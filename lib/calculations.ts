import type { CapacityConfig, CapacityStats, Task, TimeEntry, KnowledgeConcept } from '@/types';

export function calculateCapacity(config: CapacityConfig, _tasks?: Task[], _timeEntries?: TimeEntry[]): CapacityStats {
  void _tasks;
  void _timeEntries;
  const totalCapacity = 168; // hours per week
  const totalPlanned = config.mainJobHours + config.freelanceHours + config.contentHours +
    config.leetcodeHours + config.knowledgeHours + config.learningHours + config.bufferHours;

  const freeCapacity = totalCapacity - totalPlanned;
  const isOverloaded = totalPlanned > totalCapacity;
  const overloadAmount = isOverloaded ? totalPlanned - totalCapacity : 0;

  return {
    totalCapacity,
    totalPlanned,
    mainJob: config.mainJobHours,
    freelance: config.freelanceHours,
    content: config.contentHours,
    leetcode: config.leetcodeHours,
    knowledge: config.knowledgeHours,
    learning: config.learningHours,
    buffer: config.bufferHours,
    freeCapacity,
    isOverloaded,
    overloadAmount,
  };
}

export function getDueForReview(concepts: KnowledgeConcept[]): KnowledgeConcept[] {
  const now = new Date();
  return concepts.filter(c => c.nextReviewDate <= now).sort((a, b) => a.nextReviewDate.getTime() - b.nextReviewDate.getTime());
}

export function getWeakConcepts(concepts: KnowledgeConcept[]): KnowledgeConcept[] {
  return concepts.filter(c => c.confidence < 60).sort((a, b) => a.confidence - b.confidence);
}

export function getOverdueTasks(tasks: Task[]): Task[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done');
}

export function getTodaysTasks(tasks: Task[]): Task[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tasks.filter(t => {
    if (t.status === 'done') return false;
    if (t.status === 'today' || t.status === 'in-progress') return true;
    if (t.dueDate) {
      const due = new Date(t.dueDate);
      due.setHours(0, 0, 0, 0);
      return due.getTime() === today.getTime();
    }
    return false;
  });
}

export function getThisWeeksTasks(tasks: Task[]): Task[] {
  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + (7 - weekEnd.getDay()));
  weekEnd.setHours(23, 59, 59, 999);
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  return tasks.filter(t => {
    if (t.status === 'done') return false;
    if (t.dueDate) {
      const due = new Date(t.dueDate);
      return due >= weekStart && due <= weekEnd;
    }
    return t.status === 'this-week';
  });
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function getConfidenceLabel(confidence: number): string {
  if (confidence < 30) return "Don't understand";
  if (confidence < 60) return 'Familiar';
  if (confidence < 80) return 'Can explain';
  if (confidence < 95) return 'Strong';
  return 'Automatic recall';
}

export function getConfidenceColor(confidence: number): string {
  if (confidence < 30) return '#EF4444';
  if (confidence < 60) return '#F59E0B';
  if (confidence < 80) return '#3B82F6';
  if (confidence < 95) return '#10B981';
  return '#00FF9C';
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'critical': return '#EF4444';
    case 'high': return '#F97316';
    case 'medium': return '#F59E0B';
    case 'low': return '#94A3B8';
    default: return '#94A3B8';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active': case 'in-progress': return '#10B981';
    case 'done': case 'completed': case 'published': return '#00FF9C';
    case 'blocked': return '#EF4444';
    case 'testing': return '#3B82F6';
    case 'backlog': return '#94A3B8';
    default: return '#94A3B8';
  }
}

export function getEventTypeColor(type: string): string {
  switch (type) {
    case 'main-job': return '#3B82F6';
    case 'freelance': return '#8B5CF6';
    case 'hospital': return '#EF4444';
    case 'content': return '#F59E0B';
    case 'leetcode': return '#10B981';
    case 'knowledge': return '#06B6D4';
    case 'udemy': return '#EC4899';
    case 'buffer': return '#00FF9C';
    case 'personal': return '#94A3B8';
    default: return '#94A3B8';
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
}

export function isOverdue(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}
