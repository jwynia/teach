-- Document generation tables
-- Tracks generated documents and batch generation jobs

-- ============================================================================
-- Generated Documents Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS generated_documents (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  unit_id TEXT REFERENCES units(id) ON DELETE CASCADE,
  lesson_id TEXT REFERENCES lessons(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'lecture-slides', 'student-handout', 'instructor-guide',
    'assessment-worksheet', 'grading-rubric'
  )),
  template_id TEXT,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  checksum TEXT NOT NULL,
  metadata TEXT NOT NULL DEFAULT '{}',
  generated_at TEXT NOT NULL DEFAULT (datetime('now')),
  generated_by TEXT
);

-- ============================================================================
-- Batch Generation Jobs Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_generation_jobs (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_ids TEXT NOT NULL DEFAULT '[]',
  document_types TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL CHECK (status IN ('queued', 'processing', 'complete', 'failed')),
  progress_current INTEGER NOT NULL DEFAULT 0,
  progress_total INTEGER NOT NULL DEFAULT 0,
  started_at TEXT,
  completed_at TEXT,
  results TEXT,
  errors TEXT
);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_generated_documents_course ON generated_documents(course_id);
CREATE INDEX IF NOT EXISTS idx_generated_documents_lesson ON generated_documents(lesson_id);
CREATE INDEX IF NOT EXISTS idx_generated_documents_type ON generated_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_document_generation_jobs_course ON document_generation_jobs(course_id);
CREATE INDEX IF NOT EXISTS idx_document_generation_jobs_status ON document_generation_jobs(status);
