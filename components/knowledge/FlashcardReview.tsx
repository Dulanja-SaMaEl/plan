'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { getDueForReview, getConfidenceColor } from '@/lib/calculations';
import { Eye, EyeOff, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

const RATING_BUTTONS = [
  { value: 'again' as const, label: 'Again', color: '#EF4444', bg: 'bg-red-500/20 hover:bg-red-500/30', text: 'text-red-400', desc: 'Forgot completely' },
  { value: 'hard' as const, label: 'Hard', color: '#F97316', bg: 'bg-orange-500/20 hover:bg-orange-500/30', text: 'text-orange-400', desc: 'Recalled with effort' },
  { value: 'good' as const, label: 'Good', color: '#3B82F6', bg: 'bg-blue-500/20 hover:bg-blue-500/30', text: 'text-blue-400', desc: 'Recalled correctly' },
  { value: 'easy' as const, label: 'Easy', color: '#00FF9C', bg: 'bg-green-500/20 hover:bg-green-500/30', text: 'text-[#00FF9C]', desc: 'Instant recall' },
];

export function FlashcardReview() {
  const store = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  const dueCards = getDueForReview(store.concepts);

  function handleRate(rating: 'again' | 'hard' | 'good' | 'easy') {
    if (currentIndex >= dueCards.length) return;
    const concept = dueCards[currentIndex];
    store.reviewConcept(concept.id, rating);
    setReviewedCount(c => c + 1);

    if (currentIndex + 1 >= dueCards.length) {
      setSessionComplete(true);
    } else {
      setCurrentIndex(i => i + 1);
      setRevealed(false);
    }
  }

  function handleRestart() {
    setCurrentIndex(0);
    setRevealed(false);
    setSessionComplete(false);
    setReviewedCount(0);
  }

  if (dueCards.length === 0 || sessionComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-[#00FF9C]/20 flex items-center justify-center">
          <span className="text-2xl">🎉</span>
        </div>
        <h2 className="text-lg font-bold text-[#F8FAFC]">
          {dueCards.length === 0 ? 'All caught up!' : `Session Complete!`}
        </h2>
        <p className="text-sm text-[#94A3B8]">
          {dueCards.length === 0
            ? 'No concepts due for review right now. Check back later.'
            : `You reviewed ${reviewedCount} concept${reviewedCount !== 1 ? 's' : ''} this session.`}
        </p>
        {sessionComplete && (
          <button
            onClick={handleRestart}
            className="flex items-center gap-2 bg-[#003F59] text-[#F8FAFC] px-4 py-2 rounded-lg text-sm hover:bg-[#004a6e] transition-colors"
          >
            <RotateCcw size={14} /> Review Again
          </button>
        )}
      </div>
    );
  }

  const concept = dueCards[currentIndex];
  const progress = Math.round((currentIndex / dueCards.length) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#F8FAFC]">Flashcard Review</h1>
          <p className="text-xs text-[#94A3B8]">{dueCards.length - currentIndex} remaining</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-[#94A3B8] mb-1">{currentIndex + 1} / {dueCards.length}</div>
          <div className="w-32 h-1.5 bg-[#1e3a5f] rounded-full overflow-hidden">
            <div className="h-full bg-[#00FF9C] rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="rounded-xl border border-[#1e3a5f] bg-[#091B21] overflow-hidden">
        {/* Card header */}
        <div className="flex items-center justify-between border-b border-[#1e3a5f] px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#94A3B8] uppercase tracking-wider">{concept.category.replace(/-/g, ' ')}</span>
          </div>
          <span className="text-xs font-mono" style={{ color: getConfidenceColor(concept.confidence) }}>
            {concept.confidence}% confidence
          </span>
        </div>

        {/* Question */}
        <div className="px-5 py-6">
          <p className="text-xs text-[#94A3B8] uppercase tracking-wider mb-2">QUESTION</p>
          <h2 className="text-xl font-bold text-[#F8FAFC] mb-4">{concept.name}</h2>
          <p className="text-sm text-[#94A3B8]">
            {concept.interviewQuestions?.[0] || `Explain ${concept.name} from first principles.`}
          </p>
        </div>

        {/* Reveal toggle */}
        <div className="px-5 pb-4">
          <button
            onClick={() => setRevealed(r => !r)}
            className="flex items-center gap-2 text-sm text-[#00FF9C] hover:text-[#00e68a] transition-colors"
          >
            {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
            {revealed ? 'Hide Answer' : 'Reveal Answer'}
          </button>
        </div>

        {/* Answer */}
        {revealed && (
          <div className="border-t border-[#1e3a5f] px-5 py-5 space-y-4">
            {concept.definition && (
              <div>
                <p className="text-xs text-[#94A3B8] uppercase tracking-wider mb-1">Definition</p>
                <p className="text-sm text-[#F8FAFC]">{concept.definition}</p>
              </div>
            )}
            {concept.whyItExists && (
              <div>
                <p className="text-xs text-[#94A3B8] uppercase tracking-wider mb-1">Why it exists</p>
                <p className="text-sm text-[#F8FAFC]">{concept.whyItExists}</p>
              </div>
            )}
            {concept.howItWorks && (
              <div>
                <p className="text-xs text-[#94A3B8] uppercase tracking-wider mb-1">How it works</p>
                <p className="text-sm text-[#F8FAFC]">{concept.howItWorks}</p>
              </div>
            )}
            {concept.whenToUse && (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md bg-green-500/10 border border-green-500/20 p-3">
                  <p className="text-xs text-green-400 font-semibold mb-1">✓ When to use</p>
                  <p className="text-xs text-[#F8FAFC]">{concept.whenToUse}</p>
                </div>
                {concept.whenNotToUse && (
                  <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3">
                    <p className="text-xs text-red-400 font-semibold mb-1">✗ When NOT to use</p>
                    <p className="text-xs text-[#F8FAFC]">{concept.whenNotToUse}</p>
                  </div>
                )}
              </div>
            )}
            {concept.codeExample && (
              <div>
                <p className="text-xs text-[#94A3B8] uppercase tracking-wider mb-1">Code Example</p>
                <pre className="bg-[#0F172A] rounded-md p-3 text-xs text-[#00FF9C] overflow-x-auto font-mono">{concept.codeExample}</pre>
              </div>
            )}
            {concept.commonMistakes && (
              <div>
                <p className="text-xs text-orange-400 uppercase tracking-wider mb-1">Common Mistakes</p>
                <p className="text-sm text-[#F8FAFC]">{concept.commonMistakes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Self assessment */}
      {revealed && (
        <div className="rounded-xl border border-[#1e3a5f] bg-[#091B21] p-5">
          <p className="text-xs text-[#94A3B8] uppercase tracking-wider mb-3">How did you do?</p>
          <div className="grid grid-cols-4 gap-2">
            {RATING_BUTTONS.map(btn => (
              <button
                key={btn.value}
                onClick={() => handleRate(btn.value)}
                className={`rounded-lg p-3 text-center transition-colors ${btn.bg}`}
              >
                <p className={`text-sm font-bold ${btn.text}`}>{btn.label}</p>
                <p className="text-xs text-[#94A3B8] mt-0.5">{btn.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => { setCurrentIndex(i => Math.max(0, i - 1)); setRevealed(false); }}
          disabled={currentIndex === 0}
          className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#F8FAFC] disabled:opacity-30 transition-colors"
        >
          <ChevronLeft size={14} /> Previous
        </button>
        <button
          onClick={() => { if (currentIndex < dueCards.length - 1) { setCurrentIndex(i => i + 1); setRevealed(false); } }}
          disabled={currentIndex >= dueCards.length - 1}
          className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#F8FAFC] disabled:opacity-30 transition-colors"
        >
          Skip <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
