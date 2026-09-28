'use client';
import { useStore } from '@/lib/store';
import { getDueForReview, getWeakConcepts, getConfidenceColor } from '@/lib/calculations';
import { Brain, BookOpen, Target, TrendingUp, Layers } from 'lucide-react';
import Link from 'next/link';

const CATEGORY_LABELS: Record<string, string> = {
  'computer-science': 'Computer Science',
  'backend': 'Backend Engineering',
  'java': 'Java & JVM',
  'databases': 'Databases',
  'networking': 'Networking',
  'distributed-systems': 'Distributed Systems',
  'architecture': 'Architecture',
  'security': 'Security',
  'cloud-devops': 'Cloud & DevOps',
  'observability': 'Observability',
  'ml-ai': 'ML / AI Engineering',
  'system-design': 'System Design',
};

const CATEGORY_COLORS: Record<string, string> = {
  'computer-science': '#6366F1',
  'backend': '#3B82F6',
  'java': '#F59E0B',
  'databases': '#10B981',
  'networking': '#06B6D4',
  'distributed-systems': '#8B5CF6',
  'architecture': '#EF4444',
  'security': '#F97316',
  'cloud-devops': '#14B8A6',
  'observability': '#84CC16',
  'ml-ai': '#00FF9C',
  'system-design': '#EC4899',
};

export function KnowledgeDashboard() {
  const store = useStore();
  const concepts = store.concepts;
  const dueReviews = getDueForReview(concepts);
  const weakConcepts = getWeakConcepts(concepts);

  const strong = concepts.filter(c => c.confidence >= 80).length;
  const learning = concepts.filter(c => c.confidence >= 60 && c.confidence < 80).length;
  const weak = concepts.filter(c => c.confidence < 60).length;
  const overdue = concepts.filter(c => new Date(c.nextReviewDate) < new Date()).length;

  // Category distribution
  const catDist = Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
    key, label,
    count: concepts.filter(c => c.category === key).length,
    avgConfidence: concepts.filter(c => c.category === key).length > 0
      ? Math.round(concepts.filter(c => c.category === key).reduce((sum, c) => sum + c.confidence, 0) / concepts.filter(c => c.category === key).length)
      : 0,
    color: CATEGORY_COLORS[key],
  })).filter(c => c.count > 0).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#F8FAFC]">Knowledge System</h1>
          <p className="text-xs text-[#94A3B8]">Build deep engineering understanding through active recall</p>
        </div>
        <Link href="/knowledge/reviews" className="flex items-center gap-1.5 bg-[#00FF9C] text-[#091B21] rounded-md px-3 py-1.5 text-xs font-semibold hover:bg-[#00e68a] transition-colors">
          <BookOpen size={13} /> Review Now ({dueReviews.length})
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard label="Total Concepts" value={concepts.length} color="#F8FAFC" />
        <StatCard label="Strong (80%+)" value={strong} color="#00FF9C" />
        <StatCard label="Learning" value={learning} color="#3B82F6" />
        <StatCard label="Weak (<60%)" value={weak} color="#F59E0B" />
        <StatCard label="Overdue" value={overdue} color={overdue > 0 ? '#EF4444' : '#94A3B8'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Category distribution */}
        <div className="lg:col-span-2 space-y-4">
          <section className="rounded-lg border border-[#1e3a5f] bg-[#091B21] p-4">
            <h2 className="text-sm font-semibold text-[#F8FAFC] mb-4">Knowledge Distribution</h2>
            <div className="space-y-3">
              {catDist.map(cat => (
                <div key={cat.key}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-xs text-[#F8FAFC]">{cat.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#94A3B8]">{cat.count} concepts</span>
                      <span className="text-xs font-mono" style={{ color: getConfidenceColor(cat.avgConfidence) }}>{cat.avgConfidence}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-[#1e3a5f] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${cat.avgConfidence}%`, backgroundColor: cat.color }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Quick navigation */}
          <div className="grid grid-cols-2 gap-3">
            <NavCard href="/knowledge/topics" icon={<Layers size={16} />} label="Browse Topics" sub="Explore all categories" />
            <NavCard href="/knowledge/reviews" icon={<BookOpen size={16} />} label="Flashcard Review" sub={`${dueReviews.length} due now`} />
            <NavCard href="/knowledge/interview" icon={<Target size={16} />} label="Interview Mode" sub={`${store.interviewQuestions.length} questions`} />
            <NavCard href="/knowledge/architecture" icon={<Brain size={16} />} label="Architecture Patterns" sub={`${store.architecturePatterns.length} patterns`} />
          </div>
        </div>

        {/* Right - Due reviews + weak */}
        <div className="space-y-4">
          {dueReviews.length > 0 && (
            <section className="rounded-lg border border-[#1e3a5f] bg-[#091B21] p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-[#F8FAFC]">Due for Review</h2>
                <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-0.5 rounded">{dueReviews.length}</span>
              </div>
              <div className="space-y-2">
                {dueReviews.slice(0, 6).map(c => (
                  <Link key={c.id} href="/knowledge/reviews" className="flex items-center justify-between hover:bg-[#1e3a5f] rounded px-2 py-1.5 transition-colors group">
                    <span className="text-xs text-[#F8FAFC] truncate">{c.name}</span>
                    <span className="text-xs ml-2 flex-shrink-0" style={{ color: getConfidenceColor(c.confidence) }}>{c.confidence}%</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-lg border border-[#1e3a5f] bg-[#091B21] p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-orange-400" />
              <h2 className="text-sm font-semibold text-[#F8FAFC]">Weak Concepts</h2>
            </div>
            <div className="space-y-2">
              {weakConcepts.slice(0, 6).map(c => (
                <div key={c.id} className="flex items-center justify-between">
                  <span className="text-xs text-[#F8FAFC] truncate flex-1">{c.name}</span>
                  <div className="flex items-center gap-2 ml-2">
                    <div className="w-12 h-1 bg-[#1e3a5f] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${c.confidence}%`, backgroundColor: getConfidenceColor(c.confidence) }} />
                    </div>
                    <span className="text-xs w-7 text-right" style={{ color: getConfidenceColor(c.confidence) }}>{c.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Engineering Independence */}
          <section className="rounded-lg border border-[#00FF9C]/20 bg-[#091B21] p-4">
            <h2 className="text-sm font-semibold text-[#F8FAFC] mb-1">Engineering Independence</h2>
            <p className="text-xs text-[#94A3B8] mb-3">Concepts you can recall without AI</p>
            <div className="space-y-1.5">
              <IndependenceRow label="Concepts Learned" value={concepts.length} />
              <IndependenceRow label="Strong Recall" value={strong} />
              <IndependenceRow label="Interview Questions" value={store.interviewQuestions.filter(q => q.attemptCount > 0).length} />
              <IndependenceRow label="Arch Patterns" value={store.architecturePatterns.length} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border border-[#1e3a5f] bg-[#091B21] px-4 py-3">
      <p className="text-xs text-[#94A3B8] mb-1">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

function NavCard({ href, icon, label, sub }: { href: string; icon: React.ReactNode; label: string; sub: string }) {
  return (
    <Link href={href} className="rounded-lg border border-[#1e3a5f] bg-[#091B21] p-3 hover:border-[#00FF9C]/40 hover:bg-[#0d1f35] transition-colors group">
      <div className="flex items-center gap-2 mb-1 text-[#94A3B8] group-hover:text-[#00FF9C] transition-colors">{icon}<span className="text-xs font-semibold text-[#F8FAFC]">{label}</span></div>
      <p className="text-xs text-[#94A3B8]">{sub}</p>
    </Link>
  );
}

function IndependenceRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <span className="text-xs text-[#94A3B8]">{label}</span>
      <span className="text-xs font-bold text-[#00FF9C]">{value}</span>
    </div>
  );
}
