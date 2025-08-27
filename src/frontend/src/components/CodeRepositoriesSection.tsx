import React, { useState, useEffect } from 'react';
import type { CodeRepository, Application, Team } from '../types/domain';
import { api } from '../services/api';

type Props = {
  applications: Application[];
  teams: Team[];
  loading: boolean;
};

export default function CodeRepositoriesSection({ applications, teams, loading }: Props) {
  const [repositories, setRepositories] = useState<CodeRepository[]>([]);
  const [repositoriesLoading, setRepositoriesLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingRepo, setEditingRepo] = useState<CodeRepository | null>(null);
  const [formRepo, setFormRepo] = useState<Partial<CodeRepository>>({ 
    repositoryUrl: '', 
    projectId: '', 
    applicationId: undefined, 
    teamId: undefined 
  });
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadRepositories();
  }, []);

  async function loadRepositories() {
    try {
      setRepositoriesLoading(true);
      const data = await api.getCodeRepositories();
      setRepositories(Array.isArray(data) ? data : []);
      setError('');
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setRepositoriesLoading(false);
    }
  }

  function startCreateRepo() {
    setEditingRepo(null);
    setFormRepo({ repositoryUrl: '', projectId: '', applicationId: undefined, teamId: undefined });
  }

  function startEditRepo(repo: CodeRepository) {
    setEditingRepo(repo);
    setFormRepo({ 
      repositoryUrl: repo.repositoryUrl, 
      projectId: repo.projectId, 
      applicationId: repo.application?.id, 
      teamId: repo.team?.id 
    });
  }

  function updateForm<K extends keyof typeof formRepo>(key: K, value: typeof formRepo[K]) {
    setFormRepo(prev => ({ ...prev, [key]: value }));
  }

  async function submitRepoForm(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        repositoryUrl: formRepo.repositoryUrl?.trim() || '',
        projectId: formRepo.projectId?.trim() || '',
        applicationId: formRepo.applicationId || null,
        teamId: formRepo.teamId || null,
      };
      
      if (!payload.repositoryUrl || !payload.projectId) {
        setError('Repository URL and Project ID are required');
        return;
      }

      if (editingRepo) {
        await api.updateCodeRepository(editingRepo.id, payload as any);
      } else {
        await api.createCodeRepository(payload as any);
      }
      
      await loadRepositories();
      setEditingRepo(null);
      setFormRepo({ repositoryUrl: '', projectId: '', applicationId: undefined, teamId: undefined });
      setError('');
    } catch (e: any) {
      setError(e.message || String(e));
    }
  }

  async function deleteRepo(repo: CodeRepository) {
    if (!confirm(`Delete repository "${repo.repositoryUrl}"?`)) return;
    try {
      await api.deleteCodeRepository(repo.id);
      await loadRepositories();
    } catch (e: any) {
      setError(e.message || String(e));
    }
  }

  async function handleExport() {
    try {
      setExporting(true);
      const blob = await api.exportCodeRepositories();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'code-repositories.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setExporting(false);
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      await api.importCodeRepositories(file);
      await loadRepositories();
      setError('');
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24, alignItems: 'start' }}>
      <div style={{ padding: 20, border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)', background: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ marginTop: 0 }}>Code Repositories</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleExport} disabled={exporting} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>
              {exporting ? 'Exporting...' : 'Export'}
            </button>
            <label style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>
              {importing ? 'Importing...' : 'Import'}
              <input type="file" accept=".xlsx,.xls" onChange={handleImport} style={{ display: 'none' }} />
            </label>
            <button onClick={startCreateRepo} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>New Repository</button>
          </div>
        </div>

        <div style={{ overflowX: 'auto', marginTop: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 1fr 1fr 120px', gap: 12, padding: '10px 0', borderBottom: '1px solid #f3f4f6', fontWeight: 600, color: '#374151', minWidth: 800 }}>
            <div>Repository URL</div>
            <div>Project ID</div>
            <div>Application Name</div>
            <div>Assigned Team</div>
            <div>Actions</div>
          </div>
          {repositoriesLoading ? (
            <div style={{ padding: '10px 0', color: '#6b7280', fontSize: 12 }}>Loading repositories…</div>
          ) : repositories.length === 0 ? (
            <div style={{ padding: '10px 0', color: '#6b7280', fontSize: 12 }}>No repositories</div>
          ) : (
            repositories.map(repo => (
              <div key={repo.id} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 1fr 1fr 120px', gap: 12, padding: '10px 0', borderBottom: '1px solid #f3f4f6', alignItems: 'center' }}>
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{repo.repositoryUrl}</div>
                <div>{repo.projectId}</div>
                <div>{repo.application?.name || '-'}</div>
                <div>{repo.team?.name || '-'}</div>
                <div>
                  <button onClick={() => startEditRepo(repo)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', marginRight: 8 }}>Edit</button>
                  <button onClick={() => deleteRepo(repo)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ef4444', background: '#fff', color: '#b91c1c', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ padding: 20, border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)', background: '#fff' }}>
        <h3 style={{ marginTop: 0 }}>{editingRepo ? 'Edit Repository' : 'Create Repository'}</h3>
        <form onSubmit={submitRepoForm} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Repository URL *</label>
            <input value={formRepo.repositoryUrl || ''} onChange={e => updateForm('repositoryUrl', e.target.value)} placeholder="https://git.example.com/team/repo" style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 8 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Project ID *</label>
            <input value={formRepo.projectId || ''} onChange={e => updateForm('projectId', e.target.value)} placeholder="PROJ-001" style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 8 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Application</label>
            <select 
              value={formRepo.applicationId || ''} 
              onChange={e => updateForm('applicationId', e.target.value ? parseInt(e.target.value) : undefined)}
              style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 8 }}
            >
              <option value="">Select an application...</option>
              {applications.map(app => (
                <option key={app.id} value={app.id}>
                  {app.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Assigned Team</label>
            <select 
              value={formRepo.teamId || ''} 
              onChange={e => updateForm('teamId', e.target.value ? parseInt(e.target.value) : undefined)}
              style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 8 }}
            >
              <option value="">Select a team...</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name} ({team.productArea?.apg})
                </option>
              ))}
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
            <button type="submit" style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #10b981', background: '#10b981', color: '#fff', cursor: 'pointer' }}>{editingRepo ? 'Update' : 'Create'}</button>
            {editingRepo && (
              <button type="button" onClick={startCreateRepo} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Cancel</button>
            )}
          </div>
        </form>
      </div>

      {error && <p style={{ color: '#b91c1c' }}>Error: {error}</p>}
    </div>
  );
}
