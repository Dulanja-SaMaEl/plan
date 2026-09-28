'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import type { Project } from '@/types';
import { Plus, X } from 'lucide-react';
import { generateId } from '@/lib/utils';
import { format } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  lead: '#94A3B8', planning: '#3B82F6', active: '#10B981', waiting: '#F59E0B',
  testing: '#8B5CF6', revision: '#F97316', completed: '#00FF9C', archived: '#94A3B8',
};

const CATEGORY_COLORS: Record<string, string> = {
  'main-job': '#3B82F6', freelance: '#8B5CF6', personal: '#06B6D4',
  learning: '#10B981', content: '#F59E0B',
};

export function ProjectsPage() {
  const store = useStore();
  const [selected, setSelected] = useState<Project | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [filterCat, setFilterCat] = useState('all');
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState<Project['category']>('freelance');
  const [clientId, setClientId] = useState('');
  const [estHours, setEstHours] = useState('');
  const [weeklyHours, setWeeklyHours] = useState('');
  const [revenue, setRevenue] = useState('');
  const [status, setStatus] = useState<Project['status']>('planning');

  const filtered = filterCat === 'all' ? store.projects : store.projects.filter(p => p.category === filterCat);

  function handleAdd() {
    if (!name.trim()) return;
    const proj: Project = {
      id: generateId(),
      name: name.trim(),
      description: desc,
      clientId: clientId || undefined,
      status,
      priority: 'medium',
      estimatedHours: parseFloat(estHours) || 0,
      weeklyRequiredHours: parseFloat(weeklyHours) || 0,
      actualHours: 0,
      revenue: revenue ? parseFloat(revenue) : undefined,
      category: cat,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    // Capacity check for freelance
    if (cat === 'freelance') {
      const weeklyFree = store.capacityConfig.freelanceHours - store.projects.filter(p => p.category === 'freelance' && p.status === 'active').reduce((s, p) => s + p.weeklyRequiredHours, 0);
      if (parseFloat(weeklyHours) > weeklyFree) {
        alert(`⚠️ Capacity Warning\n\nAvailable freelance: ${weeklyFree}h/week\nThis project needs: ${weeklyHours}h/week\nOverload: ${(parseFloat(weeklyHours) - weeklyFree).toFixed(1)}h/week\n\nConsider scheduling when existing projects finish.`);
      }
    }
    store.addProject(proj);
    setName(''); setDesc(''); setCat('freelance'); setClientId(''); setEstHours(''); setWeeklyHours(''); setRevenue(''); setStatus('planning');
    setShowAdd(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#F8FAFC]">Projects</h1>
          <p className="text-xs text-[#94A3B8]">{store.projects.length} projects across {new Set(store.projects.map(p => p.category)).size} categories</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 bg-[#00FF9C] text-[#091B21] rounded-md px-3 py-1.5 text-xs font-semibold hover:bg-[#00e68a] transition-colors">
          <Plus size={13} /> New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'main-job', 'freelance', 'content', 'learning', 'personal'].map(f => (
          <button key={f} onClick={() => setFilterCat(f)}
            className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
              filterCat === f ? 'bg-[#003F59] text-[#00FF9C] border border-[#00FF9C]/30' : 'bg-[#091B21] text-[#94A3B8] border border-[#1e3a5f] hover:text-[#F8FAFC]'
            }`}>
            {f === 'all' ? 'All' : f.replace('-', ' ').replace('job', 'job').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      {/* Projects grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(proj => {
          const client = store.clients.find(c => c.id === proj.clientId);
          const tasks = store.tasks.filter(t => t.projectId === proj.id);
          const doneTasks = tasks.filter(t => t.status === 'done').length;
          const progress = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;
          const statusColor = STATUS_COLORS[proj.status] || '#94A3B8';
          const catColor = CATEGORY_COLORS[proj.category] || '#94A3B8';

          return (
            <div key={proj.id} className="rounded-lg border border-[#1e3a5f] bg-[#091B21] p-4 cursor-pointer hover:border-[#2a4a7f] transition-colors" onClick={() => setSelected(proj)}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: proj.color || catColor }} />
                  <div>
                    <p className="text-sm font-semibold text-[#F8FAFC]">{proj.name}</p>
                    {client && <p className="text-xs text-[#94A3B8]">{client.name}</p>}
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded font-medium flex-shrink-0" style={{ backgroundColor: `${statusColor}20`, color: statusColor }}>
                  {proj.status}
                </span>
              </div>
              {proj.description && <p className="text-xs text-[#94A3B8] mb-3 line-clamp-2">{proj.description}</p>}
              {/* Progress */}
              {tasks.length > 0 && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-[#94A3B8] mb-1">
                    <span>{doneTasks}/{tasks.length} tasks</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1 bg-[#1e3a5f] rounded-full overflow-hidden">
                    <div className="h-full bg-[#00FF9C] rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                <span>{proj.weeklyRequiredHours}h/week</span>
                {proj.revenue && <span className="text-green-400">${proj.revenue.toLocaleString()}</span>}
                {proj.deadline && <span>{format(new Date(proj.deadline), 'MMM d')}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Project detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl border border-[#1e3a5f] bg-[#091B21] shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-[#1e3a5f] bg-[#091B21] px-5 py-4">
              <h2 className="text-sm font-semibold text-[#F8FAFC]">{selected.name}</h2>
              <button onClick={() => setSelected(null)} className="text-[#94A3B8] hover:text-[#F8FAFC] p-1"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              {selected.description && <p className="text-sm text-[#94A3B8]">{selected.description}</p>}
              <div className="grid grid-cols-2 gap-3">
                <InfoPair label="Status" value={selected.status} />
                <InfoPair label="Priority" value={selected.priority} />
                <InfoPair label="Category" value={selected.category} />
                <InfoPair label="Weekly Required" value={`${selected.weeklyRequiredHours}h`} />
                <InfoPair label="Estimated Total" value={`${selected.estimatedHours}h`} />
                <InfoPair label="Actual Hours" value={`${selected.actualHours}h`} />
                {selected.revenue && <InfoPair label="Revenue" value={`$${selected.revenue.toLocaleString()}`} />}
                {selected.paymentStatus && <InfoPair label="Payment" value={selected.paymentStatus} />}
                {selected.deadline && <InfoPair label="Deadline" value={format(new Date(selected.deadline), 'MMM d, yyyy')} />}
              </div>
              {/* Tasks for this project */}
              <div>
                <p className="text-xs text-[#94A3B8] uppercase tracking-wider mb-2">Tasks</p>
                {store.tasks.filter(t => t.projectId === selected.id).length === 0
                  ? <p className="text-xs text-[#94A3B8]">No tasks yet.</p>
                  : store.tasks.filter(t => t.projectId === selected.id).slice(0, 6).map(task => (
                    <div key={task.id} className="flex items-center justify-between py-1.5 border-b border-[#1e3a5f]">
                      <p className="text-xs text-[#F8FAFC] truncate">{task.title}</p>
                      <span className={`text-xs ml-2 flex-shrink-0 ${
                        task.status === 'done' ? 'text-[#00FF9C]' : task.status === 'in-progress' ? 'text-blue-400' : 'text-[#94A3B8]'
                      }`}>{task.status}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add project modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-xl border border-[#1e3a5f] bg-[#091B21] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1e3a5f] px-5 py-4">
              <h2 className="text-sm font-semibold text-[#F8FAFC]">New Project</h2>
              <button onClick={() => setShowAdd(false)} className="text-[#94A3B8] hover:text-[#F8FAFC] p-1"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <Field label="Project Name" value={name} onChange={setName} />
              <Field label="Description" value={desc} onChange={setDesc} multiline />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1">Category</label>
                  <select value={cat} onChange={e => setCat(e.target.value as Project['category'])} className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-2 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]">
                    <option value="main-job">Main Job</option>
                    <option value="freelance">Freelance</option>
                    <option value="content">Content</option>
                    <option value="learning">Learning</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1">Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value as Project['status'])} className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-2 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]">
                    <option value="lead">Lead</option>
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="waiting">Waiting</option>
                    <option value="testing">Testing</option>
                    <option value="revision">Revision</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1">Client</label>
                  <select value={clientId} onChange={e => setClientId(e.target.value)} className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-2 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]">
                    <option value="">No client</option>
                    {store.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <Field label="Estimated Hours" value={estHours} onChange={setEstHours} type="number" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Weekly Hours" value={weeklyHours} onChange={setWeeklyHours} type="number" />
                <Field label="Revenue ($)" value={revenue} onChange={setRevenue} type="number" />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-[#1e3a5f] px-5 py-3">
              <button onClick={() => setShowAdd(false)} className="text-xs px-3 py-1.5 border border-[#1e3a5f] rounded text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">Cancel</button>
              <button onClick={handleAdd} className="text-xs px-3 py-1.5 bg-[#00FF9C] text-[#091B21] rounded font-semibold hover:bg-[#00e68a] transition-colors">Create Project</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoPair({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[#94A3B8]">{label}</p>
      <p className="text-sm text-[#F8FAFC] capitalize">{value}</p>
    </div>
  );
}

function Field({ label, value, onChange, multiline, type }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean; type?: string }) {
  const cls = "w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]";
  return (
    <div>
      <label className="block text-xs text-[#94A3B8] mb-1">{label}</label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={2} className={`${cls} resize-none`} />
        : <input type={type || 'text'} value={value} onChange={e => onChange(e.target.value)} className={cls} />
      }
    </div>
  );
}
