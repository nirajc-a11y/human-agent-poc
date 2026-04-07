const Groq = require('groq-sdk');
const { AssemblyAI } = require('assemblyai');
const { GROQ_API_KEY, ASSEMBLYAI_API_KEY } = require('../config');
const { getCall, setAnalysis } = require('../db/queries');
const log = require('../logger');

const groq = new Groq({ apiKey: GROQ_API_KEY });

async function transcribeRecording(recordingUrl) {
  if (!ASSEMBLYAI_API_KEY) throw new Error('ASSEMBLYAI_API_KEY is not configured');
  log.info('ASSEMBLYAI', 'transcribing recording', { url: recordingUrl });
  const client = new AssemblyAI({ apiKey: ASSEMBLYAI_API_KEY });
  const result = await client.transcripts.transcribe({
    audio: recordingUrl,
    speaker_labels: true,
    speech_models: ['universal-3-pro', 'universal-2'],
  });

  if (result.status === 'error') throw new Error(`AssemblyAI error: ${result.error}`);

  const utterances = (result.utterances || []).map(u => ({
    speaker: u.speaker,
    start: u.start,
    end: u.end,
    text: u.text,
  }));

  const plainText = utterances.map(u => `${u.speaker}: ${u.text}`).join('\n');
  log.info('ASSEMBLYAI', 'transcription complete', { utterances: utterances.length });
  return { plainText, utterances };
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

  const { plainText, utterances } = await transcribeRecording(call.recording_url);
  log.info('GROQ', 'analysing transcript', { callId });
  const analysis = await analyseTranscript(plainText);

  setAnalysis({
    id: callId,
    transcript: plainText,
    utterances: JSON.stringify(utterances),
    analysis: JSON.stringify(analysis),
  });

  log.info('GROQ', 'analysis saved', { callId, sentiment: analysis.sentiment });
  return { transcript: plainText, utterances, analysis };
}

module.exports = { runAnalysis };
