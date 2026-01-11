import { z } from "zod";

// ============================================================================
// Color Types
// ============================================================================

export const ColorScaleSchema = z.object({
  "50": z.string(),
  "100": z.string(),
  "200": z.string(),
  "300": z.string(),
  "400": z.string(),
  "500": z.string(),
  "600": z.string(),
  "700": z.string(),
  "800": z.string(),
  "900": z.string(),
  "950": z.string(),
});

export type ColorScale = z.infer<typeof ColorScaleSchema>;

export const PaletteSchema = z.object({
  primary: ColorScaleSchema,
  secondary: ColorScaleSchema.optional(),
  accent: ColorScaleSchema.optional(),
  neutral: ColorScaleSchema,
  semantic: z
    .object({
      success: ColorScaleSchema,
      warning: ColorScaleSchema,
      error: ColorScaleSchema,
      info: ColorScaleSchema,
    })
    .optional(),
});

export type Palette = z.infer<typeof PaletteSchema>;

export const SectionColorsSchema = z.object({
  title: z.string(),
  unit: z.string(),
  content: z.string(),
  summary: z.string(),
  quote: z.string(),
  question: z.string(),
});

export type SectionColors = z.infer<typeof SectionColorsSchema>;

export const TypographySchema = z.object({
  displayFont: z.string(),
  bodyFont: z.string(),
});

export type Typography = z.infer<typeof TypographySchema>;

// ============================================================================
// Theme Types
// ============================================================================

export const BaseThemeSchema = z.enum([
  "black",
  "white",
  "league",
  "beige",
  "night",
  "serif",
  "simple",
  "solarized",
  "blood",
  "moon",
]);

export type BaseTheme = z.infer<typeof BaseThemeSchema>;

export interface PresentationTheme {
  id: string;
  name: string;
  description: string | null;
  isBuiltin: boolean;
  palette: Palette;
  sectionColors: SectionColors;
  typography: Typography | null;
  baseTheme: BaseTheme;
  customCss: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PresentationThemeRow {
  id: string;
  name: string;
  description: string | null;
  is_builtin: number;
  palette: string;
  section_colors: string;
  typography: string | null;
  base_theme: string;
  custom_css: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// API Schemas
// ============================================================================

export const CreateThemeSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  palette: PaletteSchema,
  sectionColors: SectionColorsSchema,
  typography: TypographySchema.optional(),
  baseTheme: BaseThemeSchema,
  customCss: z.string().optional(),
});

export type CreateThemeRequest = z.infer<typeof CreateThemeSchema>;

export const UpdateThemeSchema = CreateThemeSchema.partial();

export type UpdateThemeRequest = z.infer<typeof UpdateThemeSchema>;

export const GenerateThemeSchema = z.object({
  name: z.string().min(1).max(100),
  seedColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  theme: z
    .enum(["warm", "cool", "neutral", "vibrant", "muted", "dark", "light"])
    .optional(),
  style: z
    .enum(["minimalist", "bold", "organic", "corporate", "playful"])
    .optional(),
  baseTheme: BaseThemeSchema.optional(),
});

export type GenerateThemeRequest = z.infer<typeof GenerateThemeSchema>;

export const SetCourseThemeSchema = z.object({
  themeId: z.string(),
  overrides: z
    .object({
      sectionColors: SectionColorsSchema.partial().optional(),
      customCss: z.string().optional(),
    })
    .optional(),
});

export type SetCourseThemeRequest = z.infer<typeof SetCourseThemeSchema>;

// ============================================================================
// Helper Functions
// ============================================================================

export function mapThemeRow(row: PresentationThemeRow): PresentationTheme {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    isBuiltin: row.is_builtin === 1,
    palette: JSON.parse(row.palette),
    sectionColors: JSON.parse(row.section_colors),
    typography: row.typography ? JSON.parse(row.typography) : null,
    baseTheme: row.base_theme as BaseTheme,
    customCss: row.custom_css,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
