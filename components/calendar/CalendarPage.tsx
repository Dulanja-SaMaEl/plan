'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import type { CalendarEvent, EventType, HospitalVisit } from '@/types';
import { getEventTypeColor } from '@/lib/calculations';
import { weeklyScheduleTemplate } from '@/lib/data/seed';
import { generateId } from '@/lib/utils';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  addDays,
  isSameMonth,
  isToday as dfIsToday,
  eachDayOfInterval,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, X, Building2, Car, Trash2 } from 'lucide-react';

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  'main-job': 'Main Job (Biotech)',
  freelance: 'Freelance',
  hospital: 'Hospital Visit',
  content: 'AI Content',
  leetcode: 'LeetCode',
  knowledge: 'Knowledge Review',
  udemy: 'Udemy Course',
  buffer: 'Reserved Buffer',
  personal: 'Personal',
};

export function CalendarPage() {
  const store = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('week');

  // Modals
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showHospitalModal, setShowHospitalModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<HospitalVisit | null>(null);

  // Normal event form state
  const [evtTitle, setEvtTitle] = useState('');
  const [evtType, setEvtType] = useState<EventType>('main-job');
  const [evtDate, setEvtDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [evtStart, setEvtStart] = useState('09:00');
  const [evtEnd, setEvtEnd] = useState('10:00');

  // Hospital visit form state
  const [hospitalName, setHospitalName] = useState('');
  const [visitDate, setVisitDate] = useState(format(addDays(new Date(), 2), 'yyyy-MM-dd'));
  const [visitStart, setVisitStart] = useState('09:00');
  const [visitEnd, setVisitEnd] = useState('12:00');
  const [travelMinutes, setTravelMinutes] = useState('45');
  const [purpose, setPurpose] = useState('Pharmacy System On-site Deployment & DB Migration');
  const [systemVersion, setSystemVersion] = useState('Pharmacy Management System v2.4.2');
  const [deploymentTasksText, setDeploymentTasksText] = useState(
    'Backup existing database\nRun migration scripts\nVerify prescription printing\nStaff training'
  );
  const [visitNotes, setVisitNotes] = useState('');

  // Dates computation
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const monthDays = eachDayOfInterval({ start: calStart, end: addDays(monthEnd, 7) }).slice(0, 35);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  function getEventsForDay(date: Date) {
    const dow = date.getDay();
    const templateBlocks = weeklyScheduleTemplate
      .filter((b) => b.day === dow)
      .map((b) => ({
        id: `tmpl-${dow}-${b.start}`,
        title: b.title,
        type: b.type,
        start: b.start,
        end: b.end,
        isTemplate: true,
      }));

    const storedEvents = store.events.filter((e) => {
      const evDate = new Date(e.startTime);
      return (
        evDate.getDate() === date.getDate() &&
        evDate.getMonth() === date.getMonth() &&
        evDate.getFullYear() === date.getFullYear()
      );
    });

    const dayVisits = store.hospitalVisits.filter((v) => {
      const vDate = new Date(v.date);
      return (
        vDate.getDate() === date.getDate() &&
        vDate.getMonth() === date.getMonth() &&
        vDate.getFullYear() === date.getFullYear()
      );
    });

    return { template: templateBlocks, stored: storedEvents, visits: dayVisits };
  }

  function handleCreateEvent() {
    if (!evtTitle.trim()) return;
    const startTime = new Date(`${evtDate}T${evtStart}`);
    const endTime = new Date(`${evtDate}T${evtEnd}`);
    const event: CalendarEvent = {
      id: generateId(),
      title: evtTitle.trim(),
      type: evtType,
      startTime,
      endTime,
      isRecurring: false,
      createdAt: new Date(),
    };
    store.addEvent(event);
    setEvtTitle('');
    setShowAddEvent(false);
  }

  function handleCreateHospitalVisit() {
    if (!hospitalName.trim()) return;
    const tasks = deploymentTasksText
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    const visit: HospitalVisit = {
      id: generateId(),
      hospital: hospitalName.trim(),
      date: new Date(visitDate),
      startTime: visitStart,
      endTime: visitEnd,
      travelTimeMinutes: parseInt(travelMinutes) || 0,
      purpose: purpose.trim(),
      systemBeingUpdated: systemVersion.trim(),
      deploymentTasks: tasks,
      notes: visitNotes.trim(),
      status: 'scheduled',
      projectId: 'proj-pharmacy',
      createdAt: new Date(),
    };
    store.addHospitalVisit(visit);
    setHospitalName('');
    setShowHospitalModal(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold text-[#F8FAFC]">Calendar & Deployments</h1>
            <p className="text-xs text-[#94A3B8]">
              Hospital field updates, recurring work tracks, and time blocks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View switcher */}
          <div className="flex items-center gap-1 bg-[#091B21] border border-[#1e3a5f] rounded-md p-0.5">
            {(['month', 'week', 'day'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`text-xs px-2.5 py-1 rounded transition-colors capitalize ${
                  view === v ? 'bg-[#003F59] text-[#00FF9C] font-semibold' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Date navigation */}
          <div className="flex items-center gap-1 bg-[#091B21] border border-[#1e3a5f] rounded-md px-2 py-1">
            <button
              onClick={() => setCurrentDate((d) => addDays(d, view === 'month' ? -30 : view === 'week' ? -7 : -1))}
              className="text-[#94A3B8] hover:text-[#F8FAFC] p-0.5"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-semibold text-[#F8FAFC] min-w-[100px] text-center">
              {format(currentDate, view === 'day' ? 'EEE, MMM d' : 'MMMM yyyy')}
            </span>
            <button
              onClick={() => setCurrentDate((d) => addDays(d, view === 'month' ? 30 : view === 'week' ? 7 : 1))}
              className="text-[#94A3B8] hover:text-[#F8FAFC] p-0.5"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <button
            onClick={() => setCurrentDate(new Date())}
            className="text-xs px-2.5 py-1.5 border border-[#1e3a5f] rounded text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
          >
            Today
          </button>

          <button
            onClick={() => setShowHospitalModal(true)}
            className="flex items-center gap-1.5 bg-red-500/20 text-red-300 border border-red-500/40 rounded-md px-3 py-1.5 text-xs font-semibold hover:bg-red-500/30 transition-colors"
          >
            <Building2 size={13} /> + Hospital Visit
          </button>

          <button
            onClick={() => setShowAddEvent(true)}
            className="flex items-center gap-1.5 bg-[#00FF9C] text-[#091B21] rounded-md px-3 py-1.5 text-xs font-semibold hover:bg-[#00e68a] transition-colors"
          >
            <Plus size={13} /> Add Event
          </button>
        </div>
      </div>

      {/* Hospital Visits Urgent Strip */}
      {store.hospitalVisits.filter((v) => v.status === 'scheduled').length > 0 && (
        <section className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
              <Building2 size={14} /> Scheduled Hospital Deployments & Field Visits
            </h2>
            <span className="text-[11px] text-red-300">Travel time automatically factored into workload</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {store.hospitalVisits
              .filter((v) => v.status === 'scheduled')
              .map((visit) => {
                const totalHours = (visit.travelTimeMinutes * 2) / 60 + 3; // roundtrip travel + 3h on-site
                return (
                  <div
                    key={visit.id}
                    onClick={() => setSelectedVisit(visit)}
                    className="rounded-md border border-red-500/30 bg-[#091B21] p-3 cursor-pointer hover:border-red-400 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold text-[#F8FAFC]">{visit.hospital}</p>
                        <p className="text-xs text-[#94A3B8] mt-0.5">
                          {format(new Date(visit.date), 'EEEE, MMMM d')} • {visit.startTime} – {visit.endTime}
                        </p>
                      </div>
                      <span className="text-xs font-mono bg-red-500/20 text-red-300 px-2 py-0.5 rounded">
                        {visit.status}
                      </span>
                    </div>
                    <p className="text-xs text-red-300 mt-2">{visit.purpose}</p>
                    <div className="flex items-center gap-4 mt-2.5 pt-2 border-t border-[#1e3a5f] text-xs text-[#94A3B8]">
                      <span className="flex items-center gap-1 text-orange-300">
                        <Car size={12} /> Travel: {visit.travelTimeMinutes}m each way
                      </span>
                      <span className="text-[#F8FAFC]">
                        Total Workload: ~{totalHours.toFixed(1)}h
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* Week View */}
      {view === 'week' && (
        <div className="rounded-lg border border-[#1e3a5f] bg-[#091B21] overflow-hidden shadow-lg">
          <div className="grid grid-cols-7 border-b border-[#1e3a5f]">
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className={`px-2 py-3 text-center border-r border-[#1e3a5f] last:border-r-0 ${
                  dfIsToday(day) ? 'bg-[#00FF9C]/10' : ''
                }`}
              >
                <p className={`text-xs font-semibold ${dfIsToday(day) ? 'text-[#00FF9C]' : 'text-[#94A3B8]'}`}>
                  {format(day, 'EEE')}
                </p>
                <p className={`text-base font-bold font-mono ${dfIsToday(day) ? 'text-[#00FF9C]' : 'text-[#F8FAFC]'}`}>
                  {format(day, 'd')}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 min-h-[460px]">
            {weekDays.map((day) => {
              const { template, stored, visits } = getEventsForDay(day);
              const isToday = dfIsToday(day);

              return (
                <div
                  key={day.toISOString()}
                  className={`border-r border-[#1e3a5f] last:border-r-0 p-1.5 space-y-1.5 ${
                    isToday ? 'bg-[#00FF9C]/5' : ''
                  }`}
                >
                  {/* Hospital field visits */}
                  {visits.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVisit(v)}
                      className="rounded p-2 text-xs border border-red-500/50 bg-red-500/20 text-red-200 cursor-pointer hover:bg-red-500/30"
                    >
                      <div className="font-bold flex items-center gap-1">
                        <Building2 size={11} /> {v.hospital}
                      </div>
                      <p className="text-[10px] text-red-300">
                        {v.startTime}-{v.endTime} (+{v.travelTimeMinutes}m travel)
                      </p>
                    </div>
                  ))}

                  {/* Blueprint template blocks */}
                  {template.map((block) => {
                    const color = getEventTypeColor(block.type);
                    return (
                      <div
                        key={block.id}
                        className="rounded px-2 py-1.5 text-xs truncate"
                        style={{
                          backgroundColor: `${color}15`,
                          borderLeft: `2px solid ${color}`,
                          color: '#F8FAFC',
                        }}
                      >
                        <p className="font-medium truncate">{block.title}</p>
                        <p className="text-[10px] text-[#94A3B8]">
                          {block.start} - {block.end}
                        </p>
                      </div>
                    );
                  })}

                  {/* Ad-hoc calendar events */}
                  {stored.map((event) => {
                    const color = getEventTypeColor(event.type);
                    return (
                      <div
                        key={event.id}
                        className="rounded px-2 py-1.5 text-xs truncate"
                        style={{
                          backgroundColor: `${color}25`,
                          border: `1px solid ${color}60`,
                          color: '#F8FAFC',
                        }}
                      >
                        <p className="font-semibold truncate">{event.title}</p>
                        <p className="text-[10px] text-[#94A3B8]">
                          {format(new Date(event.startTime), 'HH:mm')} - {format(new Date(event.endTime), 'HH:mm')}
                        </p>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Month View */}
      {view === 'month' && (
        <div className="rounded-lg border border-[#1e3a5f] bg-[#091B21] overflow-hidden">
          <div className="grid grid-cols-7 border-b border-[#1e3a5f]">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <div key={d} className="px-2 py-2 text-center border-r border-[#1e3a5f] last:border-r-0">
                <p className="text-xs text-[#94A3B8] font-semibold">{d}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthDays.map((day) => {
              const { template, stored, visits } = getEventsForDay(day);
              const isOtherMonth = !isSameMonth(day, currentDate);
              const isToday = dfIsToday(day);

              return (
                <div
                  key={day.toISOString()}
                  className={`border-r border-b border-[#1e3a5f] p-1.5 min-h-[90px] ${
                    isOtherMonth ? 'opacity-25' : ''
                  } ${isToday ? 'bg-[#00FF9C]/10' : ''}`}
                >
                  <p
                    className={`text-xs font-semibold mb-1 ${
                      isToday ? 'text-[#00FF9C]' : 'text-[#94A3B8]'
                    }`}
                  >
                    {format(day, 'd')}
                  </p>
                  {visits.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVisit(v)}
                      className="mb-1 rounded px-1 py-0.5 text-[10px] bg-red-500/20 text-red-300 truncate cursor-pointer"
                    >
                      🏥 {v.hospital.split(' ')[0]}
                    </div>
                  ))}
                  {stored.slice(0, 1).map((event) => (
                    <div
                      key={event.id}
                      className="mb-0.5 rounded px-1 py-0.5 text-[10px] truncate"
                      style={{
                        backgroundColor: `${getEventTypeColor(event.type)}25`,
                        color: getEventTypeColor(event.type),
                      }}
                    >
                      {event.title.split(' ')[0]}
                    </div>
                  ))}
                  {template.slice(0, 2).map((block) => (
                    <div
                      key={block.id}
                      className="mb-0.5 rounded px-1 py-0.5 text-[10px] truncate"
                      style={{
                        backgroundColor: `${getEventTypeColor(block.type)}15`,
                        color: getEventTypeColor(block.type),
                      }}
                    >
                      {block.title.split(' ')[0]}
                    </div>
                  ))}
                  {(template.length > 2 || stored.length > 1) && (
                    <p className="text-[10px] text-[#94A3B8]">+{template.length + stored.length - 2} more</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day View */}
      {view === 'day' && (
        <div className="rounded-lg border border-[#1e3a5f] bg-[#091B21] p-6 max-w-2xl mx-auto space-y-4">
          <div className="border-b border-[#1e3a5f] pb-3">
            <h2 className="text-base font-bold text-[#F8FAFC]">{format(currentDate, 'EEEE, MMMM d, yyyy')}</h2>
            <p className="text-xs text-[#94A3B8]">Detailed timeline breakdown for this date</p>
          </div>
          {(() => {
            const { template, stored, visits } = getEventsForDay(currentDate);
            return (
              <div className="space-y-3">
                {visits.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVisit(v)}
                    className="p-4 rounded-lg border border-red-500/40 bg-red-500/10 cursor-pointer space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-red-300">🏥 {v.hospital}</p>
                        <p className="text-xs text-[#94A3B8]">{v.startTime} - {v.endTime}</p>
                      </div>
                      <span className="text-xs bg-red-500/30 text-red-200 px-2 py-0.5 rounded">{v.status}</span>
                    </div>
                    <p className="text-xs text-[#F8FAFC]">{v.purpose}</p>
                    <p className="text-xs text-orange-300">🚗 Travel: {v.travelTimeMinutes}m each way</p>
                  </div>
                ))}
                {template.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-lg border border-[#1e3a5f] bg-[#0d1f35] flex justify-between items-center"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#F8FAFC]">{b.title}</p>
                      <p className="text-xs text-[#94A3B8] capitalize">{b.type.replace('-', ' ')}</p>
                    </div>
                    <span className="text-xs font-mono text-[#00FF9C]">{b.start} - {b.end}</span>
                  </div>
                ))}
                {stored.map((e) => (
                  <div
                    key={e.id}
                    className="p-3 rounded-lg border border-[#1e3a5f] bg-[#0d1f35] flex justify-between items-center"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#F8FAFC]">{e.title}</p>
                      <p className="text-xs text-[#94A3B8] capitalize">{e.type.replace('-', ' ')}</p>
                    </div>
                    <span className="text-xs font-mono text-[#00FF9C]">
                      {format(new Date(e.startTime), 'HH:mm')} - {format(new Date(e.endTime), 'HH:mm')}
                    </span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 pt-2">
        {(Object.entries(EVENT_TYPE_LABELS) as [EventType, string][]).map(([type, label]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: getEventTypeColor(type) }} />
            <span className="text-xs text-[#94A3B8]">{label}</span>
          </div>
        ))}
      </div>

      {/* Hospital Visit Modal (Create) */}
      {showHospitalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl border border-red-500/40 bg-[#091B21] shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-[#1e3a5f] bg-[#091B21] px-5 py-4">
              <h2 className="text-sm font-bold text-red-400 flex items-center gap-2">
                <Building2 size={16} /> Schedule Hospital Visit & Field Deployment
              </h2>
              <button onClick={() => setShowHospitalModal(false)} className="text-[#94A3B8] hover:text-[#F8FAFC] p-1">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-[#94A3B8] mb-1">Hospital / Medical Center</label>
                <input
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  placeholder="e.g. Asiri Central Hospital"
                  className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-red-400"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1">Date</label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-2 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-red-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1">On-Site Start</label>
                  <input
                    type="time"
                    value={visitStart}
                    onChange={(e) => setVisitStart(e.target.value)}
                    className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-2 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-red-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1">On-Site End</label>
                  <input
                    type="time"
                    value={visitEnd}
                    onChange={(e) => setVisitEnd(e.target.value)}
                    className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-2 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-red-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-orange-300 mb-1 flex items-center gap-1">
                  <Car size={13} /> Travel Time (Minutes each way) — Counted towards workload
                </label>
                <input
                  type="number"
                  value={travelMinutes}
                  onChange={(e) => setTravelMinutes(e.target.value)}
                  placeholder="45"
                  className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-red-400"
                />
              </div>
              <div>
                <label className="block text-xs text-[#94A3B8] mb-1">Deployment Purpose</label>
                <input
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-red-400"
                />
              </div>
              <div>
                <label className="block text-xs text-[#94A3B8] mb-1">Software System Version</label>
                <input
                  value={systemVersion}
                  onChange={(e) => setSystemVersion(e.target.value)}
                  className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-red-400"
                />
              </div>
              <div>
                <label className="block text-xs text-[#94A3B8] mb-1">Deployment Tasks (one per line)</label>
                <textarea
                  value={deploymentTasksText}
                  onChange={(e) => setDeploymentTasksText(e.target.value)}
                  rows={3}
                  className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-red-400 resize-none font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-[#94A3B8] mb-1">Additional Notes</label>
                <textarea
                  value={visitNotes}
                  onChange={(e) => setVisitNotes(e.target.value)}
                  placeholder="e.g. Bring deployment USB, check Dr. Perera's office"
                  rows={2}
                  className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-red-400 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-[#1e3a5f] px-5 py-3">
              <button
                onClick={() => setShowHospitalModal(false)}
                className="text-xs px-3 py-1.5 border border-[#1e3a5f] rounded text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateHospitalVisit}
                className="text-xs px-3 py-1.5 bg-red-500 text-white rounded font-semibold hover:bg-red-600 transition-colors"
              >
                Schedule Visit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hospital Visit Details Modal */}
      {selectedVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl border border-red-500/40 bg-[#091B21] shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-[#1e3a5f] bg-[#091B21] px-5 py-4">
              <div>
                <h2 className="text-base font-bold text-red-400 flex items-center gap-2">
                  <Building2 size={16} /> {selectedVisit.hospital}
                </h2>
                <p className="text-xs text-[#94A3B8]">
                  {format(new Date(selectedVisit.date), 'MMMM d, yyyy')} • {selectedVisit.startTime} – {selectedVisit.endTime}
                </p>
              </div>
              <button onClick={() => setSelectedVisit(null)} className="text-[#94A3B8] hover:text-[#F8FAFC] p-1">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-[#0F172A] p-3 rounded border border-[#1e3a5f] space-y-1 text-xs">
                <p className="text-[#94A3B8]">
                  System Version: <span className="text-[#00FF9C] font-semibold">{selectedVisit.systemBeingUpdated}</span>
                </p>
                <p className="text-[#94A3B8]">
                  Purpose: <span className="text-[#F8FAFC]">{selectedVisit.purpose}</span>
                </p>
                <p className="text-orange-300">
                  🚗 Travel Time: {selectedVisit.travelTimeMinutes} minutes each way
                </p>
              </div>

              <div>
                <p className="text-xs text-[#94A3B8] uppercase tracking-wider mb-2 font-semibold">
                  Deployment Tasks Checklist
                </p>
                <div className="space-y-1.5">
                  {selectedVisit.deploymentTasks.map((task, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-[#F8FAFC] bg-[#0d1f35] p-2 rounded">
                      <span className="text-[#00FF9C]">✓</span> {task}
                    </div>
                  ))}
                </div>
              </div>

              {selectedVisit.notes && (
                <div>
                  <p className="text-xs text-[#94A3B8] uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-xs text-[#F8FAFC] bg-[#0F172A] p-2.5 rounded border border-[#1e3a5f]">
                    {selectedVisit.notes}
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-between border-t border-[#1e3a5f] px-5 py-3">
              <button
                onClick={() => {
                  store.deleteHospitalVisit(selectedVisit.id);
                  setSelectedVisit(null);
                }}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
              >
                <Trash2 size={12} /> Remove Visit
              </button>
              <button
                onClick={() => setSelectedVisit(null)}
                className="text-xs px-3 py-1.5 bg-[#003F59] text-[#F8FAFC] rounded hover:bg-[#004a6e]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Normal Event Modal */}
      {showAddEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-[#1e3a5f] bg-[#091B21] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1e3a5f] px-5 py-4">
              <h2 className="text-sm font-semibold text-[#F8FAFC]">Add Calendar Event</h2>
              <button onClick={() => setShowAddEvent(false)} className="text-[#94A3B8] hover:text-[#F8FAFC] p-1">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-[#94A3B8] mb-1">Event Title</label>
                <input
                  value={evtTitle}
                  onChange={(e) => setEvtTitle(e.target.value)}
                  placeholder="e.g. Code Review / Client Meeting"
                  className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#94A3B8] mb-1">Event Track</label>
                <select
                  value={evtType}
                  onChange={(e) => setEvtType(e.target.value as EventType)}
                  className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-2 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]"
                >
                  {(Object.entries(EVENT_TYPE_LABELS) as [EventType, string][]).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1">Date</label>
                  <input
                    type="date"
                    value={evtDate}
                    onChange={(e) => setEvtDate(e.target.value)}
                    className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-2 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1">Start Time</label>
                  <input
                    type="time"
                    value={evtStart}
                    onChange={(e) => setEvtStart(e.target.value)}
                    className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-2 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1">End Time</label>
                  <input
                    type="time"
                    value={evtEnd}
                    onChange={(e) => setEvtEnd(e.target.value)}
                    className="w-full bg-[#0F172A] border border-[#1e3a5f] rounded px-2 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#00FF9C]"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-[#1e3a5f] px-5 py-3">
              <button
                onClick={() => setShowAddEvent(false)}
                className="text-xs px-3 py-1.5 border border-[#1e3a5f] rounded text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEvent}
                className="text-xs px-3 py-1.5 bg-[#00FF9C] text-[#091B21] rounded font-semibold hover:bg-[#00e68a] transition-colors"
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
