import React, { useState, useEffect } from 'react';
import { Finding, Ticket } from '../types/domain';

interface TicketFlyoutProps {
  finding: Finding | null;
  onClose: () => void;
  onRefreshGlobalTickets: () => Promise<void>;
}

export const TicketFlyout: React.FC<TicketFlyoutProps> = ({
  finding,
  onClose,
  onRefreshGlobalTickets
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [newTicket, setNewTicket] = useState<Partial<Ticket>>({ 
    jiraKey: '', 
    jiraUrl: '', 
    apg: '', 
    status: '' 
  });

  useEffect(() => {
    if (finding) {
      loadTickets();
    }
  }, [finding]);

  async function loadTickets() {
    if (!finding) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/findings/${finding.id}/tickets`);
      if (!res.ok) throw new Error('Failed to fetch tickets');
      const data: Ticket[] = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  async function addTicket() {
    if (!finding) return;
    try {
      const res = await fetch(`/api/findings/${finding.id}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jiraKey: newTicket.jiraKey || '',
          jiraUrl: newTicket.jiraUrl || '',
          apg: newTicket.apg || '',
          status: newTicket.status || '',
        }),
      });
      if (!res.ok) throw new Error('Failed to add ticket');
      await loadTickets();
      await onRefreshGlobalTickets();
      setNewTicket({ jiraKey: '', jiraUrl: '', apg: '', status: '' });
    } catch (e: any) {
      setError(e.message || String(e));
    }
  }

  async function deleteTicket(ticketId: number) {
    if (!finding) return;
    if (!confirm('Delete this ticket?')) return;
    try {
      const res = await fetch(`/api/findings/${finding.id}/tickets/${ticketId}`, { 
        method: 'DELETE' 
      });
      if (!res.ok) throw new Error('Failed to delete ticket');
      await loadTickets();
      await onRefreshGlobalTickets();
    } catch (e: any) {
      setError(e.message || String(e));
    }
  }

  if (!finding) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: 520, background: '#fff', boxShadow: '-4px 0 12px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, color: '#6b7280' }}>Manage Tickets for Finding</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>#{finding.id}</div>
            {finding.description && <div style={{ fontSize: 12, color: '#6b7280' }}>{finding.description}</div>}
          </div>
          <button onClick={onClose} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Close</button>
        </div>
        <div style={{ padding: 16, overflow: 'auto' }}>
          {error && <div style={{ color: '#b91c1c', marginBottom: 8 }}>Error: {error}</div>}
          {loading ? (
            <div style={{ color: '#6b7280', fontSize: 12 }}>Loading…</div>
          ) : (
            <>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Add New Ticket</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <input 
                    value={newTicket.jiraKey as string || ''} 
                    onChange={e => setNewTicket(prev => ({ ...prev, jiraKey: e.target.value }))} 
                    placeholder="Jira Key" 
                    style={{ padding: 8, border: '1px solid #d1d5db', borderRadius: 8 }} 
                  />
                  <input 
                    value={newTicket.jiraUrl as string || ''} 
                    onChange={e => setNewTicket(prev => ({ ...prev, jiraUrl: e.target.value }))} 
                    placeholder="Jira URL" 
                    style={{ padding: 8, border: '1px solid #d1d5db', borderRadius: 8 }} 
                  />
                  <input 
                    value={newTicket.apg as string || ''} 
                    onChange={e => setNewTicket(prev => ({ ...prev, apg: e.target.value }))} 
                    placeholder="APG" 
                    style={{ padding: 8, border: '1px solid #d1d5db', borderRadius: 8 }} 
                  />
                  <input 
                    value={newTicket.status as string || ''} 
                    onChange={e => setNewTicket(prev => ({ ...prev, status: e.target.value }))} 
                    placeholder="Status" 
                    style={{ padding: 8, border: '1px solid #d1d5db', borderRadius: 8 }} 
                  />
                </div>
                <div style={{ marginTop: 8 }}>
                  <button onClick={addTicket} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #10b981', background: '#10b981', color: '#fff', cursor: 'pointer' }}>Add Ticket</button>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Existing Tickets</div>
                {tickets.length === 0 ? (
                  <div style={{ color: '#6b7280', fontSize: 12 }}>No tickets</div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 120px 120px', gap: 8, fontSize: 14 }}>
                    <div style={{ fontWeight: 600 }}>ID</div>
                    <div style={{ fontWeight: 600 }}>Jira Key</div>
                    <div style={{ fontWeight: 600 }}>Jira URL</div>
                    <div style={{ fontWeight: 600 }}>APG</div>
                    <div style={{ fontWeight: 600 }}>Status</div>
                    {tickets.map(t => (
                      <React.Fragment key={t.id}>
                        <div>#{t.id}</div>
                        <div>{t.jiraKey || '-'}</div>
                        <div>{t.jiraUrl ? <a href={t.jiraUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>{t.jiraUrl}</a> : '-'}</div>
                        <div>{t.apg || '-'}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>{t.status || '-'}</span>
                          <button onClick={() => deleteTicket(t.id)} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #ef4444', background: '#fff', color: '#b91c1c', cursor: 'pointer' }}>Delete</button>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
