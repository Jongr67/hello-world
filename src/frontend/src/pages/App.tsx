import React, { useEffect, useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

type Finding = {
  id: number;
  description?: string;
  applicationSealId?: string;
  severity?: string;
  criticality?: string;
  targetDate?: string;
  assignedApg?: string;
  createdDate?: string;
};

type Application = {
  id: number;
  sealId: string;
  name: string;
  platform?: string;
  owningApg?: string;
  codeRepository?: string;
  certificates?: string;
};

type Ticket = {
  id: number;
  jiraKey?: string;
  jiraUrl?: string;
  apg?: string;
  status?: string;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'findings' | 'applications' | 'certificates' | 'tickets'>('findings');
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
        const [summaryRes, findingsRes, appsRes, certsRes, ticketsRes] = await Promise.all([
          fetch('/api/findings/summary/apg'),
          fetch('/api/findings'),
          fetch('/api/applications'),
          fetch('/api/certificates'),
          fetch('/api/tickets'),
        ]);
        if (!summaryRes.ok) throw new Error('Failed to fetch APG summary');
        if (!findingsRes.ok) throw new Error('Failed to fetch findings');
        if (!appsRes.ok) throw new Error('Failed to fetch applications');
        if (!certsRes.ok) throw new Error('Failed to fetch certificates');
        if (!ticketsRes.ok) throw new Error('Failed to fetch resolver tickets');
        const [summaryData, findingsData, appsData, certsData, ticketsData] = await Promise.all([
          summaryRes.json(), findingsRes.json(), appsRes.json(), certsRes.json(), ticketsRes.json()
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
      const res = await fetch('/api/applications');
      if (!res.ok) throw new Error('Failed to fetch applications');
      const data = await res.json();
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
      const res = await fetch('/api/tickets');
      if (!res.ok) throw new Error('Failed to fetch resolver tickets');
      const data = await res.json();
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
          </div>
        </div>

        {error && <p style={{ color: '#b91c1c' }}>Error: {error}</p>}

        {activeTab === 'findings' && (
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
                        // refresh findings
                        const refreshed = await fetch('/api/findings');
                        if (refreshed.ok) {
                          const data = await refreshed.json();
                          setFindings(Array.isArray(data) ? data : []);
                        }
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
                          <button onClick={() => openTicketFlyout(f)} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: 12 }}>Manage Tickets</button>
                        </div>
                      </div>
                      <div>{(f.createdDate || '').toString().replace('T', ' ').slice(0, 16) || '-'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24, alignItems: 'start' }}>
            <div style={{ padding: 20, border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)', background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ marginTop: 0 }}>Applications</h3>
                <button onClick={startCreateApp} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>New Application</button>
              </div>

              <div style={{ overflowX: 'auto', marginTop: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 140px 160px 1fr 120px 120px', gap: 12, padding: '10px 0', borderBottom: '1px solid #f3f4f6', fontWeight: 600, color: '#374151', minWidth: 900 }}>
                  <div>Seal ID</div>
                  <div>App Name</div>
                  <div>Platform</div>
                  <div>Owning APG</div>
                  <div>Code Repository</div>
                  <div>Certificates</div>
                  <div>Farm Findings</div>
                </div>
                {loading ? (
                  <div style={{ padding: '10px 0', color: '#6b7280', fontSize: 12 }}>Loading applications…</div>
                ) : applications.length === 0 ? (
                  <div style={{ padding: '10px 0', color: '#6b7280', fontSize: 12 }}>No applications</div>
                ) : (
                  applications.map(app => (
                    <div key={app.id} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 140px 160px 1fr 120px 120px', gap: 12, padding: '10px 0', borderBottom: '1px solid #f3f4f6', alignItems: 'center' }}>
                      <div>{app.sealId}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{app.name}</div>
                      </div>
                      <div>{app.platform || '-'}</div>
                      <div>{app.owningApg || '-'}</div>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{app.codeRepository || '-'}</div>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{(certsByAppId[app.id] || []).join(', ') || '-'}</div>
                      <div>
                        <button onClick={() => openFindingsFlyout(app)} style={{ padding: 0, margin: 0, border: 'none', background: 'none', color: '#2563eb', textDecoration: 'underline', cursor: (findingsBySealId[app.sealId] || 0) > 0 ? 'pointer' : 'default' }} title="View related findings">
                          {findingsBySealId[app.sealId] || 0}
                        </button>
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <button onClick={() => startEditApp(app)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', marginRight: 8 }}>Edit</button>
                        <button onClick={() => deleteApp(app)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ef4444', background: '#fff', color: '#b91c1c', cursor: 'pointer' }}>Delete</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ padding: 20, border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)', background: '#fff' }}>
              <h3 style={{ marginTop: 0 }}>{editingApp ? 'Edit Application' : 'Create Application'}</h3>
              <form onSubmit={submitAppForm} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Seal ID *</label>
                  <input value={formApp.sealId || ''} onChange={e => updateForm('sealId', e.target.value)} placeholder="e.g. APP-00001" style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 8 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>App Name *</label>
                  <input value={formApp.name || ''} onChange={e => updateForm('name', e.target.value)} placeholder="e.g. Customer Portal" style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 8 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Platform</label>
                  <input value={formApp.platform || ''} onChange={e => updateForm('platform', e.target.value)} placeholder="Web / iOS / Android / Service" style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 8 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Owning APG</label>
                  <input value={formApp.owningApg || ''} onChange={e => updateForm('owningApg', e.target.value)} placeholder="Relationships / Identity / ..." style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 8 }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Code Repository</label>
                  <input value={formApp.codeRepository || ''} onChange={e => updateForm('codeRepository', e.target.value)} placeholder="https://git.example.com/team/repo" style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 8 }} />
                </div>
                
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
                  <button type="submit" style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #10b981', background: '#10b981', color: '#fff', cursor: 'pointer' }}>{editingApp ? 'Update' : 'Create'}</button>
                  {editingApp && (
                    <button type="button" onClick={startCreateApp} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Cancel</button>
                  )}
                </div>
              </form>
            </div>
          </div>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24, alignItems: 'start' }}>
            <div style={{ padding: 20, border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)', background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ marginTop: 0 }}>Certificates</h3>
              </div>
              <form onSubmit={createCertificate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 8, alignItems: 'end', marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>CN</label>
                  <input value={newCert.cn} onChange={e => setNewCert(prev => ({ ...prev, cn: e.target.value }))} placeholder="e.g. portal.example.com" style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 8 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Serial</label>
                  <input value={newCert.serial} onChange={e => setNewCert(prev => ({ ...prev, serial: e.target.value }))} placeholder="optional" style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 8 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Expiration Date</label>
                  <input type="date" value={newCert.expirationDate} onChange={e => setNewCert(prev => ({ ...prev, expirationDate: e.target.value }))} style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 8 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Application</label>
                  <select value={newCert.applicationId} onChange={e => setNewCert(prev => ({ ...prev, applicationId: e.target.value }))} style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 8 }}>
                    <option value="">Select application…</option>
                    {applications.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.sealId})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <button type="submit" disabled={creatingCert} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #10b981', background: '#10b981', color: '#fff', cursor: creatingCert ? 'not-allowed' : 'pointer' }}>Add</button>
                </div>
              </form>
              <div style={{ overflowX: 'auto', marginTop: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px 180px 200px 140px', gap: 12, padding: '10px 0', borderBottom: '1px solid #f3f4f6', fontWeight: 600, color: '#374151', minWidth: 950 }}>
                  <div>CN</div>
                  <div>Serial</div>
                  <div>Expiration Date</div>
                  <div>Application</div>
                  <div>Actions</div>
                </div>
                {loading ? (
                  <div style={{ padding: '10px 0', color: '#6b7280', fontSize: 12 }}>Loading certificates…</div>
                ) : certificates.length === 0 ? (
                  <div style={{ padding: '10px 0', color: '#6b7280', fontSize: 12 }}>No certificates</div>
                ) : (
                  certificates.map(c => (
                    <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '1fr 220px 180px 200px 140px', gap: 12, padding: '10px 0', borderBottom: '1px solid #f3f4f6', alignItems: 'center' }}>
                      {editingCertId === c.id ? (
                        <>
                          <div>
                            <input value={editingCertFields.cn || ''} onChange={e => setEditingCertFields(prev => ({ ...prev, cn: e.target.value }))} placeholder="CN" style={{ width: '100%', padding: 6, border: '1px solid #d1d5db', borderRadius: 6 }} />
                          </div>
                          <div>
                            <input value={editingCertFields.serial || ''} onChange={e => setEditingCertFields(prev => ({ ...prev, serial: e.target.value }))} placeholder="Serial" style={{ width: '100%', padding: 6, border: '1px solid #d1d5db', borderRadius: 6 }} />
                          </div>
                          <div>
                            <input type="date" value={editingCertFields.expirationDate || ''} onChange={e => setEditingCertFields(prev => ({ ...prev, expirationDate: e.target.value }))} style={{ width: '100%', padding: 6, border: '1px solid #d1d5db', borderRadius: 6 }} />
                          </div>
                          <div>
                            <select value={editingCertFields.applicationId ?? ''} onChange={e => setEditingCertFields(prev => ({ ...prev, applicationId: e.target.value ? Number(e.target.value) : '' }))} style={{ width: '100%', padding: 6, border: '1px solid #d1d5db', borderRadius: 6 }}>
                              <option value="">Select application…</option>
                              {applications.map(a => (
                                <option key={a.id} value={a.id}>{a.name} ({a.sealId})</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <button onClick={() => saveEditCertificate(c.id)} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #10b981', background: '#10b981', color: '#fff', cursor: 'pointer', marginRight: 6 }}>Save</button>
                            <button onClick={cancelEditCertificate} type="button" style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Cancel</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.cn || '-'}</div>
                          <div>{c.serial || '-'}</div>
                          <div>{c.expirationDate || '-'}</div>
                          <div>{applications.find(a => a.id === (c.application?.id || c.applicationId))?.name || '-'}</div>
                          <div>
                            <button onClick={() => startEditCertificate(c)} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Edit</button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tickets' && (
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
                        await refreshGlobalTickets();
                        // clear input value so the same file can be selected again if needed
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
        )}
      </div>
    </div>
  );
}


