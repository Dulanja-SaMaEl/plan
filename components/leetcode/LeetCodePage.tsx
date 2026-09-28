'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import type { LeetCodeProblem, Difficulty, LeetCodeStatus } from '@/types';
import { Plus, X, Code2, CheckCircle2 } from 'lucide-react';
import { generateId } from '@/lib/utils';

const PIPELINE_STAGES: { id: LeetCodeStatus; label: string; color: string }[] = [
  { id: 'understand', label: 'Understand', color: '#94A3B8' },
  { id: 'brute-force', label: 'Brute Force', color: '#F59E0B' },
  { id: 'optimize', label: 'Optimize', color: '#3B82F6' },
  { id: 'code', label: 'Code', color: '#8B5CF6' },
  { id: 'test', label: 'Test', color: '#06B6D4' },
  { id: 'explain', label: 'Explain', color: '#EC4899' },
  { id: 'record', label: 'Record', color: '#F97316' },
  { id: 'edit', label: 'Edit', color: '#EF4444' },
  { id: 'publish', label: 'Publish', color: '#10B981' },
  { id: 'done', label: 'Done', color: '#00FF9C' },
];

const DIFF_COLORS: Record<Difficulty, string> = {
  easy: '#00FF9C',
  medium: '#F59E0B',
  hard: '#EF4444',
};

export function LeetCodePage() {
  const store = useStore();
  const [selected, setSelected] = useState<LeetCodeProblem | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [filterDiff, setFilterDiff] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [topic, setTopic] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editDraft, setEditDraft] = useState<Partial<LeetCodeProblem>>({});

  const filtered = store.leetcodeProblems.filter((p) => {
    if (filterDiff !== 'all' && p.difficulty !== filterDiff) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    return true;
  });

  const stats = {
    total: store.leetcodeProblems.length,
    done: store.leetcodeProblems.filter((p) => p.status === 'done').length,
    easy: store.leetcodeProblems.filter((p) => p.difficulty === 'easy').length,
    medium: store.leetcodeProblems.filter((p) => p.difficulty === 'medium').length,
    hard: store.leetcodeProblems.filter((p) => p.difficulty === 'hard').length,
    published: store.leetcodeProblems.filter((p) => p.videoStatus === 'published').length,
  };

  function handleAdd() {
    if (!name.trim()) return;
    const problem: LeetCodeProblem = {
      id: generateId(),
      name: name.trim(),
      difficulty,
      topic: topic.trim() || 'General Algorithms',
      language: 'Java',
      status: 'understand',
      startedAt: new Date(),
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    store.addLeetCodeProblem(problem);
    setName('');
    setDifficulty('medium');
    setTopic('');
    setShowAdd(false);
  }

  function handleSaveEdit() {
    if (!selected) return;
    store.updateLeetCodeProblem(selected.id, editDraft);
    setSelected({ ...selected, ...editDraft });
    setEditMode(false);
    setEditDraft({});
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#F8FAFC]">LeetCode System & Pipeline</h1>
          <p className="text-xs text-[#94A3B8]">
            {stats.done}/{stats.total} solved • {stats.published} video published • Systematic learning to content
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 bg-[#00FF9C] text-[#091B21] rounded-md px-3 py-1.5 text-xs font-semibold hover:bg-[#00e68a] transition-colors"
        >
          <Plus size={13} /> Add Problem
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {[
          { label: 'Total Tracked', value: stats.total, color: '#F8FAFC' },
          { label: 'Solved (Done)', value: stats.done, color: '#00FF9C' },
          { label: 'Easy', value: stats.easy, color: '#00FF9C' },
          { label: 'Medium', value: stats.medium, color: '#F59E0B' },
          { label: 'Hard', value: stats.hard, color: '#EF4444' },
          { label: 'Video Published', value: stats.published, color: '#3B82F6' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-[#1e3a5f] bg-[#091B21] px-3 py-2 text-center">
            <p className="text-lg font-bold" style={{ color: s.color }}>
              {s.value}
            </p>
            <p className="text-xs text-[#94A3B8]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pipeline overview */}
      <section className="rounded-lg border border-[#1e3a5f] bg-[#091B21] p-4">
        <h2 className="text-sm font-semibold text-[#F8FAFC] mb-3">LeetCode to Content Pipeline</h2>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {PIPELINE_STAGES.map((stage) => {
            const count = store.leetcodeProblems.filter((p) => p.status === stage.id).length;
            return (
              <div key={stage.id} className="flex-shrink-0 text-center min-w-[70px]">
                <div
                  className="h-10 w-10 rounded-full border-2 flex items-center justify-center mb-1 mx-auto"
                  style={{ borderColor: stage.color }}
                >
                  <span className="text-sm font-bold" style={{ color: stage.color }}>
                    {count}
                  </span>
                </div>
                <p className="text-xs text-[#94A3B8] whitespace-nowrap">{stage.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        {['all', 'easy', 'medium', 'hard'].map((d) => (
          <button
            key={d}
            onClick={() => setFilterDiff(d)}
            className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
              filterDiff === d
                ? 'bg-[#003F59] text-[#00FF9C] border border-[#00FF9C]/30'
                : 'bg-[#091B21] text-[#94A3B8] border border-[#1e3a5f] hover:text-[#F8FAFC]'
            }`}
          >
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
        <div className="h-4 border-l border-[#1e3a5f] mx-1 self-center" />
        {['all', 'done', 'understand', 'code', 'record', 'publish'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
              filterStatus === s
                ? 'bg-[#003F59] text-[#00FF9C] border border-[#00FF9C]/30'
                : 'bg-[#091B21] text-[#94A3B8] border border-[#1e3a5f] hover:text-[#F8FAFC]'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Problem list */}
      <div className="space-y-2">
        {filtered.map((problem) => {
          const stage = PIPELINE_STAGES.find((s) => s.id === problem.status);
          const diffColor = DIFF_COLORS[problem.difficulty] || '#94A3B8';
          return (
            <div
              key={problem.id}
              onClick={() => {
                setSelected(problem);
                setEditMode(false);
                setEditDraft({});
              }}
              className="rounded-lg border border-[#1e3a5f] bg-[#091B21] px-4 py-3 cursor-pointer hover:border-[#2a4a7f] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {problem.status === 'done' ? (
                    <CheckCircle2 size={16} className="text-[#00FF9C]" />
                  ) : (
                    <Code2 size={16} className="text-[#94A3B8]" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-[#F8FAFC]">
                      {problem.leetcodeId ? `#${problem.leetcodeId} ` : ''}
                      {problem.name}
                    </p>
                    <p className="text-xs text-[#94A3B8]">{problem.topic}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium" style={{ color: diffColor }}>
                    {problem.difficulty}
                  </span>
                  {stage && (
                    <span
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ backgroundColor: `${stage.color}20`, color: stage.color }}
                    >
                      {stage.label}
                    </span>
                  )}
                  {problem.videoStatus === 'published' && (
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">▶ Video Published</span>
                  )}
                </div>
              </div>
              {(problem.timeComplexity || problem.spaceComplexity) && (
                <div className="flex gap-4 mt-2 ml-7">
                  {problem.timeComplexity && (
                    <span className="text-xs text-[#94A3B8]">
                      Time: <span className="text-[#F8FAFC] font-mono">{problem.timeComplexity}</span>
                    </span>
                  )}
                  {problem.spaceComplexity && (
                    <span className="text-xs text-[#94A3B8]">
                      Space: <span className="text-[#F8FAFC] font-mono">{problem.spaceComplexity}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl border border-[#1e3a5f] bg-[#091B21] shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-[#1e3a5f] bg-[#091B21] px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-[#F8FAFC]">{selected.name}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs" style={{ color: DIFF_COLORS[selected.difficulty] }}>
                    {selected.difficulty}
                  </span>
                  <span className="text-xs text-[#94A3B8]">• {selected.topic}</span>
                  <span className="text-xs text-[#94A3B8]">• {selected.language}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!editMode && (
                  <button
                    onClick={() => {
                      setEditMode(true);
                      setEditDraft({
                        status: selected.status,
                        notes: selected.notes,
                        bruteForceApproach: selected.bruteForceApproach,
                        optimizedApproach: selected.optimizedApproach,
                        timeComplexity: selected.timeComplexity,
                        spaceComplexity: selected.spaceComplexity,
                        code: selected.code,
                        videoStatus: selected.videoStatus,
                      });
                    }}
                    className="text-xs px-3 py-1.5 border border-[#1e3a5f] rounded text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
                  >
                    Edit
                  </button>
                )}
                {editMode && (
                  <button onClick={handleSaveEdit} className="text-xs px-3 py-1.5 bg-[#00FF9C] text-[#091B21] rounded font-semibold">
                    Save
                  </button>
                )}
                <button onClick={() => setSelected(null)} className="text-[#94A3B8] hover:text-[#F8FAFC] p-1">
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="p-5 space-y-5">
              {editMode ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[#94A3B8] mb-1">Pipeline Stage</label>
                      <select
                        value={editDraft.status || selected.status}
                        onChange={(e) => setEditDraft((d) => ({ ...d, status: e.target.value as LeetCodeStatus }))}
                        className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-2 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]"
                      >
                        {PIPELINE_STAGES.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-[#94A3B8] mb-1">Video Status</label>
                      <select
                        value={editDraft.videoStatus || selected.videoStatus || 'not-started'}
                        onChange={(e) => setEditDraft((d) => ({ ...d, videoStatus: e.target.value as LeetCodeProblem['videoStatus'] }))}
                        className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-2 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]"
                      >
                        <option value="not-started">Not Started</option>
                        <option value="recorded">Recorded</option>
                        <option value="edited">Edited</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                  </div>
                  <EditField
                    label="Brute Force Approach"
                    value={editDraft.bruteForceApproach || ''}
                    onChange={(v) => setEditDraft((d) => ({ ...d, bruteForceApproach: v }))}
                    multiline
                  />
                  <EditField
                    label="Optimized Approach"
                    value={editDraft.optimizedApproach || ''}
                    onChange={(v) => setEditDraft((d) => ({ ...d, optimizedApproach: v }))}
                    multiline
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <EditField
                      label="Time Complexity"
                      value={editDraft.timeComplexity || ''}
                      onChange={(v) => setEditDraft((d) => ({ ...d, timeComplexity: v }))}
                    />
                    <EditField
                      label="Space Complexity"
                      value={editDraft.spaceComplexity || ''}
                      onChange={(v) => setEditDraft((d) => ({ ...d, spaceComplexity: v }))}
                    />
                  </div>
                  <EditField
                    label="Code Solution"
                    value={editDraft.code || ''}
                    onChange={(v) => setEditDraft((d) => ({ ...d, code: v }))}
                    multiline
                    mono
                  />
                  <EditField
                    label="Personal Notes"
                    value={editDraft.notes || ''}
                    onChange={(v) => setEditDraft((d) => ({ ...d, notes: v }))}
                    multiline
                  />
                </>
              ) : (
                <>
                  {selected.bruteForceApproach && <InfoSection title="Brute Force Approach" content={selected.bruteForceApproach} />}
                  {selected.optimizedApproach && <InfoSection title="Optimized Approach" content={selected.optimizedApproach} />}
                  {(selected.timeComplexity || selected.spaceComplexity) && (
                    <div className="flex gap-6">
                      {selected.timeComplexity && (
                        <div>
                          <p className="text-xs text-[#94A3B8] mb-0.5">Time Complexity</p>
                          <p className="text-sm font-mono text-[#00FF9C]">{selected.timeComplexity}</p>
                        </div>
                      )}
                      {selected.spaceComplexity && (
                        <div>
                          <p className="text-xs text-[#94A3B8] mb-0.5">Space Complexity</p>
                          <p className="text-sm font-mono text-[#00FF9C]">{selected.spaceComplexity}</p>
                        </div>
                      )}
                    </div>
                  )}
                  {selected.code && (
                    <div>
                      <p className="text-xs text-[#94A3B8] uppercase tracking-wider mb-2">Code Implementation</p>
                      <pre className="bg-[#0F172A] rounded-md p-4 text-xs text-[#00FF9C] overflow-x-auto font-mono whitespace-pre">
                        {selected.code}
                      </pre>
                    </div>
                  )}
                  {selected.notes && <InfoSection title="Notes" content={selected.notes} />}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-[#1e3a5f] bg-[#091B21] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1e3a5f] px-5 py-4">
              <h2 className="text-sm font-semibold text-[#F8FAFC]">Add LeetCode Problem</h2>
              <button onClick={() => setShowAdd(false)} className="text-[#94A3B8] hover:text-[#F8FAFC] p-1">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <EditField label="Problem Name" value={name} onChange={setName} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                    className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-2 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <EditField label="Topic" value={topic} onChange={setTopic} />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-[#1e3a5f] px-5 py-3">
              <button
                onClick={() => setShowAdd(false)}
                className="text-xs px-3 py-1.5 border border-[#1e3a5f] rounded text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="text-xs px-3 py-1.5 bg-[#00FF9C] text-[#091B21] rounded font-semibold hover:bg-[#00e68a] transition-colors"
              >
                Add Problem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoSection({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <p className="text-xs text-[#94A3B8] uppercase tracking-wider mb-1">{title}</p>
      <p className="text-sm text-[#F8FAFC] leading-relaxed">{content}</p>
    </div>
  );
}

function EditField({
  label,
  value,
  onChange,
  multiline,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  mono?: boolean;
}) {
  const cls = `w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00FF9C] ${
    mono ? 'font-mono text-[#00FF9C]' : 'text-[#F8FAFC]'
  }`;
  return (
    <div>
      <label className="block text-xs text-[#94A3B8] mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={mono ? 6 : 3}
          className={`${cls} resize-none`}
        />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
    </div>
  );
}
