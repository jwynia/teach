/**
 * Theme Generator Service
 *
 * Generates presentation themes from seed colors using color theory.
 * Based on the frontend-design palette generation approach.
 */

import { randomUUID } from "crypto";
import type {
  ColorScale,
  Palette,
  SectionColors,
  Typography,
  PresentationTheme,
  BaseTheme,
} from "./types.js";

// ============================================================================
// Color Utilities
// ============================================================================

interface HSL {
  h: number;
  s: number;
  l: number;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    const short = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
    if (short) {
      return {
        r: parseInt(short[1] + short[1], 16),
        g: parseInt(short[2] + short[2], 16),
        b: parseInt(short[3] + short[3], 16),
      };
    }
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) =>
    Math.round(Math.max(0, Math.min(255, n)))
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    case b:
      h = ((r - g) / d + 4) / 6;
      break;
  }

  return { h: h * 360, s, l };
}

function hslToRgb(hsl: HSL): RGB {
  const { h, s, l } = hsl;

  if (s === 0) {
    const gray = Math.round(l * 255);
    return { r: gray, g: gray, b: gray };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hNorm = h / 360;

  return {
    r: Math.round(hue2rgb(p, q, hNorm + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hNorm) * 255),
    b: Math.round(hue2rgb(p, q, hNorm - 1 / 3) * 255),
  };
}

function adjustHsl(
  hex: string,
  hDelta: number,
  sDelta: number,
  lDelta: number
): string {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);

  hsl.h = (hsl.h + hDelta + 360) % 360;
  hsl.s = Math.max(0, Math.min(1, hsl.s + sDelta));
  hsl.l = Math.max(0, Math.min(1, hsl.l + lDelta));

  return rgbToHex(hslToRgb(hsl));
}

// ============================================================================
// Shade Generation
// ============================================================================

function generateShadeScale(baseColor: string): ColorScale {
  const rgb = hexToRgb(baseColor);
  const hsl = rgbToHsl(rgb);

  const shades: Record<string, string> = {};
  const levels = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  const baseLightness = hsl.l;

  for (const level of levels) {
    let targetL: number;
    if (level <= 500) {
      targetL =
        baseLightness + ((1 - baseLightness) * (500 - level) * 0.9) / 500;
    } else {
      targetL = baseLightness - ((baseLightness * (level - 500)) / 500) * 0.9;
    }

    const satAdjust = level >= 300 && level <= 700 ? 0.05 : -0.05;

    const newHsl = {
      h: hsl.h,
      s: Math.max(0, Math.min(1, hsl.s + satAdjust)),
      l: Math.max(0.03, Math.min(0.97, targetL)),
    };

    shades[level.toString()] = rgbToHex(hslToRgb(newHsl));
  }

  return shades as ColorScale;
}

// ============================================================================
// Theme Color Generation
// ============================================================================

type Theme = "warm" | "cool" | "neutral" | "vibrant" | "muted" | "dark" | "light";
type Style = "minimalist" | "bold" | "organic" | "corporate" | "playful";

function generateThemeColors(theme: Theme): { primary: string; hueShift: number } {
  const themeSeeds: Record<Theme, { primary: string; hueShift: number }> = {
    warm: { primary: "#e07020", hueShift: 30 },
    cool: { primary: "#2563eb", hueShift: -20 },
    neutral: { primary: "#64748b", hueShift: 0 },
    vibrant: { primary: "#8b5cf6", hueShift: 40 },
    muted: { primary: "#78716c", hueShift: 15 },
    dark: { primary: "#1e293b", hueShift: 10 },
    light: { primary: "#f1f5f9", hueShift: 5 },
  };

  return themeSeeds[theme];
}

function applyStyle(color: string, style: Style): string {
  const adjustments: Record<Style, { h: number; s: number; l: number }> = {
    minimalist: { h: 0, s: -0.2, l: 0.1 },
    bold: { h: 0, s: 0.15, l: -0.05 },
    organic: { h: 15, s: -0.1, l: 0.05 },
    corporate: { h: 0, s: -0.1, l: 0 },
    playful: { h: 10, s: 0.1, l: 0.05 },
  };

  const adj = adjustments[style];
  return adjustHsl(color, adj.h, adj.s, adj.l);
}

function generateNeutralScale(primary: string): ColorScale {
  const rgb = hexToRgb(primary);
  const hsl = rgbToHsl(rgb);

  const neutralHsl: HSL = {
    h: hsl.h,
    s: 0.05,
    l: 0.5,
  };

  const base = rgbToHex(hslToRgb(neutralHsl));
  return generateShadeScale(base);
}

function generateSecondaryColor(primary: string): string {
  return adjustHsl(primary, 30, 0, 0);
}

function generateAccentColor(primary: string): string {
  return adjustHsl(primary, 180, 0.1, 0.05);
}

// ============================================================================
// Section Colors
// ============================================================================

const DARK_THEMES: BaseTheme[] = ["black", "night", "league", "blood", "moon"];

function deriveSectionColors(palette: Palette, baseTheme: BaseTheme): SectionColors {
  const isDark = DARK_THEMES.includes(baseTheme);

  if (isDark) {
    return {
      title: palette.primary["900"],
      unit: palette.primary["700"],
      content: palette.neutral["900"],
      summary: palette.secondary?.["800"] || palette.primary["800"],
      quote: palette.accent?.["900"] || palette.primary["950"],
      question: palette.secondary?.["700"] || palette.primary["600"],
    };
  } else {
    return {
      title: palette.primary["100"],
      unit: palette.primary["200"],
      content: palette.neutral["50"],
      summary: palette.secondary?.["100"] || palette.primary["50"],
      quote: palette.accent?.["100"] || palette.primary["100"],
      question: palette.secondary?.["200"] || palette.primary["200"],
    };
  }
}

// ============================================================================
// Typography Selection
// ============================================================================

function selectTypography(style?: Style): Typography {
  const typographyMap: Record<Style, Typography> = {
    minimalist: {
      displayFont: "Inter, sans-serif",
      bodyFont: "Inter, sans-serif",
    },
    bold: {
      displayFont: "Space Grotesk, sans-serif",
      bodyFont: "Inter, sans-serif",
    },
    organic: {
      displayFont: "Libre Baskerville, serif",
      bodyFont: "Source Sans Pro, sans-serif",
    },
    corporate: {
      displayFont: "Plus Jakarta Sans, sans-serif",
      bodyFont: "Plus Jakarta Sans, sans-serif",
    },
    playful: {
      displayFont: "Cabinet Grotesk, sans-serif",
      bodyFont: "DM Sans, sans-serif",
    },
  };

  return typographyMap[style || "corporate"];
}

// ============================================================================
// Main Generator Functions
// ============================================================================

export interface GenerateThemeOptions {
  name: string;
  seedColor: string;
  theme?: Theme;
  style?: Style;
  baseTheme?: BaseTheme;
}

export function generatePalette(options: {
  seedColor?: string;
  theme?: Theme;
  style?: Style;
}): Palette {
  let primaryColor: string;

  if (options.seedColor) {
    primaryColor = options.seedColor;
  } else if (options.theme) {
    primaryColor = generateThemeColors(options.theme).primary;
  } else {
    primaryColor = "#2563eb";
  }

  if (options.style) {
    primaryColor = applyStyle(primaryColor, options.style);
  }

  const secondaryColor = generateSecondaryColor(primaryColor);
  const accentColor = generateAccentColor(primaryColor);

  return {
    primary: generateShadeScale(primaryColor),
    secondary: generateShadeScale(
      options.style ? applyStyle(secondaryColor, options.style) : secondaryColor
    ),
    accent: generateShadeScale(
      options.style ? applyStyle(accentColor, options.style) : accentColor
    ),
    neutral: generateNeutralScale(primaryColor),
  };
}

export function generatePresentationTheme(
  options: GenerateThemeOptions
): Omit<PresentationTheme, "createdAt" | "updatedAt"> {
  const palette = generatePalette({
    seedColor: options.seedColor,
    theme: options.theme,
    style: options.style,
  });

  const baseTheme = options.baseTheme || "black";
  const sectionColors = deriveSectionColors(palette, baseTheme);
  const typography = selectTypography(options.style);

  return {
    id: randomUUID(),
    name: options.name,
    description: null,
    isBuiltin: false,
    palette,
    sectionColors,
    typography,
    baseTheme,
    customCss: null,
  };
}

// ============================================================================
// CSS Generation for RevealJS
// ============================================================================

export function generateThemeCSS(
  theme: PresentationTheme,
  overrides?: { sectionColors?: Partial<SectionColors>; customCss?: string }
): string {
  const sectionColors = {
    ...theme.sectionColors,
    ...overrides?.sectionColors,
  };

  const lines: string[] = [
    "/* Presentation Theme: " + theme.name + " */",
    "",
    "<style>",
    ":root {",
    "  /* Primary palette */",
  ];

  // Primary colors
  for (const [shade, hex] of Object.entries(theme.palette.primary)) {
    lines.push(`  --theme-primary-${shade}: ${hex};`);
  }

  // Secondary colors
  if (theme.palette.secondary) {
    lines.push("");
    lines.push("  /* Secondary palette */");
    for (const [shade, hex] of Object.entries(theme.palette.secondary)) {
      lines.push(`  --theme-secondary-${shade}: ${hex};`);
    }
  }

  // Accent colors
  if (theme.palette.accent) {
    lines.push("");
    lines.push("  /* Accent palette */");
    for (const [shade, hex] of Object.entries(theme.palette.accent)) {
      lines.push(`  --theme-accent-${shade}: ${hex};`);
    }
  }

  // Neutral colors
  lines.push("");
  lines.push("  /* Neutral palette */");
  for (const [shade, hex] of Object.entries(theme.palette.neutral)) {
    lines.push(`  --theme-neutral-${shade}: ${hex};`);
  }

  // Section backgrounds
  lines.push("");
  lines.push("  /* Section backgrounds */");
  lines.push(`  --bg-title: ${sectionColors.title};`);
  lines.push(`  --bg-unit: ${sectionColors.unit};`);
  lines.push(`  --bg-content: ${sectionColors.content};`);
  lines.push(`  --bg-summary: ${sectionColors.summary};`);
  lines.push(`  --bg-quote: ${sectionColors.quote};`);
  lines.push(`  --bg-question: ${sectionColors.question};`);

  lines.push("}");
  lines.push("");

  // Typography
  if (theme.typography) {
    lines.push(".reveal {");
    lines.push(`  font-family: ${theme.typography.bodyFont};`);
    lines.push("}");
    lines.push("");
    lines.push(".reveal h1, .reveal h2, .reveal h3, .reveal h4, .reveal h5, .reveal h6 {");
    lines.push(`  font-family: ${theme.typography.displayFont};`);
    lines.push("}");
    lines.push("");
  }

  // Section-specific styling
  lines.push("/* Section-specific backgrounds */");
  lines.push(".slide-title { background-color: var(--bg-title) !important; }");
  lines.push(".slide-unit { background-color: var(--bg-unit) !important; }");
  lines.push(".slide-content { background-color: var(--bg-content) !important; }");
  lines.push(".slide-summary { background-color: var(--bg-summary) !important; }");
  lines.push(".slide-quote { background-color: var(--bg-quote) !important; }");
  lines.push(".slide-big-quote { background-color: var(--bg-quote) !important; }");
  lines.push(".slide-full-image { background-color: var(--bg-content) !important; }");
  lines.push(".slide-question { background-color: var(--bg-question) !important; }");
  lines.push("");

  // Enhanced slide type styling
  lines.push("/* Enhanced slide type styling */");
  lines.push(".slide-quote blockquote {");
  lines.push("  border-left: 4px solid var(--theme-primary-500);");
  lines.push("  padding-left: 1em;");
  lines.push("  font-style: italic;");
  lines.push("}");
  lines.push("");
  lines.push(".slide-definition strong {");
  lines.push("  color: var(--theme-primary-400);");
  lines.push("}");
  lines.push("");
  lines.push(".slide-assertion h3 {");
  lines.push("  color: var(--theme-primary-300);");
  lines.push("}");
  lines.push("");

  // Custom CSS
  if (theme.customCss) {
    lines.push("/* Theme custom CSS */");
    lines.push(theme.customCss);
    lines.push("");
  }

  if (overrides?.customCss) {
    lines.push("/* Course custom CSS */");
    lines.push(overrides.customCss);
    lines.push("");
  }

  lines.push("</style>");

  return lines.join("\n");
}
