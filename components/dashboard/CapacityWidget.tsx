'use client';
import type { CapacityStats } from '@/types';
import { AlertTriangle } from 'lucide-react';

interface CapacityWidgetProps {
  capacity: CapacityStats;
}

export function CapacityWidget({ capacity }: CapacityWidgetProps) {
  const rows = [
    { label: 'Main Job', hours: capacity.mainJob, color: '#3B82F6' },
    { label: 'Freelancing', hours: capacity.freelance, color: '#8B5CF6' },
    { label: 'AI Content', hours: capacity.content, color: '#F59E0B' },
    { label: 'LeetCode', hours: capacity.leetcode, color: '#10B981' },
    { label: 'Knowledge', hours: capacity.knowledge, color: '#06B6D4' },
    { label: 'Learning', hours: capacity.learning, color: '#EC4899' },
    { label: 'Buffer', hours: capacity.buffer, color: '#00FF9C' },
  ];

  const maxHours = Math.max(...rows.map(r => r.hours), 1);

  return (
    <section className={`rounded-lg border bg-[#091B21] p-4 ${
      capacity.isOverloaded ? 'border-red-500/40' : 'border-[#1e3a5f]'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-[#F8FAFC]">Weekly Capacity</h2>
        {capacity.isOverloaded && (
          <div className="flex items-center gap-1 text-red-400">
            <AlertTriangle size={12} />
            <span className="text-xs">Overloaded</span>
          </div>
        )}
      </div>

      <div className="space-y-2 mb-4">
        {rows.map(row => (
          <div key={row.label}>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs text-[#94A3B8]">{row.label}</span>
              <span className="text-xs font-mono text-[#F8FAFC]">{row.hours}h</span>
            </div>
            <div className="h-1 bg-[#1e3a5f] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${(row.hours / maxHours) * 100}%`, backgroundColor: row.color }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-[#1e3a5f] pt-3">
        <div className="flex justify-between text-xs">
          <span className="text-[#94A3B8]">Planned</span>
          <span className={`font-mono font-semibold ${capacity.isOverloaded ? 'text-red-400' : 'text-[#F8FAFC]'}`}>
            {capacity.totalPlanned}h
          </span>
        </div>
        {capacity.isOverloaded && (
          <div className="flex justify-between text-xs mt-1">
            <span className="text-red-400">Over capacity</span>
            <span className="font-mono font-semibold text-red-400">+{capacity.overloadAmount}h</span>
          </div>
        )}
        {!capacity.isOverloaded && (
          <div className="flex justify-between text-xs mt-1">
            <span className="text-[#94A3B8]">Free capacity</span>
            <span className="font-mono font-semibold text-[#00FF9C]">{capacity.freeCapacity}h</span>
          </div>
        )}
      </div>
    </section>
  );
}
