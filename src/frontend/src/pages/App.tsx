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
import { Application, Finding, Team } from '../types/domain';
import { api } from '../services/api';
import ApplicationsSection from '../components/ApplicationsSection';
import CertificatesSection from '../components/CertificatesSection';
import { TeamsSection } from '../components/TeamsSection';
import { TicketFlyout } from '../components/TicketFlyout';
import { FindingsFlyout } from '../components/FindingsFlyout';
import CodeRepositoriesSection from '../components/CodeRepositoriesSection';

ChartJS.register(ArcElement, Tooltip, Legend);



type Ticket = {
  id: number;
  jiraKey?: string;
  jiraUrl?: string;
  apg?: string;
  status?: string;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'findings' | 'applications' | 'certificates' | 'tickets' | 'teams' | 'repositories'>('findings');
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

  const [teams, setTeams] = useState<Team[]>([]);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [formApp, setFormApp] = useState<Partial<Application>>({ sealId: '', name: '', platform: '', codeRepository: '' });

  const [editingTicketId, setEditingTicketId] = useState<number | null>(null);
  const [editingTicketFields, setEditingTicketFields] = useState<Partial<Ticket>>({});
  const [newTicketByFindingId, setNewTicketByFindingId] = useState<Record<number, Partial<Ticket>>>({});

  // Flyout state
  const [flyoutApp, setFlyoutApp] = useState<Application | null>(null);
  const [ticketFlyoutFinding, setTicketFlyoutFinding] = useState<Finding | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [summaryData, findingsData, appsData, certsData, ticketsData, teamsData] = await Promise.all([
          api.getFindingsSummary(), api.getFindings(), api.getApplications(), api.getCertificates(), api.getTickets(), api.getTeams()
        ]);
        setSummary(summaryData || {});
        setFindings(Array.isArray(findingsData) ? findingsData : []);
        setApplications(Array.isArray(appsData) ? appsData : []);
        setCertificates(Array.isArray(certsData) ? certsData : []);
        setTickets(Array.isArray(ticketsData) ? ticketsData : []);
        setTeams(Array.isArray(teamsData) ? teamsData : []);
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
    setFormApp({ sealId: '', name: '', platform: '', codeRepository: '' });
  }

  function startEditApp(app: Application) {
    setEditingApp(app);
    setFormApp({ ...app });
  }

  function updateFormTeam(teamId: number | null) {
    const team = teamId ? teams.find(t => t.id === teamId) : undefined;
    setFormApp(prev => ({ ...prev, team }));
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
        teamId: formApp.team?.id || null,
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
      setFormApp({ sealId: '', name: '', platform: '', codeRepository: '' });
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
  }

  function openFindingsFlyout(app: Application) {
    if ((findingsBySealId[app.sealId] || 0) === 0) return;
    setFlyoutApp(app);
  }

  function openTicketFlyout(finding: Finding) {
    setTicketFlyoutFinding(finding);
  }

  function closeTicketFlyout() {
    setTicketFlyoutFinding(null);
  }

  function updateNewTicketField(findingId: number, key: keyof Ticket, value: string) {
    setNewTicketByFindingId(prev => ({ ...prev, [findingId]: { ...prev[findingId], [key]: value } }));
  }

  async function refreshTicketsForFinding(findingId: number) {
    // This function is no longer needed as the flyout components handle their own data
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
      console.error('Error adding ticket:', e.message || String(e));
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
      console.error('Error updating ticket:', e.message || String(e));
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
      console.error('Error deleting ticket:', e.message || String(e));
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
            <button onClick={() => setActiveTab('repositories')} style={{ padding: '6px 12px', borderRadius: 9999, border: '1px solid ' + (activeTab === 'repositories' ? '#d1d5db' : 'transparent'), background: activeTab === 'repositories' ? '#fff' : 'transparent', cursor: 'pointer' }}>Code Repositories</button>
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
            teams={teams}
            loading={loading}
            findingsBySealId={findingsBySealId}
            editingApp={editingApp}
            formApp={formApp}
            startCreateApp={startCreateApp}
            startEditApp={startEditApp}
            deleteApp={deleteApp}
            submitAppForm={submitAppForm}
            updateForm={updateForm as any}
            updateFormTeam={updateFormTeam}
            openFindingsFlyout={openFindingsFlyout}
          />
        )}

        <TicketFlyout
          finding={ticketFlyoutFinding}
          onClose={closeTicketFlyout}
          onRefreshGlobalTickets={refreshGlobalTickets}
        />

        <FindingsFlyout
          application={flyoutApp}
          onClose={closeFlyout}
          onOpenTicketFlyout={openTicketFlyout}
        />

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

        {activeTab === 'repositories' && (
          <CodeRepositoriesSection
            applications={applications}
            teams={teams}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}


