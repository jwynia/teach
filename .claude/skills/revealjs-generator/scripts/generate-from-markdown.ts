#!/usr/bin/env -S deno run --allow-read --allow-write

/**
 * generate-from-markdown.ts - Convert Markdown to RevealJS presentation
 *
 * Transforms markdown files with slide separators into self-contained
 * RevealJS HTML presentations.
 *
 * Usage:
 *   deno run --allow-read --allow-write scripts/generate-from-markdown.ts <input.md> <output.html>
 *
 * Options:
 *   -h, --help       Show help
 *   -v, --verbose    Enable verbose output
 *   --theme <name>   Override theme from front matter
 *   --title <title>  Override title from front matter
 *
 * Markdown Format:
 *   - Use --- for horizontal slide breaks
 *   - Use -- for vertical slide breaks
 *   - Use Note: for speaker notes
 *   - Use YAML front matter for configuration
 */

import { parseArgs } from "jsr:@std/cli@1.0.9/parse-args";

// === Types ===

interface FrontMatter {
  title?: string;
  author?: string;
  theme?: string;
  transition?: string;
  controls?: boolean;
  progress?: boolean;
  slideNumber?: boolean | string;
  hash?: boolean;
  autoSlide?: number;
  loop?: boolean;
}

interface ParsedMarkdown {
  frontMatter: FrontMatter;
  slides: SlideContent[];
}

interface SlideContent {
  markdown: string;
  notes?: string;
  vertical?: SlideContent[];
}

interface GenerateOptions {
  theme?: string;
  title?: string;
  verbose?: boolean;
}

interface ParsedArgs {
  help: boolean;
  verbose: boolean;
  theme?: string;
  title?: string;
  _: (string | number)[];
}

// === Constants ===

const VERSION = "1.0.0";
const SCRIPT_NAME = "generate-from-markdown";

const CDN_BASE = "https://unpkg.com/reveal.js@5";

const VALID_THEMES = [
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
];

// === Help ===

function printHelp(): void {
  console.log(`
${SCRIPT_NAME} v${VERSION} - Convert Markdown to RevealJS presentation

Usage:
  deno run --allow-read --allow-write scripts/${SCRIPT_NAME}.ts <input.md> <output.html>

Arguments:
  <input.md>       Path to markdown source file
  <output.html>    Path for output HTML file

Options:
  -h, --help       Show this help message
  -v, --verbose    Enable verbose output
  --theme <name>   Override theme (${VALID_THEMES.join(", ")})
  --title <title>  Override presentation title

Markdown Format:
  ---              Horizontal slide separator
  --               Vertical slide separator
  Note: <text>     Speaker notes (only visible in presenter view)

Front Matter (YAML):
  ---
  title: Presentation Title
  theme: black
  transition: slide
  controls: true
  progress: true
  slideNumber: true
  hash: true
  ---

Examples:
  # Basic conversion
  deno run --allow-read --allow-write scripts/${SCRIPT_NAME}.ts slides.md presentation.html

  # With theme override
  deno run --allow-read --allow-write scripts/${SCRIPT_NAME}.ts slides.md out.html --theme league
`);
}

// === Parsing ===

/**
 * Parse YAML front matter from markdown content
 */
function parseFrontMatter(content: string): { frontMatter: FrontMatter; body: string } {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  const match = content.match(frontMatterRegex);

  if (!match) {
    return { frontMatter: {}, body: content };
  }

  const yamlContent = match[1];
  const body = content.slice(match[0].length);

  // Simple YAML parsing (key: value pairs)
  const frontMatter: FrontMatter = {};
  for (const line of yamlContent.split("\n")) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    let value: string | boolean | number = line.slice(colonIndex + 1).trim();

    // Parse boolean values
    if (value === "true") value = true;
    else if (value === "false") value = false;
    // Parse numbers
    else if (/^\d+$/.test(value)) value = parseInt(value, 10);
    // Remove quotes from strings
    else if ((value.startsWith('"') && value.endsWith('"')) ||
             (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    (frontMatter as Record<string, unknown>)[key] = value;
  }

  return { frontMatter, body };
}

/**
 * Extract speaker notes from slide content
 */
function extractNotes(content: string): { content: string; notes?: string } {
  const noteRegex = /\n\s*Note:\s*([\s\S]*?)(?=\n---|\n--|\s*$)/i;
  const match = content.match(noteRegex);

  if (!match) {
    return { content };
  }

  return {
    content: content.replace(noteRegex, "").trim(),
    notes: match[1].trim(),
  };
}

/**
 * Parse markdown into slides structure
 */
function parseMarkdown(content: string): ParsedMarkdown {
  const { frontMatter, body } = parseFrontMatter(content);

  // Split by horizontal separator (---)
  // Be careful not to match code blocks or front matter
  const horizontalSlides = body.split(/\n---\s*\n/);

  const slides: SlideContent[] = [];

  for (const hSlide of horizontalSlides) {
    if (!hSlide.trim()) continue;

    // Check for vertical slides (--)
    const verticalParts = hSlide.split(/\n--\s*\n/);

    if (verticalParts.length === 1) {
      // No vertical slides
      const { content: slideContent, notes } = extractNotes(hSlide);
      slides.push({ markdown: slideContent.trim(), notes });
    } else {
      // Has vertical slides
      const mainSlide = verticalParts[0];
      const { content: mainContent, notes: mainNotes } = extractNotes(mainSlide);

      const vertical: SlideContent[] = [];
      for (let i = 1; i < verticalParts.length; i++) {
        const { content: vContent, notes: vNotes } = extractNotes(verticalParts[i]);
        vertical.push({ markdown: vContent.trim(), notes: vNotes });
      }

      slides.push({
        markdown: mainContent.trim(),
        notes: mainNotes,
        vertical,
      });
    }
  }

  return { frontMatter, slides };
}

// === HTML Generation ===

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Generate a single slide section
 */
function generateSlideHtml(slide: SlideContent): string {
  const notesHtml = slide.notes
    ? `\n        <aside class="notes">${escapeHtml(slide.notes)}</aside>`
    : "";

  // Use data-markdown for markdown content
  const slideHtml = `      <section data-markdown>
        <textarea data-template>
${slide.markdown}
        </textarea>${notesHtml}
      </section>`;

  if (!slide.vertical?.length) {
    return slideHtml;
  }

  // Wrap with vertical container
  const verticalHtml = slide.vertical
    .map((v) => generateSlideHtml(v))
    .join("\n");

  return `      <section>
${slideHtml}
${verticalHtml}
      </section>`;
}

/**
 * Generate RevealJS configuration object
 */
function generateConfig(frontMatter: FrontMatter): string {
  const config: Record<string, unknown> = {
    hash: frontMatter.hash ?? true,
    plugins: ["RevealMarkdown", "RevealHighlight", "RevealNotes"],
  };

  if (frontMatter.controls !== undefined) config.controls = frontMatter.controls;
  if (frontMatter.progress !== undefined) config.progress = frontMatter.progress;
  if (frontMatter.slideNumber !== undefined) config.slideNumber = frontMatter.slideNumber;
  if (frontMatter.transition) config.transition = frontMatter.transition;
  if (frontMatter.autoSlide) config.autoSlide = frontMatter.autoSlide;
  if (frontMatter.loop !== undefined) config.loop = frontMatter.loop;

  // Format as JavaScript object (not JSON) for plugins array
  const configStr = JSON.stringify(config, null, 2)
    .replace(/"RevealMarkdown"/g, "RevealMarkdown")
    .replace(/"RevealHighlight"/g, "RevealHighlight")
    .replace(/"RevealNotes"/g, "RevealNotes");

  return configStr;
}

/**
 * Generate complete HTML presentation
 */
export function generateRevealJS(
  parsed: ParsedMarkdown,
  options: GenerateOptions = {}
): string {
  const theme = options.theme || parsed.frontMatter.theme || "black";
  const title = options.title || parsed.frontMatter.title || "Presentation";

  // Validate theme
  if (!VALID_THEMES.includes(theme)) {
    console.error(`Warning: Unknown theme "${theme}", using "black"`);
  }

  const slidesHtml = parsed.slides.map((s) => generateSlideHtml(s)).join("\n\n");
  const configStr = generateConfig(parsed.frontMatter);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="${CDN_BASE}/dist/reset.css">
  <link rel="stylesheet" href="${CDN_BASE}/dist/reveal.css">
  <link rel="stylesheet" href="${CDN_BASE}/dist/theme/${theme}.css">
  <link rel="stylesheet" href="${CDN_BASE}/plugin/highlight/monokai.css">
</head>
<body>
  <div class="reveal">
    <div class="slides">
${slidesHtml}
    </div>
  </div>

  <script src="${CDN_BASE}/dist/reveal.js"></script>
  <script src="${CDN_BASE}/plugin/markdown/markdown.js"></script>
  <script src="${CDN_BASE}/plugin/highlight/highlight.js"></script>
  <script src="${CDN_BASE}/plugin/notes/notes.js"></script>
  <script>
    Reveal.initialize(${configStr});
  </script>
</body>
</html>`;
}

/**
 * Generate presentation from markdown string
 */
export function generateFromMarkdownString(
  markdown: string,
  options: GenerateOptions = {}
): string {
  const parsed = parseMarkdown(markdown);
  return generateRevealJS(parsed, options);
}

// === Main CLI Handler ===

async function main(args: string[]): Promise<void> {
  const parsed = parseArgs(args, {
    boolean: ["help", "verbose"],
    string: ["theme", "title"],
    alias: { help: "h", verbose: "v" },
    default: { verbose: false },
  }) as ParsedArgs;

  if (parsed.help) {
    printHelp();
    Deno.exit(0);
  }

  const positionalArgs = parsed._.map(String);

  if (positionalArgs.length < 2) {
    console.error("Error: Both input.md and output.html are required\n");
    printHelp();
    Deno.exit(1);
  }

  const inputPath = positionalArgs[0];
  const outputPath = positionalArgs[1];

  try {
    // Read markdown file
    const markdown = await Deno.readTextFile(inputPath);

    if (parsed.verbose) {
      console.error(`Reading: ${inputPath}`);
    }

    // Parse and generate
    const parsedMd = parseMarkdown(markdown);

    if (parsed.verbose) {
      console.error(`Found ${parsedMd.slides.length} slides`);
      console.error(`Theme: ${parsed.theme || parsedMd.frontMatter.theme || "black"}`);
    }

    const html = generateRevealJS(parsedMd, {
      theme: parsed.theme,
      title: parsed.title,
      verbose: parsed.verbose,
    });

    // Write output
    await Deno.writeTextFile(outputPath, html);

    console.log(`Created: ${outputPath}`);

    if (parsed.verbose) {
      console.error(`Output size: ${html.length} bytes`);
    }
  } catch (error) {
    console.error(
      "Error:",
      error instanceof Error ? error.message : String(error)
    );
    Deno.exit(1);
  }
}

// === Entry Point ===

if (import.meta.main) {
  main(Deno.args);
}
