-- Initial schema for Delivery API
-- Creates tables for learners, progress tracking, and assessment results

-- ============================================================================
-- Learner Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS learners (
  id TEXT PRIMARY KEY,
  external_id TEXT,
  display_name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS learner_enrollments (
  id TEXT PRIMARY KEY,
  learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  progression_path_id TEXT,
  enrolled_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,
  UNIQUE (learner_id, course_id)
);

-- ============================================================================
-- Progress Tracking Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS lesson_progress (
  id TEXT PRIMARY KEY,
  learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,
  time_spent_seconds INTEGER DEFAULT 0,
  UNIQUE (learner_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS activity_progress (
  id TEXT PRIMARY KEY,
  learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  activity_id TEXT NOT NULL,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,
  responses TEXT DEFAULT '{}',
  UNIQUE (learner_id, activity_id)
);

-- ============================================================================
-- Competency Demonstration Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS competency_demonstrations (
  id TEXT PRIMARY KEY,
  learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  competency_id TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('not_demonstrated', 'partial', 'competent', 'strong')),
  demonstrated_at TEXT NOT NULL DEFAULT (datetime('now')),
  evidence_type TEXT NOT NULL CHECK (evidence_type IN (
    'scenario_response', 'artifact', 'observation', 'self_assessment'
  )),
  evidence_id TEXT,
  evaluator_notes TEXT,
  evaluated_by TEXT
);

-- ============================================================================
-- Assessment Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS assessment_sessions (
  id TEXT PRIMARY KEY,
  learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  scenario_id TEXT NOT NULL,
  variant_type TEXT NOT NULL CHECK (variant_type IN ('interview', 'assessment', 'ongoing')),
  mode TEXT NOT NULL CHECK (mode IN ('realtime', 'async')),
  status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,
  conversation_history TEXT DEFAULT '[]',
  submitted_response TEXT,
  evaluation TEXT
);

CREATE TABLE IF NOT EXISTS assessment_results (
  id TEXT PRIMARY KEY,
  learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  assessment_id TEXT,
  scenario_id TEXT,
  activity_id TEXT,
  score REAL,
  max_score REAL,
  completed_at TEXT NOT NULL DEFAULT (datetime('now')),
  responses TEXT DEFAULT '{}',
  rubric_evaluations TEXT DEFAULT '[]'
);

-- ============================================================================
-- Learning Session Tables (for agent conversation tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS learning_sessions (
  id TEXT PRIMARY KEY,
  learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  lesson_id TEXT,
  agent_type TEXT CHECK (agent_type IN ('teaching', 'coaching', 'assessment')),
  mastra_thread_id TEXT,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  ended_at TEXT
);

-- ============================================================================
-- Feedback Loop Tables (for course improvement data)
-- ============================================================================

CREATE TABLE IF NOT EXISTS learner_questions (
  id TEXT PRIMARY KEY,
  learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  lesson_id TEXT,
  competency_id TEXT,
  question_text TEXT NOT NULL,
  question_category TEXT CHECK (question_category IN (
    'training_gap', 'framework_gap', 'process_gap', 'unmapped'
  )),
  asked_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved INTEGER DEFAULT 0
);

-- ============================================================================
-- Async Submission Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS async_submissions (
  id TEXT PRIMARY KEY,
  learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  scenario_id TEXT NOT NULL,
  variant_type TEXT NOT NULL CHECK (variant_type IN ('interview', 'assessment', 'ongoing')),
  response TEXT NOT NULL,
  submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'evaluating', 'evaluated')),
  evaluation TEXT
);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_enrollments_learner ON learner_enrollments(learner_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON learner_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_learner ON lesson_progress(learner_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_course ON lesson_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_demonstrations_learner ON competency_demonstrations(learner_id);
CREATE INDEX IF NOT EXISTS idx_demonstrations_competency ON competency_demonstrations(competency_id);
CREATE INDEX IF NOT EXISTS idx_demonstrations_level ON competency_demonstrations(level);
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_learner ON assessment_sessions(learner_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_learner ON assessment_results(learner_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_course ON assessment_results(course_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_learner ON learning_sessions(learner_id);
CREATE INDEX IF NOT EXISTS idx_learner_questions_course ON learner_questions(course_id);
CREATE INDEX IF NOT EXISTS idx_async_submissions_learner ON async_submissions(learner_id);
CREATE INDEX IF NOT EXISTS idx_async_submissions_status ON async_submissions(status);
