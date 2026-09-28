'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import type { WeeklyReview } from '@/types';
import { generateId } from '@/lib/utils';
import { getOverdueTasks, formatDuration } from '@/lib/calculations';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { CheckCircle2, ClipboardList } from 'lucide-react';

export function WeeklyReviewPage() {
  const store = useStore();
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  // Weekly stats
  const weekEntries = store.timeEntries.filter(
    (e) => new Date(e.startTime) >= weekStart && new Date(e.startTime) <= weekEnd
  );
  const weekMainJob = weekEntries.filter((e) => e.category === 'main-job').reduce((s, e) => s + (e.duration || 0), 0);
  const weekFreelance = weekEntries.filter((e) => e.category === 'freelance').reduce((s, e) => s + (e.duration || 0), 0);
  const weekContent = weekEntries.filter((e) => e.category === 'content').reduce((s, e) => s + (e.duration || 0), 0);
  const weekLearning = weekEntries
    .filter((e) => e.category === 'learning' || e.category === 'leetcode' || e.category === 'knowledge')
    .reduce((s, e) => s + (e.duration || 0), 0);

  const doneTasks = store.tasks.filter((t) => t.status === 'done').length;
  const overdueTasks = getOverdueTasks(store.tasks).length;
  const reviewsDone = store.reviews.filter((r) => new Date(r.reviewedAt) >= weekStart).length;
  const publishedContent = store.content.filter((c) => c.status === 'published').length;
  const lcDone = store.leetcodeProblems.filter((p) => p.status === 'done').length;
  const interviewsAnswered = store.interviewAttempts.filter((a) => new Date(a.attemptedAt) >= weekStart).length;
  const bufferBlock = store.bufferBlocks[0];
  const bufferUsedHours = bufferBlock ? bufferBlock.usedMinutes / 60 : 0;

  // Reflection form
  const [wentWell, setWentWell] = useState('');
  const [didntGoWell, setDidntGoWell] = useState('');
  const [delays, setDelays] = useState('');
  const [stop, setStop] = useState('');
  const [cont, setCont] = useState('');
  const [start, setStart] = useState('');
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [p3, setP3] = useState('');
  const [saved, setSaved] = useState(false);

  function handleSave() {
    const review: WeeklyReview = {
      id: generateId(),
      weekStart,
      weekEnd,
      actualMainJobHours: Math.round((weekMainJob / 60) * 10) / 10,
      actualFreelanceHours: Math.round((weekFreelance / 60) * 10) / 10,
      actualContentHours: Math.round((weekContent / 60) * 10) / 10,
      actualLeetcodeHours:
        Math.round(
          (weekEntries.filter((e) => e.category === 'leetcode').reduce((s, e) => s + (e.duration || 0), 0) / 60) * 10
        ) / 10,
      actualKnowledgeHours:
        Math.round(
          (weekEntries.filter((e) => e.category === 'knowledge').reduce((s, e) => s + (e.duration || 0), 0) / 60) * 10
        ) / 10,
      actualLearningHours: Math.round((weekLearning / 60) * 10) / 10,
      bufferUsed: bufferUsedHours,
      tasksCompleted: doneTasks,
      tasksDelayed: overdueTasks,
      hospitalVisits: store.hospitalVisits.filter(
        (v) => new Date(v.date) >= weekStart && new Date(v.date) <= weekEnd
      ).length,
      contentPublished: publishedContent,
      leetcodeProblems: lcDone,
      conceptsLearned: store.concepts.length,
      conceptsReviewed: reviewsDone,
      whatWentWell: wentWell,
      whatDidntGoWell: didntGoWell,
      whatCausedDelays: delays,
      whatToStop: stop,
      whatToContinue: cont,
      whatToStart: start,
      top3NextWeek: [p1, p2, p3].filter(Boolean),
      createdAt: new Date(),
    };
    store.addWeeklyReview(review);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-8">
      <div>
        <h1 className="text-xl font-bold text-[#F8FAFC]">Weekly Review & Engineering Growth Retrospective</h1>
        <p className="text-xs text-[#94A3B8]">
          Week of {format(weekStart, 'MMMM d')} – {format(weekEnd, 'MMMM d, yyyy')} • Sustainable velocity audit
        </p>
      </div>

      {/* Auto stats breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Tasks Done" value={doneTasks} color="#00FF9C" sub="completed this week" />
        <StatCard
          label="Overdue / Delayed"
          value={overdueTasks}
          color={overdueTasks > 0 ? '#EF4444' : '#94A3B8'}
          sub={overdueTasks > 0 ? 'needs rescheduling' : 'zero delay'}
        />
        <StatCard label="Flashcards Reviewed" value={reviewsDone} color="#8B5CF6" sub="spaced repetition" />
        <StatCard label="Interview Prep" value={interviewsAnswered} color="#10B981" sub="questions answered" />
      </div>

      {/* Engineering Tracks Audit */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Work & Freelance */}
        <section className="rounded-lg border border-[#1e3a5f] bg-[#091B21] p-4 space-y-3">
          <h2 className="text-xs font-semibold text-[#00FF9C] uppercase tracking-wider">Professional & Freelance</h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Biotech Pharmacy System:</span>
              <span className="text-[#F8FAFC] font-medium">{formatDuration(weekMainJob)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Freelance Client Hours:</span>
              <span className="text-[#F8FAFC] font-medium">{formatDuration(weekFreelance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Hospital Visits Scheduled:</span>
              <span className="text-[#F8FAFC] font-medium">
                {store.hospitalVisits.filter((v) => v.status === 'scheduled').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Buffer Consumed:</span>
              <span className="text-orange-400 font-medium">{bufferUsedHours.toFixed(1)}h</span>
            </div>
          </div>
        </section>

        {/* Content & LeetCode */}
        <section className="rounded-lg border border-[#1e3a5f] bg-[#091B21] p-4 space-y-3">
          <h2 className="text-xs font-semibold text-[#F59E0B] uppercase tracking-wider">Content & LeetCode</h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Videos Recorded:</span>
              <span className="text-[#F8FAFC] font-medium">
                {store.content.filter((c) => c.status === 'recorded').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Videos Published:</span>
              <span className="text-[#00FF9C] font-medium">{publishedContent}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">LeetCode Solved:</span>
              <span className="text-[#F8FAFC] font-medium">{lcDone} problems</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Content Time Logged:</span>
              <span className="text-[#F8FAFC] font-medium">{formatDuration(weekContent)}</span>
            </div>
          </div>
        </section>

        {/* Knowledge & Courses */}
        <section className="rounded-lg border border-[#1e3a5f] bg-[#091B21] p-4 space-y-3">
          <h2 className="text-xs font-semibold text-[#8B5CF6] uppercase tracking-wider">Senior Knowledge & AI</h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Total Concepts Stored:</span>
              <span className="text-[#F8FAFC] font-medium">{store.concepts.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Strong Recall (80%+):</span>
              <span className="text-[#00FF9C] font-medium">
                {store.concepts.filter((c) => c.confidence >= 80).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Active Udemy Lessons:</span>
              <span className="text-[#F8FAFC] font-medium">
                {store.courses.reduce((s, c) => s + c.completedLessons, 0)} completed
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Study Time:</span>
              <span className="text-[#F8FAFC] font-medium">{formatDuration(weekLearning)}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Weekly Reflection Questions */}
      <section className="rounded-lg border border-[#1e3a5f] bg-[#091B21] p-5 space-y-5">
        <div className="flex items-center gap-2">
          <ClipboardList size={16} className="text-[#00FF9C]" />
          <h2 className="text-sm font-semibold text-[#F8FAFC]">Personal Engineering Reflection</h2>
        </div>
        <p className="text-xs text-[#94A3B8]">
          Review past decisions from first principles. Sustainable pace beats frantic multitasking.
        </p>

        <div className="space-y-4">
          <ReflectionField
            label="What went well this week?"
            placeholder="e.g. Drug interaction module delivered ahead of schedule; recorded 1 AI video"
            value={wentWell}
            onChange={setWentWell}
          />
          <ReflectionField
            label="What didn't go well?"
            placeholder="e.g. Underestimated database indexing task; skipped Tuesday LeetCode session"
            value={didntGoWell}
            onChange={setDidntGoWell}
          />
          <ReflectionField
            label="What caused delays or capacity overflow?"
            placeholder="e.g. Hospital deployment emergency required 3 extra on-site hours"
            value={delays}
            onChange={setDelays}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <ReflectionField
              label="What should I STOP doing?"
              placeholder="e.g. Context-switching between clients"
              value={stop}
              onChange={setStop}
            />
            <ReflectionField
              label="What should I CONTINUE?"
              placeholder="e.g. Morning 20m active recall flashcards"
              value={cont}
              onChange={setCont}
            />
            <ReflectionField
              label="What should I START?"
              placeholder="e.g. Writing out system design diagrams first"
              value={start}
              onChange={setStart}
            />
          </div>
        </div>
      </section>

      {/* Top 3 Priorities for Next Week */}
      <section className="rounded-lg border border-[#1e3a5f] bg-[#091B21] p-5">
        <h2 className="text-sm font-semibold text-[#F8FAFC] mb-2">Top 3 Priorities Next Week</h2>
        <p className="text-xs text-[#94A3B8] mb-4">Focus strictly on finishing these before taking on new leads</p>
        <div className="space-y-3">
          {[
            { n: 1, v: p1, s: setP1, placeholder: 'Priority 1: e.g. Pharmacy v2.4 hospital deployment sign-off' },
            { n: 2, v: p2, s: setP2, placeholder: 'Priority 2: e.g. Client 1 JWT authentication module release' },
            { n: 3, v: p3, s: setP3, placeholder: 'Priority 3: e.g. Record and edit RAG explanation YouTube video' },
          ].map(({ n, v, s, placeholder }) => (
            <div key={n} className="flex items-center gap-3">
              <span className="text-sm font-bold text-[#00FF9C] w-5">{n}.</span>
              <input
                value={v}
                onChange={(e) => s(e.target.value)}
                placeholder={placeholder}
                className="flex-1 bg-[#0F172A] border border-[#1e3a5f] rounded px-3 py-2 text-sm text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#00FF9C]"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Submit button */}
      <div className="flex justify-end items-center gap-3">
        {saved && (
          <div className="flex items-center gap-2 text-[#00FF9C] text-sm">
            <CheckCircle2 size={16} /> Weekly Review saved successfully!
          </div>
        )}
        <button
          onClick={handleSave}
          className="bg-[#00FF9C] text-[#091B21] px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#00e68a] transition-colors"
        >
          Save Weekly Review
        </button>
      </div>

      {/* Past Reviews History */}
      {store.weeklyReviews.length > 0 && (
        <section className="rounded-lg border border-[#1e3a5f] bg-[#091B21] p-5">
          <h2 className="text-sm font-semibold text-[#F8FAFC] mb-3">Saved Reviews History</h2>
          <div className="space-y-2">
            {store.weeklyReviews
              .slice()
              .reverse()
              .map((review) => (
                <div
                  key={review.id}
                  className="flex items-center justify-between border-b border-[#1e3a5f]/60 py-2.5 text-xs"
                >
                  <p className="text-sm font-medium text-[#F8FAFC]">
                    Week of {format(new Date(review.weekStart), 'MMM d')} – {format(new Date(review.weekEnd), 'MMM d, yyyy')}
                  </p>
                  <div className="flex items-center gap-4 text-[#94A3B8]">
                    <span>{review.tasksCompleted} tasks done</span>
                    <span>{review.conceptsReviewed} concepts reviewed</span>
                    {review.contentPublished > 0 && (
                      <span className="text-[#00FF9C]">{review.contentPublished} published</span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({ label, value, color, sub }: { label: string; value: number; color: string; sub: string }) {
  return (
    <div className="rounded-lg border border-[#1e3a5f] bg-[#091B21] px-4 py-3">
      <p className="text-xs text-[#94A3B8] mb-1">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>
        {value}
      </p>
      <p className="text-[11px] text-[#94A3B8] mt-0.5">{sub}</p>
    </div>
  );
}

function ReflectionField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs text-[#94A3B8] mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-3 py-2 text-sm text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#00FF9C] resize-none"
      />
    </div>
  );
}
