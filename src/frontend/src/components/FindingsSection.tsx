import React from 'react';
import { Pie } from 'react-chartjs-2';

export type Finding = {
  id: number;
  description?: string;
  applicationSealId?: string;
  severity?: string;
  criticality?: string;
  targetDate?: string;
  assignedApg?: string;
  createdDate?: string;
};

type Props = {
  findings: Finding[];
  summary: Record<string, number>;
  loading: boolean;
  ticketsByFindingId: Record<number, number>;
  ticketsListByFindingId: Record<number, { id: number; jiraKey?: string }[]>;
  onOpenTicketFlyout: (finding: Finding) => void;
  onRefreshFindings: () => Promise<void> | void;
};

export default function FindingsSection({ findings, summary, loading, ticketsByFindingId, ticketsListByFindingId, onOpenTicketFlyout, onRefreshFindings }: Props) {
  const pieData = React.useMemo(() => {
    const labels = Object.keys(summary);
    const values = Object.values(summary);
    const palette = ['#6366f1','#22c55e','#f59e0b','#ef4444','#06b6d4','#84cc16','#a855f7','#fb7185','#14b8a6','#eab308'];
    return { labels, datasets: [{ data: values, backgroundColor: labels.map((_, i) => palette[i % palette.length]) }] };
  }, [summary]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
      <div style={{ padding: 20, border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ marginTop: 0 }}>Findings by APG</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <a href="/api/findings/export" style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', textDecoration: 'none' }} title="Download Findings Excel">Export</a>
            <label style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>
              Import
              <input type="file" accept=".xlsx" onChange={async e => {
                const file = e.target.files?.[0];
                if (!file) return;
                const form = new FormData();
                form.append('file', file);
                try {
                  const res = await fetch('/api/findings/import', { method: 'POST', body: form });
                  if (!res.ok) throw new Error('Import failed');
                  await onRefreshFindings();
                  e.currentTarget.value = '';
                } catch (err) {
                  console.error(err);
                  alert('Import failed');
                }
              }} style={{ display: 'none' }} />
            </label>
          </div>
        </div>
        {loading ? (
          <p style={{ color: '#6b7280', fontSize: 12 }}>Loading chart…</p>
        ) : (
          <Pie data={pieData} options={{ plugins: { legend: { position: 'bottom' as const } } }} />
        )}
      </div>

      <div style={{ padding: 20, border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)', background: '#fff' }}>
        <h3 style={{ marginTop: 0 }}>Current Findings</h3>
        {loading ? (
          <p style={{ color: '#6b7280', fontSize: 12 }}>Loading findings…</p>
        ) : (
          <div style={{ marginTop: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr 160px 140px 140px 160px 160px', gap: 12, padding: '10px 0', borderBottom: '1px solid #f3f4f6', fontWeight: 600, color: '#374151' }}>
              <div>ID</div>
              <div>Description</div>
              <div>Application Seal ID</div>
              <div>Severity / Criticality</div>
              <div>Assigned APG</div>
              <div>Resolver Ticket</div>
              <div>Created</div>
            </div>
            {findings.length === 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr 160px 140px 140px 160px 160px', gap: 12, padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ color: '#6b7280', fontSize: 12 }}>No findings</div>
              </div>
            )}
            {findings.map((f) => (
              <div key={f.id} style={{ display: 'grid', gridTemplateColumns: '64px 1fr 160px 140px 140px 160px 160px', gap: 12, padding: '10px 0', borderBottom: '1px solid #f3f4f6', alignItems: 'center' }}>
                <div>#{f.id}</div>
                <div>
                  <div>{f.description || '-'}</div>
                  {f.targetDate && <div style={{ color: '#6b7280', fontSize: 12 }}>Target: {f.targetDate}</div>}
                </div>
                <div>{f.applicationSealId || '-'}</div>
                <div>
                  <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 9999, fontSize: 12, background: '#eef2ff', color: '#3730a3' }}>{f.severity || 'n/a'}</span>
                  <span style={{ marginLeft: 8, display: 'inline-block', padding: '2px 8px', borderRadius: 9999, fontSize: 12, background: '#eef2ff', color: '#3730a3' }}>{f.criticality || 'n/a'}</span>
                </div>
                <div>{f.assignedApg || '-'}</div>
                <div>
                  {ticketsByFindingId[f.id] ? (
                    <div style={{ color: '#065f46' }}>
                      {(ticketsListByFindingId[f.id] || []).map(t => t.jiraKey || '').filter(Boolean).join(', ')}
                    </div>
                  ) : (
                    <span title="No resolver ticket" aria-label="No resolver ticket" style={{ color: '#b45309' }}>⚠️</span>
                  )}
                  <div style={{ marginTop: 6 }}>
                    <button onClick={() => onOpenTicketFlyout(f)} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: 12 }}>Manage Tickets</button>
                  </div>
                </div>
                <div>{(f.createdDate || '').toString().replace('T', ' ').slice(0, 16) || '-'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
