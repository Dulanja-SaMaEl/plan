'use client';
import { useStore } from '@/lib/store';
import {
  calculateCapacity,
  getDueForReview,
  getOverdueTasks,
  getTodaysTasks,
  getWeakConcepts,
  getPriorityColor,
  getConfidenceColor,
  formatDuration,
} from '@/lib/calculations';
import { format } from 'date-fns';
import {
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Brain,
  Code2,
  Zap,
  Building2,
  Shield,
  BookOpen,
  ChevronRight,
  Target,
  Activity,
} from 'lucide-react';
import Link from 'next/link';
import { CapacityWidget } from './CapacityWidget';
import { TodayTimeline } from './TodayTimeline';

export function DashboardContent() {
  const store = useStore();
  const capacity = calculateCapacity(store.capacityConfig, store.tasks, store.timeEntries);
  const dueReviews = getDueForReview(store.concepts);
  const overdueTasks = getOverdueTasks(store.tasks);
  const todaysTasks = getTodaysTasks(store.tasks);
  const weakConcepts = getWeakConcepts(store.concepts).slice(0, 3);
  const inProgressTasks = store.tasks.filter(t => t.status === 'in-progress');
  const completedToday = store.tasks.filter(t => t.status === 'done');
  const upcomingVisits = store.hospitalVisits.filter(v => v.status === 'scheduled').slice(0, 2);
  const today = new Date();
  const buffer = store.bufferBlocks[0];
  const bufferUsedPct = buffer
    ? Math.round((buffer.usedMinutes / buffer.durationMinutes) * 100)
    : 0;

  // Content pipeline
  const contentStats = {
    ideas: store.content.filter(c => c.status === 'idea').length,
    scripts: store.content.filter(c => c.status === 'script' || c.status === 'research').length,
    recorded: store.content.filter(c => c.status === 'recorded').length,
    published: store.content.filter(c => c.status === 'published').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-[#94A3B8] uppercase tracking-wider">{format(today, 'EEEE')}</p>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">{format(today, 'MMMM d, yyyy')}</h1>
          <p className="text-sm text-[#94A3B8] mt-0.5">Biotech Software Solutions — Pharmacy System</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-[#94A3B8]">Weekly Capacity</div>
          <div className={`text-lg font-bold ${capacity.isOverloaded ? 'text-red-400' : 'text-[#00FF9C]'}`}>
            {capacity.totalPlanned}h / {capacity.totalCapacity}h
          </div>
          {capacity.isOverloaded && (
            <div className="text-xs text-red-400 flex items-center gap-1 justify-end">
              <AlertTriangle size={11} />
              Over by {capacity.overloadAmount}h
            </div>
          )}
        </div>
      </div>

      {/* Overload Banner */}
      {capacity.isOverloaded && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-400">
                OVER CAPACITY — {capacity.overloadAmount}h excess this week
              </p>
              <p className="text-xs text-red-300/80">
                Consider rescheduling non-critical tasks. The system recommends protecting your buffer first.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Today summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Today's Tasks"
          value={todaysTasks.length}
          sub={`${completedToday.length} done`}
          icon={<CheckCircle2 size={16} className="text-[#00FF9C]" />}
          color="#00FF9C"
        />
        <StatCard
          label="In Progress"
          value={inProgressTasks.length}
          sub="active now"
          icon={<Activity size={16} className="text-blue-400" />}
          color="#3B82F6"
        />
        <StatCard
          label="Overdue"
          value={overdueTasks.length}
          sub={overdueTasks.length > 0 ? 'needs attention' : 'all clear'}
          icon={
            <AlertTriangle
              size={16}
              className={overdueTasks.length > 0 ? 'text-red-400' : 'text-[#94A3B8]'}
            />
          }
          color={overdueTasks.length > 0 ? '#EF4444' : '#94A3B8'}
        />
        <StatCard
          label="Due for Review"
          value={dueReviews.length}
          sub="concepts"
          icon={<Brain size={16} className="text-purple-400" />}
          color="#8B5CF6"
        />
      </div>

      {/* Main 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — 2 cols wide */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Tasks */}
          <section className="rounded-lg border border-[#1e3a5f] bg-[#091B21] p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[#F8FAFC]">Today&apos;s Priority Tasks</h2>
              <Link
                href="/tasks"
                className="text-xs text-[#00FF9C] hover:underline flex items-center gap-0.5"
              >
                All tasks <ChevronRight size={12} />
              </Link>
            </div>
            {todaysTasks.length === 0 ? (
              <p className="text-sm text-[#94A3B8]">
                No tasks for today. Add some or check the backlog.
              </p>
            ) : (
              <div className="space-y-2">
                {todaysTasks.slice(0, 6).map(task => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 rounded-md border border-[#1e3a5f] bg-[#0d1f35] px-3 py-2"
                  >
                    <div
                      className="mt-0.5 h-2 w-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getPriorityColor(task.priority) }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#F8FAFC] truncate">{task.title}</p>
                      <p className="text-xs text-[#94A3B8]">
                        {task.category}
                        {task.estimatedHours ? ` — ${task.estimatedHours}h est.` : ''}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${
                        task.status === 'in-progress'
                          ? 'bg-blue-500/20 text-blue-400'
                          : task.status === 'today'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-[#1e3a5f] text-[#94A3B8]'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Today's Timeline */}
          <TodayTimeline />

          {/* In Progress */}
          {inProgressTasks.length > 0 && (
            <section className="rounded-lg border border-[#1e3a5f] bg-[#091B21] p-4">
              <h2 className="text-sm font-semibold text-[#F8FAFC] mb-3">In Progress</h2>
              <div className="space-y-2">
                {inProgressTasks.map(task => {
                  const project = store.projects.find(p => p.id === task.projectId);
                  const progress = task.estimatedHours
                    ? Math.min(
                        100,
                        Math.round(((task.actualHours || 0) / task.estimatedHours) * 100)
                      )
                    : 0;
                  return (
                    <div
                      key={task.id}
                      className="rounded-md border border-[#1e3a5f] bg-[#0d1f35] px-3 py-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#F8FAFC] truncate">{task.title}</p>
                          <p className="text-xs text-[#94A3B8]">{project?.name || task.category}</p>
                        </div>
                        {task.estimatedHours && (
                          <span className="text-xs text-[#94A3B8] ml-2">
                            {task.actualHours || 0}h / {task.estimatedHours}h
                          </span>
                        )}
                      </div>
                      {task.estimatedHours && (
                        <div className="mt-2 h-1 bg-[#1e3a5f] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#00FF9C] rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Capacity Widget */}
          <CapacityWidget capacity={capacity} />

          {/* Reserved Buffer */}
          {buffer && (
            <section className="rounded-lg border border-[#00FF9C]/20 bg-[#091B21] p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={14} className="text-[#00FF9C]" />
                <h2 className="text-sm font-semibold text-[#F8FAFC]">Reserved Buffer</h2>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-[#F8FAFC]">
                    {formatDuration(buffer.durationMinutes)}
                  </div>
                  <div className="text-xs text-[#94A3B8]">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-400">
                    {formatDuration(buffer.usedMinutes)}
                  </div>
                  <div className="text-xs text-[#94A3B8]">Used</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-[#00FF9C]">
                    {formatDuration(buffer.durationMinutes - buffer.usedMinutes)}
                  </div>
                  <div className="text-xs text-[#94A3B8]">Free</div>
                </div>
              </div>
              <div className="h-1.5 bg-[#1e3a5f] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00FF9C] rounded-full"
                  style={{ width: `${100 - bufferUsedPct}%` }}
                />
              </div>
              <p className="text-xs text-[#94A3B8] mt-2">
                Friday 18:30–20:30 — Hospitals, urgent clients, production
              </p>
            </section>
          )}

          {/* Knowledge Due */}
          {dueReviews.length > 0 && (
            <section className="rounded-lg border border-[#1e3a5f] bg-[#091B21] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Brain size={14} className="text-purple-400" />
                  <h2 className="text-sm font-semibold text-[#F8FAFC]">Due for Review</h2>
                </div>
                <Link href="/knowledge/reviews" className="text-xs text-[#00FF9C] hover:underline">
                  Review
                </Link>
              </div>
              <div className="space-y-1.5">
                {dueReviews.slice(0, 4).map(concept => (
                  <div key={concept.id} className="flex items-center justify-between">
                    <p className="text-xs text-[#F8FAFC] truncate">{concept.name}</p>
                    <span
                      className="text-xs ml-2 flex-shrink-0"
                      style={{ color: getConfidenceColor(concept.confidence) }}
                    >
                      {concept.confidence}%
                    </span>
                  </div>
                ))}
                {dueReviews.length > 4 && (
                  <p className="text-xs text-[#94A3B8]">+{dueReviews.length - 4} more concepts</p>
                )}
              </div>
            </section>
          )}

          {/* Upcoming Hospital Visits */}
          {upcomingVisits.length > 0 && (
            <section className="rounded-lg border border-red-500/20 bg-[#091B21] p-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 size={14} className="text-red-400" />
                <h2 className="text-sm font-semibold text-[#F8FAFC]">Hospital Visits</h2>
              </div>
              {upcomingVisits.map(visit => (
                <div key={visit.id} className="border border-red-500/20 rounded-md px-3 py-2 mb-2">
                  <p className="text-sm text-[#F8FAFC] font-medium">{visit.hospital}</p>
                  <p className="text-xs text-[#94A3B8]">
                    {format(new Date(visit.date), 'MMM d')} • {visit.startTime}–{visit.endTime}
                  </p>
                  <p className="text-xs text-red-400">{visit.purpose}</p>
                </div>
              ))}
            </section>
          )}

          {/* Weak Concepts */}
          {weakConcepts.length > 0 && (
            <section className="rounded-lg border border-[#1e3a5f] bg-[#091B21] p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={14} className="text-orange-400" />
                <h2 className="text-sm font-semibold text-[#F8FAFC]">Weak Concepts</h2>
              </div>
              <div className="space-y-2">
                {weakConcepts.map(concept => (
                  <div key={concept.id} className="flex items-center justify-between">
                    <p className="text-xs text-[#F8FAFC] truncate flex-1">{concept.name}</p>
                    <div className="flex items-center gap-2 ml-2">
                      <div className="w-16 h-1 bg-[#1e3a5f] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${concept.confidence}%`,
                            backgroundColor: getConfidenceColor(concept.confidence),
                          }}
                        />
                      </div>
                      <span
                        className="text-xs w-8 text-right"
                        style={{ color: getConfidenceColor(concept.confidence) }}
                      >
                        {concept.confidence}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Today's Growth */}
          <section className="rounded-lg border border-[#1e3a5f] bg-[#091B21] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={14} className="text-[#00FF9C]" />
              <h2 className="text-sm font-semibold text-[#F8FAFC]">Today&apos;s Engineering Growth</h2>
            </div>
            <div className="space-y-2">
              <GrowthItem
                icon={<Brain size={12} />}
                label="Knowledge Review"
                target="3 concepts"
                link="/knowledge/reviews"
              />
              <GrowthItem
                icon={<Target size={12} />}
                label="Interview Question"
                target="1 question"
                link="/knowledge/interview"
              />
              <GrowthItem
                icon={<Code2 size={12} />}
                label="LeetCode"
                target="1 problem"
                link="/leetcode"
              />
              <GrowthItem
                icon={<BookOpen size={12} />}
                label="Learning"
                target="45 minutes"
                link="/learning"
              />
            </div>
          </section>

          {/* Content Pipeline */}
          <section className="rounded-lg border border-[#1e3a5f] bg-[#091B21] p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[#F8FAFC]">Content Pipeline</h2>
              <Link href="/content" className="text-xs text-[#00FF9C] hover:underline">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 rounded bg-[#0d1f35]">
                <div className="text-lg font-bold text-[#F8FAFC]">{contentStats.ideas}</div>
                <div className="text-xs text-[#94A3B8]">Ideas</div>
              </div>
              <div className="text-center p-2 rounded bg-[#0d1f35]">
                <div className="text-lg font-bold text-[#F8FAFC]">{contentStats.scripts}</div>
                <div className="text-xs text-[#94A3B8]">Scripts</div>
              </div>
              <div className="text-center p-2 rounded bg-[#0d1f35]">
                <div className="text-lg font-bold text-[#F8FAFC]">{contentStats.recorded}</div>
                <div className="text-xs text-[#94A3B8]">Recorded</div>
              </div>
              <div className="text-center p-2 rounded bg-[#0d1f35]">
                <div className="text-lg font-bold text-[#00FF9C]">{contentStats.published}</div>
                <div className="text-xs text-[#94A3B8]">Published</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: number;
  sub: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-[#1e3a5f] bg-[#091B21] px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-[#94A3B8]">{label}</p>
        {icon}
      </div>
      <p className="text-2xl font-bold" style={{ color }}>
        {value}
      </p>
      <p className="text-xs text-[#94A3B8] mt-0.5">{sub}</p>
    </div>
  );
}

function GrowthItem({
  icon,
  label,
  target,
  link,
}: {
  icon: React.ReactNode;
  label: string;
  target: string;
  link: string;
}) {
  return (
    <Link
      href={link}
      className="flex items-center justify-between hover:bg-[#1e3a5f] rounded px-1 py-1 transition-colors group"
    >
      <div className="flex items-center gap-2 text-[#94A3B8] group-hover:text-[#F8FAFC]">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-xs text-[#00FF9C]">{target}</span>
    </Link>
  );
}
