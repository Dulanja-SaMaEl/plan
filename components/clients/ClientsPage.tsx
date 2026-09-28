'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import type { Client } from '@/types';
import { Plus, X, Mail, Phone } from 'lucide-react';
import { generateId } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  active: '#10B981', lead: '#3B82F6', inactive: '#94A3B8', archived: '#94A3B8',
};

export function ClientsPage() {
  const store = useStore();
  const [selected, setSelected] = useState<Client | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<Client['status']>('lead');
  const [notes, setNotes] = useState('');

  function handleAdd() {
    if (!name.trim()) return;
    const client: Client = {
      id: generateId(),
      name: name.trim(),
      contact: contact.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      status,
      notes: notes.trim() || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    store.addClient(client);
    setName(''); setContact(''); setEmail(''); setPhone(''); setStatus('lead'); setNotes('');
    setShowAdd(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#F8FAFC]">Clients</h1>
          <p className="text-xs text-[#94A3B8]">{store.clients.length} clients</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 bg-[#00FF9C] text-[#091B21] rounded-md px-3 py-1.5 text-xs font-semibold hover:bg-[#00e68a] transition-colors">
          <Plus size={13} /> Add Client
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {store.clients.map(client => {
          const projects = store.projects.filter(p => p.clientId === client.id);
          const totalRevenue = projects.reduce((s, p) => s + (p.revenue || 0), 0);
          const statusColor = STATUS_COLORS[client.status] || '#94A3B8';
          return (
            <div key={client.id} onClick={() => setSelected(client)} className="rounded-lg border border-[#1e3a5f] bg-[#091B21] p-4 cursor-pointer hover:border-[#2a4a7f] transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="h-10 w-10 rounded-full bg-[#003F59] flex items-center justify-center text-sm font-bold text-[#00FF9C] flex-shrink-0">
                  {client.name.charAt(0)}
                </div>
                <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ backgroundColor: `${statusColor}20`, color: statusColor }}>{client.status}</span>
              </div>
              <h3 className="text-sm font-semibold text-[#F8FAFC] mt-2">{client.name}</h3>
              <p className="text-xs text-[#94A3B8] mb-2">{client.contact}</p>
              <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
                <span>{projects.length} project{projects.length !== 1 ? 's' : ''}</span>
                {totalRevenue > 0 && <span className="text-green-400">${totalRevenue.toLocaleString()}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Client detail */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-xl border border-[#1e3a5f] bg-[#091B21] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1e3a5f] px-5 py-4">
              <h2 className="text-sm font-semibold text-[#F8FAFC]">{selected.name}</h2>
              <button onClick={() => setSelected(null)} className="text-[#94A3B8] hover:text-[#F8FAFC] p-1"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                {selected.email && <div className="flex items-center gap-2 text-sm text-[#94A3B8]"><Mail size={14} />{selected.email}</div>}
                {selected.phone && <div className="flex items-center gap-2 text-sm text-[#94A3B8]"><Phone size={14} />{selected.phone}</div>}
              </div>
              {/* Projects */}
              <div>
                <p className="text-xs text-[#94A3B8] uppercase tracking-wider mb-2">Projects</p>
                {store.projects.filter(p => p.clientId === selected.id).map(proj => (
                  <div key={proj.id} className="flex items-center justify-between py-2 border-b border-[#1e3a5f]">
                    <p className="text-sm text-[#F8FAFC]">{proj.name}</p>
                    <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                      {proj.revenue && <span className="text-green-400">${proj.revenue.toLocaleString()}</span>}
                      <span className="capitalize">{proj.status}</span>
                    </div>
                  </div>
                ))}
              </div>
              {selected.notes && (
                <div>
                  <p className="text-xs text-[#94A3B8] uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-sm text-[#F8FAFC]">{selected.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add client modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-[#1e3a5f] bg-[#091B21] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1e3a5f] px-5 py-4">
              <h2 className="text-sm font-semibold text-[#F8FAFC]">Add Client</h2>
              <button onClick={() => setShowAdd(false)} className="text-[#94A3B8] hover:text-[#F8FAFC] p-1"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <Field label="Client / Company Name" value={name} onChange={setName} />
              <Field label="Contact Person" value={contact} onChange={setContact} />
              <Field label="Email" value={email} onChange={setEmail} type="email" />
              <Field label="Phone" value={phone} onChange={setPhone} type="tel" />
              <div>
                <label className="block text-xs text-[#94A3B8] mb-1">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value as Client['status'])} className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-2 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]">
                  <option value="lead">Lead</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <Field label="Notes" value={notes} onChange={setNotes} multiline />
            </div>
            <div className="flex justify-end gap-2 border-t border-[#1e3a5f] px-5 py-3">
              <button onClick={() => setShowAdd(false)} className="text-xs px-3 py-1.5 border border-[#1e3a5f] rounded text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">Cancel</button>
              <button onClick={handleAdd} className="text-xs px-3 py-1.5 bg-[#00FF9C] text-[#091B21] rounded font-semibold hover:bg-[#00e68a] transition-colors">Add Client</button>
            </div>
          </div>
        </div>
      )}
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
