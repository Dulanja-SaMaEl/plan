'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import type {
  User, Client, Project, Task, CalendarEvent, TimeEntry,
  HospitalVisit, BufferBlock, ContentItem, LeetCodeProblem,
  LearningCourse, LearningSession, KnowledgeConcept, KnowledgeTopic,
  KnowledgeReview, InterviewQuestion, InterviewAttempt,
  ArchitecturePattern, WeeklyPlan, WeeklyReview, CapacityConfig
} from '@/types';
import {
  defaultUser, defaultCapacityConfig, seedClients, seedProjects,
  seedTasks, seedHospitalVisits, seedBufferBlocks, seedContent,
  seedLeetCode, seedCourses, seedKnowledgeTopics, seedConcepts,
  seedInterviewQuestions, seedArchitecturePatterns
} from '@/lib/data/seed';
import {
  fetchInitialDataFromSupabase,
  dbUpsertTask,
  dbDeleteTask,
  dbUpsertProject,
  dbDeleteProject,
  dbUpsertClient,
  dbDeleteClient,
  dbUpsertTimeEntry,
  dbDeleteTimeEntry,
  dbUpsertHospitalVisit,
  dbDeleteHospitalVisit,
  dbUpsertContent,
  dbDeleteContent,
  dbUpsertLeetCode,
  dbDeleteLeetCode,
  dbUpsertConcept,
  dbRecordReview,
  dbRecordInterviewAttempt,
  dbUpsertCalendarEvent,
  dbDeleteCalendarEvent,
  dbUpsertWeeklyReview,
  dbUpdateUserProfile,
} from '@/lib/supabaseSync';

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item, (k, v) => {
      if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) {
        return new Date(v);
      }
      return v;
    });
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Fail silently if storage full
  }
}

// =====================
// Application Store Interface
// =====================
interface AppStore {
  // Data
  user: User;
  capacityConfig: CapacityConfig;
  clients: Client[];
  projects: Project[];
  tasks: Task[];
  events: CalendarEvent[];
  timeEntries: TimeEntry[];
  hospitalVisits: HospitalVisit[];
  bufferBlocks: BufferBlock[];
  content: ContentItem[];
  leetcodeProblems: LeetCodeProblem[];
  courses: LearningCourse[];
  learningSessions: LearningSession[];
  knowledgeTopics: KnowledgeTopic[];
  concepts: KnowledgeConcept[];
  reviews: KnowledgeReview[];
  interviewQuestions: InterviewQuestion[];
  interviewAttempts: InterviewAttempt[];
  architecturePatterns: ArchitecturePattern[];
  weeklyPlans: WeeklyPlan[];
  weeklyReviews: WeeklyReview[];
  activeTimerEntry: TimeEntry | null;

  // Actions
  updateUser: (user: Partial<User>) => void;
  updateCapacityConfig: (config: Partial<CapacityConfig>) => void;

  // Client actions
  addClient: (client: Client) => void;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  // Project actions
  addProject: (project: Project) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Task actions
  addTask: (task: Task) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, status: Task['status']) => void;

  // Event actions
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (id: string, data: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;

  // Time entry actions
  addTimeEntry: (entry: TimeEntry) => void;
  updateTimeEntry: (id: string, data: Partial<TimeEntry>) => void;
  deleteTimeEntry: (id: string) => void;
  startTimer: (entry: Omit<TimeEntry, 'id' | 'createdAt'>) => void;
  stopTimer: () => void;

  // Hospital visit actions
  addHospitalVisit: (visit: HospitalVisit) => void;
  updateHospitalVisit: (id: string, data: Partial<HospitalVisit>) => void;
  deleteHospitalVisit: (id: string) => void;

  // Content actions
  addContent: (item: ContentItem) => void;
  updateContent: (id: string, data: Partial<ContentItem>) => void;
  deleteContent: (id: string) => void;

  // LeetCode actions
  addLeetCodeProblem: (problem: LeetCodeProblem) => void;
  updateLeetCodeProblem: (id: string, data: Partial<LeetCodeProblem>) => void;
  deleteLeetCodeProblem: (id: string) => void;

  // Learning actions
  addCourse: (course: LearningCourse) => void;
  updateCourse: (id: string, data: Partial<LearningCourse>) => void;
  addLearningSession: (session: LearningSession) => void;

  // Knowledge actions
  addConcept: (concept: KnowledgeConcept) => void;
  updateConcept: (id: string, data: Partial<KnowledgeConcept>) => void;
  deleteConcept: (id: string) => void;
  reviewConcept: (id: string, rating: KnowledgeReview['rating']) => void;

  // Interview actions
  addInterviewQuestion: (question: InterviewQuestion) => void;
  updateInterviewQuestion: (id: string, data: Partial<InterviewQuestion>) => void;
  recordInterviewAttempt: (attempt: InterviewAttempt) => void;

  // Architecture actions
  addArchitecturePattern: (pattern: ArchitecturePattern) => void;
  updateArchitecturePattern: (id: string, data: Partial<ArchitecturePattern>) => void;

  // Review actions
  addWeeklyReview: (review: WeeklyReview) => void;
  updateWeeklyReview: (id: string, data: Partial<WeeklyReview>) => void;
}

const STORAGE_KEYS = {
  user: 'eos:user',
  capacity: 'eos:capacity',
  clients: 'eos:clients',
  projects: 'eos:projects',
  tasks: 'eos:tasks',
  events: 'eos:events',
  timeEntries: 'eos:time-entries',
  hospitalVisits: 'eos:hospital-visits',
  bufferBlocks: 'eos:buffer-blocks',
  content: 'eos:content',
  leetcode: 'eos:leetcode',
  courses: 'eos:courses',
  learningSessions: 'eos:learning-sessions',
  knowledgeTopics: 'eos:knowledge-topics',
  concepts: 'eos:concepts',
  reviews: 'eos:reviews',
  interviewQuestions: 'eos:interview-questions',
  interviewAttempts: 'eos:interview-attempts',
  architecturePatterns: 'eos:architecture-patterns',
  weeklyPlans: 'eos:weekly-plans',
  weeklyReviews: 'eos:weekly-reviews',
  activeTimer: 'eos:active-timer',
};

const StoreContext = createContext<AppStore | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(() => loadFromStorage(STORAGE_KEYS.user, defaultUser));
  const [capacityConfig, setCapacityConfig] = useState<CapacityConfig>(() => loadFromStorage(STORAGE_KEYS.capacity, defaultCapacityConfig));
  const [clients, setClients] = useState<Client[]>(() => loadFromStorage(STORAGE_KEYS.clients, seedClients));
  const [projects, setProjects] = useState<Project[]>(() => loadFromStorage(STORAGE_KEYS.projects, seedProjects));
  const [tasks, setTasks] = useState<Task[]>(() => loadFromStorage(STORAGE_KEYS.tasks, seedTasks));
  const [events, setEvents] = useState<CalendarEvent[]>(() => loadFromStorage(STORAGE_KEYS.events, []));
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(() => loadFromStorage(STORAGE_KEYS.timeEntries, []));
  const [hospitalVisits, setHospitalVisits] = useState<HospitalVisit[]>(() => loadFromStorage(STORAGE_KEYS.hospitalVisits, seedHospitalVisits));
  const [bufferBlocks] = useState<BufferBlock[]>(() => loadFromStorage(STORAGE_KEYS.bufferBlocks, seedBufferBlocks));
  const [content, setContent] = useState<ContentItem[]>(() => loadFromStorage(STORAGE_KEYS.content, seedContent));
  const [leetcodeProblems, setLeetcodeProblems] = useState<LeetCodeProblem[]>(() => loadFromStorage(STORAGE_KEYS.leetcode, seedLeetCode));
  const [courses, setCourses] = useState<LearningCourse[]>(() => loadFromStorage(STORAGE_KEYS.courses, seedCourses));
  const [learningSessions, setLearningSessions] = useState<LearningSession[]>(() => loadFromStorage(STORAGE_KEYS.learningSessions, []));
  const [knowledgeTopics] = useState<KnowledgeTopic[]>(() => loadFromStorage(STORAGE_KEYS.knowledgeTopics, seedKnowledgeTopics));
  const [concepts, setConcepts] = useState<KnowledgeConcept[]>(() => loadFromStorage(STORAGE_KEYS.concepts, seedConcepts));
  const [reviews, setReviews] = useState<KnowledgeReview[]>(() => loadFromStorage(STORAGE_KEYS.reviews, []));
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>(() => loadFromStorage(STORAGE_KEYS.interviewQuestions, seedInterviewQuestions));
  const [interviewAttempts, setInterviewAttempts] = useState<InterviewAttempt[]>(() => loadFromStorage(STORAGE_KEYS.interviewAttempts, []));
  const [architecturePatterns, setArchitecturePatterns] = useState<ArchitecturePattern[]>(() => loadFromStorage(STORAGE_KEYS.architecturePatterns, seedArchitecturePatterns));
  const [weeklyPlans] = useState<WeeklyPlan[]>(() => loadFromStorage(STORAGE_KEYS.weeklyPlans, []));
  const [weeklyReviews, setWeeklyReviews] = useState<WeeklyReview[]>(() => loadFromStorage(STORAGE_KEYS.weeklyReviews, []));
  const [activeTimerEntry, setActiveTimerEntry] = useState<TimeEntry | null>(() => loadFromStorage(STORAGE_KEYS.activeTimer, null));

  // Hydrate from Supabase on initial load
  useEffect(() => {
    fetchInitialDataFromSupabase().then((data) => {
      if (!data) return;
      if (data.user) setUser(data.user);
      if (data.capacityConfig) setCapacityConfig(data.capacityConfig);
      if (data.clients && data.clients.length > 0) setClients(data.clients);
      if (data.projects && data.projects.length > 0) setProjects(data.projects);
      if (data.tasks && data.tasks.length > 0) setTasks(data.tasks);
      if (data.events && data.events.length > 0) setEvents(data.events);
      if (data.timeEntries && data.timeEntries.length > 0) setTimeEntries(data.timeEntries);
      if (data.hospitalVisits && data.hospitalVisits.length > 0) setHospitalVisits(data.hospitalVisits);
      if (data.content && data.content.length > 0) setContent(data.content);
      if (data.leetcodeProblems && data.leetcodeProblems.length > 0) setLeetcodeProblems(data.leetcodeProblems);
      if (data.courses && data.courses.length > 0) setCourses(data.courses);
      if (data.concepts && data.concepts.length > 0) setConcepts(data.concepts);
      if (data.interviewQuestions && data.interviewQuestions.length > 0) setInterviewQuestions(data.interviewQuestions);
      if (data.architecturePatterns && data.architecturePatterns.length > 0) setArchitecturePatterns(data.architecturePatterns);
      if (data.weeklyReviews && data.weeklyReviews.length > 0) setWeeklyReviews(data.weeklyReviews);
    }).catch((err) => {
      console.warn('Supabase initial fetch skipped, staying on local store:', err);
    });
  }, []);

  // Persist to localStorage on changes
  useEffect(() => { saveToStorage(STORAGE_KEYS.user, user); }, [user]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.capacity, capacityConfig); }, [capacityConfig]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.clients, clients); }, [clients]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.projects, projects); }, [projects]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.tasks, tasks); }, [tasks]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.events, events); }, [events]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.timeEntries, timeEntries); }, [timeEntries]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.hospitalVisits, hospitalVisits); }, [hospitalVisits]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.bufferBlocks, bufferBlocks); }, [bufferBlocks]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.content, content); }, [content]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.leetcode, leetcodeProblems); }, [leetcodeProblems]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.courses, courses); }, [courses]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.learningSessions, learningSessions); }, [learningSessions]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.concepts, concepts); }, [concepts]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.reviews, reviews); }, [reviews]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.interviewQuestions, interviewQuestions); }, [interviewQuestions]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.interviewAttempts, interviewAttempts); }, [interviewAttempts]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.architecturePatterns, architecturePatterns); }, [architecturePatterns]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.weeklyReviews, weeklyReviews); }, [weeklyReviews]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.activeTimer, activeTimerEntry); }, [activeTimerEntry]);

  function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  // Spaced repetition intervals (days)
  function getNextInterval(rating: string, currentInterval: number): number {
    switch (rating) {
      case 'again': return 1;
      case 'hard': return Math.max(1, Math.floor(currentInterval * 1.2));
      case 'good': return Math.max(1, Math.floor(currentInterval * 2));
      case 'easy': return Math.max(1, Math.floor(currentInterval * 3));
      default: return currentInterval;
    }
  }

  const store: AppStore = {
    user, capacityConfig, clients, projects, tasks, events, timeEntries,
    hospitalVisits, bufferBlocks, content, leetcodeProblems, courses,
    learningSessions, knowledgeTopics, concepts, reviews, interviewQuestions,
    interviewAttempts, architecturePatterns, weeklyPlans, weeklyReviews,
    activeTimerEntry,

    updateUser: (data) => {
      setUser((u) => {
        const updated = { ...u, ...data };
        dbUpdateUserProfile(updated, capacityConfig);
        return updated;
      });
    },

    updateCapacityConfig: (data) => {
      setCapacityConfig((c) => {
        const updated = { ...c, ...data };
        dbUpdateUserProfile(user, updated);
        return updated;
      });
    },

    addClient: (client) => {
      setClients((cs) => [...cs, client]);
      dbUpsertClient(client);
    },
    updateClient: (id, data) => {
      setClients((cs) => cs.map((c) => {
        if (c.id === id) {
          const updated = { ...c, ...data, updatedAt: new Date() };
          dbUpsertClient(updated);
          return updated;
        }
        return c;
      }));
    },
    deleteClient: (id) => {
      setClients((cs) => cs.filter((c) => c.id !== id));
      dbDeleteClient(id);
    },

    addProject: (project) => {
      setProjects((ps) => [...ps, project]);
      dbUpsertProject(project);
    },
    updateProject: (id, data) => {
      setProjects((ps) => ps.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...data, updatedAt: new Date() };
          dbUpsertProject(updated);
          return updated;
        }
        return p;
      }));
    },
    deleteProject: (id) => {
      setProjects((ps) => ps.filter((p) => p.id !== id));
      dbDeleteProject(id);
    },

    addTask: (task) => {
      setTasks((ts) => [...ts, task]);
      dbUpsertTask(task);
    },
    updateTask: (id, data) => {
      setTasks((ts) => ts.map((t) => {
        if (t.id === id) {
          const updated = { ...t, ...data, updatedAt: new Date() };
          dbUpsertTask(updated);
          return updated;
        }
        return t;
      }));
    },
    deleteTask: (id) => {
      setTasks((ts) => ts.filter((t) => t.id !== id));
      dbDeleteTask(id);
    },
    moveTask: (id, status) => {
      setTasks((ts) => ts.map((t) => {
        if (t.id === id) {
          const updated = { ...t, status, updatedAt: new Date() };
          dbUpsertTask(updated);
          return updated;
        }
        return t;
      }));
    },

    addEvent: (event) => {
      setEvents((es) => [...es, event]);
      dbUpsertCalendarEvent(event);
    },
    updateEvent: (id, data) => {
      setEvents((es) => es.map((e) => {
        if (e.id === id) {
          const updated = { ...e, ...data };
          dbUpsertCalendarEvent(updated);
          return updated;
        }
        return e;
      }));
    },
    deleteEvent: (id) => {
      setEvents((es) => es.filter((e) => e.id !== id));
      dbDeleteCalendarEvent(id);
    },

    addTimeEntry: (entry) => {
      setTimeEntries((es) => [...es, entry]);
      dbUpsertTimeEntry(entry);
    },
    updateTimeEntry: (id, data) => {
      setTimeEntries((es) => es.map((e) => {
        if (e.id === id) {
          const updated = { ...e, ...data };
          dbUpsertTimeEntry(updated);
          return updated;
        }
        return e;
      }));
    },
    deleteTimeEntry: (id) => {
      setTimeEntries((es) => es.filter((e) => e.id !== id));
      dbDeleteTimeEntry(id);
    },
    startTimer: (entryData) => {
      const entry: TimeEntry = { ...entryData, id: generateId(), startTime: new Date(), createdAt: new Date() };
      setActiveTimerEntry(entry);
    },
    stopTimer: () => {
      if (activeTimerEntry) {
        const completed: TimeEntry = {
          ...activeTimerEntry,
          endTime: new Date(),
          duration: Math.floor((Date.now() - activeTimerEntry.startTime.getTime()) / 60000),
        };
        setTimeEntries((es) => [...es, completed]);
        dbUpsertTimeEntry(completed);
        setActiveTimerEntry(null);
      }
    },

    addHospitalVisit: (visit) => {
      setHospitalVisits((vs) => [...vs, visit]);
      dbUpsertHospitalVisit(visit);
    },
    updateHospitalVisit: (id, data) => {
      setHospitalVisits((vs) => vs.map((v) => {
        if (v.id === id) {
          const updated = { ...v, ...data };
          dbUpsertHospitalVisit(updated);
          return updated;
        }
        return v;
      }));
    },
    deleteHospitalVisit: (id) => {
      setHospitalVisits((vs) => vs.filter((v) => v.id !== id));
      dbDeleteHospitalVisit(id);
    },

    addContent: (item) => {
      setContent((cs) => [...cs, item]);
      dbUpsertContent(item);
    },
    updateContent: (id, data) => {
      setContent((cs) => cs.map((c) => {
        if (c.id === id) {
          const updated = { ...c, ...data, updatedAt: new Date() };
          dbUpsertContent(updated);
          return updated;
        }
        return c;
      }));
    },
    deleteContent: (id) => {
      setContent((cs) => cs.filter((c) => c.id !== id));
      dbDeleteContent(id);
    },

    addLeetCodeProblem: (problem) => {
      setLeetcodeProblems((ps) => [...ps, problem]);
      dbUpsertLeetCode(problem);
    },
    updateLeetCodeProblem: (id, data) => {
      setLeetcodeProblems((ps) => ps.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...data, updatedAt: new Date() };
          dbUpsertLeetCode(updated);
          return updated;
        }
        return p;
      }));
    },
    deleteLeetCodeProblem: (id) => {
      setLeetcodeProblems((ps) => ps.filter((p) => p.id !== id));
      dbDeleteLeetCode(id);
    },

    addCourse: (course) => setCourses((cs) => [...cs, course]),
    updateCourse: (id, data) => setCourses((cs) => cs.map((c) => c.id === id ? { ...c, ...data, updatedAt: new Date() } : c)),
    addLearningSession: (session) => setLearningSessions((ss) => [...ss, session]),

    addConcept: (concept) => {
      setConcepts((cs) => [...cs, concept]);
      dbUpsertConcept(concept);
    },
    updateConcept: (id, data) => {
      setConcepts((cs) => cs.map((c) => {
        if (c.id === id) {
          const updated = { ...c, ...data, updatedAt: new Date() };
          dbUpsertConcept(updated);
          return updated;
        }
        return c;
      }));
    },
    deleteConcept: (id) => setConcepts((cs) => cs.filter((c) => c.id !== id)),

    reviewConcept: (id, rating) => {
      let updatedConcept: KnowledgeConcept | null = null;
      let prevInterval = 1;
      let newInterval = 1;

      setConcepts((cs) => cs.map((c) => {
        if (c.id !== id) return c;
        prevInterval = c.currentIntervalDays || 1;
        newInterval = getNextInterval(rating, prevInterval);
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + newInterval);
        updatedConcept = {
          ...c,
          reviewCount: c.reviewCount + 1,
          correctCount: rating === 'good' || rating === 'easy' ? c.correctCount + 1 : c.correctCount,
          incorrectCount: rating === 'again' ? c.incorrectCount + 1 : c.incorrectCount,
          currentIntervalDays: newInterval,
          nextReviewDate: nextReview,
          lastReviewedAt: new Date(),
          updatedAt: new Date(),
        };
        return updatedConcept;
      }));

      if (updatedConcept) {
        dbUpsertConcept(updatedConcept);
        dbRecordReview(id, rating, prevInterval, newInterval);
      }

      const review: KnowledgeReview = {
        id: generateId(),
        conceptId: id,
        reviewedAt: new Date(),
        rating,
        previousInterval: prevInterval,
        newInterval: newInterval,
      };
      setReviews((rs) => [...rs, review]);
    },

    addInterviewQuestion: (q) => setInterviewQuestions((qs) => [...qs, q]),
    updateInterviewQuestion: (id, data) => setInterviewQuestions((qs) => qs.map((q) => q.id === id ? { ...q, ...data, updatedAt: new Date() } : q)),
    recordInterviewAttempt: (attempt) => {
      setInterviewAttempts((as) => [...as, attempt]);
      dbRecordInterviewAttempt(attempt.id, attempt.questionId, attempt.myAnswer, attempt.rating);
      setInterviewQuestions((qs) => qs.map((q) => q.id === attempt.questionId ? {
        ...q,
        attemptCount: q.attemptCount + 1,
        lastAttemptRating: attempt.rating,
        lastAttemptedAt: attempt.attemptedAt,
        updatedAt: new Date(),
      } : q));
    },

    addArchitecturePattern: (p) => setArchitecturePatterns((ps) => [...ps, p]),
    updateArchitecturePattern: (id, data) => setArchitecturePatterns((ps) => ps.map((p) => p.id === id ? { ...p, ...data, updatedAt: new Date() } : p)),

    addWeeklyReview: (review) => {
      setWeeklyReviews((rs) => [...rs, review]);
      dbUpsertWeeklyReview(review);
    },
    updateWeeklyReview: (id, data) => setWeeklyReviews((rs) => rs.map((r) => r.id === id ? { ...r, ...data } : r)),
  };

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): AppStore {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used within StoreProvider');
  return store;
}
