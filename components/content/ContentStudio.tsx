'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import type { ContentItem, ContentStatus, ContentPlatform } from '@/types';
import { Plus, X } from 'lucide-react';
import { generateId } from '@/lib/utils';

const PIPELINE: { id: ContentStatus; label: string; color: string }[] = [
  { id: 'idea', label: 'Idea', color: '#94A3B8' },
  { id: 'research', label: 'Research', color: '#3B82F6' },
  { id: 'script', label: 'Script', color: '#8B5CF6' },
  { id: 'ready-to-record', label: 'Ready to Record', color: '#F59E0B' },
  { id: 'recorded', label: 'Recorded', color: '#F97316' },
  { id: 'editing', label: 'Editing', color: '#EF4444' },
  { id: 'ready', label: 'Ready', color: '#10B981' },
  { id: 'published', label: 'Published', color: '#00FF9C' },
];

const PLATFORM_ICONS: Record<string, string> = {
  youtube: '📺 YouTube',
  tiktok: '🎵 TikTok',
  instagram: '📸 Instagram',
  blog: '📝 Blog',
};

export function ContentStudio() {
  const store = useStore();
  const [selected, setSelected] = useState<ContentItem | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [filterStatus, setFilterStatus] = useState<ContentStatus | 'all'>('all');
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [type, setType] = useState<ContentItem['type']>('long-form');
  const [platforms, setPlatforms] = useState<ContentPlatform[]>(['youtube']);
  const [status, setStatus] = useState<ContentStatus>('idea');

  const filtered = filterStatus === 'all' ? store.content : store.content.filter((c) => c.status === filterStatus);

  const stats = PIPELINE.map((stage) => ({
    ...stage,
    count: store.content.filter((c) => c.status === stage.id).length,
  }));

  function togglePlatform(p: ContentPlatform) {
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  }

  function handleAdd() {
    if (!title.trim()) return;
    const item: ContentItem = {
      id: generateId(),
      title: title.trim(),
      topic: topic.trim() || 'AI & Engineering',
      type,
      platform: platforms,
      status,
      hashtags: [],
      thumbnailDone: false,
      captionDone: false,
      estimatedMinutes: type === 'short-form' ? 5 : 20,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    store.addContent(item);
    setTitle('');
    setTopic('');
    setType('long-form');
    setPlatforms(['youtube']);
    setStatus('idea');
    setShowAdd(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#F8FAFC]">AI Content Studio</h1>
          <p className="text-xs text-[#94A3B8]">
            Educational AI engineering content pipeline • Prevent ideas from dying in backlog
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 bg-[#00FF9C] text-[#091B21] rounded-md px-3 py-1.5 text-xs font-semibold hover:bg-[#00e68a] transition-colors"
        >
          <Plus size={13} /> New Content Item
        </button>
      </div>

      {/* Production Conversion Funnel */}
      <section className="rounded-lg border border-[#1e3a5f] bg-[#091B21] p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#F8FAFC]">Production Conversion Pipeline</h2>
          <span className="text-xs text-[#94A3B8]">
            {store.content.filter((c) => c.status === 'published').length} / {store.content.length} converted to published
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {stats.map((stage, i) => (
            <div key={stage.id} className="flex items-center gap-2 flex-shrink-0">
              <div
                className="text-center px-3.5 py-2.5 rounded-lg min-w-[85px]"
                style={{ backgroundColor: `${stage.color}15`, border: `1px solid ${stage.color}35` }}
              >
                <p className="text-lg font-bold" style={{ color: stage.color }}>
                  {stage.count}
                </p>
                <p className="text-xs text-[#94A3B8] whitespace-nowrap">{stage.label}</p>
              </div>
              {i < stats.length - 1 && <span className="text-[#94A3B8] text-xs">→</span>}
            </div>
          ))}
        </div>
      </section>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <button
          onClick={() => setFilterStatus('all')}
          className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
            filterStatus === 'all'
              ? 'bg-[#003F59] text-[#00FF9C] border border-[#00FF9C]/30'
              : 'bg-[#091B21] text-[#94A3B8] border border-[#1e3a5f] hover:text-[#F8FAFC]'
          }`}
        >
          All ({store.content.length})
        </button>
        {PIPELINE.map((stage) => (
          <button
            key={stage.id}
            onClick={() => setFilterStatus(stage.id)}
            className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
              filterStatus === stage.id
                ? 'border'
                : 'bg-[#091B21] text-[#94A3B8] border border-[#1e3a5f] hover:text-[#F8FAFC]'
            }`}
            style={
              filterStatus === stage.id
                ? { backgroundColor: `${stage.color}20`, color: stage.color, borderColor: `${stage.color}50` }
                : {}
            }
          >
            {stage.label} ({store.content.filter((c) => c.status === stage.id).length})
          </button>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => {
          const stageInfo = PIPELINE.find((s) => s.id === item.status);
          return (
            <div
              key={item.id}
              onClick={() => setSelected(item)}
              className="rounded-lg border border-[#1e3a5f] bg-[#091B21] p-4 cursor-pointer hover:border-[#2a4a7f] transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-sm font-semibold text-[#F8FAFC] line-clamp-2">{item.title}</p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">{item.topic}</p>
                  </div>
                  {stageInfo && (
                    <span
                      className="flex-shrink-0 text-xs px-2 py-0.5 rounded font-medium"
                      style={{ backgroundColor: `${stageInfo.color}20`, color: stageInfo.color }}
                    >
                      {stageInfo.label}
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="text-xs text-[#94A3B8] line-clamp-2 mb-3">{item.description}</p>
                )}
              </div>

              <div className="pt-3 border-t border-[#1e3a5f]/60 mt-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                  <span className="capitalize">{item.type}</span>
                  <span>{item.estimatedMinutes}m est.</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 flex-wrap">
                    {item.platform.map((p) => (
                      <span key={p} className="text-xs bg-[#1e3a5f] text-[#F8FAFC] px-1.5 py-0.5 rounded">
                        {p}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className={item.thumbnailDone ? 'text-[#00FF9C]' : 'text-[#94A3B8]'}>Thumbnail</span>
                    <span className={item.captionDone ? 'text-[#00FF9C]' : 'text-[#94A3B8]'}>Caption</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl border border-[#1e3a5f] bg-[#091B21] shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-[#1e3a5f] bg-[#091B21] px-5 py-4">
              <h2 className="text-sm font-semibold text-[#F8FAFC] truncate pr-4">{selected.title}</h2>
              <button onClick={() => setSelected(null)} className="text-[#94A3B8] hover:text-[#F8FAFC] p-1 flex-shrink-0">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-[#94A3B8] mb-1">Pipeline Status</p>
                  <select
                    value={selected.status}
                    onChange={(e) => {
                      const s = e.target.value as ContentStatus;
                      store.updateContent(selected.id, { status: s });
                      setSelected({ ...selected, status: s });
                    }}
                    className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-2 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]"
                  >
                    {PIPELINE.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="text-xs text-[#94A3B8] mb-1">Format Type</p>
                  <p className="text-sm text-[#F8FAFC] capitalize mt-2">{selected.type}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-[#94A3B8] mb-1">Target Platforms</p>
                <div className="flex gap-2 flex-wrap">
                  {selected.platform.map((p) => (
                    <span key={p} className="text-xs bg-[#1e3a5f] text-[#00FF9C] px-2 py-1 rounded">
                      {PLATFORM_ICONS[p] || p}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-[#94A3B8] uppercase tracking-wider mb-2">Production Checklist</p>
                <div className="space-y-2 bg-[#0F172A] p-3 rounded border border-[#1e3a5f]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected.thumbnailDone}
                      onChange={(e) => {
                        store.updateContent(selected.id, { thumbnailDone: e.target.checked });
                        setSelected({ ...selected, thumbnailDone: e.target.checked });
                      }}
                      className="accent-[#00FF9C]"
                    />
                    <span className="text-sm text-[#F8FAFC]">DaVinci Thumbnail & Asset Generated</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected.captionDone}
                      onChange={(e) => {
                        store.updateContent(selected.id, { captionDone: e.target.checked });
                        setSelected({ ...selected, captionDone: e.target.checked });
                      }}
                      className="accent-[#00FF9C]"
                    />
                    <span className="text-sm text-[#F8FAFC]">Caption, Description & Tags Ready</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#94A3B8] mb-1">Video Script / Outline</label>
                <textarea
                  value={selected.script || ''}
                  onChange={(e) => {
                    store.updateContent(selected.id, { script: e.target.value });
                    setSelected({ ...selected, script: e.target.value });
                  }}
                  rows={5}
                  placeholder="Draft script, bullet points, camera cues..."
                  className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C] resize-none"
                />
              </div>
              {selected.hashtags && selected.hashtags.length > 0 && (
                <div>
                  <p className="text-xs text-[#94A3B8] uppercase tracking-wider mb-1">Hashtags</p>
                  <p className="text-sm text-[#00FF9C]">{selected.hashtags.join(' ')}</p>
                </div>
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
              <h2 className="text-sm font-semibold text-[#F8FAFC]">Create Content Item</h2>
              <button onClick={() => setShowAdd(false)} className="text-[#94A3B8] hover:text-[#F8FAFC] p-1">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-[#94A3B8] mb-1">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. How Vector Embeddings Work Under The Hood"
                  className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#94A3B8] mb-1">Topic</label>
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. LLM Engineering / RAG"
                  className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ContentItem['type'])}
                    className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-2 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]"
                  >
                    <option value="long-form">Long-form Video</option>
                    <option value="short-form">Short-form Clip</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1">Initial Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ContentStatus)}
                    className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-2 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]"
                  >
                    {PIPELINE.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#94A3B8] mb-2">Platforms</label>
                <div className="flex gap-2 flex-wrap">
                  {(['youtube', 'tiktok', 'instagram', 'blog'] as ContentPlatform[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePlatform(p)}
                      className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                        platforms.includes(p)
                          ? 'bg-[#003F59] text-[#00FF9C] border border-[#00FF9C]/30'
                          : 'bg-[#0F172A] text-[#94A3B8] border border-[#1e3a5f]'
                      }`}
                    >
                      {PLATFORM_ICONS[p]}
                    </button>
                  ))}
                </div>
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
                Add Content
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
