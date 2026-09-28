'use client';
import { Menu, Search, Plus, Bell } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const quickAddItems = [
    { label: 'Task', href: '/tasks?new=true' },
    { label: 'Project', href: '/projects?new=true' },
    { label: 'Client', href: '/clients?new=true' },
    { label: 'Calendar Event', href: '/calendar?new=true' },
    { label: 'Hospital Visit', href: '/calendar?type=hospital' },
    { label: 'Content Idea', href: '/content?new=true' },
    { label: 'LeetCode Problem', href: '/leetcode?new=true' },
    { label: 'Knowledge Concept', href: '/knowledge?new=true' },
    { label: 'Time Entry', href: '/time-tracking?new=true' },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-[#1e3a5f] bg-[#091B21] px-4">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-md text-[#94A3B8] hover:bg-[#1e3a5f] hover:text-[#F8FAFC] transition-colors"
        aria-label="Toggle menu"
      >
        <Menu size={18} />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search tasks, concepts, projects..."
            className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded-md py-1.5 pl-9 pr-4 text-sm text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#00FF9C] focus:ring-1 focus:ring-[#00FF9C]"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Quick Add */}
        <div className="relative">
          <button
            onClick={() => setShowQuickAdd(s => !s)}
            className="flex items-center gap-1.5 rounded-md bg-[#00FF9C] px-3 py-1.5 text-xs font-semibold text-[#091B21] hover:bg-[#00e68a] transition-colors"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Add</span>
          </button>
          {showQuickAdd && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-[#1e3a5f] bg-[#091B21] shadow-xl z-50">
              {quickAddItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowQuickAdd(false)}
                  className="flex items-center px-3 py-2 text-sm text-[#94A3B8] hover:bg-[#1e3a5f] hover:text-[#F8FAFC] transition-colors first:rounded-t-lg last:rounded-b-lg"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <button
          className="p-2 rounded-md text-[#94A3B8] hover:bg-[#1e3a5f] hover:text-[#F8FAFC] transition-colors relative"
          aria-label="Notifications"
        >
          <Bell size={16} />
        </button>
      </div>
    </header>
  );
}
