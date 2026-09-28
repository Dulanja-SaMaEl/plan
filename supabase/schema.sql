-- =============================================================================
-- ENGINEERING OPERATING SYSTEM (EOS) - COMPLETE SUPABASE SCHEMA & INITIAL SEED
-- Run this entire script in your Supabase Project -> SQL Editor -> Run
-- =============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. DROP EXISTING TABLES (CASCADE) TO ALLOW CLEAN RE-RUNS
-- =============================================================================
DROP TABLE IF EXISTS weekly_reviews CASCADE;
DROP TABLE IF EXISTS weekly_plans CASCADE;
DROP TABLE IF EXISTS architecture_patterns CASCADE;
DROP TABLE IF EXISTS interview_attempts CASCADE;
DROP TABLE IF EXISTS interview_questions CASCADE;
DROP TABLE IF EXISTS knowledge_reviews CASCADE;
DROP TABLE IF EXISTS knowledge_concepts CASCADE;
DROP TABLE IF EXISTS knowledge_topics CASCADE;
DROP TABLE IF EXISTS learning_sessions CASCADE;
DROP TABLE IF EXISTS learning_courses CASCADE;
DROP TABLE IF EXISTS leetcode_problems CASCADE;
DROP TABLE IF EXISTS content_items CASCADE;
DROP TABLE IF EXISTS buffer_blocks CASCADE;
DROP TABLE IF EXISTS hospital_visits CASCADE;
DROP TABLE IF EXISTS time_entries CASCADE;
DROP TABLE IF EXISTS calendar_events CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- =============================================================================
-- 2. CREATE TABLES
-- =============================================================================

-- User Profiles & Capacity Config
CREATE TABLE user_profiles (
  id TEXT PRIMARY KEY DEFAULT 'user-1',
  name TEXT NOT NULL DEFAULT 'Engineer',
  email TEXT NOT NULL DEFAULT 'engineer@example.com',
  timezone TEXT NOT NULL DEFAULT 'Asia/Colombo',
  main_job_hours NUMERIC NOT NULL DEFAULT 40,
  freelance_hours NUMERIC NOT NULL DEFAULT 12,
  content_hours NUMERIC NOT NULL DEFAULT 4,
  leetcode_hours NUMERIC NOT NULL DEFAULT 3,
  knowledge_hours NUMERIC NOT NULL DEFAULT 3,
  learning_hours NUMERIC NOT NULL DEFAULT 3,
  buffer_hours NUMERIC NOT NULL DEFAULT 4,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clients
CREATE TABLE clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT,
  email TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'lead',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'planning',
  priority TEXT NOT NULL DEFAULT 'medium',
  start_date TIMESTAMPTZ,
  deadline TIMESTAMPTZ,
  estimated_hours NUMERIC NOT NULL DEFAULT 0,
  weekly_required_hours NUMERIC NOT NULL DEFAULT 0,
  actual_hours NUMERIC NOT NULL DEFAULT 0,
  revenue NUMERIC,
  payment_status TEXT,
  category TEXT NOT NULL DEFAULT 'freelance',
  color TEXT,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  category TEXT NOT NULL DEFAULT 'General',
  status TEXT NOT NULL DEFAULT 'backlog',
  priority TEXT NOT NULL DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  estimated_hours NUMERIC,
  actual_hours NUMERIC DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  subtasks JSONB DEFAULT '[]'::jsonb,
  order_num INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Calendar Events
CREATE TABLE calendar_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'main-job',
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_days INTEGER[] DEFAULT '{}',
  color TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Time Entries
CREATE TABLE time_entries (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
  category TEXT NOT NULL DEFAULT 'main-job',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Hospital Visits
CREATE TABLE hospital_visits (
  id TEXT PRIMARY KEY,
  hospital TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  travel_time_minutes INTEGER NOT NULL DEFAULT 0,
  purpose TEXT NOT NULL,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  system_being_updated TEXT,
  deployment_tasks TEXT[] DEFAULT '{}',
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Buffer Blocks
CREATE TABLE buffer_blocks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  day_of_week INTEGER NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  used_minutes INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  week_of TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Content Items
CREATE TABLE content_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'long-form',
  platform TEXT[] DEFAULT '{"youtube"}',
  status TEXT NOT NULL DEFAULT 'idea',
  script TEXT,
  description TEXT,
  hashtags TEXT[] DEFAULT '{}',
  publish_date TIMESTAMPTZ,
  recording_date TIMESTAMPTZ,
  editing_notes TEXT,
  thumbnail_done BOOLEAN DEFAULT FALSE,
  caption_done BOOLEAN DEFAULT FALSE,
  notes TEXT,
  estimated_minutes INTEGER DEFAULT 10,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- LeetCode Problems
CREATE TABLE leetcode_problems (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  leetcode_id INTEGER,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  topic TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'Java',
  status TEXT NOT NULL DEFAULT 'understand',
  started_at TIMESTAMPTZ,
  solved_at TIMESTAMPTZ,
  brute_force_approach TEXT,
  optimized_approach TEXT,
  time_complexity TEXT,
  space_complexity TEXT,
  notes TEXT,
  code TEXT,
  video_status TEXT DEFAULT 'not-started',
  published_url TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Learning Courses
CREATE TABLE learning_courses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  platform TEXT NOT NULL,
  url TEXT,
  total_lessons INTEGER DEFAULT 0,
  completed_lessons INTEGER DEFAULT 0,
  total_hours NUMERIC DEFAULT 0,
  completed_hours NUMERIC DEFAULT 0,
  current_lesson TEXT,
  notes TEXT,
  target_completion_date TIMESTAMPTZ,
  category TEXT DEFAULT 'udemy',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Learning Sessions
CREATE TABLE learning_sessions (
  id TEXT PRIMARY KEY,
  course_id TEXT REFERENCES learning_courses(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_minutes INTEGER NOT NULL,
  lessons_completed INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Knowledge Topics
CREATE TABLE knowledge_topics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  parent_topic_id TEXT,
  child_topic_ids TEXT[] DEFAULT '{}',
  concept_count INTEGER DEFAULT 0,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Knowledge Concepts
CREATE TABLE knowledge_concepts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  topic_id TEXT REFERENCES knowledge_topics(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  definition TEXT,
  why_it_exists TEXT,
  how_it_works TEXT,
  when_to_use TEXT,
  when_not_to_use TEXT,
  real_world_example TEXT,
  code_example TEXT,
  common_mistakes TEXT,
  related_concept_ids TEXT[] DEFAULT '{}',
  interview_questions TEXT[] DEFAULT '{}',
  ai_assisted_notes TEXT,
  my_explanation TEXT,
  first_principles TEXT,
  confidence INTEGER DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  current_interval_days INTEGER DEFAULT 1,
  next_review_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_reviewed_at TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Knowledge Reviews
CREATE TABLE knowledge_reviews (
  id TEXT PRIMARY KEY,
  concept_id TEXT REFERENCES knowledge_concepts(id) ON DELETE CASCADE,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rating TEXT NOT NULL,
  previous_interval INTEGER DEFAULT 1,
  new_interval INTEGER DEFAULT 1,
  notes TEXT
);

-- Interview Questions
CREATE TABLE interview_questions (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  model_answer TEXT,
  my_answer TEXT,
  tags TEXT[] DEFAULT '{}',
  attempt_count INTEGER DEFAULT 0,
  last_attempt_rating TEXT,
  last_attempted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Interview Attempts
CREATE TABLE interview_attempts (
  id TEXT PRIMARY KEY,
  question_id TEXT REFERENCES interview_questions(id) ON DELETE CASCADE,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  my_answer TEXT NOT NULL,
  rating TEXT NOT NULL,
  notes TEXT
);

-- Architecture Patterns
CREATE TABLE architecture_patterns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  problem TEXT NOT NULL,
  context TEXT,
  solution TEXT NOT NULL,
  diagram_description TEXT,
  advantages TEXT[] DEFAULT '{}',
  disadvantages TEXT[] DEFAULT '{}',
  when_to_use TEXT[] DEFAULT '{}',
  when_not_to_use TEXT[] DEFAULT '{}',
  failure_modes TEXT[] DEFAULT '{}',
  real_world_example TEXT,
  related_patterns TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  confidence INTEGER DEFAULT 50,
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Weekly Plans
CREATE TABLE weekly_plans (
  id TEXT PRIMARY KEY,
  week_start TIMESTAMPTZ NOT NULL,
  week_end TIMESTAMPTZ NOT NULL,
  planned_main_job_hours NUMERIC DEFAULT 40,
  planned_freelance_hours NUMERIC DEFAULT 12,
  planned_content_hours NUMERIC DEFAULT 4,
  planned_leetcode_hours NUMERIC DEFAULT 3,
  planned_knowledge_hours NUMERIC DEFAULT 3,
  planned_learning_hours NUMERIC DEFAULT 3,
  planned_buffer_hours NUMERIC DEFAULT 4,
  priorities TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Weekly Reviews
CREATE TABLE weekly_reviews (
  id TEXT PRIMARY KEY,
  week_start TIMESTAMPTZ NOT NULL,
  week_end TIMESTAMPTZ NOT NULL,
  actual_main_job_hours NUMERIC DEFAULT 0,
  actual_freelance_hours NUMERIC DEFAULT 0,
  actual_content_hours NUMERIC DEFAULT 0,
  actual_leetcode_hours NUMERIC DEFAULT 0,
  actual_knowledge_hours NUMERIC DEFAULT 0,
  actual_learning_hours NUMERIC DEFAULT 0,
  buffer_used NUMERIC DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  tasks_delayed INTEGER DEFAULT 0,
  hospital_visits INTEGER DEFAULT 0,
  content_published INTEGER DEFAULT 0,
  leetcode_problems INTEGER DEFAULT 0,
  concepts_learned INTEGER DEFAULT 0,
  concepts_reviewed INTEGER DEFAULT 0,
  what_went_well TEXT,
  what_didnt_go_well TEXT,
  what_caused_delays TEXT,
  what_to_stop TEXT,
  what_to_continue TEXT,
  what_to_start TEXT,
  top_3_next_week TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- Permissive public policies for personal engineering OS single-user mode
-- =============================================================================

DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Public access on %I" ON %I;', tbl, tbl);
    EXECUTE format('CREATE POLICY "Public access on %I" ON %I FOR ALL USING (true) WITH CHECK (true);', tbl, tbl);
  END LOOP;
END $$;

-- =============================================================================
-- 4. INITIAL SEED DATA POPULATION
-- =============================================================================

-- User profile
INSERT INTO user_profiles (id, name, email, timezone, main_job_hours, freelance_hours, content_hours, leetcode_hours, knowledge_hours, learning_hours, buffer_hours)
VALUES ('user-1', 'Engineer', 'engineer@example.com', 'Asia/Colombo', 40, 12, 4, 3, 3, 3, 4)
ON CONFLICT (id) DO NOTHING;

-- Clients
INSERT INTO clients (id, name, contact, email, phone, status, notes) VALUES
('client-biotech', 'Biotech Software Solutions', 'Main Employer', 'hr@biotech.example.com', NULL, 'active', 'Main employer. Full-time position.'),
('client-1', 'Client Project 1', 'John Smith', 'john@client1.example.com', '+1234567890', 'active', 'Active freelance client. Priority project.'),
('client-2', 'Client Project 2', 'Sarah Johnson', 'sarah@client2.example.com', NULL, 'active', 'Secondary freelance client.'),
('client-future', 'New Client / Future Project', 'TBD', '', NULL, 'lead', 'Potential new client under evaluation.')
ON CONFLICT (id) DO NOTHING;

-- Projects
INSERT INTO projects (id, name, description, client_id, status, priority, estimated_hours, weekly_required_hours, actual_hours, revenue, payment_status, category, color, tags, notes) VALUES
('proj-pharmacy', 'Pharmacy Management System', 'Core pharmacy management software for hospital and clinic deployments.', 'client-biotech', 'active', 'critical', 2000, 40, 1240, NULL, NULL, 'main-job', '#3B82F6', '{"java","spring","postgresql","pharmacy"}', 'Main product. Hospital deployments ongoing.'),
('proj-client1', 'Client Project 1', 'Full-stack web application for Client 1.', 'client-1', 'active', 'high', 120, 6, 34, 4500, 'partial', 'freelance', '#8B5CF6', '{"react","nodejs","mongodb"}', 'Regular Monday night sessions.'),
('proj-client2', 'Client Project 2', 'API integration and backend development.', 'client-2', 'active', 'high', 80, 4, 22, 2800, 'pending', 'freelance', '#EC4899', '{"python","fastapi","postgresql"}', 'Tuesday night sessions.'),
('proj-ai-content', 'AI Education Channel', 'Creating educational AI/ML content for engineers.', NULL, 'active', 'medium', 500, 4, 48, NULL, NULL, 'content', '#F59E0B', '{"ai","ml","youtube","education"}', 'Wednesday evenings + Saturday afternoons.'),
('proj-leetcode', 'LeetCode From Zero', 'Systematic LeetCode study and content creation.', NULL, 'active', 'medium', 200, 3, 18, NULL, NULL, 'learning', '#10B981', '{"algorithms","data-structures","java"}', 'Saturday afternoons.')
ON CONFLICT (id) DO NOTHING;

-- Tasks
INSERT INTO tasks (id, title, description, project_id, category, status, priority, due_date, estimated_hours, actual_hours, tags, notes, subtasks, order_num) VALUES
('task-1', 'Implement drug interaction checker module', 'Build the drug interaction validation module for the Pharmacy Management System.', 'proj-pharmacy', 'Feature Development', 'in-progress', 'high', NOW() + INTERVAL '5 days', 12, 4, '{"java","spring","pharmacy"}', 'Core safety feature. Needs thorough testing.', '[{"id":"st-1","title":"Define interaction rules schema","completed":true},{"id":"st-2","title":"Implement validation service","completed":true},{"id":"st-3","title":"Add unit tests","completed":false},{"id":"st-4","title":"Integration testing","completed":false}]'::jsonb, 0),
('task-2', 'Fix prescription print layout bug', 'Prescription PDF layout breaks on A5 paper size.', 'proj-pharmacy', 'Bug Fix', 'today', 'critical', NOW(), 2, 0, '{"bug","print","pdf"}', 'Reported by XYZ Hospital. Urgent fix needed.', '[]'::jsonb, 0),
('task-3', 'Build authentication system for Client 1', 'JWT-based authentication with refresh tokens.', 'proj-client1', 'Feature Development', 'in-progress', 'high', NOW() + INTERVAL '7 days', 8, 3, '{"auth","jwt","security"}', 'Client is waiting for this.', '[{"id":"st-5","title":"Setup JWT library","completed":true},{"id":"st-6","title":"Login endpoint","completed":true},{"id":"st-7","title":"Refresh token","completed":false},{"id":"st-8","title":"Logout + blacklist","completed":false}]'::jsonb, 1),
('task-4', 'Prepare hospital deployment checklist', 'Checklist for XYZ Hospital system update next week.', 'proj-pharmacy', 'Deployment', 'this-week', 'high', NOW() + INTERVAL '3 days', 1, 0, '{"deployment","hospital"}', 'Hospital visit scheduled. Need DB migration script.', '[]'::jsonb, 0),
('task-5', 'Script: What is Retrieval Augmented Generation?', 'Write complete script for RAG explanation video.', 'proj-ai-content', 'Content', 'this-week', 'medium', NOW() + INTERVAL '4 days', 2, 0, '{"script","rag","ai"}', 'Wednesday evening session.', '[]'::jsonb, 1),
('task-6', 'Solve Two Sum problem', 'LeetCode #1 - Two Sum. Understand, implement, optimize.', 'proj-leetcode', 'LeetCode', 'today', 'medium', NOW(), 1.5, 0, '{"arrays","hash-map","easy"}', '', '[]'::jsonb, 1),
('task-7', 'API pagination for Client 2', 'Implement cursor-based pagination for the products API.', 'proj-client2', 'Feature Development', 'backlog', 'medium', NOW() + INTERVAL '14 days', 4, 0, '{"api","pagination","python"}', '', '[]'::jsonb, 0),
('task-8', 'Write weekly review', 'Complete this week engineering review and planning.', NULL, 'Personal', 'backlog', 'medium', NOW() + INTERVAL '6 days', 1, 0, '{"review","planning"}', 'Sunday evening', '[]'::jsonb, 0)
ON CONFLICT (id) DO NOTHING;

-- Hospital Visits
INSERT INTO hospital_visits (id, hospital, date, start_time, end_time, travel_time_minutes, purpose, project_id, system_being_updated, deployment_tasks, notes, status) VALUES
('visit-1', 'XYZ General Hospital', NOW() + INTERVAL '5 days', '09:00', '12:00', 45, 'System Update & Database Migration', 'proj-pharmacy', 'Pharmacy Management System v2.4.1', '{"Backup existing database","Run migration scripts","Update application binaries","Verify all modules","Test prescription workflow","Sign-off with pharmacy staff"}', 'Bring laptop + deployment USB. Contact: Dr. Perera ext. 234.', 'scheduled')
ON CONFLICT (id) DO NOTHING;

-- Buffer Blocks
INSERT INTO buffer_blocks (id, title, day_of_week, start_time, end_time, duration_minutes, used_minutes, notes) VALUES
('buffer-friday', 'Reserved Buffer — Friday', 5, '18:30', '20:30', 120, 45, 'Keep free for hospital visits, urgent client requests, production issues.')
ON CONFLICT (id) DO NOTHING;

-- Content Items
INSERT INTO content_items (id, title, topic, type, platform, status, script, description, hashtags, thumbnail_done, caption_done, estimated_minutes, tags) VALUES
('content-1', 'What is RAG? (Retrieval Augmented Generation Explained)', 'RAG / LLM Engineering', 'long-form', '{"youtube"}', 'script', '', 'Complete explanation of RAG from first principles.', '{"#AI","#MachineLearning","#RAG","#LLM"}', false, false, 15, '{"rag","llm","ai"}'),
('content-2', 'Transformers Explained Simply', 'Deep Learning / Transformers', 'long-form', '{"youtube"}', 'idea', '', 'Demystifying the transformer architecture.', '{"#AI","#DeepLearning","#Transformers"}', false, false, 20, '{"transformers","deep-learning"}'),
('content-3', 'Vector Databases for Engineers', 'Vector Search / Embeddings', 'long-form', '{"youtube"}', 'idea', '', 'Practical guide to vector databases.', '{"#VectorDB","#AI","#Engineering"}', false, false, 12, '{"vector-db","embeddings","ai"}'),
('content-4', 'Two Sum - LeetCode #1 Solution', 'LeetCode / Algorithms', 'short-form', '{"youtube","tiktok"}', 'recorded', '', 'LeetCode Two Sum solution with optimization.', '{"#LeetCode","#Algorithms","#CodingInterview"}', false, false, 8, '{"leetcode","algorithms"}'),
('content-5', 'What is a Circuit Breaker Pattern?', 'Distributed Systems', 'short-form', '{"youtube","instagram"}', 'published', '', 'Quick explanation of the circuit breaker pattern.', '{"#SystemDesign","#DistributedSystems","#SoftwareEngineering"}', true, true, 5, '{"circuit-breaker","distributed-systems"}')
ON CONFLICT (id) DO NOTHING;

-- LeetCode Problems
INSERT INTO leetcode_problems (id, name, leetcode_id, difficulty, topic, language, status, started_at, solved_at, brute_force_approach, optimized_approach, time_complexity, space_complexity, notes, code, video_status, tags) VALUES
('lc-1', 'Two Sum', 1, 'easy', 'Arrays & Hashing', 'Java', 'done', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', 'Nested loops O(n²)', 'HashMap for O(n) lookup', 'O(n)', 'O(n)', 'Classic intro problem. HashMaps are key.', 'public int[] twoSum(int[] nums, int target) {\n    Map<Integer, Integer> map = new HashMap<>();\n    for (int i = 0; i < nums.length; i++) {\n        int complement = target - nums[i];\n        if (map.containsKey(complement)) {\n            return new int[]{map.get(complement), i};\n        }\n        map.put(nums[i], i);\n    }\n    return new int[]{};\n}', 'published', '{"arrays","hash-map","easy"}'),
('lc-2', 'Valid Parentheses', 20, 'easy', 'Stack', 'Java', 'code', NOW() - INTERVAL '5 days', NULL, 'Count opens and closes', 'Stack-based matching', 'O(n)', 'O(n)', 'Classic stack problem.', NULL, 'not-started', '{"stack","easy"}'),
('lc-3', 'Group Anagrams', 49, 'medium', 'Arrays & Hashing', 'Java', 'understand', NOW() - INTERVAL '2 days', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'not-started', '{"arrays","hash-map","sorting","medium"}'),
('lc-4', 'Binary Search', 704, 'easy', 'Binary Search', 'Java', 'done', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days', 'Linear scan O(n)', 'Binary search O(log n)', 'O(log n)', 'O(1)', NULL, NULL, 'not-started', '{"binary-search","easy"}'),
('lc-5', 'Longest Substring Without Repeating Characters', 3, 'medium', 'Sliding Window', 'Java', 'optimize', NOW() - INTERVAL '3 days', NULL, 'Nested loops O(n³)', 'Sliding window with HashSet', 'O(n)', 'O(min(m,n))', NULL, NULL, 'not-started', '{"sliding-window","hash-set","medium"}')
ON CONFLICT (id) DO NOTHING;

-- Learning Courses
INSERT INTO learning_courses (id, name, platform, total_lessons, completed_lessons, total_hours, completed_hours, current_lesson, notes, target_completion_date, category, tags) VALUES
('course-1', 'Udemy Course 1', 'Udemy', 54, 42, 18, 14, 'Section 8: Advanced Patterns', 'Excellent course. Take notes on each section.', NOW() + INTERVAL '21 days', 'udemy', '{"programming","backend"}'),
('course-2', 'Udemy Course 2', 'Udemy', 38, 12, 12, 3.5, 'Section 3: Core Concepts', 'Moving through this steadily.', NOW() + INTERVAL '45 days', 'udemy', '{"ml","python"}')
ON CONFLICT (id) DO NOTHING;

-- Knowledge Topics
INSERT INTO knowledge_topics (id, name, category, description, concept_count, color) VALUES
('topic-cs', 'Computer Science', 'computer-science', 'Fundamental CS concepts', 8, '#6366F1'),
('topic-backend', 'Backend Engineering', 'backend', 'REST, APIs, caching, queues', 9, '#3B82F6'),
('topic-java', 'Java & JVM', 'java', 'Java internals and best practices', 5, '#F59E0B'),
('topic-db', 'Databases', 'databases', 'SQL, indexing, transactions, replication', 7, '#10B981'),
('topic-net', 'Networking', 'networking', 'TCP, HTTP, DNS, TLS', 4, '#06B6D4'),
('topic-dist', 'Distributed Systems', 'distributed-systems', 'CAP, consistency, messaging', 8, '#8B5CF6'),
('topic-arch', 'Architecture', 'architecture', 'Patterns, trade-offs, design', 6, '#EF4444'),
('topic-sec', 'Security', 'security', 'Auth, encryption, common attacks', 5, '#F97316'),
('topic-cloud', 'Cloud & DevOps', 'cloud-devops', 'Docker, K8s, CI/CD, cloud', 4, '#14B8A6'),
('topic-mlai', 'ML / AI Engineering', 'ml-ai', 'Machine learning and AI systems', 7, '#00FF9C')
ON CONFLICT (id) DO NOTHING;

-- Knowledge Concepts
INSERT INTO knowledge_concepts (id, name, topic_id, category, definition, why_it_exists, how_it_works, when_to_use, when_not_to_use, real_world_example, code_example, common_mistakes, first_principles, confidence, review_count, correct_count, incorrect_count, current_interval_days, next_review_date, tags) VALUES
('concept-1', 'Database Index', 'topic-db', 'databases', 'A data structure that improves the speed of data retrieval operations on a database table at the cost of additional storage and write overhead.', 'Without indexes, the database must scan every row (full table scan) to find matching records, which is O(n). Indexes enable O(log n) lookups for most queries.', 'Most indexes use B-Tree structures. The index stores a sorted copy of the column(s) with pointers back to the actual row.', 'Columns used frequently in WHERE, JOIN, ORDER BY clauses. Foreign keys. High-cardinality columns.', 'Small tables where full scan is fast. Low cardinality columns. When write performance is critical.', 'SELECT * FROM prescriptions WHERE patient_id = 123', 'CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);', 'Over-indexing. Not using composite indexes correctly.', 'The core problem: finding a row in a large table requires scanning all rows. A sorted secondary data structure makes this faster.', 78, 5, 4, 1, 14, NOW() + INTERVAL '3 days', '{"database","performance","sql"}'),
('concept-2', 'CAP Theorem', 'topic-dist', 'distributed-systems', 'In a distributed data store, you can only guarantee two of the three: Consistency, Availability, and Partition Tolerance.', 'Network partitions are unavoidable in distributed systems. The theorem forces architects to make explicit trade-off decisions.', 'During a network partition, the system must choose: stop responding (maintain consistency) or return potentially stale data (maintain availability).', 'Use when designing distributed data systems.', 'CAP is theoretical. In practice, PACELC also considers latency vs consistency.', 'During network split, CP (Zookeeper) refuses writes on minority partition. AP (Cassandra) accepts writes.', NULL, 'Treating CAP as binary. CAP ignores latency.', 'Network failures WILL happen. What happens during failure is the CAP choice.', 65, 3, 2, 1, 7, NOW() + INTERVAL '1 day', '{"distributed-systems","consistency","availability"}'),
('concept-3', 'B-Tree', 'topic-db', 'databases', 'A self-balancing tree data structure that maintains sorted data and allows searches, sequential access, insertions, and deletions in O(log n).', 'Database indexes need to be stored on disk efficiently. B-Trees minimize disk I/O by having high branching factor.', 'Unlike binary trees, B-Tree nodes store multiple keys. All leaves are at the same level.', 'Most relational databases use B-Trees or B+ Trees by default for indexes.', 'Hash indexes are better for exact equality lookups. LSM trees for write-heavy workloads.', NULL, NULL, 'Confusing B-Tree with Binary Search Tree.', NULL, 45, 2, 1, 1, 3, NOW(), '{"database","data-structures","algorithms"}'),
('concept-4', 'ACID Transactions', 'topic-db', 'databases', 'ACID guarantees database transactions are processed reliably: Atomicity, Consistency, Isolation, Durability.', 'Without ACID guarantees, concurrent transactions can corrupt data (partial writes, dirty reads, lost updates).', 'Atomicity: all-or-nothing. Consistency: constraints maintained. Isolation: concurrent tx dont interfere. Durability: committed data survives crashes.', 'Financial, medical, or critical data systems.', 'Extreme write throughput with eventual consistency tolerance.', 'Bank transfer: debit account A and credit account B must both succeed or both fail.', NULL, 'Assuming all databases are ACID compliant.', NULL, 72, 4, 3, 1, 14, NOW() + INTERVAL '7 days', '{"database","transactions","consistency"}'),
('concept-5', 'Circuit Breaker Pattern', 'topic-dist', 'distributed-systems', 'A design pattern that prevents an application from repeatedly trying to execute an operation that is likely to fail, allowing the system to recover without cascade failures.', 'In microservices, a slow downstream service causes thread exhaustion in the caller, leading to cascade failure across the system.', 'Three states: CLOSED (normal), OPEN (blocking calls, fast-fail), HALF-OPEN (testing recovery).', 'Service-to-service calls over network. High-traffic services.', 'Simple two-service systems with no cascade risk.', 'Payment service calls bank API. If bank API fails 50% in 10s, circuit opens for 60s.', NULL, 'Not setting appropriate thresholds. No fallback in OPEN state.', 'Isolate failure so one slow dependency does not take down the entire distributed system.', 85, 6, 5, 1, 30, NOW() + INTERVAL '15 days', '{"distributed-systems","resilience","patterns"}')
ON CONFLICT (id) DO NOTHING;

-- Interview Questions
INSERT INTO interview_questions (id, question, type, category, difficulty, model_answer, tags) VALUES
('iq-1', 'Why can''t a normal in-memory mutex coordinate access between two different application servers?', 'why', 'distributed-systems', 'medium', 'A mutex works by locking a region of shared memory within a single process. Multiple application servers run on different machines with completely isolated memory spaces. To coordinate between servers, you need an external shared coordination system like Redis (SETNX), ZooKeeper, or database row-level locks.', '{"distributed-systems","concurrency","locks"}'),
('iq-2', 'Your API latency increased from 200ms to 2 seconds. How would you investigate?', 'scenario', 'backend', 'hard', '1. Check monitoring dashboards (APM, metrics). 2. Look at error rates. 3. Check slow query logs on the database. 4. Check downstream service latencies. 5. Inspect CPU, memory, DB connections. 6. Check recent deployments and git history. 7. Trace requests with distributed tracing (OpenTelemetry).', '{"debugging","performance","backend"}'),
('iq-3', 'When is accuracy a misleading metric in machine learning?', 'ml', 'ml-ai', 'medium', 'Accuracy is misleading under class imbalance. In fraud detection with 99% non-fraud, a naive model predicting non-fraud always achieves 99% accuracy but catches zero fraud cases. Use Precision, Recall, F1, or PR-AUC instead.', '{"ml","evaluation","metrics"}'),
('iq-4', 'Design a distributed job processing system', 'system-design', 'system-design', 'hard', 'Key components: 1. Job Queue (Kafka/RabbitMQ). 2. Workers consuming with at-least-once semantics. 3. Idempotency keys to avoid duplicate execution. 4. Dead Letter Queue for poison pills. 5. Status store (Redis/Postgres). 6. Scheduler for delayed jobs. 7. Exponential backoff retry with jitter.', '{"system-design","distributed-systems","queues"}')
ON CONFLICT (id) DO NOTHING;

-- Architecture Patterns
INSERT INTO architecture_patterns (id, name, problem, context, solution, advantages, disadvantages, when_to_use, when_not_to_use, failure_modes, real_world_example, related_patterns, tags, confidence) VALUES
('arch-1', 'Circuit Breaker', 'Downstream service failures cause cascade failures in the calling service due to thread exhaustion and timeout accumulation.', 'Microservices architecture where Service A calls Service B over network.', 'Wrap service calls in a circuit breaker that tracks failure rates. When failures exceed threshold, open the circuit and fast-fail all calls for a recovery window.', '{"Prevents cascade failures","Fast failure response","Allows downstream to recover","Improves system resilience"}', '{"Adds complexity","False positives may open circuit unnecessarily","Requires careful threshold tuning"}', '{"Service-to-service calls over network","High traffic systems"}', '{"Local function calls","Simple low-traffic architectures"}', '{"Circuit opens too aggressively","No fallback provided in OPEN state"}', 'Netflix Hystrix, Resilience4j', '{"Bulkhead","Retry with Exponential Backoff","Timeout"}', '{"resilience","distributed-systems","microservices"}', 85),
('arch-2', 'Saga Pattern', 'Maintaining data consistency across multiple microservices without expensive distributed 2PC transactions.', 'Multi-service workflows like order checkout with payment, inventory, and fulfillment.', 'Break the business transaction into local transactions. Each step publishes an event triggering the next step. If a step fails, compensating transactions undo earlier work.', '{"No distributed locks needed","Services remain loosely coupled","Scalable across databases"}', '{"Complex error recovery","Eventual consistency instead of ACID isolation","Compensating transactions can be difficult to author"}', '{"Multi-service business transactions","Long-running workflows"}', '{"Single database operations","Strict instantaneous consistency requirements"}', '{"Missing compensating action","Compensation failure requires manual intervention"}', 'Uber trip lifecycle, E-commerce order checkout', '{"Outbox Pattern","Event Sourcing","CQRS"}', '{"distributed-systems","consistency","microservices"}', 60)
ON CONFLICT (id) DO NOTHING;
