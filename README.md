# Personal Engineering Operating System (Engineering OS)

A production-quality personal productivity, workload management, active recall, learning retention, and engineering growth system for Senior Software Engineers and ML/AI Engineers.

Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, and **Recharts**. Designed for single-click deployment to **Vercel**.

---

## 💡 Core Philosophy

```text
DO LESS
FINISH MORE
REMEMBER BETTER
UNDERSTAND DEEPLY
```

Engineering OS operates as your private command center, unifying professional employment, freelance client projects, hospital deployments, AI educational content creation, LeetCode algorithm mastery, and senior software/AI engineering knowledge retention.

---

## 🚀 Key Modules & Capabilities

1. **Dashboard (`/dashboard`)**:
   - Immediate daily situational awareness: What to do today, timeline, hours remaining, overload alert, upcoming hospital deployments, due flashcards, and daily growth goals.
2. **Capacity Engine & Overload Detection**:
   - 168-hour weekly budget calculations.
   - Calculates available, planned, used, free, and overload hours across 7 simultaneous tracks.
   - Intelligent rescheduling recommendations when capacity is exceeded.
3. **Reserved Buffer Protection**:
   - First-class 4-hour flexible time block (default Friday 18:30–20:30) protected for urgent hospital visits, client escalations, and production bugs.
4. **Hospital Deployments & Field Visits (`/calendar`)**:
   - Track medical center site visits, software version, deployment task checklists, and travel times (roundtrip travel time counts directly against weekly workload).
5. **Tasks Kanban (`/tasks`)**:
   - 7-stage workflow: `BACKLOG` → `THIS WEEK` → `TODAY` → `IN PROGRESS` → `BLOCKED` → `TESTING` → `DONE`.
   - Drag-and-drop support, subtask checklists, and priority tagging.
6. **Freelance Management (`/clients` & `/projects`)**:
   - Client contact tracking, project revenue, payment statuses, and capacity impact check when onboarding new client contracts.
7. **Time Tracking (`/time-tracking`)**:
   - Live session timer with start/stop, manual block entry, duration variance analysis, and weekly distribution charts.
8. **AI Content Studio (`/content`)**:
   - Pipeline funnel: `Idea` → `Research` → `Script` → `Ready to Record` → `Recorded` → `Editing` → `Ready` → `Published`.
   - Thumbnail and caption tracking to eliminate backlog bloat.
9. **LeetCode System (`/leetcode`)**:
   - 10-step problem-to-content learning pipeline: `Understand` → `Brute Force` → `Optimize` → `Code` → `Test` → `Explain` → `Record` → `Edit` → `Publish` → `Done`.
   - Time & space complexity benchmarks and Java code implementations.
10. **Active Recall & Spaced Repetition (`/knowledge`)**:
    - Structured knowledge cards: Definition, Why it exists, How it works, When to use, When NOT to use, First Principles, and Common Mistakes.
    - Spaced repetition intervals (`Again`, `Hard`, `Good`, `Easy`) with next-review scheduling.
    - Interactive Interview Mode (`/knowledge/interview`) with self-assessments.
    - Architecture Pattern Library (`/knowledge/architecture`).
11. **Weekly Review & Reflection (`/weekly-review`)**:
    - Retrospective on work, client progress, content released, and reflection questions.
12. **Analytics (`/analytics`)**:
    - Recharts data visualizations for capacity allocation, confidence buckets, content conversion, and deterministic rule-based insights.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16.3+ (App Router)
- **UI Library**: React 19, Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Typing & Validation**: TypeScript (Strict mode), Zod
- **Date Utilities**: Date-fns
- **Theme**: Premium developer dark theme (`#0F172A` background, `#091B21` cards, `#1e3a5f` borders, `#00FF9C` accent)

---

## 📦 Project Structure

```text
engineering-os/
├── app/
│   ├── layout.tsx             # Root layout with theme & StoreProvider
│   ├── globals.css            # Custom theme variables & utilities
│   ├── page.tsx               # Redirect to dashboard
│   ├── dashboard/             # Engineering OS Dashboard
│   ├── planner/               # Weekly Workload & Overload Planner
│   ├── calendar/              # Calendar & Hospital Field Deployments
│   ├── tasks/                 # Kanban Task Management
│   ├── projects/              # Projects Management
│   ├── clients/               # Clients Directory & Revenue Tracking
│   ├── time-tracking/         # Real-time Timer & Session Logs
│   ├── content/               # AI Content Studio Pipeline
│   ├── leetcode/              # LeetCode Problem Pipeline
│   ├── learning/              # Udemy Courses & Progress
│   ├── knowledge/             # Senior Knowledge Base & Topics
│   │   ├── topics/            # Category Explorer
│   │   ├── reviews/           # Spaced Repetition Flashcards
│   │   ├── interview/         # Interactive Technical Interview Prep
│   │   └── architecture/      # Architecture Pattern Library
│   ├── analytics/             # Charts & Deterministic Insights
│   ├── weekly-review/         # Weekly Growth Retrospective
│   └── settings/              # Capacity & Profile Preferences
├── components/
│   ├── layout/                # AppShell, Sidebar, TopBar
│   ├── dashboard/             # Dashboard Widgets, Timeline, Capacity
│   ├── tasks/                 # TasksBoard, TaskCards, Modals
│   ├── projects/              # ProjectsPage
│   ├── clients/               # ClientsPage
│   ├── content/               # ContentStudio
│   ├── leetcode/              # LeetCodePage
│   ├── learning/              # LearningPage
│   ├── time-tracking/         # TimeTrackingPage
│   ├── knowledge/             # KnowledgeDashboard, Flashcards, Interview, Patterns
│   ├── analytics/             # AnalyticsPage
│   ├── weekly-review/         # WeeklyReviewPage
│   ├── planner/               # PlannerPage
│   ├── calendar/              # CalendarPage
│   └── settings/              # SettingsPage
├── lib/
│   ├── store.tsx              # React Context store with localStorage persistence
│   ├── calculations.ts        # Capacity, review scheduling, and formatting logic
│   ├── utils.ts               # Classnames helper (cn) & UUID generators
│   └── data/
│       └── seed.ts            # Realistic seed data for Biotech, Clients, Knowledge
├── types/
│   └── index.ts               # Strongly-typed models and enums
└── .env.example               # Environment variables template
```

---

## ⚡ Getting Started

### 1. Installation

```bash
cd engineering-os
npm install
```

### 2. Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build

```bash
npm run build
npm run start
```

---

## ☁️ Vercel Deployment

This project is architected for zero-configuration deployment to Vercel:

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Import the project into the [Vercel Dashboard](https://vercel.com/new).
3. The framework preset will automatically detect **Next.js**.
4. Click **Deploy**. No special environment variables are needed for initial operation.

---

## 🔒 Privacy & Local Sovereignty

Engineering OS operates locally in the user's browser via indexed storage with automated ISO date hydration. No tracking pixels, telemetry, or external third-party APIs are executed, maintaining strict client confidentiality for hospital and medical data.
