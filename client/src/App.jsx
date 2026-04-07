import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './components/Auth/LoginPage';
import AppShell from './components/Layout/AppShell';

export default function App() {
  const { agent, login, logout } = useAuth();

  if (!agent) return <LoginPage onLogin={login} />;

  return (
    <BrowserRouter>
      <AppShell agent={agent} onLogout={logout} />
    </BrowserRouter>
  );
}
