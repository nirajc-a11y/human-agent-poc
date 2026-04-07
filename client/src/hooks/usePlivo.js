import { useState, useEffect, useRef, useCallback } from 'react';

export function usePlivo(agent) {
  // Store agent ref so dial() can access the latest number without re-subscribing
  const agentRef = useRef(agent);
  useEffect(() => { agentRef.current = agent; }, [agent]);
  const [status, setStatus]             = useState('disconnected');
  const [callState, setCallState]       = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const plivRef = useRef(null);

  useEffect(() => {
    if (!agent?.username || !agent?.password) return;
    if (!window.Plivo) { console.error('Plivo SDK not loaded'); return; }

    let plivo;
    try {
      plivo = new window.Plivo({
        debug: 'ERROR',
        permOnClick: true,
        enableTracking: false,
        closeProtection: false,
        maxAverageBitrate: 48000,
      });
    } catch (e) {
      console.error('Failed to init Plivo SDK:', e);
      return;
    }

    plivRef.current = plivo;
    const c = plivo.client;

    c.on('onLogin',       () => setStatus('connected'));
    c.on('onLogout',      () => setStatus('disconnected'));
    c.on('onLoginFailed', (cause) => { console.warn('Plivo login failed:', cause); setStatus('disconnected'); });

    c.on('onCallRemoteRinging', () => setStatus('ringing'));

    c.on('onIncomingCall', (callerName, _extraHeaders, callInfo) => {
      setStatus('ringing');
      setIncomingCall({ number: callerName || callInfo?.src || 'Unknown', callInfo });
    });

    c.on('onIncomingCallCanceled', () => {
      setStatus('connected');
      setIncomingCall(null);
    });

    c.on('onCallAnswered', (callInfo) => {
      setStatus('oncall');
      setIncomingCall(null);
      setCallState(prev => ({
        number:    prev?.number    || callInfo?.src || 'Unknown',
        direction: prev?.direction || 'inbound',
        startedAt: Date.now(),
      }));
    });

    c.on('onCallTerminated', () => {
      setStatus('connected');
      setCallState(null);
      setIncomingCall(null);
    });

    c.on('onCalling', (number) => {
      setStatus('ringing');
      setCallState({ number, direction: 'outbound', startedAt: null });
    });

    try {
      c.login(agent.username, agent.password);
    } catch (e) {
      console.error('Plivo login error:', e);
    }

    return () => {
      try { c.logout(); } catch {}
    };
  }, [agent?.username, agent?.password]);

  const dial = useCallback((rawNumber) => {
    // Normalise to E.164: strip spaces/dashes/parens, prepend +91 for bare 10-digit Indian numbers
    let number = rawNumber.replace(/[\s\-().]/g, '');
    if (!number.startsWith('+')) {
      number = number.startsWith('91') && number.length === 12
        ? '+' + number
        : '+91' + number;
    }
    const callerId = agentRef.current?.number || '';
    const extraHeaders = callerId ? { 'X-PH-callerId': callerId } : {};
    try { plivRef.current?.client.call(number, extraHeaders); } catch (e) { console.error('dial error:', e); }
  }, []);

  const hangup = useCallback(() => {
    try { plivRef.current?.client.hangup(); } catch (e) { console.error('hangup error:', e); }
  }, []);

  const accept = useCallback(() => {
    try { plivRef.current?.client.answer(); } catch (e) { console.error('accept error:', e); }
  }, []);

  const reject = useCallback(() => {
    try { plivRef.current?.client.reject(); } catch (e) { console.error('reject error:', e); }
  }, []);

  const mute = useCallback((muted) => {
    try {
      muted ? plivRef.current?.client.mute() : plivRef.current?.client.unmute();
    } catch (e) { console.error('mute error:', e); }
  }, []);

  return { status, callState, incomingCall, dial, hangup, accept, reject, mute };
}
