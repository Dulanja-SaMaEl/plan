'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { getConfidenceColor } from '@/lib/calculations';
import type { KnowledgeConcept, KnowledgeCategory } from '@/types';
import { Plus, X, ChevronDown, ChevronRight } from 'lucide-react';
import { generateId } from '@/lib/utils';

const CATEGORY_LABELS: Record<KnowledgeCategory, string> = {
  'computer-science': 'Computer Science',
  'backend': 'Backend Engineering',
  'java': 'Java & JVM',
  'databases': 'Databases',
  'networking': 'Networking',
  'distributed-systems': 'Distributed Systems',
  'architecture': 'Architecture',
  'security': 'Security',
  'cloud-devops': 'Cloud & DevOps',
  'observability': 'Observability',
  'ml-ai': 'ML / AI Engineering',
  'system-design': 'System Design',
};

const CATEGORY_COLORS: Record<KnowledgeCategory, string> = {
  'computer-science': '#6366F1',
  'backend': '#3B82F6',
  'java': '#F59E0B',
  'databases': '#10B981',
  'networking': '#06B6D4',
  'distributed-systems': '#8B5CF6',
  'architecture': '#EF4444',
  'security': '#F97316',
  'cloud-devops': '#14B8A6',
  'observability': '#84CC16',
  'ml-ai': '#00FF9C',
  'system-design': '#EC4899',
};

export function KnowledgeTopics() {
  const store = useStore();
  const [expanded, setExpanded] = useState<string[]>(['databases', 'distributed-systems']);
  const [selected, setSelected] = useState<KnowledgeConcept | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addCategory, setAddCategory] = useState<KnowledgeCategory>('backend');
  const [addName, setAddName] = useState('');
  const [addDef, setAddDef] = useState('');
  const [addWhy, setAddWhy] = useState('');
  const [addHow, setAddHow] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editDraft, setEditDraft] = useState<Partial<KnowledgeConcept>>({});

  const categories = (Object.keys(CATEGORY_LABELS) as KnowledgeCategory[]).filter(cat =>
    store.concepts.some(c => c.category === cat)
  );

  function toggleCat(cat: string) {
    setExpanded(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  }

  function handleAddConcept() {
    if (!addName.trim()) return;
    const concept: KnowledgeConcept = {
      id: generateId(),
      name: addName.trim(),
      topicId: `topic-${addCategory}`,
      category: addCategory,
      definition: addDef,
      whyItExists: addWhy,
      howItWorks: addHow,
      relatedConceptIds: [],
      interviewQuestions: [],
      tags: [],
      confidence: 50,
      reviewCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      currentIntervalDays: 1,
      nextReviewDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    store.addConcept(concept);
    setAddName(''); setAddDef(''); setAddWhy(''); setAddHow('');
    setShowAdd(false);
  }

  function handleSaveEdit() {
    if (!selected) return;
    store.updateConcept(selected.id, editDraft);
    setSelected({ ...selected, ...editDraft });
    setEditMode(false);
    setEditDraft({});
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#F8FAFC]">Knowledge Topics</h1>
          <p className="text-xs text-[#94A3B8]">{store.concepts.length} total concepts</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 bg-[#00FF9C] text-[#091B21] rounded-md px-3 py-1.5 text-xs font-semibold hover:bg-[#00e68a] transition-colors">
          <Plus size={13} /> Add Concept
        </button>
      </div>

      {/* Category list */}
      <div className="space-y-2">
        {categories.map(cat => {
          const catConcepts = store.concepts.filter(c => c.category === cat);
          const avgConf = catConcepts.length > 0
            ? Math.round(catConcepts.reduce((s, c) => s + c.confidence, 0) / catConcepts.length)
            : 0;
          const isOpen = expanded.includes(cat);
          const color = CATEGORY_COLORS[cat];

          return (
            <div key={cat} className="rounded-lg border border-[#1e3a5f] bg-[#091B21] overflow-hidden">
              <button
                onClick={() => toggleCat(cat)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#0d1f35] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-sm font-medium text-[#F8FAFC]">{CATEGORY_LABELS[cat]}</span>
                  <span className="text-xs text-[#94A3B8]">{catConcepts.length} concepts</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono" style={{ color: getConfidenceColor(avgConf) }}>{avgConf}% avg</span>
                  {isOpen ? <ChevronDown size={14} className="text-[#94A3B8]" /> : <ChevronRight size={14} className="text-[#94A3B8]" />}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-[#1e3a5f] divide-y divide-[#1e3a5f]">
                  {catConcepts.map(concept => (
                    <button
                      key={concept.id}
                      onClick={() => { setSelected(concept); setEditMode(false); setEditDraft({}); }}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#0d1f35] transition-colors text-left"
                    >
                      <p className="text-sm text-[#F8FAFC] truncate">{concept.name}</p>
                      <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                        <div className="w-16 h-1 bg-[#1e3a5f] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${concept.confidence}%`, backgroundColor: getConfidenceColor(concept.confidence) }} />
                        </div>
                        <span className="text-xs w-8 text-right font-mono" style={{ color: getConfidenceColor(concept.confidence) }}>{concept.confidence}%</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Concept detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl border border-[#1e3a5f] bg-[#091B21] shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-[#1e3a5f] bg-[#091B21] px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-[#F8FAFC]">{selected.name}</h2>
                <p className="text-xs text-[#94A3B8]">{CATEGORY_LABELS[selected.category as KnowledgeCategory]}</p>
              </div>
              <div className="flex items-center gap-2">
                {!editMode && (
                  <button onClick={() => { setEditMode(true); setEditDraft({ myExplanation: selected.myExplanation || '', confidence: selected.confidence }); }} className="text-xs px-3 py-1.5 border border-[#1e3a5f] rounded text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">Edit</button>
                )}
                {editMode && (
                  <button onClick={handleSaveEdit} className="text-xs px-3 py-1.5 bg-[#00FF9C] text-[#091B21] rounded font-semibold hover:bg-[#00e68a] transition-colors">Save</button>
                )}
                <button onClick={() => setSelected(null)} className="text-[#94A3B8] hover:text-[#F8FAFC] p-1"><X size={16} /></button>
              </div>
            </div>
            <div className="p-5 space-y-5">
              {selected.definition && <Section title="Definition" content={selected.definition} />}
              {selected.whyItExists && <Section title="Why it exists" content={selected.whyItExists} />}
              {selected.howItWorks && <Section title="How it works" content={selected.howItWorks} />}
              {(selected.whenToUse || selected.whenNotToUse) && (
                <div className="grid grid-cols-2 gap-3">
                  {selected.whenToUse && (
                    <div className="rounded-md bg-green-500/10 border border-green-500/20 p-3">
                      <p className="text-xs text-green-400 font-semibold mb-1">✓ When to use</p>
                      <p className="text-xs text-[#F8FAFC]">{selected.whenToUse}</p>
                    </div>
                  )}
                  {selected.whenNotToUse && (
                    <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3">
                      <p className="text-xs text-red-400 font-semibold mb-1">✗ When NOT to use</p>
                      <p className="text-xs text-[#F8FAFC]">{selected.whenNotToUse}</p>
                    </div>
                  )}
                </div>
              )}
              {selected.firstPrinciples && <Section title="First Principles" content={selected.firstPrinciples} />}
              {selected.realWorldExample && <Section title="Real-World Example" content={selected.realWorldExample} />}
              {selected.codeExample && (
                <div>
                  <p className="text-xs text-[#94A3B8] uppercase tracking-wider mb-2">Code Example</p>
                  <pre className="bg-[#0F172A] rounded-md p-3 text-xs text-[#00FF9C] overflow-x-auto font-mono whitespace-pre-wrap">{selected.codeExample}</pre>
                </div>
              )}
              {selected.commonMistakes && <Section title="Common Mistakes" content={selected.commonMistakes} />}
              {/* My explanation */}
              <div>
                <p className="text-xs text-[#94A3B8] uppercase tracking-wider mb-2">My Own Explanation</p>
                {editMode ? (
                  <textarea
                    value={editDraft.myExplanation || ''}
                    onChange={e => setEditDraft(d => ({ ...d, myExplanation: e.target.value }))}
                    rows={4}
                    placeholder="Write this from memory — not a copy-paste..."
                    className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C] resize-none"
                  />
                ) : (
                  <p className="text-sm text-[#F8FAFC]">{selected.myExplanation || <span className="text-[#94A3B8] italic">Not written yet. Try explaining from memory.</span>}</p>
                )}
              </div>
              {/* Confidence */}
              {editMode && (
                <div>
                  <p className="text-xs text-[#94A3B8] uppercase tracking-wider mb-2">Confidence: {editDraft.confidence}%</p>
                  <input
                    type="range"
                    min={0} max={100}
                    value={editDraft.confidence || 50}
                    onChange={e => setEditDraft(d => ({ ...d, confidence: parseInt(e.target.value) }))}
                    className="w-full accent-[#00FF9C]"
                  />
                </div>
              )}
              {/* Interview questions */}
              {selected.interviewQuestions && selected.interviewQuestions.length > 0 && (
                <div>
                  <p className="text-xs text-[#94A3B8] uppercase tracking-wider mb-2">Interview Questions</p>
                  <ul className="space-y-1">
                    {selected.interviewQuestions.map((q, i) => (
                      <li key={i} className="text-xs text-[#F8FAFC]">• {q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add concept modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-xl border border-[#1e3a5f] bg-[#091B21] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1e3a5f] px-5 py-4">
              <h2 className="text-sm font-semibold text-[#F8FAFC]">Add Knowledge Concept</h2>
              <button onClick={() => setShowAdd(false)} className="text-[#94A3B8] hover:text-[#F8FAFC] p-1"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-[#94A3B8] mb-1">Category</label>
                <select value={addCategory} onChange={e => setAddCategory(e.target.value as KnowledgeCategory)} className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-2 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]">
                  {(Object.entries(CATEGORY_LABELS) as [KnowledgeCategory, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <Field label="Concept Name" value={addName} onChange={setAddName} />
              <Field label="Definition" value={addDef} onChange={setAddDef} multiline />
              <Field label="Why it exists" value={addWhy} onChange={setAddWhy} multiline />
              <Field label="How it works" value={addHow} onChange={setAddHow} multiline />
            </div>
            <div className="flex justify-end gap-2 border-t border-[#1e3a5f] px-5 py-3">
              <button onClick={() => setShowAdd(false)} className="text-xs px-3 py-1.5 border border-[#1e3a5f] rounded text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">Cancel</button>
              <button onClick={handleAddConcept} className="text-xs px-3 py-1.5 bg-[#00FF9C] text-[#091B21] rounded font-semibold hover:bg-[#00e68a] transition-colors">Add Concept</button>
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
