-- Add export template settings to courses table
-- Allows courses to specify a default template for exports

ALTER TABLE courses ADD COLUMN export_template_type TEXT
  CHECK (export_template_type IS NULL OR export_template_type IN ('pptx', 'revealjs'));

ALTER TABLE courses ADD COLUMN export_template_id TEXT;

-- Create an index for queries filtering by template type
CREATE INDEX IF NOT EXISTS idx_courses_export_template ON courses(export_template_type)
  WHERE export_template_type IS NOT NULL;
