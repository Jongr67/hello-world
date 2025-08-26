import React, { useState, useEffect } from 'react';
import { Application, Finding, Ticket } from '../types/domain';

interface FindingsFlyoutProps {
  application: Application | null;
  onClose: () => void;
  onOpenTicketFlyout: (finding: Finding) => void;
}

export const FindingsFlyout: React.FC<FindingsFlyoutProps> = ({
  application,
  onClose,
  onOpenTicketFlyout
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState<Array<{ finding: Finding; tickets: Ticket[] }>>([]);

  useEffect(() => {
    if (application) {
      loadFindings();
    }
  }, [application]);

  async function loadFindings() {
    if (!application) return;
    setLoading(true);
    setError('');
    try {
      // Get all findings for this application
      const findingsRes = await fetch('/api/findings');
      if (!findingsRes.ok) throw new Error('Failed to fetch findings');
      const allFindings: Finding[] = await findingsRes.json();
      
      // Filter findings for this application
      const related = allFindings.filter(f => (f.applicationSealId || '').trim() === application.sealId);
      
      // Load tickets for each finding
      const items = await Promise.all(
        related.map(async (f) => {
          try {
            const res = await fetch(`/api/findings/${f.id}/tickets`);
            if (!res.ok) throw new Error('Failed to fetch tickets');
            const tickets: Ticket[] = await res.json();
            return { finding: f, tickets: Array.isArray(tickets) ? tickets : [] };
          } catch (e) {
            return { finding: f, tickets: [] };
          }
        })
      );
      setItems(items);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  if (!application) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: 480, background: '#fff', boxShadow: '-4px 0 12px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, color: '#6b7280' }}>Application</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{application.name}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{application.sealId}</div>
          </div>
          <button onClick={onClose} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Close</button>
        </div>
        <div style={{ padding: 16, overflow: 'auto' }}>
          {error && <div style={{ color: '#b91c1c', marginBottom: 8 }}>Error: {error}</div>}
          {loading ? (
            <div style={{ color: '#6b7280', fontSize: 12 }}>Loading findings…</div>
          ) : items.length === 0 ? (
            <div style={{ color: '#6b7280', fontSize: 12 }}>No related findings</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map(({ finding, tickets }) => (
                <div key={finding.id} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 600 }}>#{finding.id} {finding.description || ''}</div>
                    <div>
                      <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 9999, fontSize: 12, background: '#eef2ff', color: '#3730a3' }}>{finding.severity || 'n/a'}</span>
                      <span style={{ marginLeft: 8, display: 'inline-block', padding: '2px 8px', borderRadius: 9999, fontSize: 12, background: '#eef2ff', color: '#3730a3' }}>{finding.criticality || 'n/a'}</span>
                    </div>
                  </div>
                  {finding.targetDate && <div style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>Target: {finding.targetDate}</div>}
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>Resolver Tickets</div>
                      <button 
                        onClick={() => onOpenTicketFlyout(finding)}
                        style={{ 
                          padding: '4px 8px', 
                          borderRadius: 6, 
                          border: '1px solid #2563eb', 
                          background: '#fff', 
                          color: '#2563eb', 
                          cursor: 'pointer',
                          fontSize: 12
                        }}
                      >
                        Manage Tickets
                      </button>
                    </div>
                    {tickets.length === 0 ? (
                      <div style={{ color: '#6b7280', fontSize: 12 }}>No tickets</div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 120px 120px', gap: 8, fontSize: 14, fontWeight: 600 }}>
                        <div>ID</div>
                        <div>Jira Key</div>
                        <div>Jira URL</div>
                        <div>APG</div>
                        <div>Status</div>
                        {tickets.map(t => (
                          <React.Fragment key={t.id}>
                            <div>#{t.id}</div>
                            <div>{t.jiraKey || '-'}</div>
                            <div>{t.jiraUrl ? <a href={t.jiraUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>{t.jiraUrl}</a> : '-'}</div>
                            <div>{t.apg || '-'}</div>
                            <div>{t.status || '-'}</div>
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
