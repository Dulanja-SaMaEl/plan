'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { cn, generateId } from '@/lib/utils';
import { getPriorityColor } from '@/lib/calculations';
import type { Task, TaskStatus } from '@/types';
import { Plus, X, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'backlog', label: 'BACKLOG', color: '#94A3B8' },
  { id: 'this-week', label: 'THIS WEEK', color: '#3B82F6' },
  { id: 'today', label: 'TODAY', color: '#F59E0B' },
  { id: 'in-progress', label: 'IN PROGRESS', color: '#10B981' },
  { id: 'blocked', label: 'BLOCKED', color: '#EF4444' },
  { id: 'testing', label: 'TESTING', color: '#8B5CF6' },
  { id: 'done', label: 'DONE', color: '#00FF9C' },
];

export function TasksBoard() {
  const store = useStore();
  const [filter, setFilter] = useState<'all' | string>('all');
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTaskColumn, setNewTaskColumn] = useState<TaskStatus>('backlog');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('medium');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null);

  const filteredTasks =
    filter === 'all' ? store.tasks : store.tasks.filter(t => t.projectId === filter);

  function handleAddTask(colId: TaskStatus) {
    setNewTaskColumn(colId);
    setShowNewTask(true);
    setNewTaskTitle('');
  }

  function handleCreateTask() {
    if (!newTaskTitle.trim()) return;
    const task: Task = {
      id: generateId(),
      title: newTaskTitle.trim(),
      category: 'General',
      status: newTaskColumn,
      priority: newTaskPriority,
      tags: [],
      subtasks: [],
      order: filteredTasks.filter(t => t.status === newTaskColumn).length,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    store.addTask(task);
    setShowNewTask(false);
    setNewTaskTitle('');
  }

  function handleDragStart(id: string) {
    setDragging(id);
  }
  function handleDragOver(e: React.DragEvent, status: TaskStatus) {
    e.preventDefault();
    setDragOver(status);
  }
  function handleDrop(status: TaskStatus) {
    if (dragging) {
      store.moveTask(dragging, status);
      setDragging(null);
      setDragOver(null);
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold text-[#F8FAFC]">Tasks</h1>
          <p className="text-xs text-[#94A3B8]">
            {store.tasks.length} total &bull;{' '}
            {store.tasks.filter(t => t.status === 'done').length} done
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Project filter */}
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="bg-[#091B21] border border-[#1e3a5f] rounded-md px-2 py-1.5 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]"
          >
            <option value="all">All Projects</option>
            {store.projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => handleAddTask('backlog')}
            className="flex items-center gap-1.5 bg-[#00FF9C] text-[#091B21] rounded-md px-3 py-1.5 text-xs font-semibold hover:bg-[#00e68a] transition-colors"
          >
            <Plus size={13} /> Add Task
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-3 overflow-x-auto pb-4 flex-1">
        {COLUMNS.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col.id);
          return (
            <div
              key={col.id}
              className={cn(
                'flex-shrink-0 w-64 flex flex-col rounded-lg border bg-[#091B21] transition-colors',
                dragOver === col.id ? 'border-[#00FF9C]/50' : 'border-[#1e3a5f]',
              )}
              onDragOver={e => handleDragOver(e, col.id)}
              onDrop={() => handleDrop(col.id)}
              onDragLeave={() => setDragOver(null)}
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#1e3a5f]">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: col.color }}
                  />
                  <span
                    className="text-xs font-semibold tracking-wide"
                    style={{ color: col.color }}
                  >
                    {col.label}
                  </span>
                </div>
                <span className="text-xs text-[#94A3B8] bg-[#1e3a5f] rounded px-1.5 py-0.5">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {colTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    projects={store.projects}
                    onDragStart={() => handleDragStart(task.id)}
                    onDragEnd={() => setDragging(null)}
                    onClick={() => setSelectedTask(task)}
                  />
                ))}

                {/* Inline new task form for this column */}
                {showNewTask && newTaskColumn === col.id && (
                  <div className="rounded-md border border-[#00FF9C]/30 bg-[#0d1f35] p-2">
                    <input
                      autoFocus
                      type="text"
                      placeholder="Task title..."
                      value={newTaskTitle}
                      onChange={e => setNewTaskTitle(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleCreateTask();
                        if (e.key === 'Escape') setShowNewTask(false);
                      }}
                      className="w-full bg-transparent text-sm text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none mb-2"
                    />
                    <div className="flex items-center gap-2">
                      <select
                        value={newTaskPriority}
                        onChange={e =>
                          setNewTaskPriority(e.target.value as Task['priority'])
                        }
                        className="flex-1 bg-[#091B21] border border-[#1e3a5f] rounded text-xs text-[#F8FAFC] px-1.5 py-1 focus:outline-none"
                      >
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                      <button
                        onClick={handleCreateTask}
                        className="bg-[#00FF9C] text-[#091B21] text-xs px-2 py-1 rounded font-semibold hover:bg-[#00e68a]"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setShowNewTask(false)}
                        className="text-[#94A3B8] hover:text-[#F8FAFC] p-1"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Column add button */}
              <button
                onClick={() => handleAddTask(col.id)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1e3a5f] transition-colors border-t border-[#1e3a5f] w-full text-left rounded-b-lg"
              >
                <Plus size={12} /> Add
              </button>
            </div>
          );
        })}
      </div>

      {/* Task detail modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          projects={store.projects}
          onClose={() => setSelectedTask(null)}
          onUpdate={(id, data) => {
            store.updateTask(id, data);
            setSelectedTask(null);
          }}
          onDelete={id => {
            store.deleteTask(id);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TaskCard
// ---------------------------------------------------------------------------

function TaskCard({
  task,
  projects,
  onDragStart,
  onDragEnd,
  onClick,
}: {
  task: Task;
  projects: Array<{ id: string; name: string; color?: string }>;
  onDragStart: () => void;
  onDragEnd: () => void;
  onClick: () => void;
}) {
  const project = projects.find(p => p.id === task.projectId);
  const completedSubtasks = task.subtasks.filter(s => s.completed).length;
  const overdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      role="button"
      aria-label={`Task: ${task.title}`}
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      className="rounded-md border border-[#1e3a5f] bg-[#0d1f35] p-2.5 cursor-pointer hover:border-[#2a4a7f] transition-colors group"
    >
      {/* Priority indicator + title */}
      <div className="flex items-start gap-2 mb-2">
        <div
          className="mt-1 h-1.5 w-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: getPriorityColor(task.priority) }}
        />
        <p className="text-xs text-[#F8FAFC] leading-snug">{task.title}</p>
      </div>

      {/* Project tag */}
      {project && (
        <div className="mb-2">
          <span
            className="inline-flex items-center text-xs px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: `${project.color || '#3B82F6'}20`,
              color: project.color || '#3B82F6',
            }}
          >
            {project.name}
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span
              className={`flex items-center gap-0.5 text-xs ${
                overdue ? 'text-red-400' : 'text-[#94A3B8]'
              }`}
            >
              <Calendar size={10} />
              {format(new Date(task.dueDate), 'MMM d')}
            </span>
          )}
          {task.estimatedHours && (
            <span className="flex items-center gap-0.5 text-xs text-[#94A3B8]">
              <Clock size={10} /> {task.estimatedHours}h
            </span>
          )}
        </div>
        {task.subtasks.length > 0 && (
          <span className="text-xs text-[#94A3B8]">
            {completedSubtasks}/{task.subtasks.length}
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TaskDetailModal
// ---------------------------------------------------------------------------

function TaskDetailModal({
  task,
  projects,
  onClose,
  onUpdate,
  onDelete,
}: {
  task: Task;
  projects: Array<{ id: string; name: string }>;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<Task>) => void;
  onDelete: (id: string) => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority);
  const [status, setStatus] = useState(task.status);
  const [estimatedHours, setEstimatedHours] = useState(
    task.estimatedHours?.toString() || '',
  );
  const [projectId, setProjectId] = useState(task.projectId || '');
  const [notes, setNotes] = useState(task.notes || '');

  function handleSave() {
    onUpdate(task.id, {
      title,
      description,
      priority,
      status,
      estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
      projectId: projectId || undefined,
      notes,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Task details"
    >
      <div className="w-full max-w-lg rounded-xl border border-[#1e3a5f] bg-[#091B21] shadow-2xl">
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-[#1e3a5f] px-5 py-4">
          <h2 className="text-sm font-semibold text-[#F8FAFC]">Task Details</h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-[#94A3B8] hover:text-[#F8FAFC] p-1"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs text-[#94A3B8] mb-1">Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]"
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#94A3B8] mb-1">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-2 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]"
              >
                <option value="backlog">Backlog</option>
                <option value="this-week">This Week</option>
                <option value="today">Today</option>
                <option value="in-progress">In Progress</option>
                <option value="blocked">Blocked</option>
                <option value="testing">Testing</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#94A3B8] mb-1">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as Task['priority'])}
                className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-2 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Project + Estimated hours */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#94A3B8] mb-1">Project</label>
              <select
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-2 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]"
              >
                <option value="">No project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#94A3B8] mb-1">
                Estimated Hours
              </label>
              <input
                type="number"
                value={estimatedHours}
                onChange={e => setEstimatedHours(e.target.value)}
                step="0.5"
                min="0"
                className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-[#94A3B8] mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C] resize-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs text-[#94A3B8] mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C] resize-none"
            />
          </div>
        </div>

        {/* Modal footer */}
        <div className="flex justify-between border-t border-[#1e3a5f] px-5 py-3">
          <button
            onClick={() => onDelete(task.id)}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Delete task
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="text-xs px-3 py-1.5 border border-[#1e3a5f] rounded text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="text-xs px-3 py-1.5 bg-[#00FF9C] text-[#091B21] rounded font-semibold hover:bg-[#00e68a] transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
