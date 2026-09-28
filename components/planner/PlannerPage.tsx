'use client';

import { useStore } from '@/lib/store';
import {
  getTodaysTasks,
  getThisWeeksTasks,
  getOverdueTasks,
  calculateCapacity,
  getPriorityColor,
  getEventTypeColor,
} from '@/lib/calculations';
import { weeklyScheduleTemplate } from '@/lib/data/seed';
import { format, addDays, startOfWeek } from 'date-fns';
import { AlertTriangle, Zap, Calendar, CheckSquare, Shield } from 'lucide-react';
import Link from 'next/link';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function PlannerPage() {
  const store = useStore();
  const capacity = calculateCapacity(store.capacityConfig, store.tasks, store.timeEntries);
  const todaysTasks = getTodaysTasks(store.tasks);
  const weekTasks = getThisWeeksTasks(store.tasks);
  const overdueTasks = getOverdueTasks(store.tasks);
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });

  // Overload source breakdown calculation
  const freelanceOverload = Math.max(
    0,
    store.projects.filter((p) => p.category === 'freelance' && p.status === 'active').reduce((s, p) => s + p.weeklyRequiredHours, 0) -
      store.capacityConfig.freelanceHours
  );
  const contentOverload = Math.max(
    0,
    store.content.filter((c) => c.status === 'script' || c.status === 'ready-to-record').length * 2 -
      store.capacityConfig.contentHours
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#F8FAFC]">Workload & Weekly Planner</h1>
          <p className="text-xs text-[#94A3B8]">
            Week of {format(weekStart, 'MMMM d, yyyy')} • Capacity constraints & daily execution
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-[#94A3B8]">Weekly Budget: </span>
            <span
              className={`text-sm font-bold font-mono ${
                capacity.isOverloaded ? 'text-red-400' : 'text-[#00FF9C]'
              }`}
            >
              {capacity.totalPlanned}h / {capacity.totalCapacity}h
            </span>
          </div>
        </div>
      </div>

      {/* Overload Warning & Rescheduling Recommendation */}
      {capacity.isOverloaded && (
        <section className="rounded-lg border border-red-500/40 bg-red-500/10 p-5 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-red-400 uppercase tracking-wide">
                OVER CAPACITY — Workload Exceeds Weekly Hours by {capacity.overloadAmount}h
              </h2>
              <p className="text-xs text-red-200/90 leading-relaxed">
                Do not simply add more work. The Engineering OS strictly recommends **rescheduling non-critical tasks**
                or postponing secondary freelance deliverables to protect your mental focus and 4h emergency buffer.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-red-500/30 text-xs text-red-200">
            <div>
              <span className="text-red-300/70">Main Job:</span> 40h (Committed)
            </div>
            <div>
              <span className="text-red-300/70">Freelance:</span> {store.capacityConfig.freelanceHours}h (+{freelanceOverload}h active)
            </div>
            <div>
              <span className="text-red-300/70">AI Content:</span> {store.capacityConfig.contentHours}h {contentOverload > 0 ? `(+${contentOverload}h)` : ''}
            </div>
            <div>
              <span className="text-red-300/70">Reserved Buffer:</span> {store.capacityConfig.bufferHours}h (Protected)
            </div>
          </div>
        </section>
      )}

      {/* Overdue Alert */}
      {overdueTasks.length > 0 && (
        <section className="rounded-lg border border-red-500/30 bg-[#091B21] p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-red-400 flex items-center gap-2">
              <AlertTriangle size={15} /> Overdue Tasks Requiring Action ({overdueTasks.length})
            </h2>
            <Link href="/tasks" className="text-xs text-[#00FF9C] hover:underline">
              Manage in Kanban
            </Link>
          </div>
          <div className="space-y-1.5">
            {overdueTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-2 rounded bg-[#0d1f35] border border-[#1e3a5f]"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: getPriorityColor(task.priority) }}
                  />
                  <p className="text-xs text-[#F8FAFC]">{task.title}</p>
                </div>
                <span className="text-xs text-red-400 font-mono">
                  {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : ''}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7-Day Weekly Grid Schedule */}
      <section className="rounded-lg border border-[#1e3a5f] bg-[#091B21] p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap size={15} className="text-[#00FF9C]" />
            <h2 className="text-sm font-semibold text-[#F8FAFC]">Weekly Recurring Commitment Blueprint</h2>
          </div>
          <span className="text-xs text-[#94A3B8]">Default schedule blocks across 7 days</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {Array.from({ length: 7 }, (_, i) => {
            const dayDate = addDays(weekStart, i);
            const dayOfWeek = dayDate.getDay();
            const isCurrentDay = dayDate.toDateString() === today.toDateString();
            const dayBlocks = weeklyScheduleTemplate.filter((b) => b.day === dayOfWeek);

            return (
              <div
                key={i}
                className={`rounded-lg border p-3 flex flex-col justify-between min-h-[160px] ${
                  isCurrentDay ? 'border-[#00FF9C]/50 bg-[#00FF9C]/5' : 'border-[#1e3a5f] bg-[#0d1f35]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between border-b border-[#1e3a5f]/80 pb-1.5 mb-2">
                    <span
                      className={`text-xs font-semibold ${
                        isCurrentDay ? 'text-[#00FF9C]' : 'text-[#94A3B8]'
                      }`}
                    >
                      {DAYS[dayOfWeek]}
                    </span>
                    <span
                      className={`text-sm font-bold font-mono ${
                        isCurrentDay ? 'text-[#00FF9C]' : 'text-[#F8FAFC]'
                      }`}
                    >
                      {format(dayDate, 'd')}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {dayBlocks.map((block, j) => {
                      const color = getEventTypeColor(block.type);
                      return (
                        <div
                          key={j}
                          className="rounded px-2 py-1 text-[11px] leading-tight"
                          style={{
                            backgroundColor: `${color}15`,
                            borderLeft: `2px solid ${color}`,
                            color: '#F8FAFC',
                          }}
                        >
                          <p className="font-medium truncate">{block.title}</p>
                          <p className="text-[10px] text-[#94A3B8]">
                            {block.start} - {block.end}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {dayOfWeek === 5 && (
                  <div className="mt-2 text-[10px] text-[#00FF9C] flex items-center gap-1 font-semibold">
                    <Shield size={10} /> 4h Buffer Protected
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Today's Tasks vs This Week's Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <section className="rounded-lg border border-[#1e3a5f] bg-[#091B21] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#F8FAFC] flex items-center gap-2">
              <CheckSquare size={16} className="text-[#00FF9C]" /> Scheduled for Today ({todaysTasks.length})
            </h2>
            <Link href="/tasks" className="text-xs text-[#00FF9C] hover:underline">
              Kanban
            </Link>
          </div>
          <div className="space-y-2">
            {todaysTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-2.5 rounded bg-[#0d1f35] border border-[#1e3a5f]"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getPriorityColor(task.priority) }}
                  />
                  <div>
                    <p className="text-xs font-medium text-[#F8FAFC]">{task.title}</p>
                    <p className="text-[11px] text-[#94A3B8]">{task.category}</p>
                  </div>
                </div>
                {task.estimatedHours && (
                  <span className="text-xs text-[#94A3B8] font-mono">{task.estimatedHours}h est.</span>
                )}
              </div>
            ))}
            {todaysTasks.length === 0 && (
              <p className="text-xs text-[#94A3B8]">No pending tasks scheduled for today.</p>
            )}
          </div>
        </section>

        {/* This Week's Focus Tasks */}
        <section className="rounded-lg border border-[#1e3a5f] bg-[#091B21] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#F8FAFC] flex items-center gap-2">
              <Calendar size={16} className="text-[#3B82F6]" /> Active Week Deliverables ({weekTasks.length})
            </h2>
            <Link href="/tasks" className="text-xs text-[#00FF9C] hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-2">
            {weekTasks.slice(0, 7).map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-2.5 rounded bg-[#0d1f35] border border-[#1e3a5f]"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getPriorityColor(task.priority) }}
                  />
                  <div>
                    <p className="text-xs font-medium text-[#F8FAFC]">{task.title}</p>
                    <p className="text-[11px] text-[#94A3B8]">{task.category}</p>
                  </div>
                </div>
                {task.dueDate && (
                  <span className="text-xs text-[#94A3B8] font-mono">
                    Due {format(new Date(task.dueDate), 'MMM d')}
                  </span>
                )}
              </div>
            ))}
            {weekTasks.length === 0 && (
              <p className="text-xs text-[#94A3B8]">No deliverables currently planned for this week.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
