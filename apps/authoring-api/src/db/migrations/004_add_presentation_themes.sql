-- Add presentation themes table and course theme settings
-- Enables custom color palettes and section-specific backgrounds for RevealJS presentations

-- ============================================================================
-- Presentation Themes Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS presentation_themes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_builtin INTEGER NOT NULL DEFAULT 0,

  -- Color palette (JSON with shade scales)
  -- Structure: {primary: {50..950}, secondary?: {50..950}, accent?: {50..950}, neutral: {50..950}}
  palette TEXT NOT NULL,

  -- Section-specific background colors (JSON)
  -- Structure: {title, unit, content, summary, quote, question}
  section_colors TEXT NOT NULL,

  -- Typography settings (JSON, optional)
  -- Structure: {displayFont, bodyFont}
  typography TEXT,

  -- RevealJS base theme to extend
  base_theme TEXT NOT NULL DEFAULT 'black' CHECK (base_theme IN ('black', 'white', 'league', 'beige', 'night', 'serif', 'simple', 'solarized', 'blood', 'moon')),

  -- Additional CSS overrides
  custom_css TEXT,

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_presentation_themes_builtin ON presentation_themes(is_builtin);
CREATE INDEX IF NOT EXISTS idx_presentation_themes_name ON presentation_themes(name);

-- ============================================================================
-- Add theme columns to courses table
-- ============================================================================

ALTER TABLE courses ADD COLUMN presentation_theme_id TEXT REFERENCES presentation_themes(id) ON DELETE SET NULL;
ALTER TABLE courses ADD COLUMN theme_overrides TEXT;

-- ============================================================================
-- Seed built-in themes
-- ============================================================================

-- 1. Midnight Professional (Dark, Corporate)
INSERT INTO presentation_themes (id, name, description, is_builtin, palette, section_colors, typography, base_theme) VALUES (
  'theme-midnight-professional',
  'Midnight Professional',
  'Dark corporate theme with deep blues. Ideal for business and technical presentations.',
  1,
  '{
    "primary": {"50": "#eff6ff", "100": "#dbeafe", "200": "#bfdbfe", "300": "#93c5fd", "400": "#60a5fa", "500": "#3b82f6", "600": "#2563eb", "700": "#1d4ed8", "800": "#1e40af", "900": "#1e3a8a", "950": "#172554"},
    "secondary": {"50": "#f0fdfa", "100": "#ccfbf1", "200": "#99f6e4", "300": "#5eead4", "400": "#2dd4bf", "500": "#14b8a6", "600": "#0d9488", "700": "#0f766e", "800": "#115e59", "900": "#134e4a", "950": "#042f2e"},
    "accent": {"50": "#faf5ff", "100": "#f3e8ff", "200": "#e9d5ff", "300": "#d8b4fe", "400": "#c084fc", "500": "#a855f7", "600": "#9333ea", "700": "#7c3aed", "800": "#6b21a8", "900": "#581c87", "950": "#3b0764"},
    "neutral": {"50": "#f8fafc", "100": "#f1f5f9", "200": "#e2e8f0", "300": "#cbd5e1", "400": "#94a3b8", "500": "#64748b", "600": "#475569", "700": "#334155", "800": "#1e293b", "900": "#0f172a", "950": "#020617"}
  }',
  '{"title": "#0f172a", "unit": "#1e3a8a", "content": "#1e293b", "summary": "#134e4a", "quote": "#3b0764", "question": "#581c87"}',
  '{"displayFont": "Space Grotesk, sans-serif", "bodyFont": "Inter, sans-serif"}',
  'night'
);

-- 2. Warm Keynote (Light, Inviting)
INSERT INTO presentation_themes (id, name, description, is_builtin, palette, section_colors, typography, base_theme) VALUES (
  'theme-warm-keynote',
  'Warm Keynote',
  'Light warm theme with amber accents. Friendly and approachable for general audiences.',
  1,
  '{
    "primary": {"50": "#fffbeb", "100": "#fef3c7", "200": "#fde68a", "300": "#fcd34d", "400": "#fbbf24", "500": "#f59e0b", "600": "#d97706", "700": "#b45309", "800": "#92400e", "900": "#78350f", "950": "#451a03"},
    "secondary": {"50": "#fff7ed", "100": "#ffedd5", "200": "#fed7aa", "300": "#fdba74", "400": "#fb923c", "500": "#f97316", "600": "#ea580c", "700": "#c2410c", "800": "#9a3412", "900": "#7c2d12", "950": "#431407"},
    "accent": {"50": "#fdf4ff", "100": "#fae8ff", "200": "#f5d0fe", "300": "#f0abfc", "400": "#e879f9", "500": "#d946ef", "600": "#c026d3", "700": "#a21caf", "800": "#86198f", "900": "#701a75", "950": "#4a044e"},
    "neutral": {"50": "#fafaf9", "100": "#f5f5f4", "200": "#e7e5e4", "300": "#d6d3d1", "400": "#a8a29e", "500": "#78716c", "600": "#57534e", "700": "#44403c", "800": "#292524", "900": "#1c1917", "950": "#0c0a09"}
  }',
  '{"title": "#fef3c7", "unit": "#fde68a", "content": "#fffbeb", "summary": "#fed7aa", "quote": "#fef3c7", "question": "#fef9c3"}',
  '{"displayFont": "Libre Baskerville, serif", "bodyFont": "DM Sans, sans-serif"}',
  'white'
);

-- 3. Forest Academic (Natural, Scholarly)
INSERT INTO presentation_themes (id, name, description, is_builtin, palette, section_colors, typography, base_theme) VALUES (
  'theme-forest-academic',
  'Forest Academic',
  'Natural green theme with scholarly feel. Perfect for educational and environmental topics.',
  1,
  '{
    "primary": {"50": "#f0fdf4", "100": "#dcfce7", "200": "#bbf7d0", "300": "#86efac", "400": "#4ade80", "500": "#22c55e", "600": "#16a34a", "700": "#15803d", "800": "#166534", "900": "#14532d", "950": "#052e16"},
    "secondary": {"50": "#ecfdf5", "100": "#d1fae5", "200": "#a7f3d0", "300": "#6ee7b7", "400": "#34d399", "500": "#10b981", "600": "#059669", "700": "#047857", "800": "#065f46", "900": "#064e3b", "950": "#022c22"},
    "accent": {"50": "#f0fdfa", "100": "#ccfbf1", "200": "#99f6e4", "300": "#5eead4", "400": "#2dd4bf", "500": "#14b8a6", "600": "#0d9488", "700": "#0f766e", "800": "#115e59", "900": "#134e4a", "950": "#042f2e"},
    "neutral": {"50": "#fafaf9", "100": "#f5f5f4", "200": "#e7e5e4", "300": "#d6d3d1", "400": "#a8a29e", "500": "#78716c", "600": "#57534e", "700": "#44403c", "800": "#292524", "900": "#1c1917", "950": "#0c0a09"}
  }',
  '{"title": "#14532d", "unit": "#166534", "content": "#f0fdf4", "summary": "#dcfce7", "quote": "#ecfdf5", "question": "#d1fae5"}',
  '{"displayFont": "Cormorant, serif", "bodyFont": "Source Sans Pro, sans-serif"}',
  'beige'
);

-- 4. Ocean Bold (Cool, Modern)
INSERT INTO presentation_themes (id, name, description, is_builtin, palette, section_colors, typography, base_theme) VALUES (
  'theme-ocean-bold',
  'Ocean Bold',
  'Cool modern theme with ocean blues. Great for tech and innovation presentations.',
  1,
  '{
    "primary": {"50": "#f0f9ff", "100": "#e0f2fe", "200": "#bae6fd", "300": "#7dd3fc", "400": "#38bdf8", "500": "#0ea5e9", "600": "#0284c7", "700": "#0369a1", "800": "#075985", "900": "#0c4a6e", "950": "#082f49"},
    "secondary": {"50": "#ecfeff", "100": "#cffafe", "200": "#a5f3fc", "300": "#67e8f9", "400": "#22d3ee", "500": "#06b6d4", "600": "#0891b2", "700": "#0e7490", "800": "#155e75", "900": "#164e63", "950": "#083344"},
    "accent": {"50": "#eff6ff", "100": "#dbeafe", "200": "#bfdbfe", "300": "#93c5fd", "400": "#60a5fa", "500": "#3b82f6", "600": "#2563eb", "700": "#1d4ed8", "800": "#1e40af", "900": "#1e3a8a", "950": "#172554"},
    "neutral": {"50": "#f8fafc", "100": "#f1f5f9", "200": "#e2e8f0", "300": "#cbd5e1", "400": "#94a3b8", "500": "#64748b", "600": "#475569", "700": "#334155", "800": "#1e293b", "900": "#0f172a", "950": "#020617"}
  }',
  '{"title": "#0c4a6e", "unit": "#0369a1", "content": "#082f49", "summary": "#0e7490", "quote": "#164e63", "question": "#1e40af"}',
  '{"displayFont": "Plus Jakarta Sans, sans-serif", "bodyFont": "Plus Jakarta Sans, sans-serif"}',
  'black'
);

-- 5. Sunset Vibrant (Warm, Energetic)
INSERT INTO presentation_themes (id, name, description, is_builtin, palette, section_colors, typography, base_theme) VALUES (
  'theme-sunset-vibrant',
  'Sunset Vibrant',
  'Warm energetic theme with sunset colors. Ideal for creative and motivational content.',
  1,
  '{
    "primary": {"50": "#fff7ed", "100": "#ffedd5", "200": "#fed7aa", "300": "#fdba74", "400": "#fb923c", "500": "#f97316", "600": "#ea580c", "700": "#c2410c", "800": "#9a3412", "900": "#7c2d12", "950": "#431407"},
    "secondary": {"50": "#fef2f2", "100": "#fee2e2", "200": "#fecaca", "300": "#fca5a5", "400": "#f87171", "500": "#ef4444", "600": "#dc2626", "700": "#b91c1c", "800": "#991b1b", "900": "#7f1d1d", "950": "#450a0a"},
    "accent": {"50": "#fefce8", "100": "#fef9c3", "200": "#fef08a", "300": "#fde047", "400": "#facc15", "500": "#eab308", "600": "#ca8a04", "700": "#a16207", "800": "#854d0e", "900": "#713f12", "950": "#422006"},
    "neutral": {"50": "#fafaf9", "100": "#f5f5f4", "200": "#e7e5e4", "300": "#d6d3d1", "400": "#a8a29e", "500": "#78716c", "600": "#57534e", "700": "#44403c", "800": "#292524", "900": "#1c1917", "950": "#0c0a09"}
  }',
  '{"title": "#431407", "unit": "#7c2d12", "content": "#292524", "summary": "#713f12", "quote": "#44403c", "question": "#991b1b"}',
  '{"displayFont": "Outfit, sans-serif", "bodyFont": "Inter, sans-serif"}',
  'league'
);

-- 6. Lavender Minimal (Soft, Calming)
INSERT INTO presentation_themes (id, name, description, is_builtin, palette, section_colors, typography, base_theme) VALUES (
  'theme-lavender-minimal',
  'Lavender Minimal',
  'Soft calming theme with lavender tones. Perfect for wellness and thoughtful content.',
  1,
  '{
    "primary": {"50": "#faf5ff", "100": "#f3e8ff", "200": "#e9d5ff", "300": "#d8b4fe", "400": "#c084fc", "500": "#a855f7", "600": "#9333ea", "700": "#7c3aed", "800": "#6b21a8", "900": "#581c87", "950": "#3b0764"},
    "secondary": {"50": "#fdf4ff", "100": "#fae8ff", "200": "#f5d0fe", "300": "#f0abfc", "400": "#e879f9", "500": "#d946ef", "600": "#c026d3", "700": "#a21caf", "800": "#86198f", "900": "#701a75", "950": "#4a044e"},
    "accent": {"50": "#fdf2f8", "100": "#fce7f3", "200": "#fbcfe8", "300": "#f9a8d4", "400": "#f472b6", "500": "#ec4899", "600": "#db2777", "700": "#be185d", "800": "#9d174d", "900": "#831843", "950": "#500724"},
    "neutral": {"50": "#fafafa", "100": "#f4f4f5", "200": "#e4e4e7", "300": "#d4d4d8", "400": "#a1a1aa", "500": "#71717a", "600": "#52525b", "700": "#3f3f46", "800": "#27272a", "900": "#18181b", "950": "#09090b"}
  }',
  '{"title": "#f5f3ff", "unit": "#ede9fe", "content": "#faf5ff", "summary": "#f3e8ff", "quote": "#fdf4ff", "question": "#fce7f3"}',
  '{"displayFont": "DM Sans, sans-serif", "bodyFont": "DM Sans, sans-serif"}',
  'simple'
);

-- 7. Slate Technical (Neutral, Developer-Focused)
INSERT INTO presentation_themes (id, name, description, is_builtin, palette, section_colors, typography, base_theme) VALUES (
  'theme-slate-technical',
  'Slate Technical',
  'Neutral developer-focused theme with slate tones. Ideal for code and technical documentation.',
  1,
  '{
    "primary": {"50": "#f8fafc", "100": "#f1f5f9", "200": "#e2e8f0", "300": "#cbd5e1", "400": "#94a3b8", "500": "#64748b", "600": "#475569", "700": "#334155", "800": "#1e293b", "900": "#0f172a", "950": "#020617"},
    "secondary": {"50": "#f9fafb", "100": "#f3f4f6", "200": "#e5e7eb", "300": "#d1d5db", "400": "#9ca3af", "500": "#6b7280", "600": "#4b5563", "700": "#374151", "800": "#1f2937", "900": "#111827", "950": "#030712"},
    "accent": {"50": "#ecfeff", "100": "#cffafe", "200": "#a5f3fc", "300": "#67e8f9", "400": "#22d3ee", "500": "#06b6d4", "600": "#0891b2", "700": "#0e7490", "800": "#155e75", "900": "#164e63", "950": "#083344"},
    "neutral": {"50": "#fafafa", "100": "#f4f4f5", "200": "#e4e4e7", "300": "#d4d4d8", "400": "#a1a1aa", "500": "#71717a", "600": "#52525b", "700": "#3f3f46", "800": "#27272a", "900": "#18181b", "950": "#09090b"}
  }',
  '{"title": "#0f172a", "unit": "#1e293b", "content": "#1e293b", "summary": "#334155", "quote": "#1e293b", "question": "#3f3f46"}',
  '{"displayFont": "JetBrains Mono, monospace", "bodyFont": "Inter, sans-serif"}',
  'black'
);

-- 8. Coral Creative (Playful, Engaging)
INSERT INTO presentation_themes (id, name, description, is_builtin, palette, section_colors, typography, base_theme) VALUES (
  'theme-coral-creative',
  'Coral Creative',
  'Playful engaging theme with coral colors. Great for creative and marketing presentations.',
  1,
  '{
    "primary": {"50": "#fff1f2", "100": "#ffe4e6", "200": "#fecdd3", "300": "#fda4af", "400": "#fb7185", "500": "#f43f5e", "600": "#e11d48", "700": "#be123c", "800": "#9f1239", "900": "#881337", "950": "#4c0519"},
    "secondary": {"50": "#fdf2f8", "100": "#fce7f3", "200": "#fbcfe8", "300": "#f9a8d4", "400": "#f472b6", "500": "#ec4899", "600": "#db2777", "700": "#be185d", "800": "#9d174d", "900": "#831843", "950": "#500724"},
    "accent": {"50": "#fffbeb", "100": "#fef3c7", "200": "#fde68a", "300": "#fcd34d", "400": "#fbbf24", "500": "#f59e0b", "600": "#d97706", "700": "#b45309", "800": "#92400e", "900": "#78350f", "950": "#451a03"},
    "neutral": {"50": "#fafaf9", "100": "#f5f5f4", "200": "#e7e5e4", "300": "#d6d3d1", "400": "#a8a29e", "500": "#78716c", "600": "#57534e", "700": "#44403c", "800": "#292524", "900": "#1c1917", "950": "#0c0a09"}
  }',
  '{"title": "#fecdd3", "unit": "#fda4af", "content": "#fff1f2", "summary": "#fbcfe8", "quote": "#fce7f3", "question": "#fef3c7"}',
  '{"displayFont": "Cabinet Grotesk, sans-serif", "bodyFont": "Inter, sans-serif"}',
  'white'
);
