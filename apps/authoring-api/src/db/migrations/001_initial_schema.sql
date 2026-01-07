-- Initial schema for Authoring API
-- Creates tables for courses, competencies, scenarios, and progression models

-- ============================================================================
-- Core Course Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_audiences TEXT NOT NULL DEFAULT '["general"]',
  default_progression_path_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS units (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  unit_id TEXT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('markdown', 'html')),
  content_body TEXT NOT NULL DEFAULT '',
  audience_layer TEXT CHECK (audience_layer IN ('general', 'practitioner', 'specialist')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('practice', 'quiz', 'discussion', 'scenario_assessment')),
  title TEXT NOT NULL,
  instructions TEXT NOT NULL,
  audience_layer TEXT CHECK (audience_layer IN ('general', 'practitioner', 'specialist')),
  scenario_id TEXT,
  data TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- Competency Framework Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS competency_clusters (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  prefix TEXT NOT NULL,
  description TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS competencies (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  cluster_id TEXT REFERENCES competency_clusters(id) ON DELETE SET NULL,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  audience_layer TEXT NOT NULL CHECK (audience_layer IN ('general', 'practitioner', 'specialist')),
  "order" INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (course_id, code)
);

CREATE TABLE IF NOT EXISTS competency_dependencies (
  id TEXT PRIMARY KEY,
  competency_id TEXT NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
  required_competency_id TEXT NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
  rationale TEXT,
  UNIQUE (competency_id, required_competency_id)
);

CREATE TABLE IF NOT EXISTS rubric_criteria (
  id TEXT PRIMARY KEY,
  competency_id TEXT NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
  level TEXT NOT NULL CHECK (level IN ('not_demonstrated', 'partial', 'competent', 'strong')),
  description TEXT NOT NULL,
  indicators TEXT NOT NULL DEFAULT '[]',
  UNIQUE (competency_id, level)
);

-- ============================================================================
-- Scenario Assessment Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS scenarios (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  core_decision TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS scenario_variants (
  id TEXT PRIMARY KEY,
  scenario_id TEXT NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  variant TEXT NOT NULL CHECK (variant IN ('interview', 'assessment', 'ongoing')),
  content TEXT NOT NULL,
  context_notes TEXT,
  expected_duration INTEGER,
  follow_up_questions TEXT DEFAULT '[]',
  UNIQUE (scenario_id, variant)
);

CREATE TABLE IF NOT EXISTS scenario_rubrics (
  id TEXT PRIMARY KEY,
  scenario_id TEXT NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  good_response_indicators TEXT NOT NULL DEFAULT '[]',
  red_flags TEXT NOT NULL DEFAULT '[]',
  partial_indicators TEXT DEFAULT '[]',
  strong_indicators TEXT DEFAULT '[]',
  UNIQUE (scenario_id)
);

CREATE TABLE IF NOT EXISTS scenario_competency_map (
  scenario_id TEXT NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  competency_id TEXT NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
  PRIMARY KEY (scenario_id, competency_id)
);

-- ============================================================================
-- Progression Model Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS progression_paths (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_role TEXT,
  description TEXT NOT NULL,
  minimum_viable_competency_ids TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS progression_steps (
  id TEXT PRIMARY KEY,
  path_id TEXT NOT NULL REFERENCES progression_paths(id) ON DELETE CASCADE,
  competency_id TEXT NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
  "order" INTEGER NOT NULL,
  estimated_hours REAL,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS skip_logic_rules (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  condition TEXT NOT NULL,
  evidence_type TEXT NOT NULL CHECK (evidence_type IN (
    'scenario_response', 'artifact', 'observation', 'self_assessment',
    'certification', 'portfolio', 'interview'
  )),
  skippable_competency_ids TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- Junction Tables for Content-Competency Mapping
-- ============================================================================

CREATE TABLE IF NOT EXISTS unit_competencies (
  unit_id TEXT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  competency_id TEXT NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
  PRIMARY KEY (unit_id, competency_id)
);

CREATE TABLE IF NOT EXISTS lesson_competencies (
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  competency_id TEXT NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
  PRIMARY KEY (lesson_id, competency_id)
);

CREATE TABLE IF NOT EXISTS activity_competencies (
  activity_id TEXT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  competency_id TEXT NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
  PRIMARY KEY (activity_id, competency_id)
);

CREATE TABLE IF NOT EXISTS lesson_prerequisites (
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  prerequisite_lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  PRIMARY KEY (lesson_id, prerequisite_lesson_id)
);

-- ============================================================================
-- Agent Configuration Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_configs (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('teaching', 'coaching', 'assessment', 'curriculum')),
  instructions TEXT NOT NULL,
  model TEXT NOT NULL,
  temperature REAL,
  tools TEXT DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (course_id, role)
);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_units_course ON units(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_unit ON lessons(unit_id);
CREATE INDEX IF NOT EXISTS idx_activities_lesson ON activities(lesson_id);
CREATE INDEX IF NOT EXISTS idx_competencies_course ON competencies(course_id);
CREATE INDEX IF NOT EXISTS idx_competencies_cluster ON competencies(cluster_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_course ON scenarios(course_id);
CREATE INDEX IF NOT EXISTS idx_progression_paths_course ON progression_paths(course_id);
CREATE INDEX IF NOT EXISTS idx_competency_clusters_course ON competency_clusters(course_id);
