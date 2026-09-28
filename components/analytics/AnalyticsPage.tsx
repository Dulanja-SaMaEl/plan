'use client';

import { useStore } from '@/lib/store';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#06B6D4', '#EC4899', '#00FF9C'];
const CUSTOM_TOOLTIP_STYLE = {
  backgroundColor: '#091B21',
  border: '1px solid #1e3a5f',
  borderRadius: '6px',
  color: '#F8FAFC',
  fontSize: '12px',
};

export function AnalyticsPage() {
  const store = useStore();

  // Weekly capacity configured
  const capacityData = [
    { name: 'Main Job', hours: store.capacityConfig.mainJobHours, fill: '#3B82F6' },
    { name: 'Freelance', hours: store.capacityConfig.freelanceHours, fill: '#8B5CF6' },
    { name: 'Content', hours: store.capacityConfig.contentHours, fill: '#F59E0B' },
    { name: 'LeetCode', hours: store.capacityConfig.leetcodeHours, fill: '#10B981' },
    { name: 'Knowledge', hours: store.capacityConfig.knowledgeHours, fill: '#06B6D4' },
    { name: 'Learning', hours: store.capacityConfig.learningHours, fill: '#EC4899' },
    { name: 'Buffer', hours: store.capacityConfig.bufferHours, fill: '#00FF9C' },
  ];

  // Task distribution
  const taskStatusData = [
    { name: 'Backlog', value: store.tasks.filter((t) => t.status === 'backlog').length },
    { name: 'This Week', value: store.tasks.filter((t) => t.status === 'this-week').length },
    { name: 'In Progress', value: store.tasks.filter((t) => t.status === 'in-progress').length },
    { name: 'Done', value: store.tasks.filter((t) => t.status === 'done').length },
    { name: 'Blocked', value: store.tasks.filter((t) => t.status === 'blocked').length },
  ].filter((d) => d.value > 0);

  // Confidence distribution
  const confBuckets = [
    { name: '0-30%', value: store.concepts.filter((c) => c.confidence < 30).length, fill: '#EF4444' },
    { name: '30-60%', value: store.concepts.filter((c) => c.confidence >= 30 && c.confidence < 60).length, fill: '#F59E0B' },
    { name: '60-80%', value: store.concepts.filter((c) => c.confidence >= 60 && c.confidence < 80).length, fill: '#3B82F6' },
    { name: '80-95%', value: store.concepts.filter((c) => c.confidence >= 80 && c.confidence < 95).length, fill: '#10B981' },
    { name: '95-100%', value: store.concepts.filter((c) => c.confidence >= 95).length, fill: '#00FF9C' },
  ];

  // Content funnel
  const contentFunnel = [
    { name: 'Ideas', value: store.content.filter((c) => c.status === 'idea').length },
    { name: 'Scripts', value: store.content.filter((c) => c.status === 'script' || c.status === 'research').length },
    { name: 'Recorded', value: store.content.filter((c) => c.status === 'recorded').length },
    { name: 'Editing', value: store.content.filter((c) => c.status === 'editing').length },
    { name: 'Published', value: store.content.filter((c) => c.status === 'published').length },
  ];

  // LeetCode by difficulty
  const lcDiff = [
    {
      name: 'Easy',
      done: store.leetcodeProblems.filter((p) => p.difficulty === 'easy' && p.status === 'done').length,
      total: store.leetcodeProblems.filter((p) => p.difficulty === 'easy').length,
    },
    {
      name: 'Medium',
      done: store.leetcodeProblems.filter((p) => p.difficulty === 'medium' && p.status === 'done').length,
      total: store.leetcodeProblems.filter((p) => p.difficulty === 'medium').length,
    },
    {
      name: 'Hard',
      done: store.leetcodeProblems.filter((p) => p.difficulty === 'hard' && p.status === 'done').length,
      total: store.leetcodeProblems.filter((p) => p.difficulty === 'hard').length,
    },
  ];

  // Category knowledge overview
  const catData = [
    { name: 'Databases', concepts: store.concepts.filter((c) => c.category === 'databases').length, avgConf: avgConf(store.concepts, 'databases') },
    { name: 'Distributed', concepts: store.concepts.filter((c) => c.category === 'distributed-systems').length, avgConf: avgConf(store.concepts, 'distributed-systems') },
    { name: 'Security', concepts: store.concepts.filter((c) => c.category === 'security').length, avgConf: avgConf(store.concepts, 'security') },
    { name: 'Java', concepts: store.concepts.filter((c) => c.category === 'java').length, avgConf: avgConf(store.concepts, 'java') },
    { name: 'ML/AI', concepts: store.concepts.filter((c) => c.category === 'ml-ai').length, avgConf: avgConf(store.concepts, 'ml-ai') },
    { name: 'Networking', concepts: store.concepts.filter((c) => c.category === 'networking').length, avgConf: avgConf(store.concepts, 'networking') },
  ];

  // Rule-based deterministic insights
  const insights = generateInsights(store);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-[#F8FAFC]">Engineering Analytics & Performance</h1>
        <p className="text-xs text-[#94A3B8]">
          Deterministic metrics across engineering workload, knowledge retention, and content velocity
        </p>
      </div>

      {/* Smart insights */}
      {insights.length > 0 && (
        <section className="rounded-lg border border-[#00FF9C]/20 bg-[#091B21] p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[#F8FAFC] mb-3 flex items-center gap-2">
            <span className="text-[#00FF9C]">⚡</span> Rule-Based Engineering Insights
          </h2>
          <div className="space-y-2.5">
            {insights.map((insight, i) => (
              <div
                key={i}
                className={`rounded-md px-3.5 py-2.5 text-xs border ${
                  insight.type === 'warning'
                    ? 'border-orange-500/30 bg-orange-500/10 text-orange-200'
                    : insight.type === 'danger'
                    ? 'border-red-500/30 bg-red-500/10 text-red-200'
                    : 'border-[#00FF9C]/20 bg-[#00FF9C]/5 text-[#00FF9C]'
                }`}
              >
                {insight.message}
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Capacity allocation */}
        <ChartCard title="Weekly Capacity Allocation (Hours)">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={capacityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} />
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
              <Bar dataKey="hours" radius={[3, 3, 0, 0]}>
                {capacityData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Task status */}
        <ChartCard title="Task Pipeline Distribution">
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie
                data={taskStatusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {taskStatusData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Knowledge confidence */}
        <ChartCard title="Knowledge Confidence Distribution (Spaced Repetition)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={confBuckets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} />
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
              <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                {confBuckets.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Content pipeline */}
        <ChartCard title="Content Pipeline Volume">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={contentFunnel} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94A3B8', fontSize: 10 }} width={75} />
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
              <Bar dataKey="value" fill="#F59E0B" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* LeetCode progress */}
        <ChartCard title="LeetCode Solved vs Total">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={lcDiff} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} />
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
              <Bar dataKey="total" fill="#1e3a5f" radius={[3, 3, 0, 0]} name="Total Tracked" />
              <Bar dataKey="done" fill="#10B981" radius={[3, 3, 0, 0]} name="Solved" />
              <Legend wrapperStyle={{ color: '#94A3B8', fontSize: 11 }} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Category knowledge */}
        <ChartCard title="Senior Engineering Knowledge Domains">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={catData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 9 }} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} />
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
              <Bar dataKey="avgConf" fill="#8B5CF6" radius={[3, 3, 0, 0]} name="Avg Confidence %" />
              <Bar dataKey="concepts" fill="#3B82F6" radius={[3, 3, 0, 0]} name="Total Concepts" />
              <Legend wrapperStyle={{ color: '#94A3B8', fontSize: 11 }} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function avgConf(concepts: Array<{ category: string; confidence: number }>, category: string): number {
  const filtered = concepts.filter((c) => c.category === category);
  if (filtered.length === 0) return 0;
  return Math.round(filtered.reduce((s, c) => s + c.confidence, 0) / filtered.length);
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-[#1e3a5f] bg-[#091B21] p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-[#F8FAFC] mb-4">{title}</h2>
      {children}
    </section>
  );
}

function generateInsights(
  store: ReturnType<typeof import('@/lib/store').useStore>
): Array<{ message: string; type: 'info' | 'warning' | 'danger' }> {
  const insights: Array<{ message: string; type: 'info' | 'warning' | 'danger' }> = [];
  const totalPlanned = Object.values(store.capacityConfig).reduce((s, v) => s + v, 0);

  if (totalPlanned > 60) {
    insights.push({
      message: `Weekly planned workload is ${totalPlanned}h. High risk of burnout; consider protecting your reserved buffer.`,
      type: 'warning',
    });
  }

  const overdue = store.concepts.filter((c) => new Date(c.nextReviewDate) < new Date());
  if (overdue.length > 3) {
    insights.push({
      message: `You have ${overdue.length} engineering knowledge concepts overdue for active recall review.`,
      type: 'warning',
    });
  }

  const weakCount = store.concepts.filter((c) => c.confidence < 45).length;
  if (weakCount > 2) {
    insights.push({
      message: `${weakCount} core engineering concepts have under 45% recall confidence (e.g. Isolation Levels, TLS Handshake). Prioritize these in daily reviews.`,
      type: 'danger',
    });
  }

  const bufferBlock = store.bufferBlocks[0];
  if (bufferBlock && bufferBlock.usedMinutes >= bufferBlock.durationMinutes * 0.7) {
    insights.push({
      message: `Emergency buffer is ${Math.round(
        (bufferBlock.usedMinutes / bufferBlock.durationMinutes) * 100
      )}% consumed this week. Avoid accepting new ad-hoc requests until next week.`,
      type: 'danger',
    });
  }

  const contentIdeas = store.content.filter((c) => c.status === 'idea').length;
  const contentPublished = store.content.filter((c) => c.status === 'published').length;
  if (contentIdeas >= 3 && contentPublished === 0) {
    insights.push({
      message: `You have ${contentIdeas} ideas in Content Studio but 0 published. Finish recording existing scripts before capturing new ideas.`,
      type: 'warning',
    });
  }

  const activeFreelanceHours = store.projects
    .filter((p) => p.category === 'freelance' && p.status === 'active')
    .reduce((s, p) => s + p.weeklyRequiredHours, 0);

  if (activeFreelanceHours > store.capacityConfig.freelanceHours) {
    insights.push({
      message: `Active freelance commitment (${activeFreelanceHours}h/week) exceeds your configured capacity (${store.capacityConfig.freelanceHours}h/week) by ${
        activeFreelanceHours - store.capacityConfig.freelanceHours
      }h.`,
      type: 'danger',
    });
  }

  return insights;
}
