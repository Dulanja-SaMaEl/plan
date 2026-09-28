'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, CalendarDays, CheckSquare, FolderKanban, Users, Timer,
  Clapperboard, Code2, BookOpen, Brain, BarChart3, ClipboardList, Settings,
  ChevronRight, ChevronLeft, Zap, GraduationCap, MessageSquare,
  Network, Layers
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Planner', href: '/planner', icon: Zap },
  { label: 'Calendar', href: '/calendar', icon: CalendarDays },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Clients', href: '/clients', icon: Users },
  { label: 'Time Tracking', href: '/time-tracking', icon: Timer },
  { label: 'Content Studio', href: '/content', icon: Clapperboard },
  { label: 'LeetCode', href: '/leetcode', icon: Code2 },
  { label: 'Learning', href: '/learning', icon: GraduationCap },
  {
    label: 'Knowledge',
    href: '/knowledge',
    icon: Brain,
    children: [
      { label: 'Dashboard', href: '/knowledge', icon: LayoutDashboard },
      { label: 'Topics', href: '/knowledge/topics', icon: Layers },
      { label: 'Flashcards', href: '/knowledge/reviews', icon: BookOpen },
      { label: 'Interview', href: '/knowledge/interview', icon: MessageSquare },
      { label: 'Architecture', href: '/knowledge/architecture', icon: Network },
    ],
  },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Weekly Review', href: '/weekly-review', icon: ClipboardList },
  { label: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Knowledge']);

  function toggleGroup(label: string) {
    setExpandedGroups(prev =>
      prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]
    );
  }

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === href || pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b border-[#1e3a5f] px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-[#00FF9C] flex items-center justify-center">
              <span className="text-[#091B21] font-bold text-xs">EOS</span>
            </div>
            <span className="font-semibold text-sm text-[#F8FAFC]">Engineering OS</span>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto h-7 w-7 rounded-md bg-[#00FF9C] flex items-center justify-center">
            <span className="text-[#091B21] font-bold text-xs">E</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="rounded p-1 text-[#94A3B8] hover:bg-[#1e3a5f] hover:text-[#F8FAFC] transition-colors hidden lg:flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navigation.map((item) => (
          <div key={item.label}>
            {item.children ? (
              <div>
                {!collapsed ? (
                  <button
                    onClick={() => toggleGroup(item.label)}
                    className={`
                      w-full flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm
                      transition-colors
                      ${isActive(item.href)
                        ? 'bg-[#003F59] text-[#00FF9C]'
                        : 'text-[#94A3B8] hover:bg-[#1e3a5f] hover:text-[#F8FAFC]'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon size={16} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight
                      size={12}
                      className={`transition-transform ${expandedGroups.includes(item.label) ? 'rotate-90' : ''}`}
                    />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`
                      flex items-center justify-center rounded-md p-2 mb-0.5 transition-colors
                      ${isActive(item.href)
                        ? 'bg-[#003F59] text-[#00FF9C]'
                        : 'text-[#94A3B8] hover:bg-[#1e3a5f] hover:text-[#F8FAFC]'
                      }
                    `}
                    title={item.label}
                  >
                    <item.icon size={16} />
                  </Link>
                )}
                {!collapsed && expandedGroups.includes(item.label) && (
                  <div className="ml-4 mt-0.5 border-l border-[#1e3a5f] pl-2">
                    {item.children.map(child => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`
                          flex items-center gap-2 rounded-md px-2 py-1.5 text-xs mb-0.5 transition-colors
                          ${pathname === child.href
                            ? 'bg-[#003F59] text-[#00FF9C]'
                            : 'text-[#94A3B8] hover:bg-[#1e3a5f] hover:text-[#F8FAFC]'
                          }
                        `}
                      >
                        <child.icon size={13} />
                        <span>{child.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={item.href}
                className={`
                  flex items-center gap-2 rounded-md mb-0.5 transition-colors
                  ${collapsed ? 'justify-center p-2' : 'px-2 py-1.5'}
                  ${isActive(item.href)
                    ? 'bg-[#003F59] text-[#00FF9C]'
                    : 'text-[#94A3B8] hover:bg-[#1e3a5f] hover:text-[#F8FAFC]'
                  }
                `}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={16} />
                {!collapsed && <span className="text-sm">{item.label}</span>}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom status */}
      {!collapsed && (
        <div className="border-t border-[#1e3a5f] px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-[#003F59] flex items-center justify-center">
              <span className="text-xs text-[#00FF9C] font-semibold">SE</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#F8FAFC] truncate">Engineer</p>
              <p className="text-xs text-[#94A3B8] truncate">Biotech Software Solutions</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
