'use client';
import { getEventTypeColor } from '@/lib/calculations';
import { weeklyScheduleTemplate } from '@/lib/data/seed';

export function TodayTimeline() {
  const dayOfWeek = new Date().getDay(); // 0=Sun, 1=Mon...
  const todaySchedule = weeklyScheduleTemplate.filter(s => s.day === dayOfWeek);

  if (todaySchedule.length === 0) {
    return (
      <section className="rounded-lg border border-[#1e3a5f] bg-[#091B21] p-4">
        <h2 className="text-sm font-semibold text-[#F8FAFC] mb-3">Today&apos;s Timeline</h2>
        <p className="text-sm text-[#94A3B8]">No scheduled blocks today. Enjoy the free time!</p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-[#1e3a5f] bg-[#091B21] p-4">
      <h2 className="text-sm font-semibold text-[#F8FAFC] mb-4">Today&apos;s Timeline</h2>
      <div className="relative pl-16 space-y-2">
        {todaySchedule.map((block, i) => {
          const color = getEventTypeColor(block.type);
          return (
            <div key={i} className="relative">
              {/* Time label */}
              <div className="absolute -left-16 top-0 w-14 text-right">
                <span className="text-xs text-[#94A3B8] font-mono">{block.start}</span>
              </div>
              {/* Block */}
              <div
                className="rounded-md px-3 py-2 border-l-2"
                style={{
                  borderLeftColor: color,
                  backgroundColor: `${color}15`,
                }}
              >
                <p className="text-sm font-medium text-[#F8FAFC]">{block.title}</p>
                <p className="text-xs text-[#94A3B8]">{block.start}–{block.end}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
