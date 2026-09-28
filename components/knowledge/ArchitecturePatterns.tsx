'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import type { ArchitecturePattern } from '@/types';
import { getConfidenceColor } from '@/lib/calculations';
import { X, Plus } from 'lucide-react';
import { generateId } from '@/lib/utils';

export function ArchitecturePatterns() {
  const store = useStore();
  const [selected, setSelected] = useState<ArchitecturePattern | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');

  function handleAdd() {
    if (!name.trim()) return;
    const pattern: ArchitecturePattern = {
      id: generateId(),
      name: name.trim(),
      problem: problem.trim(),
      context: '',
      solution: solution.trim(),
      advantages: [],
      disadvantages: [],
      whenToUse: [],
      whenNotToUse: [],
      failureModes: [],
      relatedPatterns: [],
      tags: [],
      confidence: 50,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    store.addArchitecturePattern(pattern);
    setName(''); setProblem(''); setSolution('');
    setShowAdd(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#F8FAFC]">Architecture Pattern Library</h1>
          <p className="text-xs text-[#94A3B8]">{store.architecturePatterns.length} patterns</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 bg-[#00FF9C] text-[#091B21] rounded-md px-3 py-1.5 text-xs font-semibold hover:bg-[#00e68a] transition-colors">
          <Plus size={13} /> Add Pattern
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {store.architecturePatterns.map(pattern => (
          <div
            key={pattern.id}
            onClick={() => setSelected(pattern)}
            className="rounded-lg border border-[#1e3a5f] bg-[#091B21] p-4 cursor-pointer hover:border-[#00FF9C]/40 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-semibold text-[#F8FAFC]">{pattern.name}</h3>
              <span className="text-xs font-mono" style={{ color: getConfidenceColor(pattern.confidence) }}>{pattern.confidence}%</span>
            </div>
            <p className="text-xs text-[#94A3B8] line-clamp-2 mb-3">{pattern.problem}</p>
            {pattern.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {pattern.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-[#1e3a5f] text-[#94A3B8]">{tag}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pattern detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl border border-[#1e3a5f] bg-[#091B21] shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-[#1e3a5f] bg-[#091B21] px-5 py-4">
              <h2 className="text-sm font-semibold text-[#F8FAFC]">{selected.name}</h2>
              <button onClick={() => setSelected(null)} className="text-[#94A3B8] hover:text-[#F8FAFC] p-1"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-5">
              <Section title="Problem" content={selected.problem} />
              {selected.context && <Section title="Context" content={selected.context} />}
              <Section title="Solution" content={selected.solution} />
              {selected.advantages.length > 0 && <ListSection title="Advantages" items={selected.advantages} color="#00FF9C" />}
              {selected.disadvantages.length > 0 && <ListSection title="Disadvantages" items={selected.disadvantages} color="#EF4444" />}
              {selected.whenToUse.length > 0 && <ListSection title="When to Use" items={selected.whenToUse} color="#10B981" />}
              {selected.whenNotToUse.length > 0 && <ListSection title="When NOT to Use" items={selected.whenNotToUse} color="#F59E0B" />}
              {selected.failureModes.length > 0 && <ListSection title="Failure Modes" items={selected.failureModes} color="#EF4444" />}
              {selected.realWorldExample && <Section title="Real-World Example" content={selected.realWorldExample} />}
              {selected.relatedPatterns.length > 0 && (
                <div>
                  <p className="text-xs text-[#94A3B8] uppercase tracking-wider mb-2">Related Patterns</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.relatedPatterns.map(p => (
                      <span key={p} className="text-xs px-2 py-1 rounded bg-[#1e3a5f] text-[#94A3B8]">{p}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add pattern modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-xl border border-[#1e3a5f] bg-[#091B21] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1e3a5f] px-5 py-4">
              <h2 className="text-sm font-semibold text-[#F8FAFC]">Add Architecture Pattern</h2>
              <button onClick={() => setShowAdd(false)} className="text-[#94A3B8] hover:text-[#F8FAFC] p-1"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <Field label="Pattern Name" value={name} onChange={setName} />
              <Field label="Problem it solves" value={problem} onChange={setProblem} multiline />
              <Field label="Solution approach" value={solution} onChange={setSolution} multiline />
            </div>
            <div className="flex justify-end gap-2 border-t border-[#1e3a5f] px-5 py-3">
              <button onClick={() => setShowAdd(false)} className="text-xs px-3 py-1.5 border border-[#1e3a5f] rounded text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">Cancel</button>
              <button onClick={handleAdd} className="text-xs px-3 py-1.5 bg-[#00FF9C] text-[#091B21] rounded font-semibold hover:bg-[#00e68a] transition-colors">Add Pattern</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <p className="text-xs text-[#94A3B8] uppercase tracking-wider mb-1">{title}</p>
      <p className="text-sm text-[#F8FAFC] leading-relaxed">{content}</p>
    </div>
  );
}

function ListSection({ title, items, color }: { title: string; items: string[]; color: string }) {
  return (
    <div>
      <p className="text-xs text-[#94A3B8] uppercase tracking-wider mb-2">{title}</p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-[#F8FAFC]">
            <span style={{ color }}>•</span> {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Field({ label, value, onChange, multiline }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  const cls = "w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]";
  return (
    <div>
      <label className="block text-xs text-[#94A3B8] mb-1">{label}</label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} className={`${cls} resize-none`} />
        : <input value={value} onChange={e => onChange(e.target.value)} className={cls} />
      }
    </div>
  );
}
