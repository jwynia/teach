-- Migration 003: Add slide_content to lessons
-- Separate field for presentation-ready content (distinct from narrative speaker notes)

ALTER TABLE lessons ADD COLUMN slide_content TEXT NOT NULL DEFAULT '';
