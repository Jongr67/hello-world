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
  const [filteredApg, setFilteredApg] = React.useState<string | null>(null);
  const [filteredDueWindow, setFilteredDueWindow] = React.useState<string | null>(null);
  const pieData = React.useMemo(() => {
    const labels = Object.keys(summary);
    const values = Object.values(summary);
    const palette = ['#6366f1','#22c55e','#f59e0b','#ef4444','#06b6d4','#84cc16','#a855f7','#fb7185','#14b8a6','#eab308'];
    return { 
      labels, 
      datasets: [{ 
        data: values, 
        backgroundColor: labels.map((_, i) => palette[i % palette.length]) 
      }] 
    };
  }, [summary]);

  const filteredFindings = React.useMemo(() => {
    let filtered = findings;
    
    if (filteredApg) {
      filtered = filtered.filter(f => f.assignedApg === filteredApg);
    }
    
    if (filteredDueWindow) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(f => {
        const d = (f.targetDate || '').toString();
        if (!d) return false;
        const target = new Date(d + 'T00:00:00');
        const diffMs = target.getTime() - today.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        switch (filteredDueWindow) {
          case 'Overdue':
            return diffDays < 0;
          case '≤30 days':
            return diffDays >= 0 && diffDays <= 30;
          case '31–60 days':
            return diffDays > 30 && diffDays <= 60;
          case '61–90 days':
            return diffDays > 60 && diffDays <= 90;
          default:
            return false;
        }
      });
    }
    
    return filtered;
  }, [findings, filteredApg, filteredDueWindow]);

  const handleApgPieChartClick = (event: any, elements: any[]) => {
    if (elements.length > 0) {
      const index = elements[0].index;
      const apg = Object.keys(summary)[index];
      setFilteredApg(apg);
      setFilteredDueWindow(null); // Clear due window filter when APG is selected
    }
  };

  const handleDueWindowPieChartClick = (event: any, elements: any[]) => {
    if (elements.length > 0) {
      const index = elements[0].index;
      const dueWindow = ['Overdue', '≤30 days', '31–60 days', '61–90 days'][index];
      setFilteredDueWindow(dueWindow);
      // Don't clear APG filter - allow both filters to be active
    }
  };

  const clearApgFilter = () => {
    setFilteredApg(null);
  };

  const clearDueWindowFilter = () => {
    setFilteredDueWindow(null);
  };

  const clearAllFilters = () => {
    setFilteredApg(null);
    setFilteredDueWindow(null);
  };

  const dueBuckets = React.useMemo(() => {
    const counts = { Overdue: 0, '≤30 days': 0, '31–60 days': 0, '61–90 days': 0 };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Use filtered findings instead of all findings
    const findingsToProcess = filteredApg ? findings.filter(f => f.assignedApg === filteredApg) : findings;
    
    for (const f of findingsToProcess) {
      const d = (f.targetDate || '').toString();
      if (!d) continue;
      const target = new Date(d + 'T00:00:00');
      const diffMs = target.getTime() - today.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays < 0) counts.Overdue += 1;
      else if (diffDays <= 30) counts['≤30 days'] += 1;
      else if (diffDays <= 60) counts['31–60 days'] += 1;
      else if (diffDays <= 90) counts['61–90 days'] += 1;
    }
    return counts;
  }, [findings, filteredApg]);

  const duePieData = React.useMemo(() => {
    const labels = ['Overdue', '≤30 days', '31–60 days', '61–90 days'];
    const values = labels.map(l => (dueBuckets as any)[l] as number);
    const palette = ['#ef4444', '#f59e0b', '#84cc16', '#06b6d4'];
    return { labels, datasets: [{ data: values, backgroundColor: labels.map((_, i) => palette[i % palette.length]) }] };
  }, [dueBuckets]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
      <div style={{ padding: 20, border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ marginTop: 0 }}>Findings by APG</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                         {(filteredApg || filteredDueWindow) && (
               <button 
                 onClick={clearAllFilters}
                 style={{ 
                   padding: '6px 10px', 
                   borderRadius: 6, 
                   border: '1px solid #2563eb', 
                   background: '#2563eb', 
                   color: '#fff', 
                   cursor: 'pointer',
                   fontSize: 12
                 }}
               >
                 Show All
               </button>
             )}
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
          <div style={{ height: 260 }}>
            <Pie 
              data={pieData} 
              options={{ 
                maintainAspectRatio: false, 
                plugins: { legend: { position: 'bottom' as const } },
                onClick: handleApgPieChartClick
              }} 
            />
          </div>
        )}
      </div>

      <div style={{ padding: 20, border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)', background: '#fff' }}>
                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
           <h3 style={{ marginTop: 0 }}>
             Findings by Due Window
             {filteredApg && (
               <span style={{ fontSize: 14, color: '#6b7280', fontWeight: 'normal' }}>
                 {' '}(for APG: {filteredApg})
               </span>
             )}
           </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {(filteredApg || filteredDueWindow) && (
              <button 
                onClick={clearAllFilters}
                style={{ 
                  padding: '6px 10px', 
                  borderRadius: 6, 
                  border: '1px solid #2563eb', 
                  background: '#2563eb', 
                  color: '#fff', 
                  cursor: 'pointer',
                  fontSize: 12
                }}
              >
                Show All
              </button>
            )}
          </div>
        </div>
        {loading ? (
          <p style={{ color: '#6b7280', fontSize: 12 }}>Loading chart…</p>
        ) : (
          <div style={{ height: 260 }}>
            <Pie 
              data={duePieData} 
              options={{ 
                maintainAspectRatio: false, 
                plugins: { legend: { position: 'bottom' as const } },
                onClick: handleDueWindowPieChartClick
              }} 
            />
          </div>
        )}
        <div style={{ marginTop: 8, color: '#6b7280', fontSize: 12 }}>
          Over 90 days and items without a target date are not included.
        </div>
      </div>

      <div style={{ padding: 20, border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ marginTop: 0 }}>
            Current Findings
            {filteredApg && (
              <span style={{ fontSize: 14, color: '#6b7280', fontWeight: 'normal' }}>
                {' '}(Filtered by APG: {filteredApg})
              </span>
            )}
            {filteredDueWindow && (
              <span style={{ fontSize: 14, color: '#6b7280', fontWeight: 'normal' }}>
                {' '}(Filtered by Due Window: {filteredDueWindow})
              </span>
            )}
          </h3>
        </div>
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
                         {filteredFindings.length === 0 && (
               <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr 160px 140px 140px 160px 160px', gap: 12, padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                 <div style={{ color: '#6b7280', fontSize: 12 }}>
                   {filteredApg && filteredDueWindow ? 
                    `No findings for APG: ${filteredApg} and Due Window: ${filteredDueWindow}` :
                    filteredApg ? `No findings for APG: ${filteredApg}` : 
                    filteredDueWindow ? `No findings for Due Window: ${filteredDueWindow}` : 
                    'No findings'}
                 </div>
               </div>
             )}
            {filteredFindings.map((f) => (
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
