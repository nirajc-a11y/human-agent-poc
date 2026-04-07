const Groq = require('groq-sdk');
const { GROQ_API_KEY } = require('../config');
const { getCall, setAnalysis } = require('../db/queries');
const log = require('../logger');

const groq = new Groq({ apiKey: GROQ_API_KEY });

async function transcribeRecording(recordingUrl) {
  log.info('GROQ', 'transcribing recording', { url: recordingUrl });
  const response = await fetch(recordingUrl);
  if (!response.ok) throw new Error(`Failed to fetch recording: ${response.status}`);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Groq SDK accepts a File-like object
  const { File } = await import('node:buffer');
  const file = new File([buffer], 'recording.mp3', { type: 'audio/mpeg' });

  const transcription = await groq.audio.transcriptions.create({
    file,
    model: 'whisper-large-v3',
    response_format: 'text',
  });
  const text = typeof transcription === 'string' ? transcription : transcription.text || '';
  log.info('GROQ', 'transcription complete', { chars: text.length });
  return text;
}

async function analyseTranscript(transcript) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are a call analysis assistant. Given a call transcript, return ONLY valid JSON with these fields:
{
  "summary": "2-3 sentence summary of the call",
  "sentiment": "positive" | "neutral" | "negative",
  "intent": "primary caller intent in 5-8 words",
  "entities": [{ "type": "product|company|person|location", "value": "string" }],
  "action_items": ["string"]
}`,
      },
      {
        role: 'user',
        content: `Analyse this call transcript:\n\n${transcript}`,
      },
    ],
    temperature: 0.1,
    max_tokens: 1024,
  });
  const raw = completion.choices[0]?.message?.content || '{}';
  return JSON.parse(raw);
}

async function runAnalysis(callId) {
  log.info('GROQ', 'starting analysis', { callId });
  const call = getCall(callId);
  if (!call) throw new Error(`Call ${callId} not found`);
  if (!call.recording_url) throw new Error(`Call ${callId} has no recording URL`);

  const transcript = await transcribeRecording(call.recording_url);
  log.info('GROQ', 'analysing transcript', { callId });
  const analysis = await analyseTranscript(transcript);

  setAnalysis({
    id: callId,
    transcript,
    analysis: JSON.stringify(analysis),
  });

  log.info('GROQ', 'analysis saved', { callId, sentiment: analysis.sentiment });
  return { transcript, analysis };
}

module.exports = { runAnalysis };
