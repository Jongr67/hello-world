import React from 'react';
import type { Application, Certificate } from '../types/domain';

type NewCert = { cn: string; serial: string; expirationDate: string; applicationId: string };

type EditFields = { cn?: string; serial?: string; expirationDate?: string; applicationId?: number | '' };

type Props = {
  applications: Application[];
  certificates: Certificate[];
  loading: boolean;
  newCert: NewCert;
  setNewCert: (updater: (prev: NewCert) => NewCert) => void | void;
  creatingCert: boolean;
  onCreateCertificate: (e: React.FormEvent) => void | Promise<void>;
  editingCertId: number | null;
  editingCertFields: EditFields;
  startEditCertificate: (c: Certificate) => void;
  cancelEditCertificate: () => void;
  saveEditCertificate: (id: number) => void | Promise<void>;
};

export default function CertificatesSection({
  applications,
  certificates,
  loading,
  newCert,
  setNewCert,
  creatingCert,
  onCreateCertificate,
  editingCertId,
  editingCertFields,
  startEditCertificate,
  cancelEditCertificate,
  saveEditCertificate,
}: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24, alignItems: 'start' }}>
      <div style={{ padding: 20, border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)', background: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ marginTop: 0 }}>Certificates</h3>
        </div>
        <form onSubmit={onCreateCertificate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 8, alignItems: 'end', marginBottom: 12 }}>
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
                      <input value={editingCertFields.cn || ''} onChange={e => (/* controlled by parent */ 0, (editingCertFields.cn = e.target.value))} placeholder="CN" style={{ width: '100%', padding: 6, border: '1px solid #d1d5db', borderRadius: 6 }} />
                    </div>
                    <div>
                      <input value={editingCertFields.serial || ''} onChange={e => (editingCertFields.serial = e.target.value)} placeholder="Serial" style={{ width: '100%', padding: 6, border: '1px solid #d1d5db', borderRadius: 6 }} />
                    </div>
                    <div>
                      <input type="date" value={editingCertFields.expirationDate || ''} onChange={e => (editingCertFields.expirationDate = e.target.value)} style={{ width: '100%', padding: 6, border: '1px solid #d1d5db', borderRadius: 6 }} />
                    </div>
                    <div>
                      <select value={editingCertFields.applicationId ?? ''} onChange={e => (editingCertFields.applicationId = e.target.value ? Number(e.target.value) : '')} style={{ width: '100%', padding: 6, border: '1px solid #d1d5db', borderRadius: 6 }}>
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
  );
}
