import { supabase } from '@/lib/supabase';
import type {
  User,
  CapacityConfig,
  Client,
  Project,
  Task,
  CalendarEvent,
  TimeEntry,
  HospitalVisit,
  BufferBlock,
  ContentItem,
  LeetCodeProblem,
  LearningCourse,
  KnowledgeTopic,
  KnowledgeConcept,
  InterviewQuestion,
  ArchitecturePattern,
  WeeklyReview,
} from '@/types';

// =============================================================================
// HYDRATION: Fetch full database state on initial client load
// =============================================================================
export async function fetchInitialDataFromSupabase() {
  if (!supabase) return null;

  try {
    const [
      userRes,
      clientsRes,
      projectsRes,
      tasksRes,
      eventsRes,
      timeEntriesRes,
      visitsRes,
      bufferRes,
      contentRes,
      leetcodeRes,
      coursesRes,
      topicsRes,
      conceptsRes,
      interviewRes,
      archRes,
      weeklyReviewsRes,
    ] = await Promise.all([
      supabase.from('user_profiles').select('*').limit(1).maybeSingle(),
      supabase.from('clients').select('*'),
      supabase.from('projects').select('*'),
      supabase.from('tasks').select('*'),
      supabase.from('calendar_events').select('*'),
      supabase.from('time_entries').select('*'),
      supabase.from('hospital_visits').select('*'),
      supabase.from('buffer_blocks').select('*'),
      supabase.from('content_items').select('*'),
      supabase.from('leetcode_problems').select('*'),
      supabase.from('learning_courses').select('*'),
      supabase.from('knowledge_topics').select('*'),
      supabase.from('knowledge_concepts').select('*'),
      supabase.from('interview_questions').select('*'),
      supabase.from('architecture_patterns').select('*'),
      supabase.from('weekly_reviews').select('*'),
    ]);

    let user: User | null = null;
    let capacityConfig: CapacityConfig | null = null;

    if (userRes.data) {
      const u = userRes.data;
      user = {
        id: u.id,
        name: u.name,
        email: u.email,
        timezone: u.timezone,
        mainJobHoursPerWeek: Number(u.main_job_hours) || 40,
        freelanceHoursPerWeek: Number(u.freelance_hours) || 12,
        contentHoursPerWeek: Number(u.content_hours) || 4,
        leetcodeHoursPerWeek: Number(u.leetcode_hours) || 3,
        knowledgeHoursPerWeek: Number(u.knowledge_hours) || 3,
        learningHoursPerWeek: Number(u.learning_hours) || 3,
        bufferHoursPerWeek: Number(u.buffer_hours) || 4,
        createdAt: new Date(u.created_at),
      };
      capacityConfig = {
        mainJobHours: Number(u.main_job_hours) || 40,
        freelanceHours: Number(u.freelance_hours) || 12,
        contentHours: Number(u.content_hours) || 4,
        leetcodeHours: Number(u.leetcode_hours) || 3,
        knowledgeHours: Number(u.knowledge_hours) || 3,
        learningHours: Number(u.learning_hours) || 3,
        bufferHours: Number(u.buffer_hours) || 4,
      };
    }

    const clients: Client[] = (clientsRes.data || []).map((c) => ({
      id: c.id,
      name: c.name,
      contact: c.contact || '',
      email: c.email || '',
      phone: c.phone || undefined,
      status: c.status,
      notes: c.notes || undefined,
      createdAt: new Date(c.created_at),
      updatedAt: new Date(c.updated_at),
    }));

    const projects: Project[] = (projectsRes.data || []).map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description || undefined,
      clientId: p.client_id || undefined,
      status: p.status,
      priority: p.priority,
      startDate: p.start_date ? new Date(p.start_date) : undefined,
      deadline: p.deadline ? new Date(p.deadline) : undefined,
      estimatedHours: Number(p.estimated_hours) || 0,
      weeklyRequiredHours: Number(p.weekly_required_hours) || 0,
      actualHours: Number(p.actual_hours) || 0,
      revenue: p.revenue ? Number(p.revenue) : undefined,
      paymentStatus: p.payment_status || undefined,
      category: p.category,
      color: p.color || undefined,
      tags: p.tags || [],
      notes: p.notes || undefined,
      createdAt: new Date(p.created_at),
      updatedAt: new Date(p.updated_at),
    }));

    const tasks: Task[] = (tasksRes.data || []).map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description || undefined,
      projectId: t.project_id || undefined,
      category: t.category,
      status: t.status,
      priority: t.priority,
      dueDate: t.due_date ? new Date(t.due_date) : undefined,
      estimatedHours: t.estimated_hours ? Number(t.estimated_hours) : undefined,
      actualHours: Number(t.actual_hours) || 0,
      tags: t.tags || [],
      notes: t.notes || undefined,
      subtasks: t.subtasks || [],
      order: t.order_num || 0,
      createdAt: new Date(t.created_at),
      updatedAt: new Date(t.updated_at),
    }));

    const events: CalendarEvent[] = (eventsRes.data || []).map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description || undefined,
      type: e.type,
      projectId: e.project_id || undefined,
      startTime: new Date(e.start_time),
      endTime: new Date(e.end_time),
      isRecurring: Boolean(e.is_recurring),
      recurringDays: e.recurring_days || [],
      color: e.color || undefined,
      notes: e.notes || undefined,
      createdAt: new Date(e.created_at),
    }));

    const timeEntries: TimeEntry[] = (timeEntriesRes.data || []).map((t) => ({
      id: t.id,
      title: t.title,
      projectId: t.project_id || undefined,
      taskId: t.task_id || undefined,
      category: t.category,
      startTime: new Date(t.start_time),
      endTime: t.end_time ? new Date(t.end_time) : undefined,
      duration: t.duration || 0,
      notes: t.notes || undefined,
      createdAt: new Date(t.created_at),
    }));

    const hospitalVisits: HospitalVisit[] = (visitsRes.data || []).map((v) => ({
      id: v.id,
      hospital: v.hospital,
      date: new Date(v.date),
      startTime: v.start_time,
      endTime: v.end_time,
      travelTimeMinutes: v.travel_time_minutes || 0,
      purpose: v.purpose,
      projectId: v.project_id || undefined,
      systemBeingUpdated: v.system_being_updated || undefined,
      deploymentTasks: v.deployment_tasks || [],
      notes: v.notes || undefined,
      status: v.status,
      createdAt: new Date(v.created_at),
    }));

    const bufferBlocks: BufferBlock[] = (bufferRes.data || []).map((b) => ({
      id: b.id,
      title: b.title,
      dayOfWeek: b.day_of_week,
      startTime: b.start_time,
      endTime: b.end_time,
      durationMinutes: b.duration_minutes,
      usedMinutes: b.used_minutes || 0,
      notes: b.notes || undefined,
      weekOf: b.week_of ? new Date(b.week_of) : undefined,
      createdAt: new Date(b.created_at),
    }));

    const content: ContentItem[] = (contentRes.data || []).map((c) => ({
      id: c.id,
      title: c.title,
      topic: c.topic,
      type: c.type,
      platform: c.platform || ['youtube'],
      status: c.status,
      script: c.script || undefined,
      description: c.description || undefined,
      hashtags: c.hashtags || [],
      publishDate: c.publish_date ? new Date(c.publish_date) : undefined,
      recordingDate: c.recording_date ? new Date(c.recording_date) : undefined,
      editingNotes: c.editing_notes || undefined,
      thumbnailDone: Boolean(c.thumbnail_done),
      captionDone: Boolean(c.caption_done),
      notes: c.notes || undefined,
      estimatedMinutes: c.estimated_minutes || 10,
      tags: c.tags || [],
      createdAt: new Date(c.created_at),
      updatedAt: new Date(c.updated_at),
    }));

    const leetcodeProblems: LeetCodeProblem[] = (leetcodeRes.data || []).map((l) => ({
      id: l.id,
      name: l.name,
      leetcodeId: l.leetcode_id || undefined,
      difficulty: l.difficulty,
      topic: l.topic,
      language: l.language || 'Java',
      status: l.status,
      startedAt: l.started_at ? new Date(l.started_at) : undefined,
      solvedAt: l.solved_at ? new Date(l.solved_at) : undefined,
      bruteForceApproach: l.brute_force_approach || undefined,
      optimizedApproach: l.optimized_approach || undefined,
      timeComplexity: l.time_complexity || undefined,
      spaceComplexity: l.space_complexity || undefined,
      notes: l.notes || undefined,
      code: l.code || undefined,
      videoStatus: l.video_status || 'not-started',
      publishedUrl: l.published_url || undefined,
      tags: l.tags || [],
      createdAt: new Date(l.created_at),
      updatedAt: new Date(l.updated_at),
    }));

    const courses: LearningCourse[] = (coursesRes.data || []).map((c) => ({
      id: c.id,
      name: c.name,
      platform: c.platform,
      url: c.url || undefined,
      totalLessons: c.total_lessons || 0,
      completedLessons: c.completed_lessons || 0,
      totalHours: Number(c.total_hours) || 0,
      completedHours: Number(c.completed_hours) || 0,
      currentLesson: c.current_lesson || undefined,
      notes: c.notes || undefined,
      targetCompletionDate: c.target_completion_date ? new Date(c.target_completion_date) : undefined,
      category: c.category || 'udemy',
      tags: c.tags || [],
      createdAt: new Date(c.created_at),
      updatedAt: new Date(c.updated_at),
    }));

    const knowledgeTopics: KnowledgeTopic[] = (topicsRes.data || []).map((t) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      description: t.description || undefined,
      parentTopicId: t.parent_topic_id || undefined,
      childTopicIds: t.child_topic_ids || [],
      conceptCount: t.concept_count || 0,
      color: t.color || undefined,
      createdAt: new Date(t.created_at),
    }));

    const concepts: KnowledgeConcept[] = (conceptsRes.data || []).map((c) => ({
      id: c.id,
      name: c.name,
      topicId: c.topic_id,
      category: c.category,
      definition: c.definition || undefined,
      whyItExists: c.why_it_exists || undefined,
      howItWorks: c.how_it_works || undefined,
      whenToUse: c.when_to_use || undefined,
      whenNotToUse: c.when_not_to_use || undefined,
      realWorldExample: c.real_world_example || undefined,
      codeExample: c.code_example || undefined,
      commonMistakes: c.common_mistakes || undefined,
      relatedConceptIds: c.related_concept_ids || [],
      interviewQuestions: c.interview_questions || [],
      aiAssistedNotes: c.ai_assisted_notes || undefined,
      myExplanation: c.my_explanation || undefined,
      firstPrinciples: c.first_principles || undefined,
      confidence: c.confidence || 0,
      reviewCount: c.review_count || 0,
      correctCount: c.correct_count || 0,
      incorrectCount: c.incorrect_count || 0,
      currentIntervalDays: c.current_interval_days || 1,
      nextReviewDate: new Date(c.next_review_date),
      lastReviewedAt: c.last_reviewed_at ? new Date(c.last_reviewed_at) : undefined,
      tags: c.tags || [],
      createdAt: new Date(c.created_at),
      updatedAt: new Date(c.updated_at),
    }));

    const interviewQuestions: InterviewQuestion[] = (interviewRes.data || []).map((i) => ({
      id: i.id,
      question: i.question,
      type: i.type,
      category: i.category,
      difficulty: i.difficulty,
      modelAnswer: i.model_answer || undefined,
      myAnswer: i.my_answer || undefined,
      tags: i.tags || [],
      attemptCount: i.attempt_count || 0,
      lastAttemptRating: i.last_attempt_rating || undefined,
      lastAttemptedAt: i.last_attempted_at ? new Date(i.last_attempted_at) : undefined,
      createdAt: new Date(i.created_at),
      updatedAt: new Date(i.updated_at),
    }));

    const architecturePatterns: ArchitecturePattern[] = (archRes.data || []).map((a) => ({
      id: a.id,
      name: a.name,
      problem: a.problem,
      context: a.context || undefined,
      solution: a.solution,
      diagramDescription: a.diagram_description || undefined,
      advantages: a.advantages || [],
      disadvantages: a.disadvantages || [],
      whenToUse: a.when_to_use || [],
      whenNotToUse: a.when_not_to_use || [],
      failureModes: a.failure_modes || [],
      realWorldExample: a.real_world_example || undefined,
      relatedPatterns: a.related_patterns || [],
      tags: a.tags || [],
      confidence: a.confidence || 50,
      lastReviewedAt: a.last_reviewed_at ? new Date(a.last_reviewed_at) : undefined,
      createdAt: new Date(a.created_at),
      updatedAt: new Date(a.updated_at),
    }));

    const weeklyReviews: WeeklyReview[] = (weeklyReviewsRes.data || []).map((w) => ({
      id: w.id,
      weekStart: new Date(w.week_start),
      weekEnd: new Date(w.week_end),
      actualMainJobHours: Number(w.actual_main_job_hours) || 0,
      actualFreelanceHours: Number(w.actual_freelance_hours) || 0,
      actualContentHours: Number(w.actual_content_hours) || 0,
      actualLeetcodeHours: Number(w.actual_leetcode_hours) || 0,
      actualKnowledgeHours: Number(w.actual_knowledge_hours) || 0,
      actualLearningHours: Number(w.actual_learning_hours) || 0,
      bufferUsed: Number(w.buffer_used) || 0,
      tasksCompleted: w.tasks_completed || 0,
      tasksDelayed: w.tasks_delayed || 0,
      hospitalVisits: w.hospital_visits || 0,
      contentPublished: w.content_published || 0,
      leetcodeProblems: w.leetcode_problems || 0,
      conceptsLearned: w.concepts_learned || 0,
      conceptsReviewed: w.concepts_reviewed || 0,
      whatWentWell: w.what_went_well || undefined,
      whatDidntGoWell: w.what_didnt_go_well || undefined,
      whatCausedDelays: w.what_caused_delays || undefined,
      whatToStop: w.what_to_stop || undefined,
      whatToContinue: w.what_to_continue || undefined,
      whatToStart: w.what_to_start || undefined,
      top3NextWeek: w.top_3_next_week || [],
      createdAt: new Date(w.created_at),
    }));

    return {
      user,
      capacityConfig,
      clients,
      projects,
      tasks,
      events,
      timeEntries,
      hospitalVisits,
      bufferBlocks,
      content,
      leetcodeProblems,
      courses,
      knowledgeTopics,
      concepts,
      interviewQuestions,
      architecturePatterns,
      weeklyReviews,
    };
  } catch (err) {
    console.warn('Error hydrating from Supabase, staying on local store:', err);
    return null;
  }
}

// =============================================================================
// ASYNC PERSISTENCE: Write back mutations to Supabase
// =============================================================================

export async function dbUpsertTask(task: Task) {
  if (!supabase) return;
  await supabase.from('tasks').upsert({
    id: task.id,
    title: task.title,
    description: task.description,
    project_id: task.projectId,
    category: task.category,
    status: task.status,
    priority: task.priority,
    due_date: task.dueDate?.toISOString(),
    estimated_hours: task.estimatedHours,
    actual_hours: task.actualHours,
    tags: task.tags,
    notes: task.notes,
    subtasks: task.subtasks,
    order_num: task.order,
    updated_at: new Date().toISOString(),
  });
}

export async function dbDeleteTask(id: string) {
  if (!supabase) return;
  await supabase.from('tasks').delete().eq('id', id);
}

export async function dbUpsertProject(project: Project) {
  if (!supabase) return;
  await supabase.from('projects').upsert({
    id: project.id,
    name: project.name,
    description: project.description,
    client_id: project.clientId,
    status: project.status,
    priority: project.priority,
    start_date: project.startDate?.toISOString(),
    deadline: project.deadline?.toISOString(),
    estimated_hours: project.estimatedHours,
    weekly_required_hours: project.weeklyRequiredHours,
    actual_hours: project.actualHours,
    revenue: project.revenue,
    payment_status: project.paymentStatus,
    category: project.category,
    color: project.color,
    tags: project.tags,
    notes: project.notes,
    updated_at: new Date().toISOString(),
  });
}

export async function dbDeleteProject(id: string) {
  if (!supabase) return;
  await supabase.from('projects').delete().eq('id', id);
}

export async function dbUpsertClient(client: Client) {
  if (!supabase) return;
  await supabase.from('clients').upsert({
    id: client.id,
    name: client.name,
    contact: client.contact,
    email: client.email,
    phone: client.phone,
    status: client.status,
    notes: client.notes,
    updated_at: new Date().toISOString(),
  });
}

export async function dbDeleteClient(id: string) {
  if (!supabase) return;
  await supabase.from('clients').delete().eq('id', id);
}

export async function dbUpsertTimeEntry(entry: TimeEntry) {
  if (!supabase) return;
  await supabase.from('time_entries').upsert({
    id: entry.id,
    title: entry.title,
    project_id: entry.projectId,
    task_id: entry.taskId,
    category: entry.category,
    start_time: entry.startTime.toISOString(),
    end_time: entry.endTime?.toISOString(),
    duration: entry.duration,
    notes: entry.notes,
  });
}

export async function dbDeleteTimeEntry(id: string) {
  if (!supabase) return;
  await supabase.from('time_entries').delete().eq('id', id);
}

export async function dbUpsertHospitalVisit(visit: HospitalVisit) {
  if (!supabase) return;
  await supabase.from('hospital_visits').upsert({
    id: visit.id,
    hospital: visit.hospital,
    date: visit.date.toISOString(),
    start_time: visit.startTime,
    end_time: visit.endTime,
    travel_time_minutes: visit.travelTimeMinutes,
    purpose: visit.purpose,
    project_id: visit.projectId,
    system_being_updated: visit.systemBeingUpdated,
    deployment_tasks: visit.deploymentTasks,
    notes: visit.notes,
    status: visit.status,
  });
}

export async function dbDeleteHospitalVisit(id: string) {
  if (!supabase) return;
  await supabase.from('hospital_visits').delete().eq('id', id);
}

export async function dbUpsertContent(item: ContentItem) {
  if (!supabase) return;
  await supabase.from('content_items').upsert({
    id: item.id,
    title: item.title,
    topic: item.topic,
    type: item.type,
    platform: item.platform,
    status: item.status,
    script: item.script,
    description: item.description,
    hashtags: item.hashtags,
    publish_date: item.publishDate?.toISOString(),
    recording_date: item.recordingDate?.toISOString(),
    editing_notes: item.editingNotes,
    thumbnail_done: item.thumbnailDone,
    caption_done: item.captionDone,
    notes: item.notes,
    estimated_minutes: item.estimatedMinutes,
    tags: item.tags,
    updated_at: new Date().toISOString(),
  });
}

export async function dbDeleteContent(id: string) {
  if (!supabase) return;
  await supabase.from('content_items').delete().eq('id', id);
}

export async function dbUpsertLeetCode(problem: LeetCodeProblem) {
  if (!supabase) return;
  await supabase.from('leetcode_problems').upsert({
    id: problem.id,
    name: problem.name,
    leetcode_id: problem.leetcodeId,
    difficulty: problem.difficulty,
    topic: problem.topic,
    language: problem.language,
    status: problem.status,
    started_at: problem.startedAt?.toISOString(),
    solved_at: problem.solvedAt?.toISOString(),
    brute_force_approach: problem.bruteForceApproach,
    optimized_approach: problem.optimizedApproach,
    time_complexity: problem.timeComplexity,
    space_complexity: problem.spaceComplexity,
    notes: problem.notes,
    code: problem.code,
    video_status: problem.videoStatus,
    published_url: problem.publishedUrl,
    tags: problem.tags,
    updated_at: new Date().toISOString(),
  });
}

export async function dbDeleteLeetCode(id: string) {
  if (!supabase) return;
  await supabase.from('leetcode_problems').delete().eq('id', id);
}

export async function dbUpsertConcept(concept: KnowledgeConcept) {
  if (!supabase) return;
  await supabase.from('knowledge_concepts').upsert({
    id: concept.id,
    name: concept.name,
    topic_id: concept.topicId,
    category: concept.category,
    definition: concept.definition,
    why_it_exists: concept.whyItExists,
    how_it_works: concept.howItWorks,
    when_to_use: concept.whenToUse,
    when_not_to_use: concept.whenNotToUse,
    real_world_example: concept.realWorldExample,
    code_example: concept.codeExample,
    common_mistakes: concept.commonMistakes,
    related_concept_ids: concept.relatedConceptIds,
    interview_questions: concept.interviewQuestions,
    ai_assisted_notes: concept.aiAssistedNotes,
    my_explanation: concept.myExplanation,
    first_principles: concept.firstPrinciples,
    confidence: concept.confidence,
    review_count: concept.reviewCount,
    correct_count: concept.correctCount,
    incorrect_count: concept.incorrectCount,
    current_interval_days: concept.currentIntervalDays,
    next_review_date: concept.nextReviewDate.toISOString(),
    last_reviewed_at: concept.lastReviewedAt?.toISOString(),
    tags: concept.tags,
    updated_at: new Date().toISOString(),
  });
}

export async function dbRecordReview(conceptId: string, rating: string, prevInterval: number, newInterval: number) {
  if (!supabase) return;
  await supabase.from('knowledge_reviews').insert({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    concept_id: conceptId,
    reviewed_at: new Date().toISOString(),
    rating,
    previous_interval: prevInterval,
    new_interval: newInterval,
  });
}

export async function dbRecordInterviewAttempt(attemptId: string, questionId: string, answer: string, rating: string) {
  if (!supabase) return;
  await supabase.from('interview_attempts').insert({
    id: attemptId,
    question_id: questionId,
    attempted_at: new Date().toISOString(),
    my_answer: answer,
    rating,
  });
}

export async function dbUpsertCalendarEvent(event: CalendarEvent) {
  if (!supabase) return;
  await supabase.from('calendar_events').upsert({
    id: event.id,
    title: event.title,
    description: event.description,
    type: event.type,
    project_id: event.projectId,
    start_time: event.startTime.toISOString(),
    end_time: event.endTime.toISOString(),
    is_recurring: event.isRecurring,
    recurring_days: event.recurringDays,
    color: event.color,
    notes: event.notes,
  });
}

export async function dbDeleteCalendarEvent(id: string) {
  if (!supabase) return;
  await supabase.from('calendar_events').delete().eq('id', id);
}

export async function dbUpsertWeeklyReview(review: WeeklyReview) {
  if (!supabase) return;
  await supabase.from('weekly_reviews').upsert({
    id: review.id,
    week_start: review.weekStart.toISOString(),
    week_end: review.weekEnd.toISOString(),
    actual_main_job_hours: review.actualMainJobHours,
    actual_freelance_hours: review.actualFreelanceHours,
    actual_content_hours: review.actualContentHours,
    actual_leetcode_hours: review.actualLeetcodeHours,
    actual_knowledge_hours: review.actualKnowledgeHours,
    actual_learning_hours: review.actualLearningHours,
    buffer_used: review.bufferUsed,
    tasks_completed: review.tasksCompleted,
    tasks_delayed: review.tasksDelayed,
    hospital_visits: review.hospitalVisits,
    content_published: review.contentPublished,
    leetcode_problems: review.leetcodeProblems,
    concepts_learned: review.conceptsLearned,
    concepts_reviewed: review.conceptsReviewed,
    what_went_well: review.whatWentWell,
    what_didnt_go_well: review.whatDidntGoWell,
    what_caused_delays: review.whatCausedDelays,
    what_to_stop: review.whatToStop,
    what_to_continue: review.whatToContinue,
    what_to_start: review.whatToStart,
    top_3_next_week: review.top3NextWeek,
  });
}

export async function dbUpdateUserProfile(user: Partial<User>, capacity?: Partial<CapacityConfig>) {
  if (!supabase) return;
  await supabase.from('user_profiles').upsert({
    id: 'user-1',
    name: user.name,
    timezone: user.timezone,
    main_job_hours: capacity?.mainJobHours ?? user.mainJobHoursPerWeek,
    freelance_hours: capacity?.freelanceHours ?? user.freelanceHoursPerWeek,
    content_hours: capacity?.contentHours ?? user.contentHoursPerWeek,
    leetcode_hours: capacity?.leetcodeHours ?? user.leetcodeHoursPerWeek,
    knowledge_hours: capacity?.knowledgeHours ?? user.knowledgeHoursPerWeek,
    learning_hours: capacity?.learningHours ?? user.learningHoursPerWeek,
    buffer_hours: capacity?.bufferHours ?? user.bufferHoursPerWeek,
  });
}
