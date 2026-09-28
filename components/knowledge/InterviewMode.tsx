'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { generateId } from '@/lib/utils';
import type { InterviewAttempt, InterviewAnswerRating } from '@/types';
import { Target, RotateCcw, ChevronRight } from 'lucide-react';

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All Categories',
  'computer-science': 'Computer Science',
  backend: 'Backend',
  java: 'Java',
  databases: 'Databases',
  networking: 'Networking',
  'distributed-systems': 'Distributed Systems',
  architecture: 'Architecture',
  security: 'Security',
  'cloud-devops': 'Cloud & DevOps',
  'ml-ai': 'ML / AI',
  'system-design': 'System Design',
};

const ANSWER_RATINGS: { value: InterviewAnswerRating; label: string; color: string; bg: string }[] = [
  { value: 'incorrect', label: 'Incorrect', color: 'text-red-400', bg: 'bg-red-500/20 hover:bg-red-500/30' },
  { value: 'partial', label: 'Partial', color: 'text-orange-400', bg: 'bg-orange-500/20 hover:bg-orange-500/30' },
  { value: 'correct', label: 'Correct', color: 'text-blue-400', bg: 'bg-blue-500/20 hover:bg-blue-500/30' },
  { value: 'excellent', label: 'Excellent', color: 'text-[#00FF9C]', bg: 'bg-green-500/20 hover:bg-green-500/30' },
];

const TYPE_LABELS: Record<string, string> = {
  explain: 'Explain',
  why: 'Why',
  compare: 'Compare',
  scenario: 'Scenario',
  'system-design': 'System Design',
  ml: 'ML',
};

const TYPE_COLORS: Record<string, string> = {
  explain: '#3B82F6',
  why: '#F59E0B',
  compare: '#8B5CF6',
  scenario: '#EF4444',
  'system-design': '#06B6D4',
  ml: '#00FF9C',
};

export function InterviewMode() {
  const store = useStore();
  const [category, setCategory] = useState('all');
  const [showAnswer, setShowAnswer] = useState(false);
  const [myAnswer, setMyAnswer] = useState('');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);

  const filteredQs = category === 'all'
    ? store.interviewQuestions
    : store.interviewQuestions.filter(q => q.category === category);

  const currentQ = filteredQs[currentIdx];

  function handleRate(rating: InterviewAnswerRating) {
    if (!currentQ) return;
    const attempt: InterviewAttempt = {
      id: generateId(),
      questionId: currentQ.id,
      attemptedAt: new Date(),
      myAnswer,
      rating,
    };
    store.recordInterviewAttempt(attempt);
    if (currentIdx + 1 >= filteredQs.length) {
      setSessionDone(true);
    } else {
      setCurrentIdx(i => i + 1);
      setShowAnswer(false);
      setMyAnswer('');
    }
  }

  function handleReset() {
    setCurrentIdx(0);
    setShowAnswer(false);
    setMyAnswer('');
    setSessionDone(false);
  }

  if (!currentQ || sessionDone) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-[#00FF9C]/20 flex items-center justify-center">
          <Target size={28} className="text-[#00FF9C]" />
        </div>
        <h2 className="text-lg font-bold text-[#F8FAFC]">{sessionDone ? 'Session Complete!' : 'No Questions'}</h2>
        <p className="text-sm text-[#94A3B8]">{sessionDone ? 'You answered all questions in this session.' : 'No interview questions found for this category.'}</p>
        <button onClick={handleReset} className="flex items-center gap-2 bg-[#003F59] text-[#F8FAFC] px-4 py-2 rounded-lg text-sm hover:bg-[#004a6e] transition-colors">
          <RotateCcw size={14} /> Start New Session
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#F8FAFC]">Interview Mode</h1>
          <p className="text-xs text-[#94A3B8]">{currentIdx + 1} of {filteredQs.length} questions</p>
        </div>
        <select
          value={category}
          onChange={e => { setCategory(e.target.value); setCurrentIdx(0); handleReset(); }}
          className="bg-[#091B21] border border-[#1e3a5f] rounded px-2 py-1.5 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]"
        >
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Question card */}
      <div className="rounded-xl border border-[#1e3a5f] bg-[#091B21] p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs px-2 py-0.5 rounded font-semibold" style={{ backgroundColor: `${TYPE_COLORS[currentQ.type]}20`, color: TYPE_COLORS[currentQ.type] }}>
            {TYPE_LABELS[currentQ.type]}
          </span>
          <span className="text-xs text-[#94A3B8] capitalize">{currentQ.difficulty}</span>
        </div>
        <p className="text-lg font-semibold text-[#F8FAFC] mb-6">{currentQ.question}</p>

        {/* Answer textarea */}
        <div>
          <label className="block text-xs text-[#94A3B8] uppercase tracking-wider mb-2">Your Answer (from memory)</label>
          <textarea
            value={myAnswer}
            onChange={e => setMyAnswer(e.target.value)}
            rows={5}
            placeholder="Write your answer without looking at the reference..."
            className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded-lg px-4 py-3 text-sm text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#00FF9C] resize-none"
          />
        </div>

        {/* Show model answer */}
        <button
          onClick={() => setShowAnswer(s => !s)}
          className="mt-3 text-sm text-[#00FF9C] hover:text-[#00e68a] transition-colors"
        >
          {showAnswer ? 'Hide model answer' : 'Show model answer'}
        </button>

        {showAnswer && currentQ.modelAnswer && (
          <div className="mt-4 rounded-lg border border-[#1e3a5f] bg-[#0F172A] p-4">
            <p className="text-xs text-[#94A3B8] uppercase tracking-wider mb-2">Model Answer</p>
            <p className="text-sm text-[#F8FAFC] leading-relaxed">{currentQ.modelAnswer}</p>
          </div>
        )}
      </div>

      {/* Self assessment */}
      <div className="rounded-xl border border-[#1e3a5f] bg-[#091B21] p-5">
        <p className="text-xs text-[#94A3B8] uppercase tracking-wider mb-3">Self Assessment</p>
        <div className="grid grid-cols-4 gap-2">
          {ANSWER_RATINGS.map(r => (
            <button key={r.value} onClick={() => handleRate(r.value)} className={`rounded-lg p-3 text-center transition-colors ${r.bg}`}>
              <p className={`text-sm font-bold ${r.color}`}>{r.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button onClick={() => { setCurrentIdx(i => Math.max(0, i - 1)); setShowAnswer(false); setMyAnswer(''); }} disabled={currentIdx === 0} className="text-xs text-[#94A3B8] hover:text-[#F8FAFC] disabled:opacity-30 transition-colors">
          ← Previous
        </button>
        <button onClick={() => { setCurrentIdx(i => Math.min(filteredQs.length - 1, i + 1)); setShowAnswer(false); setMyAnswer(''); }} disabled={currentIdx >= filteredQs.length - 1} className="flex items-center gap-1 text-xs text-[#94A3B8] hover:text-[#F8FAFC] disabled:opacity-30 transition-colors">
          Skip <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}
