import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import StatsRow from './StatsRow';
import FilterBar from './FilterBar';
import CallRow from './CallRow';

export default function CallHistoryPage() {
  const [calls, setCalls]   = useState([]);
  const [stats, setStats]   = useState(null);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchCalls = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter === 'missed') {
        params.status = 'missed';
      } else if (filter) {
        params.direction = filter;
      }
      if (search) params.search = search;
      const { data } = await api.get('/calls', { params });
      setCalls(data.calls);
      setStats(data.stats);
    } catch (err) {
      console.error('Failed to fetch calls:', err.message);
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => { fetchCalls(); }, [fetchCalls]);

  // Poll every 10s to pick up new analysis results
  useEffect(() => {
    const interval = setInterval(fetchCalls, 10000);
    return () => clearInterval(interval);
  }, [fetchCalls]);

  async function handleClearAll() {
    if (!window.confirm('Clear all call history? This cannot be undone.')) return;
    try {
      await api.delete('/calls');
      setCalls([]);
      setStats(null);
    } catch (err) {
      console.error('Failed to clear calls:', err.message);
    }
  }

  function handleAnalysisUpdate(callId, result) {
    setCalls(prev => prev.map(c =>
      c.id === callId
        ? { ...c, transcript: result.transcript, analysis: JSON.stringify(result.analysis) }
        : c
    ));
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <StatsRow stats={stats} />
      <FilterBar active={filter} onFilter={setFilter} search={search} onSearch={setSearch} onClear={handleClearAll} />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading && calls.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading...</div>
        )}
        {!loading && calls.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>No calls found</div>
        )}
        {calls.map(call => (
          <CallRow key={call.id} call={call} onAnalysisUpdate={handleAnalysisUpdate} />
        ))}
      </div>
    </div>
  );
}
