import { useState, useCallback } from 'react';
import axios from 'axios';

export function useAuth() {
  const [agent, setAgent] = useState(() => {
    try { return JSON.parse(localStorage.getItem('agent')); } catch { return null; }
  });

  const login = useCallback(async (username, password) => {
    const { data } = await axios.post('/api/auth/login', { username, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('agent', JSON.stringify(data.agent));
    setAgent(data.agent);
    return data.agent;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('agent');
    setAgent(null);
  }, []);

  return { agent, login, logout };
}
