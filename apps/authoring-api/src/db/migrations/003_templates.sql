-- Template management tables
-- Stores user templates and validation results for PPTX/RevealJS generation

-- ============================================================================
-- Templates Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  created_by_user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('pptx', 'revealjs')),
  document_types TEXT NOT NULL DEFAULT '[]', -- JSON array of supported doc types
  file_path TEXT NOT NULL,
  manifest TEXT NOT NULL DEFAULT '{}', -- JSON manifest of placeholders/elements
  version TEXT NOT NULL DEFAULT '1.0',
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  download_count INTEGER NOT NULL DEFAULT 0,
  rating_average REAL,
  tags TEXT DEFAULT '[]', -- JSON array of tags
  validation_status TEXT NOT NULL CHECK (validation_status IN ('pending', 'valid', 'invalid')) DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- Template Validations Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS template_validations (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  validation_results TEXT NOT NULL DEFAULT '{}', -- JSON validation results
  has_required_placeholders BOOLEAN NOT NULL DEFAULT false,
  has_required_elements BOOLEAN NOT NULL DEFAULT false,
  llm_enhanced_errors TEXT DEFAULT '[]', -- JSON array of LLM-enhanced error messages
  validated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- Template Ratings Table  
-- ============================================================================

CREATE TABLE IF NOT EXISTS template_ratings (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (template_id, user_id)
);

-- ============================================================================
-- Template Usage Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS template_usage (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  document_id TEXT REFERENCES generated_documents(id) ON DELETE SET NULL,
  used_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_templates_user ON templates(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_templates_type ON templates(type);
CREATE INDEX IF NOT EXISTS idx_templates_public ON templates(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_templates_featured ON templates(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_template_validations_template ON template_validations(template_id);
CREATE INDEX IF NOT EXISTS idx_template_ratings_template ON template_ratings(template_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_template ON template_usage(template_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_user ON template_usage(user_id);