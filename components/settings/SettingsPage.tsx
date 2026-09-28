'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { CheckCircle2, Shield, Settings, Sliders } from 'lucide-react';

export function SettingsPage() {
  const store = useStore();
  const [saved, setSaved] = useState(false);

  // Capacity hours
  const [mainJob, setMainJob] = useState(store.capacityConfig.mainJobHours.toString());
  const [freelance, setFreelance] = useState(store.capacityConfig.freelanceHours.toString());
  const [content, setContent] = useState(store.capacityConfig.contentHours.toString());
  const [leetcode, setLeetcode] = useState(store.capacityConfig.leetcodeHours.toString());
  const [knowledge, setKnowledge] = useState(store.capacityConfig.knowledgeHours.toString());
  const [learning, setLearning] = useState(store.capacityConfig.learningHours.toString());
  const [buffer, setBuffer] = useState(store.capacityConfig.bufferHours.toString());

  // User details
  const [name, setName] = useState(store.user.name);
  const [timezone, setTimezone] = useState(store.user.timezone || 'Asia/Colombo');

  const total = [mainJob, freelance, content, leetcode, knowledge, learning, buffer].reduce(
    (s, v) => s + (parseFloat(v) || 0),
    0
  );

  function handleSave() {
    store.updateCapacityConfig({
      mainJobHours: parseFloat(mainJob) || 40,
      freelanceHours: parseFloat(freelance) || 12,
      contentHours: parseFloat(content) || 4,
      leetcodeHours: parseFloat(leetcode) || 3,
      knowledgeHours: parseFloat(knowledge) || 3,
      learningHours: parseFloat(learning) || 3,
      bufferHours: parseFloat(buffer) || 4,
    });
    store.updateUser({ name, timezone });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-10">
      <div>
        <h1 className="text-xl font-bold text-[#F8FAFC]">System & Capacity Configuration</h1>
        <p className="text-xs text-[#94A3B8]">
          Personalize work commitments, timezone, and protect emergency buffer hours
        </p>
      </div>

      {/* Profile */}
      <section className="rounded-lg border border-[#1e3a5f] bg-[#091B21] p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-[#F8FAFC] mb-4 flex items-center gap-2">
          <Settings size={16} className="text-[#00FF9C]" /> Engineer Profile
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Engineer Name" value={name} onChange={setName} />
          <div>
            <label className="block text-xs text-[#94A3B8] mb-1">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]"
            >
              <option value="Asia/Colombo">Asia/Colombo (UTC+05:30 - Sri Lanka / India)</option>
              <option value="America/New_York">America/New_York (EST / EDT)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (PST / PDT)</option>
              <option value="Europe/London">Europe/London (GMT / BST)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>
      </section>

      {/* Weekly Capacity Hours Engine */}
      <section className="rounded-lg border border-[#1e3a5f] bg-[#091B21] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#F8FAFC] flex items-center gap-2">
            <Sliders size={16} className="text-[#00FF9C]" /> Weekly Capacity Allocation (Hours)
          </h2>
          <span
            className={`text-xs font-mono font-semibold px-2.5 py-1 rounded ${
              total > 75
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : total > 60
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'bg-green-500/20 text-[#00FF9C] border border-[#00FF9C]/30'
            }`}
          >
            Planned Total: {total.toFixed(0)}h / 168h
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Main Job (Biotech Pharmacy System)" value={mainJob} onChange={setMainJob} type="number" />
          <Field label="Freelance Client Hours" value={freelance} onChange={setFreelance} type="number" />
          <Field label="AI Content Studio (YouTube / Short-form)" value={content} onChange={setContent} type="number" />
          <Field label="LeetCode & Algorithm Practice" value={leetcode} onChange={setLeetcode} type="number" />
          <Field label="Knowledge Spaced Repetition" value={knowledge} onChange={setKnowledge} type="number" />
          <Field label="Udemy / Deep Learning Courses" value={learning} onChange={setLearning} type="number" />
          <Field label="Reserved Buffer (Hospitals / Deployments / Bugs)" value={buffer} onChange={setBuffer} type="number" />
        </div>

        {/* Capacity summary explanation */}
        <div className="mt-5 rounded-md bg-[#0F172A] border border-[#1e3a5f] p-4 text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-[#94A3B8]">Total Weekly Hours in 7 Days:</span>
            <span className="font-mono text-[#F8FAFC]">168h</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#94A3B8]">Total Professional & Learning Planned:</span>
            <span className="font-mono text-[#F8FAFC] font-semibold">{total.toFixed(0)}h</span>
          </div>
          <div className="flex justify-between border-t border-[#1e3a5f] pt-2">
            <span className="text-[#94A3B8]">Remaining for Rest, Sleep & Family:</span>
            <span className="font-mono text-[#00FF9C] font-semibold">{(168 - total).toFixed(0)}h</span>
          </div>
          {total > 70 && (
            <p className="text-orange-400 text-xs pt-1">
              ⚠️ Warning: Exceeding 70 planned hours significantly elevates burnout risk. Ensure your 4h emergency buffer is strictly defended.
            </p>
          )}
        </div>
      </section>

      {/* Save Action */}
      <div className="flex justify-end items-center gap-3">
        {saved && (
          <div className="flex items-center gap-2 text-[#00FF9C] text-sm">
            <CheckCircle2 size={16} /> Preferences successfully updated!
          </div>
        )}
        <button
          onClick={handleSave}
          className="bg-[#00FF9C] text-[#091B21] px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#00e68a] transition-colors"
        >
          Save Configuration
        </button>
      </div>

      {/* Privacy & Storage */}
      <section className="rounded-lg border border-[#1e3a5f] bg-[#091B21] p-5">
        <h2 className="text-sm font-semibold text-[#F8FAFC] mb-2 flex items-center gap-2">
          <Shield size={16} className="text-[#00FF9C]" /> Privacy & Local Data Sovereignty
        </h2>
        <p className="text-xs text-[#94A3B8] mb-4 leading-relaxed">
          This system operates as a private, single-user Engineering OS. No external trackers, telemetry, or public feeds
          are loaded. All records persist safely in local browser storage, and the architecture is prepared for direct
          PostgreSQL / Supabase integration.
        </p>
        <button
          onClick={() => {
            if (confirm('Are you sure you want to reset all data back to the default seed state?')) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          className="text-xs px-3 py-1.5 border border-red-500/40 rounded text-red-400 hover:bg-red-500/10 transition-colors"
        >
          Reset Application Data to Factory Seed
        </button>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-[#94A3B8] mb-1">{label}</label>
      <input
        type={type || 'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        step={type === 'number' ? '0.5' : undefined}
        min={type === 'number' ? '0' : undefined}
        className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]"
      />
    </div>
  );
}
