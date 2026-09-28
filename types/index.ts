// types/index.ts
// Complete type definitions for Engineering OS

export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type Status = 'active' | 'inactive' | 'archived' | 'completed' | 'cancelled';
export type ProjectStatus = 'lead' | 'planning' | 'active' | 'waiting' | 'testing' | 'revision' | 'completed' | 'archived';
export type TaskStatus = 'backlog' | 'this-week' | 'today' | 'in-progress' | 'blocked' | 'testing' | 'done';
export type ContentStatus = 'idea' | 'research' | 'script' | 'ready-to-record' | 'recorded' | 'editing' | 'ready' | 'published';
export type LeetCodeStatus = 'understand' | 'brute-force' | 'optimize' | 'code' | 'test' | 'explain' | 'record' | 'edit' | 'publish' | 'done';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type EventType = 'main-job' | 'freelance' | 'hospital' | 'content' | 'leetcode' | 'knowledge' | 'udemy' | 'buffer' | 'personal';
export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';
export type ConfidenceLevel = 'none' | 'beginner' | 'familiar' | 'can-explain' | 'strong' | 'automatic';
export type KnowledgeCategory = 'computer-science' | 'backend' | 'java' | 'databases' | 'networking' | 'distributed-systems' | 'architecture' | 'security' | 'cloud-devops' | 'observability' | 'ml-ai' | 'system-design';
export type ContentPlatform = 'youtube' | 'tiktok' | 'instagram' | 'blog';
export type InterviewAnswerRating = 'incorrect' | 'partial' | 'correct' | 'excellent';
export type TimeEntryCategory = 'main-job' | 'freelance' | 'content' | 'leetcode' | 'learning' | 'knowledge' | 'buffer';

export interface User {
  id: string;
  name: string;
  email: string;
  timezone: string;
  mainJobHoursPerWeek: number;
  freelanceHoursPerWeek: number;
  contentHoursPerWeek: number;
  leetcodeHoursPerWeek: number;
  knowledgeHoursPerWeek: number;
  learningHoursPerWeek: number;
  bufferHoursPerWeek: number;
  createdAt: Date;
}

export interface Client {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone?: string;
  status: 'active' | 'lead' | 'inactive' | 'archived';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  clientId?: string;
  status: ProjectStatus;
  priority: Priority;
  startDate?: Date;
  deadline?: Date;
  estimatedHours: number;
  weeklyRequiredHours: number;
  actualHours: number;
  revenue?: number;
  paymentStatus?: 'pending' | 'partial' | 'paid' | 'overdue';
  category: 'main-job' | 'freelance' | 'personal' | 'learning' | 'content';
  color?: string;
  tags: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId?: string;
  category: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  notes?: string;
  subtasks: Subtask[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: EventType;
  projectId?: string;
  startTime: Date;
  endTime: Date;
  isRecurring: boolean;
  recurringDays?: number[];
  color?: string;
  notes?: string;
  createdAt: Date;
}

export interface TimeEntry {
  id: string;
  title: string;
  projectId?: string;
  taskId?: string;
  category: TimeEntryCategory;
  startTime: Date;
  endTime?: Date;
  duration?: number; // minutes
  notes?: string;
  createdAt: Date;
}

export interface HospitalVisit {
  id: string;
  hospital: string;
  date: Date;
  startTime: string;
  endTime: string;
  travelTimeMinutes: number;
  purpose: string;
  projectId?: string;
  systemBeingUpdated?: string;
  deploymentTasks: string[];
  notes?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface BufferBlock {
  id: string;
  title: string;
  dayOfWeek: number; // 0=Sun, 1=Mon...
  startTime: string;
  endTime: string;
  durationMinutes: number;
  usedMinutes: number;
  notes?: string;
  weekOf?: Date;
  createdAt: Date;
}

export interface ContentItem {
  id: string;
  title: string;
  topic: string;
  type: 'long-form' | 'short-form';
  platform: ContentPlatform[];
  status: ContentStatus;
  script?: string;
  description?: string;
  hashtags: string[];
  publishDate?: Date;
  recordingDate?: Date;
  editingNotes?: string;
  thumbnailDone: boolean;
  captionDone: boolean;
  notes?: string;
  estimatedMinutes: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LeetCodeProblem {
  id: string;
  name: string;
  leetcodeId?: number;
  difficulty: Difficulty;
  topic: string;
  language: string;
  status: LeetCodeStatus;
  startedAt?: Date;
  solvedAt?: Date;
  bruteForceApproach?: string;
  optimizedApproach?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  notes?: string;
  code?: string;
  videoStatus?: 'not-started' | 'recorded' | 'edited' | 'published';
  publishedUrl?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LearningCourse {
  id: string;
  name: string;
  platform: string;
  url?: string;
  totalLessons: number;
  completedLessons: number;
  totalHours: number;
  completedHours: number;
  currentLesson?: string;
  notes?: string;
  targetCompletionDate?: Date;
  category: 'udemy' | 'book' | 'course' | 'documentation';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LearningSession {
  id: string;
  courseId: string;
  date: Date;
  durationMinutes: number;
  lessonsCompleted: number;
  notes?: string;
  createdAt: Date;
}

export interface KnowledgeTopic {
  id: string;
  name: string;
  category: KnowledgeCategory;
  description?: string;
  parentTopicId?: string;
  childTopicIds: string[];
  conceptCount: number;
  color?: string;
  createdAt: Date;
}

export interface KnowledgeConcept {
  id: string;
  name: string;
  topicId: string;
  category: KnowledgeCategory;
  definition?: string;
  whyItExists?: string;
  howItWorks?: string;
  whenToUse?: string;
  whenNotToUse?: string;
  realWorldExample?: string;
  codeExample?: string;
  commonMistakes?: string;
  relatedConceptIds: string[];
  interviewQuestions: string[];
  aiAssistedNotes?: string;
  myExplanation?: string;
  firstPrinciples?: string;
  confidence: number; // 0-100
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
  currentIntervalDays: number;
  nextReviewDate: Date;
  lastReviewedAt?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeReview {
  id: string;
  conceptId: string;
  reviewedAt: Date;
  rating: ReviewRating;
  previousInterval: number;
  newInterval: number;
  notes?: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  type: 'explain' | 'why' | 'compare' | 'scenario' | 'system-design' | 'ml';
  category: KnowledgeCategory | 'system-design';
  difficulty: Difficulty;
  modelAnswer?: string;
  myAnswer?: string;
  tags: string[];
  attemptCount: number;
  lastAttemptRating?: InterviewAnswerRating;
  lastAttemptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InterviewAttempt {
  id: string;
  questionId: string;
  attemptedAt: Date;
  myAnswer: string;
  rating: InterviewAnswerRating;
  notes?: string;
}

export interface ArchitecturePattern {
  id: string;
  name: string;
  problem: string;
  context?: string;
  solution: string;
  diagramDescription?: string;
  advantages: string[];
  disadvantages: string[];
  whenToUse: string[];
  whenNotToUse: string[];
  failureModes: string[];
  realWorldExample?: string;
  relatedPatterns: string[];
  tags: string[];
  confidence: number;
  lastReviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeeklyPlan {
  id: string;
  weekStart: Date;
  weekEnd: Date;
  plannedMainJobHours: number;
  plannedFreelanceHours: number;
  plannedContentHours: number;
  plannedLeetcodeHours: number;
  plannedKnowledgeHours: number;
  plannedLearningHours: number;
  plannedBufferHours: number;
  priorities: string[];
  notes?: string;
  createdAt: Date;
}

export interface WeeklyReview {
  id: string;
  weekStart: Date;
  weekEnd: Date;
  actualMainJobHours: number;
  actualFreelanceHours: number;
  actualContentHours: number;
  actualLeetcodeHours: number;
  actualKnowledgeHours: number;
  actualLearningHours: number;
  bufferUsed: number;
  tasksCompleted: number;
  tasksDelayed: number;
  hospitalVisits: number;
  contentPublished: number;
  leetcodeProblems: number;
  conceptsLearned: number;
  conceptsReviewed: number;
  whatWentWell?: string;
  whatDidntGoWell?: string;
  whatCausedDelays?: string;
  whatToStop?: string;
  whatToContinue?: string;
  whatToStart?: string;
  top3NextWeek: string[];
  createdAt: Date;
}

export interface CapacityConfig {
  mainJobHours: number;
  freelanceHours: number;
  contentHours: number;
  leetcodeHours: number;
  knowledgeHours: number;
  learningHours: number;
  bufferHours: number;
}

export interface CapacityStats {
  totalCapacity: number;
  totalPlanned: number;
  mainJob: number;
  freelance: number;
  content: number;
  leetcode: number;
  knowledge: number;
  learning: number;
  buffer: number;
  freeCapacity: number;
  isOverloaded: boolean;
  overloadAmount: number;
}

export interface DashboardStats {
  todaysTasks: Task[];
  overdueTaskCount: number;
  inProgressTaskCount: number;
  completedTodayCount: number;
  plannedHoursToday: number;
  actualHoursToday: number;
  capacityStats: CapacityStats;
  upcomingHospitalVisits: HospitalVisit[];
  dueForReview: KnowledgeConcept[];
  activeTimer?: TimeEntry;
}
