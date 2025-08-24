import React from 'react';
import type { Application } from '../types/domain';

type Props = {
  applications: Application[];
  loading: boolean;
  findingsBySealId: Record<string, number>;
  editingApp: Application | null;
  formApp: Partial<Application>;
  startCreateApp: () => void;
  startEditApp: (app: Application) => void;
  deleteApp: (app: Application) => void;
  submitAppForm: (e: React.FormEvent) => void | Promise<void>;
  updateForm: (key: keyof Application, value: any) => void;
};

export default function ApplicationsSection({ applications, loading, findingsBySealId, editingApp, formApp, startCreateApp, startEditApp, deleteApp, submitAppForm, updateForm }: Props) {
  return (
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
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{app.certificates || '-'}</div>
                <div>
                  <button onClick={() => {/* keep behavior identical; this button remains in place for layout */}} style={{ padding: 0, margin: 0, border: 'none', background: 'none', color: '#2563eb', textDecoration: 'underline', cursor: (findingsBySealId[app.sealId] || 0) > 0 ? 'pointer' : 'default' }} title="View related findings">
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
  );
}
