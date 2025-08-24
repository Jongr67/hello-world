import React from 'react';
import type { Application, Ticket } from '../types/domain';

type Props = {
  applications: Application[];
  tickets: Ticket[];
  loading: boolean;
  onRefreshTickets: () => Promise<void> | void;
};

export default function TicketsSection({ applications, tickets, loading, onRefreshTickets }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24, alignItems: 'start' }}>
      <div style={{ padding: 20, border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)', background: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ marginTop: 0 }}>All Resolver Tickets</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <a href="/api/tickets/export" style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', textDecoration: 'none' }} title="Download Excel of tickets">Export</a>
            <label style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>
              Import
              <input type="file" accept=".xlsx" onChange={async e => {
                const file = e.target.files?.[0];
                if (!file) return;
                const form = new FormData();
                form.append('file', file);
                try {
                  const res = await fetch('/api/tickets/import', { method: 'POST', body: form });
                  if (!res.ok) throw new Error('Import failed');
                  await onRefreshTickets();
                  e.currentTarget.value = '';
                } catch (err) {
                  console.error(err);
                  alert('Import failed');
                }
              }} style={{ display: 'none' }} />
            </label>
          </div>
        </div>
        <div style={{ overflowX: 'auto', marginTop: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 160px 140px 180px 160px', gap: 12, padding: '10px 0', borderBottom: '1px solid #f3f4f6', fontWeight: 600, color: '#374151', minWidth: 1000 }}>
            <div>Finding ID</div>
            <div>Jira Key / URL</div>
            <div>APG</div>
            <div>Status</div>
            <div>Application (Seal)</div>
            <div>Application Name</div>
          </div>
          {loading ? (
            <div style={{ padding: '10px 0', color: '#6b7280', fontSize: 12 }}>Loading tickets…</div>
          ) : tickets.length === 0 ? (
            <div style={{ padding: '10px 0', color: '#6b7280', fontSize: 12 }}>No resolver tickets</div>
          ) : (
            tickets.map(t => {
              const app = applications.find(a => a.sealId === (t.applicationSealId || ''));
              return (
                <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 160px 140px 180px 160px', gap: 12, padding: '10px 0', borderBottom: '1px solid #f3f4f6', alignItems: 'center' }}>
                  <div>#{t.findingId ?? '-'}</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{t.jiraKey || '-'}</div>
                    {t.jiraUrl ? <a href={t.jiraUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>{t.jiraUrl}</a> : <span style={{ color: '#6b7280', fontSize: 12 }}>No URL</span>}
                  </div>
                  <div>{t.apg || '-'}</div>
                  <div>{t.status || '-'}</div>
                  <div>{t.applicationSealId || '-'}</div>
                  <div>{app?.name || '-'}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
