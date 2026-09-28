'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import type { TimeEntry, TimeEntryCategory } from '@/types';
import { Play, Square, Plus, X, Clock } from 'lucide-react';
import { generateId } from '@/lib/utils';
import { format } from 'date-fns';
import { formatDuration } from '@/lib/calculations';

const CATEGORY_COLORS: Record<TimeEntryCategory, string> = {
  'main-job': '#3B82F6',
  freelance: '#8B5CF6',
  content: '#F59E0B',
  leetcode: '#10B981',
  learning: '#EC4899',
  knowledge: '#06B6D4',
  buffer: '#00FF9C',
};

export function TimeTrackingPage() {
  const store = useStore();
  const [elapsed, setElapsed] = useState(() =>
    store.activeTimerEntry
      ? Math.floor((Date.now() - new Date(store.activeTimerEntry.startTime).getTime()) / 1000)
      : 0
  );
  const [showManual, setShowManual] = useState(false);
  const [timerTitle, setTimerTitle] = useState('');
  const [timerCategory, setTimerCategory] = useState<TimeEntryCategory>('main-job');
  const [timerProject, setTimerProject] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [manualDate, setManualDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [manualDuration, setManualDuration] = useState('');
  const [manualCategory, setManualCategory] = useState<TimeEntryCategory>('main-job');
  const [manualProject, setManualProject] = useState('');

  useEffect(() => {
    if (!store.activeTimerEntry) {
      return;
    }
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(store.activeTimerEntry!.startTime).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [store.activeTimerEntry]);

  function formatElapsed(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function handleStart() {
    if (!timerTitle.trim()) return;
    setElapsed(0);
    store.startTimer({
      title: timerTitle.trim(),
      category: timerCategory,
      projectId: timerProject || undefined,
      startTime: new Date(),
    });
  }

  function handleStop() {
    store.stopTimer();
    setElapsed(0);
  }

  function handleManualAdd() {
    if (!manualTitle.trim() || !manualDuration) return;
    const durationMinutes = Math.round(parseFloat(manualDuration) * 60);
    const entryDate = new Date(manualDate);
    const entry: TimeEntry = {
      id: generateId(),
      title: manualTitle.trim(),
      category: manualCategory,
      projectId: manualProject || undefined,
      startTime: entryDate,
      endTime: new Date(entryDate.getTime() + durationMinutes * 60000),
      duration: durationMinutes,
      createdAt: new Date(),
    };
    store.addTimeEntry(entry);
    setManualTitle('');
    setManualDuration('');
    setManualProject('');
    setManualDate(format(new Date(), 'yyyy-MM-dd'));
    setShowManual(false);
  }

  // Today's entries
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEntries = store.timeEntries.filter((e) => new Date(e.startTime) >= today);
  const todayMinutes = todayEntries.reduce((s, e) => s + (e.duration || 0), 0);

  // Weekly by category
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEntries = store.timeEntries.filter((e) => new Date(e.startTime) >= weekStart);
  const weekByCategory = (Object.keys(CATEGORY_COLORS) as TimeEntryCategory[])
    .map((cat) => ({
      category: cat,
      minutes: weekEntries.filter((e) => e.category === cat).reduce((s, e) => s + (e.duration || 0), 0),
    }))
    .filter((c) => c.minutes > 0);

  const maxCatMinutes = Math.max(...weekByCategory.map((c) => c.minutes), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#F8FAFC]">Time Tracking & Workload Audit</h1>
          <p className="text-xs text-[#94A3B8]">
            Today: {formatDuration(todayMinutes)} logged • Precise real-time tracking with variance analysis
          </p>
        </div>
        <button
          onClick={() => setShowManual(true)}
          className="flex items-center gap-1.5 border border-[#1e3a5f] text-[#94A3B8] rounded-md px-3 py-1.5 text-xs hover:text-[#F8FAFC] hover:border-[#2a4a7f] transition-colors"
        >
          <Plus size={13} /> Manual Entry
        </button>
      </div>

      {/* Timer Section */}
      <section className="rounded-xl border border-[#1e3a5f] bg-[#091B21] p-6 shadow-lg">
        {store.activeTimerEntry ? (
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00FF9C]/10 border border-[#00FF9C]/30 text-[#00FF9C] text-xs">
              <span className="w-2 h-2 rounded-full bg-[#00FF9C] animate-pulse" /> Live Tracking
            </div>
            <p className="text-lg font-semibold text-[#F8FAFC]">{store.activeTimerEntry.title}</p>
            <p className="text-xs text-[#94A3B8] uppercase tracking-wider">
              {store.activeTimerEntry.category}
              {store.activeTimerEntry.projectId &&
                ` • ${store.projects.find((p) => p.id === store.activeTimerEntry?.projectId)?.name}`}
            </p>
            <p className="text-6xl font-mono font-bold text-[#00FF9C] tracking-wider py-2">
              {formatElapsed(elapsed)}
            </p>
            <button
              onClick={handleStop}
              className="flex items-center gap-2 mx-auto bg-red-500/20 text-red-400 border border-red-500/40 rounded-lg px-8 py-3 text-sm font-semibold hover:bg-red-500/30 transition-colors"
            >
              <Square size={16} /> Stop & Record Session
            </button>
          </div>
        ) : (
          <div className="space-y-4 max-w-xl mx-auto">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#F8FAFC]">
              <Clock size={16} className="text-[#00FF9C]" /> Start Live Session
            </div>
            <input
              value={timerTitle}
              onChange={(e) => setTimerTitle(e.target.value)}
              placeholder="What task or feature are you working on right now?"
              className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded-lg px-4 py-3 text-sm text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#00FF9C]"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#94A3B8] mb-1">Category</label>
                <select
                  value={timerCategory}
                  onChange={(e) => setTimerCategory(e.target.value as TimeEntryCategory)}
                  className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]"
                >
                  {(Object.keys(CATEGORY_COLORS) as TimeEntryCategory[]).map((c) => (
                    <option key={c} value={c}>
                      {c.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#94A3B8] mb-1">Associated Project</label>
                <select
                  value={timerProject}
                  onChange={(e) => setTimerProject(e.target.value)}
                  className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]"
                >
                  <option value="">(No Project)</option>
                  {store.projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={handleStart}
              disabled={!timerTitle.trim()}
              className="flex items-center gap-2 w-full justify-center bg-[#00FF9C] text-[#091B21] rounded-lg px-4 py-3 text-sm font-semibold hover:bg-[#00e68a] disabled:opacity-50 transition-colors shadow-sm"
            >
              <Play size={16} /> Start Recording
            </button>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Breakdown */}
        <section className="rounded-lg border border-[#1e3a5f] bg-[#091B21] p-5">
          <h2 className="text-sm font-semibold text-[#F8FAFC] mb-4">Hours Logged This Week</h2>
          {weekByCategory.length === 0 ? (
            <p className="text-sm text-[#94A3B8]">No time tracked yet this week.</p>
          ) : (
            <div className="space-y-3">
              {weekByCategory
                .sort((a, b) => b.minutes - a.minutes)
                .map((cat) => (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#94A3B8] capitalize">{cat.category.replace('-', ' ')}</span>
                      <span className="text-xs font-mono text-[#F8FAFC]">{formatDuration(cat.minutes)}</span>
                    </div>
                    <div className="h-1.5 bg-[#1e3a5f] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(cat.minutes / maxCatMinutes) * 100}%`,
                          backgroundColor: CATEGORY_COLORS[cat.category],
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>

        {/* Today's Logged Sessions */}
        <section className="rounded-lg border border-[#1e3a5f] bg-[#091B21] p-5">
          <h2 className="text-sm font-semibold text-[#F8FAFC] mb-4">Today&apos;s Sessions</h2>
          {todayEntries.length === 0 ? (
            <p className="text-sm text-[#94A3B8]">No sessions completed today yet.</p>
          ) : (
            <div className="space-y-2">
              {todayEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between border-b border-[#1e3a5f]/60 py-2.5">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[entry.category] || '#94A3B8' }}
                    />
                    <div>
                      <p className="text-xs font-medium text-[#F8FAFC]">{entry.title}</p>
                      <p className="text-[11px] text-[#94A3B8] capitalize">
                        {entry.category.replace('-', ' ')}
                        {entry.projectId && ` • ${store.projects.find((p) => p.id === entry.projectId)?.name}`}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-[#00FF9C]">
                    {entry.duration ? formatDuration(entry.duration) : 'Active'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Manual Entry Modal */}
      {showManual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-[#1e3a5f] bg-[#091B21] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1e3a5f] px-5 py-4">
              <h2 className="text-sm font-semibold text-[#F8FAFC]">Log Past Time Block</h2>
              <button onClick={() => setShowManual(false)} className="text-[#94A3B8] hover:text-[#F8FAFC] p-1">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-[#94A3B8] mb-1">Work Description</label>
                <input
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="e.g. Drug interaction DB queries optimization"
                  className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1">Date</label>
                  <input
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1">Duration (Hours)</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    placeholder="1.5"
                    value={manualDuration}
                    onChange={(e) => setManualDuration(e.target.value)}
                    className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1">Category</label>
                  <select
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value as TimeEntryCategory)}
                    className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-2 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]"
                  >
                    {(Object.keys(CATEGORY_COLORS) as TimeEntryCategory[]).map((c) => (
                      <option key={c} value={c}>
                        {c.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1">Project</label>
                  <select
                    value={manualProject}
                    onChange={(e) => setManualProject(e.target.value)}
                    className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-2 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]"
                  >
                    <option value="">(None)</option>
                    {store.projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-[#1e3a5f] px-5 py-3">
              <button
                onClick={() => setShowManual(false)}
                className="text-xs px-3 py-1.5 border border-[#1e3a5f] rounded text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleManualAdd}
                className="text-xs px-3 py-1.5 bg-[#00FF9C] text-[#091B21] rounded font-semibold hover:bg-[#00e68a] transition-colors"
              >
                Save Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
