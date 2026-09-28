'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import type { LearningCourse } from '@/types';
import { GraduationCap, Plus, X } from 'lucide-react';
import { generateId } from '@/lib/utils';

export function LearningPage() {
  const store = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<LearningCourse | null>(null);
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState('Udemy');
  const [totalLessons, setTotalLessons] = useState('');
  const [totalHours, setTotalHours] = useState('');
  const [notes, setNotes] = useState('');

  function handleAdd() {
    if (!name.trim()) return;
    const course: LearningCourse = {
      id: generateId(),
      name: name.trim(),
      platform: platform.trim(),
      totalLessons: parseInt(totalLessons) || 0,
      completedLessons: 0,
      totalHours: parseFloat(totalHours) || 0,
      completedHours: 0,
      notes: notes.trim() || undefined,
      category: 'udemy',
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    store.addCourse(course);
    setName('');
    setPlatform('Udemy');
    setTotalLessons('');
    setTotalHours('');
    setNotes('');
    setShowAdd(false);
  }

  function handleUpdateProgress(course: LearningCourse, lessonsDelta: number) {
    const newCompleted = Math.min(course.totalLessons, Math.max(0, course.completedLessons + lessonsDelta));
    const ratio = course.totalLessons > 0 ? newCompleted / course.totalLessons : 0;
    const updatedCompletedHours = Math.round(course.totalHours * ratio * 10) / 10;
    store.updateCourse(course.id, {
      completedLessons: newCompleted,
      completedHours: updatedCompletedHours,
    });
    if (selected?.id === course.id) {
      setSelected({
        ...selected,
        completedLessons: newCompleted,
        completedHours: updatedCompletedHours,
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#F8FAFC]">Courses & Active Learning</h1>
          <p className="text-xs text-[#94A3B8]">
            Structured deep-work courses • Track lessons, hours, and remaining study commitments
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 bg-[#00FF9C] text-[#091B21] rounded-md px-3 py-1.5 text-xs font-semibold hover:bg-[#00e68a] transition-colors"
        >
          <Plus size={13} /> Add Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {store.courses.map((course) => {
          const progress = course.totalLessons > 0 ? Math.round((course.completedLessons / course.totalLessons) * 100) : 0;
          const remainingHours = Math.max(0, course.totalHours - course.completedHours);
          const isComplete = course.completedLessons >= course.totalLessons;

          // Visual block representation: 42 / 54 lessons
          const filledBlocks = Math.floor(progress / 5);
          const emptyBlocks = Math.max(0, 20 - filledBlocks);

          return (
            <div key={course.id} className="rounded-lg border border-[#1e3a5f] bg-[#091B21] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <GraduationCap size={16} className="text-[#00FF9C]" />
                      <p className="text-base font-semibold text-[#F8FAFC]">{course.name}</p>
                    </div>
                    <p className="text-xs text-[#94A3B8] ml-6">{course.platform}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-semibold ${
                      isComplete ? 'bg-green-500/20 text-[#00FF9C]' : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {isComplete ? 'Completed' : `${progress}%`}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-[#94A3B8] mb-1.5">
                    <span>
                      {course.completedLessons} / {course.totalLessons} lessons completed
                    </span>
                    <span className="font-semibold text-[#F8FAFC]">{progress}%</span>
                  </div>
                  <div className="h-2 bg-[#1e3a5f] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: isComplete ? '#00FF9C' : '#3B82F6',
                      }}
                    />
                  </div>
                </div>

                {/* Text visual progress representation */}
                <div className="bg-[#0F172A] border border-[#1e3a5f] rounded p-2.5 mb-4 text-center font-mono text-xs">
                  <div className="text-[#00FF9C] tracking-widest text-sm mb-1">
                    {'█'.repeat(filledBlocks)}
                    {'░'.repeat(emptyBlocks)}
                  </div>
                  <div className="text-[11px] text-[#94A3B8]">
                    {course.completedLessons} / {course.totalLessons} lessons ({progress}%)
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-[#94A3B8] mb-3">
                  <div className="bg-[#0d1f35] p-2 rounded border border-[#1e3a5f]">
                    <span className="text-[#94A3B8]">Completed: </span>
                    <span className="text-[#F8FAFC] font-semibold">{course.completedHours.toFixed(1)}h</span>
                  </div>
                  <div className="bg-[#0d1f35] p-2 rounded border border-[#1e3a5f]">
                    <span className="text-[#94A3B8]">Remaining: </span>
                    <span className="text-[#00FF9C] font-semibold">{remainingHours.toFixed(1)}h</span>
                  </div>
                </div>

                {course.currentLesson && (
                  <p className="text-xs text-[#94A3B8] mb-3">
                    Current Focus: <span className="text-[#F8FAFC] font-medium">{course.currentLesson}</span>
                  </p>
                )}
                {course.notes && <p className="text-xs text-[#94A3B8] italic mb-3">&quot;{course.notes}&quot;</p>}
              </div>

              {/* Progress control buttons */}
              <div className="pt-3 border-t border-[#1e3a5f]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateProgress(course, -1)}
                    disabled={course.completedLessons === 0}
                    className="text-xs px-2.5 py-1.5 border border-[#1e3a5f] rounded text-[#94A3B8] hover:text-[#F8FAFC] disabled:opacity-30 transition-colors"
                  >
                    -1 lesson
                  </button>
                  <span className="text-xs text-[#94A3B8] flex-1 text-center">Log Progress</span>
                  <button
                    onClick={() => handleUpdateProgress(course, 1)}
                    disabled={course.completedLessons >= course.totalLessons}
                    className="text-xs px-3 py-1.5 bg-[#00FF9C]/10 border border-[#00FF9C]/40 rounded text-[#00FF9C] hover:bg-[#00FF9C]/20 disabled:opacity-30 transition-colors font-medium"
                  >
                    +1 lesson finished
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-[#1e3a5f] bg-[#091B21] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1e3a5f] px-5 py-4">
              <h2 className="text-sm font-semibold text-[#F8FAFC]">Add Learning Course</h2>
              <button onClick={() => setShowAdd(false)} className="text-[#94A3B8] hover:text-[#F8FAFC] p-1">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-[#94A3B8] mb-1">Course Title</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Distributed Systems in Java"
                  className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#94A3B8] mb-1">Platform</label>
                <input
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1">Total Lessons</label>
                  <input
                    type="number"
                    value={totalLessons}
                    onChange={(e) => setTotalLessons(e.target.value)}
                    placeholder="54"
                    className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1">Total Video Hours</label>
                  <input
                    type="number"
                    value={totalHours}
                    onChange={(e) => setTotalHours(e.target.value)}
                    placeholder="18"
                    className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#94A3B8] mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C] resize-none"
                />
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
                Add Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
