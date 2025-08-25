import React, { useEffect, useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import TicketsSection from '../components/TicketsSection';
import FindingsSection from '../components/FindingsSection';
import { Application, Finding } from '../types/domain';
import { api } from '../services/api';
import ApplicationsSection from '../components/ApplicationsSection';
import CertificatesSection from '../components/CertificatesSection';
import { TeamsSection } from '../components/TeamsSection';

ChartJS.register(ArcElement, Tooltip, Legend);



type Ticket = {
  id: number;
  jiraKey?: string;
  jiraUrl?: string;
  apg?: string;
  status?: string;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'findings' | 'applications' | 'certificates' | 'tickets' | 'teams'>('findings');
  const [tickets, setTickets] = useState<Array<{
    id: number;
    jiraKey?: string;
    jiraUrl?: string;
    apg?: string;
    status?: string;
    findingId?: number;
    applicationSealId?: string;
  }>>([]);
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [findings, setFindings] = useState<Finding[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [certificates, setCertificates] = useState<Array<{
    id: number;
    cn?: string;
    serial?: string;
    expirationDate?: string;
    application?: Application;
    applicationId?: number;
  }>>([]);
  const [newCert, setNewCert] = useState<{ cn: string; serial: string; expirationDate: string; applicationId: string }>({ cn: '', serial: '', expirationDate: '', applicationId: '' });
  const [creatingCert, setCreatingCert] = useState(false);
  const [editingCertId, setEditingCertId] = useState<number | null>(null);
  const [editingCertFields, setEditingCertFields] = useState<{ cn?: string; serial?: string; expirationDate?: string; applicationId?: number | '' }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [formApp, setFormApp] = useState<Partial<Application>>({ sealId: '', name: '', platform: '', owningApg: '', codeRepository: '' });

  const [flyoutApp, setFlyoutApp] = useState<Application | null>(null);
  const [flyoutLoading, setFlyoutLoading] = useState(false);
  const [flyoutError, setFlyoutError] = useState('');
  const [flyoutItems, setFlyoutItems] = useState<Array<{ finding: Finding; tickets: Ticket[] }>>([]);
  const [editingTicketId, setEditingTicketId] = useState<number | null>(null);
  const [editingTicketFields, setEditingTicketFields] = useState<Partial<Ticket>>({});
  const [newTicketByFindingId, setNewTicketByFindingId] = useState<Record<number, Partial<Ticket>>>({});

  // Dedicated per-finding ticket management flyout
  const [ticketFlyoutFinding, setTicketFlyoutFinding] = useState<Finding | null>(null);
  const [ticketFlyoutLoading, setTicketFlyoutLoading] = useState(false);
  const [ticketFlyoutError, setTicketFlyoutError] = useState('');
  const [ticketFlyoutTickets, setTicketFlyoutTickets] = useState<Ticket[]>([]);
  const [newTicket, setNewTicket] = useState<Partial<Ticket>>({ jiraKey: '', jiraUrl: '', apg: '', status: '' });

  useEffect(() => {
    async function loadData() {
      try {
        const [summaryData, findingsData, appsData, certsData, ticketsData] = await Promise.all([
          api.getFindingsSummary(), api.getFindings(), api.getApplications(), api.getCertificates(), api.getTickets()
        ]);
        setSummary(summaryData || {});
        setFindings(Array.isArray(findingsData) ? findingsData : []);
        setApplications(Array.isArray(appsData) ? appsData : []);
        setCertificates(Array.isArray(certsData) ? certsData : []);
        setTickets(Array.isArray(ticketsData) ? ticketsData : []);
        setError('');
      } catch (e: any) {
        setError(e.message || String(e));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function refreshApplications() {
    try {
      const data = await api.getApplications();
      setApplications(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message || String(e));
    }
  }

  async function refreshCertificates() {
    try {
      const res = await fetch('/api/certificates');
      if (!res.ok) throw new Error('Failed to fetch certificates');
      const data = await res.json();
      setCertificates(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message || String(e));
    }
  }

  async function refreshGlobalTickets() {
    try {
      const data = await api.getTickets();
      setTickets(Array.isArray(data) ? data : []);
    } catch {
      // ignore background refresh errors
    }
  }

  function startCreateApp() {
    setEditingApp(null);
    setFormApp({ sealId: '', name: '', platform: '', owningApg: '', codeRepository: '' });
  }

  function startEditApp(app: Application) {
    setEditingApp(app);
    setFormApp({ ...app });
  }

  function updateForm<K extends keyof Application>(key: K, value: Application[K]) {
    setFormApp(prev => ({ ...prev, [key]: value }));
  }

  async function submitAppForm(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        sealId: formApp.sealId?.trim() || '',
        name: formApp.name?.trim() || '',
        platform: formApp.platform || '',
        owningApg: formApp.owningApg || '',
        codeRepository: formApp.codeRepository || '',
      };
      if (!payload.sealId || !payload.name) {
        setError('Seal ID and Name are required');
        return;
      }
      const res = await fetch(editingApp ? `/api/applications/${editingApp.id}` : '/api/applications', {
        method: editingApp ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Failed to ${editingApp ? 'update' : 'create'} application`);
      await refreshApplications();
      setEditingApp(null);
      setFormApp({ sealId: '', name: '', platform: '', owningApg: '', codeRepository: '' });
      setError('');
    } catch (e: any) {
      setError(e.message || String(e));
    }
  }

  async function deleteApp(app: Application) {
    if (!confirm(`Delete application "${app.name}"?`)) return;
    try {
      const res = await fetch(`/api/applications/${app.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete application');
      await refreshApplications();
    } catch (e: any) {
      setError(e.message || String(e));
    }
  }

  async function createCertificate(e: React.FormEvent) {
    e.preventDefault();
    if (!newCert.applicationId) { setError('Select an application'); return; }
    try {
      setCreatingCert(true);
      const payload: any = {
        cn: (newCert.cn || '').trim(),
        serial: (newCert.serial || '').trim(),
        expirationDate: (newCert.expirationDate || '').trim() || null,
      };
      const res = await fetch(`/api/certificates/application/${newCert.applicationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create certificate');
      await refreshCertificates();
      setNewCert({ cn: '', serial: '', expirationDate: '', applicationId: '' });
      setError('');
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setCreatingCert(false);
    }
  }

  function startEditCertificate(c: { id: number; cn?: string; serial?: string; expirationDate?: string; application?: Application; applicationId?: number }) {
    setEditingCertId(c.id);
    setEditingCertFields({
      cn: c.cn || '',
      serial: c.serial || '',
      expirationDate: (c.expirationDate || '').substring(0, 10),
      applicationId: (c.application?.id || c.applicationId) ?? ''
    });
  }

  function cancelEditCertificate() {
    setEditingCertId(null);
    setEditingCertFields({});
  }

  async function saveEditCertificate(id: number) {
    try {
      const payload: any = {
        cn: (editingCertFields.cn || '').toString().trim(),
        serial: (editingCertFields.serial || '').toString().trim(),
        expirationDate: (editingCertFields.expirationDate || '').toString().trim() || null,
      };
      if (editingCertFields.applicationId) {
        payload.applicationId = editingCertFields.applicationId;
      }
      const res = await fetch(`/api/certificates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update certificate');
      await refreshCertificates();
      cancelEditCertificate();
      setError('');
    } catch (e: any) {
      setError(e.message || String(e));
    }
  }

  function closeFlyout() {
    setFlyoutApp(null);
    setFlyoutItems([]);
    setFlyoutError('');
    setFlyoutLoading(false);
  }

  async function openFindingsFlyout(app: Application) {
    if ((findingsBySealId[app.sealId] || 0) === 0) return;
    setFlyoutApp(app);
    setFlyoutLoading(true);
    setFlyoutError('');
    try {
      const related = findings.filter(f => (f.applicationSealId || '').trim() === app.sealId);
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
      setFlyoutItems(items);
    } catch (e: any) {
      setFlyoutError(e.message || String(e));
    } finally {
      setFlyoutLoading(false);
    }
  }

  // Finding tickets: dedicated flyout
  async function openTicketFlyout(finding: Finding) {
    setTicketFlyoutFinding(finding);
    setTicketFlyoutLoading(true);
    setTicketFlyoutError('');
    try {
      const res = await fetch(`/api/findings/${finding.id}/tickets`);
      if (!res.ok) throw new Error('Failed to fetch tickets');
      const data: Ticket[] = await res.json();
      setTicketFlyoutTickets(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setTicketFlyoutError(e.message || String(e));
    } finally {
      setTicketFlyoutLoading(false);
    }
  }

  function closeTicketFlyout() {
    setTicketFlyoutFinding(null);
    setTicketFlyoutTickets([]);
    setTicketFlyoutError('');
    setNewTicket({ jiraKey: '', jiraUrl: '', apg: '', status: '' });
  }

  async function addTicketInTicketFlyout() {
    if (!ticketFlyoutFinding) return;
    try {
      const res = await fetch(`/api/findings/${ticketFlyoutFinding.id}/tickets`, {
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
      const refreshed = await fetch(`/api/findings/${ticketFlyoutFinding.id}/tickets`);
      if (refreshed.ok) {
        const list: Ticket[] = await refreshed.json();
        setTicketFlyoutTickets(Array.isArray(list) ? list : []);
      }
      await refreshGlobalTickets();
      setNewTicket({ jiraKey: '', jiraUrl: '', apg: '', status: '' });
    } catch (e: any) {
      setTicketFlyoutError(e.message || String(e));
    }
  }

  async function deleteTicketInTicketFlyout(ticketId: number) {
    if (!ticketFlyoutFinding) return;
    if (!confirm('Delete this ticket?')) return;
    try {
      const res = await fetch(`/api/findings/${ticketFlyoutFinding.id}/tickets/${ticketId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete ticket');
      const refreshed = await fetch(`/api/findings/${ticketFlyoutFinding.id}/tickets`);
      if (refreshed.ok) {
        const list: Ticket[] = await refreshed.json();
        setTicketFlyoutTickets(Array.isArray(list) ? list : []);
      }
      await refreshGlobalTickets();
    } catch (e: any) {
      setTicketFlyoutError(e.message || String(e));
    }
  }

  function updateNewTicketField(findingId: number, key: keyof Ticket, value: string) {
    setNewTicketByFindingId(prev => ({ ...prev, [findingId]: { ...prev[findingId], [key]: value } }));
  }

  async function refreshTicketsForFinding(findingId: number) {
    try {
      const res = await fetch(`/api/findings/${findingId}/tickets`);
      if (!res.ok) throw new Error('Failed to refresh tickets');
      const tickets: Ticket[] = await res.json();
      setFlyoutItems(items => items.map(it => it.finding.id === findingId ? { ...it, tickets } : it));
    } catch (e) {
      // keep old tickets if refresh fails
    }
  }

  async function addTicketForFinding(findingId: number) {
    const data = newTicketByFindingId[findingId] || {};
    const payload = {
      jiraKey: (data.jiraKey || '').toString().trim(),
      jiraUrl: (data.jiraUrl || '').toString().trim(),
      apg: (data.apg || '').toString().trim(),
      status: (data.status || '').toString().trim(),
    };
    try {
      const res = await fetch(`/api/findings/${findingId}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to add ticket');
      await refreshTicketsForFinding(findingId);
      await refreshGlobalTickets();
      setNewTicketByFindingId(prev => ({ ...prev, [findingId]: {} }));
    } catch (e: any) {
      setFlyoutError(e.message || String(e));
    }
  }

  function startEditTicket(ticket: Ticket) {
    setEditingTicketId(ticket.id);
    setEditingTicketFields({ jiraKey: ticket.jiraKey || '', jiraUrl: ticket.jiraUrl || '', apg: ticket.apg || '', status: ticket.status || '' });
  }

  function cancelEditTicket() {
    setEditingTicketId(null);
    setEditingTicketFields({});
  }

  async function saveEditTicket(findingId: number, ticketId: number) {
    try {
      const res = await fetch(`/api/findings/${findingId}/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jiraKey: editingTicketFields.jiraKey || '',
          jiraUrl: editingTicketFields.jiraUrl || '',
          apg: editingTicketFields.apg || '',
          status: editingTicketFields.status || '',
        }),
      });
      if (!res.ok) throw new Error('Failed to update ticket');
      await refreshTicketsForFinding(findingId);
      await refreshGlobalTickets();
      cancelEditTicket();
    } catch (e: any) {
      setFlyoutError(e.message || String(e));
    }
  }

  async function deleteTicket(findingId: number, ticketId: number) {
    if (!confirm('Delete this ticket?')) return;
    try {
      const res = await fetch(`/api/findings/${findingId}/tickets/${ticketId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete ticket');
      await refreshTicketsForFinding(findingId);
      await refreshGlobalTickets();
      if (editingTicketId === ticketId) cancelEditTicket();
    } catch (e: any) {
      setFlyoutError(e.message || String(e));
    }
  }

  const pieData = useMemo(() => {
    const labels = Object.keys(summary);
    const values = Object.values(summary);
    const palette = ['#6366f1','#22c55e','#f59e0b','#ef4444','#06b6d4','#84cc16','#a855f7','#fb7185','#14b8a6','#eab308'];
    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: labels.map((_, i) => palette[i % palette.length]),
        },
      ],
    };
  }, [summary]);

  const findingsBySealId = useMemo(() => {
    const map: Record<string, number> = {};
    for (const f of findings) {
      const key = (f.applicationSealId || '').trim();
      if (!key) continue;
      map[key] = (map[key] || 0) + 1;
    }
    return map;
  }, [findings]);

  const ticketsByFindingId = useMemo(() => {
    const map: Record<number, number> = {};
    for (const t of tickets) {
      const fid = t.findingId;
      if (!fid && fid !== 0) continue;
      map[fid] = (map[fid] || 0) + 1;
    }
    return map;
  }, [tickets]);

  const ticketsListByFindingId = useMemo(() => {
    const map: Record<number, Ticket[]> = {};
    for (const t of tickets) {
      const fid = t.findingId;
      if (!fid && fid !== 0) continue;
      (map[fid] = map[fid] || []).push(t);
    }
    return map;
  }, [tickets]);

  const certsByAppId = useMemo(() => {
    const map: Record<number, string[]> = {};
    for (const c of certificates) {
      const appId = (c.application?.id || c.applicationId) as number | undefined;
      if (!appId) continue;
      const cn = (c.cn || '').toString();
      if (!cn) continue;
      (map[appId] = map[appId] || []).push(cn);
    }
    return map;
  }, [certificates]);

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif', margin: 32, color: '#111827' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: 28 }}>Security Dashboard</h1>
          <div style={{ display: 'inline-flex', background: '#f3f4f6', borderRadius: 9999, padding: 4, gap: 4 }}>
            <button onClick={() => setActiveTab('findings')} style={{ padding: '6px 12px', borderRadius: 9999, border: '1px solid ' + (activeTab === 'findings' ? '#d1d5db' : 'transparent'), background: activeTab === 'findings' ? '#fff' : 'transparent', cursor: 'pointer' }}>Findings</button>
            <button onClick={() => setActiveTab('applications')} style={{ padding: '6px 12px', borderRadius: 9999, border: '1px solid ' + (activeTab === 'applications' ? '#d1d5db' : 'transparent'), background: activeTab === 'applications' ? '#fff' : 'transparent', cursor: 'pointer' }}>Applications</button>
            <button onClick={() => setActiveTab('certificates')} style={{ padding: '6px 12px', borderRadius: 9999, border: '1px solid ' + (activeTab === 'certificates' ? '#d1d5db' : 'transparent'), background: activeTab === 'certificates' ? '#fff' : 'transparent', cursor: 'pointer' }}>Certificates</button>
            <button onClick={() => setActiveTab('tickets')} style={{ padding: '6px 12px', borderRadius: 9999, border: '1px solid ' + (activeTab === 'tickets' ? '#d1d5db' : 'transparent'), background: activeTab === 'tickets' ? '#fff' : 'transparent', cursor: 'pointer' }}>Resolver Tickets</button>
            <button onClick={() => setActiveTab('teams')} style={{ padding: '6px 12px', borderRadius: 9999, border: '1px solid ' + (activeTab === 'teams' ? '#d1d5db' : 'transparent'), background: activeTab === 'teams' ? '#fff' : 'transparent', cursor: 'pointer' }}>Teams</button>
          </div>
        </div>

        {error && <p style={{ color: '#b91c1c' }}>Error: {error}</p>}

        {activeTab === 'findings' && (
          <FindingsSection
            findings={findings}
            summary={summary}
            loading={loading}
            ticketsByFindingId={ticketsByFindingId}
            ticketsListByFindingId={ticketsListByFindingId as any}
            onOpenTicketFlyout={openTicketFlyout}
            onRefreshFindings={async () => {
              try {
                const res = await fetch('/api/findings');
                if (res.ok) {
                  const data = await res.json();
                  setFindings(Array.isArray(data) ? data : []);
                }
              } catch {}
            }}
          />
        )}

        {activeTab === 'applications' && (
          <ApplicationsSection
            applications={applications}
            loading={loading}
            findingsBySealId={findingsBySealId}
            editingApp={editingApp}
            formApp={formApp}
            startCreateApp={startCreateApp}
            startEditApp={startEditApp}
            deleteApp={deleteApp}
            submitAppForm={submitAppForm}
            updateForm={updateForm as any}
          />
        )}

        {ticketFlyoutFinding && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
            <div onClick={closeTicketFlyout} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />
            <div style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: 520, background: '#fff', boxShadow: '-4px 0 12px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 14, color: '#6b7280' }}>Manage Tickets for Finding</div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>#{ticketFlyoutFinding.id}</div>
                  {ticketFlyoutFinding.description && <div style={{ fontSize: 12, color: '#6b7280' }}>{ticketFlyoutFinding.description}</div>}
                </div>
                <button onClick={closeTicketFlyout} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Close</button>
              </div>
              <div style={{ padding: 16, overflow: 'auto' }}>
                {ticketFlyoutError && <div style={{ color: '#b91c1c', marginBottom: 8 }}>Error: {ticketFlyoutError}</div>}
                {ticketFlyoutLoading ? (
                  <div style={{ color: '#6b7280', fontSize: 12 }}>Loading…</div>
                ) : (
                  <>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Add New Ticket</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <input value={newTicket.jiraKey as string || ''} onChange={e => setNewTicket(prev => ({ ...prev, jiraKey: e.target.value }))} placeholder="Jira Key" style={{ padding: 8, border: '1px solid #d1d5db', borderRadius: 8 }} />
                        <input value={newTicket.jiraUrl as string || ''} onChange={e => setNewTicket(prev => ({ ...prev, jiraUrl: e.target.value }))} placeholder="Jira URL" style={{ padding: 8, border: '1px solid #d1d5db', borderRadius: 8 }} />
                        <input value={newTicket.apg as string || ''} onChange={e => setNewTicket(prev => ({ ...prev, apg: e.target.value }))} placeholder="APG" style={{ padding: 8, border: '1px solid #d1d5db', borderRadius: 8 }} />
                        <input value={newTicket.status as string || ''} onChange={e => setNewTicket(prev => ({ ...prev, status: e.target.value }))} placeholder="Status" style={{ padding: 8, border: '1px solid #d1d5db', borderRadius: 8 }} />
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <button onClick={addTicketInTicketFlyout} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #10b981', background: '#10b981', color: '#fff', cursor: 'pointer' }}>Add Ticket</button>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Existing Tickets</div>
                      {ticketFlyoutTickets.length === 0 ? (
                        <div style={{ color: '#6b7280', fontSize: 12 }}>No tickets</div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 120px 120px', gap: 8, fontSize: 14 }}>
                          <div style={{ fontWeight: 600 }}>ID</div>
                          <div style={{ fontWeight: 600 }}>Jira Key</div>
                          <div style={{ fontWeight: 600 }}>Jira URL</div>
                          <div style={{ fontWeight: 600 }}>APG</div>
                          <div style={{ fontWeight: 600 }}>Status</div>
                          {ticketFlyoutTickets.map(t => (
                            <>
                              <div>#{t.id}</div>
                              <div>{t.jiraKey || '-'}</div>
                              <div>{t.jiraUrl ? <a href={t.jiraUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>{t.jiraUrl}</a> : '-'}</div>
                              <div>{t.apg || '-'}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span>{t.status || '-'}</span>
                                <button onClick={() => deleteTicketInTicketFlyout(t.id)} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #ef4444', background: '#fff', color: '#b91c1c', cursor: 'pointer' }}>Delete</button>
                              </div>
                            </>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {flyoutApp && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
            <div onClick={closeFlyout} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />
            <div style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: 480, background: '#fff', boxShadow: '-4px 0 12px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 14, color: '#6b7280' }}>Application</div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>{flyoutApp.name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{flyoutApp.sealId}</div>
                </div>
                <button onClick={closeFlyout} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Close</button>
              </div>
              <div style={{ padding: 16, overflow: 'auto' }}>
                {flyoutError && <div style={{ color: '#b91c1c', marginBottom: 8 }}>Error: {flyoutError}</div>}
                {flyoutLoading ? (
                  <div style={{ color: '#6b7280', fontSize: 12 }}>Loading findings…</div>
                ) : flyoutItems.length === 0 ? (
                  <div style={{ color: '#6b7280', fontSize: 12 }}>No related findings</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {flyoutItems.map(({ finding, tickets }) => (
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
                          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Resolver Tickets</div>
                          {tickets.length === 0 ? (
                            <div style={{ color: '#6b7280', fontSize: 12 }}>No tickets</div>
                          ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 120px 120px 120px', gap: 8, fontSize: 14, fontWeight: 600 }}>
                              <div>ID</div>
                              <div>Jira Key</div>
                              <div>Jira URL</div>
                              <div>APG</div>
                              <div>Status</div>
                              <div>Actions</div>
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
        )}

        {activeTab === 'certificates' && (
          <CertificatesSection
            applications={applications}
            certificates={certificates}
            loading={loading}
            newCert={newCert as any}
            setNewCert={(updater: any) => setNewCert(prev => updater(prev))}
            creatingCert={creatingCert}
            onCreateCertificate={createCertificate}
            editingCertId={editingCertId}
            editingCertFields={editingCertFields as any}
            startEditCertificate={startEditCertificate as any}
            cancelEditCertificate={cancelEditCertificate}
            saveEditCertificate={saveEditCertificate}
          />
        )}

        {activeTab === 'tickets' && (
          <TicketsSection applications={applications} tickets={tickets} loading={loading} onRefreshTickets={refreshGlobalTickets} />
        )}

        {activeTab === 'teams' && (
          <TeamsSection />
        )}
      </div>
    </div>
  );
}


