// PPTX Template Utilities
// Dynamic layout discovery and placeholder mapping for template-based PPTX generation

import { readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import JSZip from "jszip";

// Get the project root directory
const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "../../../../..");

// ============================================================================
// Types
// ============================================================================

export type SlideType =
  | "title"
  | "assertion"
  | "definition"
  | "process"
  | "comparison"
  | "quote"
  | "question"
  | "example"
  | "summary"
  | "default";

export interface SlideData {
  title: string;
  content: string[];
  rawContent?: string;
  notes?: string;
  type?: SlideType;
}

export interface PptxGenerationOptions {
  title: string;
  subtitle?: string;
  templatePath?: string;
  templateId?: string;
}

export interface DiscoveredLayout {
  name: string;
  slideNumber: number;
  placeholders: string[];
}

export interface TextReplacement {
  tag: string;
  value: string;
}

// ============================================================================
// Layout Name Patterns
// ============================================================================

// Slide type → Layout name patterns (order = priority)
const TYPE_TO_LAYOUT_PATTERNS: Record<SlideType, string[]> = {
  title: ["title", "cover", "opening"],
  assertion: ["content", "assertion", "standard"],
  default: ["content", "standard", "basic"],
  definition: ["big text", "definition", "statement"],
  quote: ["quote", "quotation", "callout"],
  comparison: ["two column", "comparison", "side by side", "split"],
  question: ["q&a", "question", "discussion", "qa"],
  process: ["content", "process", "steps"],
  summary: ["content", "summary", "takeaway", "key points"],
  example: ["content", "example", "case study"],
};

// ============================================================================
// Placeholder Mapping
// ============================================================================

interface PlaceholderMapping {
  pattern: RegExp;
  getValue: (data: SlideData, options: PptxGenerationOptions) => string;
}

const PLACEHOLDER_MAPPINGS: PlaceholderMapping[] = [
  // Title patterns (most specific first)
  { pattern: /course[_\s]?title/i, getValue: (d) => d.title },
  { pattern: /slide[_\s]?title/i, getValue: (d) => d.title },
  { pattern: /section[_\s]?title/i, getValue: (d) => d.title },
  { pattern: /competency[_\s]?title/i, getValue: (d) => d.title },
  { pattern: /activity[_\s]?title/i, getValue: (d) => d.title },
  { pattern: /^title$/i, getValue: (d) => d.title },
  { pattern: /heading/i, getValue: (d) => d.title },

  // Content patterns
  { pattern: /main[_\s]?content/i, getValue: (d) => formatAsBullets(d.content) },
  { pattern: /section[_\s]?description/i, getValue: (d) => formatAsBullets(d.content) },
  { pattern: /content|body/i, getValue: (d) => formatAsBullets(d.content) },
  { pattern: /bullets?|points?/i, getValue: (d) => formatAsBullets(d.content) },
  { pattern: /learning[_\s]?objectives/i, getValue: (d) => formatAsBullets(d.content) },
  { pattern: /activity[_\s]?instructions/i, getValue: (d) => formatAsNumbered(d.content) },
  { pattern: /discussion[_\s]?points/i, getValue: (d) => formatAsBullets(d.content) },

  // Quote patterns
  { pattern: /quote[_\s]?text|quotation/i, getValue: (d) => extractQuoteText(d) },
  { pattern: /attribution|author|source/i, getValue: (d) => extractAttribution(d) },

  // Big text pattern
  { pattern: /big[_\s]?text[_\s]?content/i, getValue: (d) => formatBigText(d) },

  // Two-column patterns
  { pattern: /left[_\s]?column|column[_\s]?1|first[_\s]?column/i, getValue: (d) => extractLeftColumn(d) },
  { pattern: /right[_\s]?column|column[_\s]?2|second[_\s]?column/i, getValue: (d) => extractRightColumn(d) },

  // Question/discussion patterns
  { pattern: /discussion[_\s]?prompt|prompt|question/i, getValue: (d) => d.title },
  { pattern: /teaching[_\s]?notes/i, getValue: (d) => d.notes || "" },

  // Competency patterns
  { pattern: /competency[_\s]?description/i, getValue: (d) => d.content.join("\n") },

  // Activity patterns
  { pattern: /time[_\s]?estimate/i, getValue: () => "" },
  { pattern: /materials[_\s]?needed/i, getValue: () => "" },

  // Metadata patterns
  { pattern: /date|course[_\s]?date/i, getValue: () => new Date().toLocaleDateString() },
  { pattern: /subtitle|course[_\s]?subtitle/i, getValue: (_, o) => o.subtitle || "" },
  { pattern: /instructor[_\s]?name/i, getValue: () => "" },
  { pattern: /image[_\s]?caption/i, getValue: () => "" },
];

// ============================================================================
// Content Formatting Helpers
// ============================================================================

function formatAsBullets(content: string[]): string {
  if (content.length === 0) return "";
  return content.map((line) => `• ${line}`).join("\n");
}

function formatAsNumbered(content: string[]): string {
  if (content.length === 0) return "";
  return content.map((line, i) => `${i + 1}. ${line}`).join("\n");
}

function formatBigText(data: SlideData): string {
  if (data.content.length > 0) {
    return `${data.title}\n\n${data.content.join("\n")}`;
  }
  return data.title;
}

function extractQuoteText(data: SlideData): string {
  const raw = data.rawContent || data.content.join(" ");

  // Try to extract from markdown quote syntax: > "quote text"
  const quoteMatch = raw.match(/>\s*"?([^"]+)"?\s*(?:[-—–]|$)/s);
  if (quoteMatch) {
    return quoteMatch[1].trim();
  }

  // If content looks like a quote, use it
  if (data.content.length === 1 && data.content[0].length > 20) {
    return data.content[0];
  }

  // Fall back to title if it looks like a quote
  if (data.title.length > 30) {
    return data.title;
  }

  return data.content.join(" ") || data.title;
}

function extractAttribution(data: SlideData): string {
  const raw = data.rawContent || "";

  // Try to extract attribution from markdown: — Author Name
  const attrMatch = raw.match(/[-—–]\s*(.+?)$/m);
  if (attrMatch) {
    return attrMatch[1].trim();
  }

  return "";
}

function extractLeftColumn(data: SlideData): string {
  const raw = data.rawContent || "";

  // Try to parse markdown table
  const tableMatch = parseMarkdownTable(raw);
  if (tableMatch.length > 1 && tableMatch[0].length >= 2) {
    // First column (excluding header)
    const column = tableMatch.slice(1).map((row) => row[0] || "");
    return formatAsBullets(column.filter((c) => c));
  }

  // Fall back to first half of content
  const half = Math.ceil(data.content.length / 2);
  return formatAsBullets(data.content.slice(0, half));
}

function extractRightColumn(data: SlideData): string {
  const raw = data.rawContent || "";

  // Try to parse markdown table
  const tableMatch = parseMarkdownTable(raw);
  if (tableMatch.length > 1 && tableMatch[0].length >= 2) {
    // Second column (excluding header)
    const column = tableMatch.slice(1).map((row) => row[1] || "");
    return formatAsBullets(column.filter((c) => c));
  }

  // Fall back to second half of content
  const half = Math.ceil(data.content.length / 2);
  return formatAsBullets(data.content.slice(half));
}

function parseMarkdownTable(content: string): string[][] {
  const lines = content.split("\n");
  const rows: string[][] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) continue;

    // Skip separator rows (|---|---|)
    if (/^\|[\s\-:|]+\|$/.test(trimmed)) continue;

    // Parse data rows
    if (trimmed.endsWith("|")) {
      const cells = trimmed
        .slice(1, -1) // Remove leading/trailing |
        .split("|")
        .map((c) => c.trim());

      if (cells.some((c) => c.length > 0)) {
        rows.push(cells);
      }
    }
  }

  return rows;
}

// ============================================================================
// Layout Discovery
// ============================================================================

export function getSlideFiles(zip: JSZip): string[] {
  const slideFiles: string[] = [];
  zip.forEach((relativePath) => {
    const match = relativePath.match(/^ppt\/slides\/slide(\d+)\.xml$/);
    if (match) {
      slideFiles.push(relativePath);
    }
  });
  // Sort by slide number
  slideFiles.sort((a, b) => {
    const numA = parseInt(a.match(/slide(\d+)\.xml$/)?.[1] || "0", 10);
    const numB = parseInt(b.match(/slide(\d+)\.xml$/)?.[1] || "0", 10);
    return numA - numB;
  });
  return slideFiles;
}

export async function discoverLayoutsFromZip(
  zip: JSZip
): Promise<DiscoveredLayout[]> {
  const layouts: DiscoveredLayout[] = [];
  const slideFiles = getSlideFiles(zip);

  for (let i = 0; i < slideFiles.length; i++) {
    const slideXml = await zip.file(slideFiles[i])?.async("string");
    if (!slideXml) continue;

    // Extract all {{placeholder}} patterns
    const placeholderMatches = [...slideXml.matchAll(/\{\{([^}]+)\}\}/g)];
    const placeholders = placeholderMatches.map((m) => `{{${m[1]}}}`);

    // Infer layout name from placeholders
    const layoutName = inferLayoutName(placeholders, i + 1);

    layouts.push({
      name: layoutName,
      slideNumber: i + 1,
      placeholders: [...new Set(placeholders)],
    });
  }

  return layouts;
}

function inferLayoutName(placeholders: string[], slideNumber: number): string {
  const placeholderStr = placeholders.join(" ").toLowerCase();

  // Infer from placeholder patterns
  if (placeholderStr.includes("course_title") || placeholderStr.includes("instructor")) {
    return "title slide";
  }
  if (placeholderStr.includes("section_title") && !placeholderStr.includes("slide_title")) {
    return "section header";
  }
  if (placeholderStr.includes("left_column") || placeholderStr.includes("right_column")) {
    return "two column";
  }
  if (placeholderStr.includes("quote_text") || placeholderStr.includes("attribution")) {
    return "quote";
  }
  if (placeholderStr.includes("discussion_prompt") || placeholderStr.includes("teaching_notes")) {
    return "q&a / discussion";
  }
  if (placeholderStr.includes("competency_title") || placeholderStr.includes("competency_description")) {
    return "competency overview";
  }
  if (placeholderStr.includes("activity_title") || placeholderStr.includes("time_estimate")) {
    return "activity instructions";
  }
  if (placeholderStr.includes("big_text_content")) {
    return "big text";
  }
  if (placeholderStr.includes("image_caption")) {
    return "full image";
  }
  if (placeholderStr.includes("slide_title") || placeholderStr.includes("main_content")) {
    return "content slide";
  }

  // Default to generic name
  return `slide ${slideNumber}`;
}

export async function loadLayoutsFromManifest(
  templateId: string
): Promise<DiscoveredLayout[] | null> {
  try {
    const manifestPath = join(
      PROJECT_ROOT,
      "storage/starter-templates/manifests/pptx-manifest.json"
    );
    console.log(`[PPTX Debug] Loading manifest from: ${manifestPath}`);
    const manifestContent = await readFile(manifestPath, "utf-8");
    const manifest = JSON.parse(manifestContent);

    const templateManifest = manifest[templateId];
    if (!templateManifest?.layouts) {
      console.log(`[PPTX Debug] No layouts found for templateId: ${templateId}`);
      return null;
    }

    const layouts = templateManifest.layouts.map(
      (l: { name: string; slideNumber: number; placeholders: { name: string }[] }) => ({
        name: l.name.toLowerCase(),
        slideNumber: l.slideNumber,
        placeholders: l.placeholders.map((p) => p.name),
      })
    );
    console.log(`[PPTX Debug] Loaded ${layouts.length} layouts from manifest:`, layouts.map((l: DiscoveredLayout) => `${l.name} (slide ${l.slideNumber})`));
    return layouts;
  } catch (err) {
    console.log(`[PPTX Debug] Failed to load manifest:`, err);
    return null;
  }
}

// ============================================================================
// Layout Matching
// ============================================================================

export function buildLayoutMap(
  layouts: DiscoveredLayout[]
): Map<string, DiscoveredLayout> {
  const map = new Map<string, DiscoveredLayout>();

  for (const layout of layouts) {
    // Normalize name for matching
    const normalized = layout.name.toLowerCase().replace(/[^a-z0-9\s]/g, "");
    map.set(normalized, layout);
  }

  return map;
}

export function findMatchingLayout(
  layoutMap: Map<string, DiscoveredLayout>,
  slideType: SlideType
): DiscoveredLayout {
  const patterns = TYPE_TO_LAYOUT_PATTERNS[slideType] || ["content"];

  for (const pattern of patterns) {
    // Try exact match first
    if (layoutMap.has(pattern)) {
      console.log(`[PPTX Debug] findMatchingLayout: type="${slideType}" exact match pattern="${pattern}"`);
      return layoutMap.get(pattern)!;
    }

    // Try fuzzy match (layout name contains pattern)
    for (const [name, layout] of layoutMap) {
      if (name.includes(pattern)) {
        console.log(`[PPTX Debug] findMatchingLayout: type="${slideType}" fuzzy match pattern="${pattern}" in name="${name}"`);
        return layout;
      }
    }
  }

  // Fallback: try "content" layout
  for (const [name, layout] of layoutMap) {
    if (name.includes("content")) {
      console.log(`[PPTX Debug] findMatchingLayout: type="${slideType}" FALLBACK to content layout="${name}"`);
      return layout;
    }
  }

  // Last resort: return first layout (template must have at least one slide)
  console.log(`[PPTX Debug] findMatchingLayout: type="${slideType}" LAST RESORT first layout`);
  return layoutMap.values().next().value!;
}

// ============================================================================
// Placeholder Population
// ============================================================================

export function populatePlaceholders(
  placeholders: string[],
  data: SlideData,
  options: PptxGenerationOptions
): TextReplacement[] {
  const replacements: TextReplacement[] = [];

  for (const placeholder of placeholders) {
    const innerName = placeholder.slice(2, -2); // Remove {{ }}

    // Find matching mapping
    const mapping = PLACEHOLDER_MAPPINGS.find((m) => m.pattern.test(innerName));
    if (mapping) {
      replacements.push({
        tag: placeholder,
        value: mapping.getValue(data, options),
      });
    } else {
      // Default: clear unknown placeholders
      replacements.push({ tag: placeholder, value: "" });
    }
  }

  return replacements;
}

// ============================================================================
// Default Template Path
// ============================================================================

export const DEFAULT_TEMPLATE_PATH = join(
  PROJECT_ROOT,
  "storage/starter-templates/pptx/professional-course-template-v1.0.pptx"
);
export const DEFAULT_TEMPLATE_ID = "professional-course-template-v1.0";
