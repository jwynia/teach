#!/usr/bin/env -S deno run --allow-read --allow-write

/**
 * generate-scratch.ts - Create RevealJS presentation from JSON specification
 *
 * Generates RevealJS HTML presentations from a detailed JSON specification.
 * Provides fine-grained control over slide content, backgrounds, and configuration.
 *
 * Usage:
 *   deno run --allow-read --allow-write scripts/generate-scratch.ts <spec.json> <output.html>
 *
 * Options:
 *   -h, --help       Show help
 *   -v, --verbose    Enable verbose output
 */

import { parseArgs } from "jsr:@std/cli@1.0.9/parse-args";
import { dirname, resolve } from "jsr:@std/path@1.0.8";

// === Types ===

export interface SlideSpec {
  /** HTML content for the slide */
  content?: string;
  /** Markdown content (will be wrapped in data-markdown) */
  markdown?: string;
  /** Background configuration */
  background?: {
    color?: string;
    image?: string;
    video?: string;
    size?: "cover" | "contain";
    opacity?: number;
  };
  /** Speaker notes */
  notes?: string;
  /** Nested vertical slides */
  vertical?: SlideSpec[];
  /** Slide-specific transition */
  transition?: string;
  /** Transition speed for this slide */
  transitionSpeed?: string;
  /** Enable auto-animate */
  autoAnimate?: boolean;
  /** Custom data attributes */
  attributes?: Record<string, string>;
}

export interface RevealJSSpec {
  /** Presentation title */
  title: string;
  /** Author name */
  author?: string;
  /** Presentation description */
  description?: string;
  /** RevealJS theme */
  theme?:
    | "black"
    | "white"
    | "league"
    | "beige"
    | "night"
    | "serif"
    | "simple"
    | "solarized"
    | "blood"
    | "moon";
  /** Path to custom CSS file */
  customCss?: string;
  /** RevealJS configuration */
  config?: {
    controls?: boolean;
    progress?: boolean;
    slideNumber?: boolean | string;
    hash?: boolean;
    transition?: "none" | "fade" | "slide" | "convex" | "concave" | "zoom";
    transitionSpeed?: "default" | "fast" | "slow";
    backgroundTransition?: string;
    autoSlide?: number;
    loop?: boolean;
    mouseWheel?: boolean;
    embedded?: boolean;
    center?: boolean;
    width?: number;
    height?: number;
  };
  /** Plugins to include */
  plugins?: ("markdown" | "highlight" | "notes" | "math" | "search" | "zoom")[];
  /** Slides array */
  slides: SlideSpec[];
}

interface ParsedArgs {
  help: boolean;
  verbose: boolean;
  _: (string | number)[];
}

// === Constants ===

const VERSION = "1.0.0";
const SCRIPT_NAME = "generate-scratch";
const CDN_BASE = "https://unpkg.com/reveal.js@5";

const PLUGIN_MAP: Record<string, { js: string; css?: string; init: string }> = {
  markdown: {
    js: `${CDN_BASE}/plugin/markdown/markdown.js`,
    init: "RevealMarkdown",
  },
  highlight: {
    js: `${CDN_BASE}/plugin/highlight/highlight.js`,
    css: `${CDN_BASE}/plugin/highlight/monokai.css`,
    init: "RevealHighlight",
  },
  notes: {
    js: `${CDN_BASE}/plugin/notes/notes.js`,
    init: "RevealNotes",
  },
  math: {
    js: `${CDN_BASE}/plugin/math/math.js`,
    init: "RevealMath.KaTeX",
  },
  search: {
    js: `${CDN_BASE}/plugin/search/search.js`,
    init: "RevealSearch",
  },
  zoom: {
    js: `${CDN_BASE}/plugin/zoom/zoom.js`,
    init: "RevealZoom",
  },
};

// === Help ===

function printHelp(): void {
  console.log(`
${SCRIPT_NAME} v${VERSION} - Create RevealJS presentation from JSON specification

Usage:
  deno run --allow-read --allow-write scripts/${SCRIPT_NAME}.ts <spec.json> <output.html>

Arguments:
  <spec.json>      Path to JSON specification file
  <output.html>    Path for output HTML file

Options:
  -h, --help       Show this help message
  -v, --verbose    Enable verbose output

Specification Format:
  {
    "title": "Presentation Title",
    "theme": "black",
    "config": {
      "controls": true,
      "progress": true,
      "transition": "slide"
    },
    "plugins": ["highlight", "notes"],
    "slides": [
      {
        "content": "<h1>Title</h1><p>Content</p>",
        "notes": "Speaker notes here"
      },
      {
        "markdown": "## Slide 2\\n\\n- Bullet 1\\n- Bullet 2"
      }
    ]
  }

Examples:
  # Generate from specification
  deno run --allow-read --allow-write scripts/${SCRIPT_NAME}.ts spec.json presentation.html

  # With verbose output
  deno run --allow-read --allow-write scripts/${SCRIPT_NAME}.ts spec.json out.html -v
`);
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
 * Build slide attributes string
 */
function buildSlideAttributes(slide: SlideSpec): string {
  const attrs: string[] = [];

  if (slide.background) {
    if (slide.background.color) {
      attrs.push(`data-background-color="#${slide.background.color.replace("#", "")}"`);
    }
    if (slide.background.image) {
      attrs.push(`data-background-image="${slide.background.image}"`);
    }
    if (slide.background.video) {
      attrs.push(`data-background-video="${slide.background.video}"`);
    }
    if (slide.background.size) {
      attrs.push(`data-background-size="${slide.background.size}"`);
    }
    if (slide.background.opacity !== undefined) {
      attrs.push(`data-background-opacity="${slide.background.opacity}"`);
    }
  }

  if (slide.transition) {
    attrs.push(`data-transition="${slide.transition}"`);
  }
  if (slide.transitionSpeed) {
    attrs.push(`data-transition-speed="${slide.transitionSpeed}"`);
  }
  if (slide.autoAnimate) {
    attrs.push(`data-auto-animate`);
  }

  // Custom attributes
  if (slide.attributes) {
    for (const [key, value] of Object.entries(slide.attributes)) {
      attrs.push(`data-${key}="${escapeHtml(value)}"`);
    }
  }

  return attrs.length > 0 ? " " + attrs.join(" ") : "";
}

/**
 * Generate a single slide section
 */
function generateSlideHtml(slide: SlideSpec): string {
  const attrs = buildSlideAttributes(slide);
  const notesHtml = slide.notes
    ? `\n        <aside class="notes">${escapeHtml(slide.notes)}</aside>`
    : "";

  let contentHtml: string;

  if (slide.markdown) {
    // Markdown slide
    contentHtml = `      <section data-markdown${attrs}>
        <textarea data-template>
${slide.markdown}
        </textarea>${notesHtml}
      </section>`;
  } else {
    // HTML slide
    contentHtml = `      <section${attrs}>
        ${slide.content || ""}${notesHtml}
      </section>`;
  }

  if (!slide.vertical?.length) {
    return contentHtml;
  }

  // Wrap with vertical container
  const verticalHtml = slide.vertical
    .map((v) => generateSlideHtml(v))
    .join("\n");

  return `      <section>
${contentHtml}
${verticalHtml}
      </section>`;
}

/**
 * Generate plugin CSS links
 */
function generatePluginCss(plugins: string[]): string {
  const cssLinks: string[] = [];

  for (const plugin of plugins) {
    const pluginInfo = PLUGIN_MAP[plugin];
    if (pluginInfo?.css) {
      cssLinks.push(`  <link rel="stylesheet" href="${pluginInfo.css}">`);
    }
  }

  return cssLinks.join("\n");
}

/**
 * Generate plugin script tags
 */
function generatePluginScripts(plugins: string[]): string {
  const scripts: string[] = [];

  for (const plugin of plugins) {
    const pluginInfo = PLUGIN_MAP[plugin];
    if (pluginInfo) {
      scripts.push(`  <script src="${pluginInfo.js}"></script>`);
    }
  }

  return scripts.join("\n");
}

/**
 * Generate plugin initialization array
 */
function generatePluginInit(plugins: string[]): string {
  const inits: string[] = [];

  for (const plugin of plugins) {
    const pluginInfo = PLUGIN_MAP[plugin];
    if (pluginInfo) {
      inits.push(pluginInfo.init);
    }
  }

  return inits.join(", ");
}

/**
 * Generate RevealJS configuration object
 */
function generateConfig(spec: RevealJSSpec): string {
  const config: Record<string, unknown> = {
    hash: true,
    ...spec.config,
  };

  // Add plugins array
  const plugins = spec.plugins || ["markdown", "highlight", "notes"];
  const pluginInit = generatePluginInit(plugins);

  // Build config string manually to include unquoted plugin names
  const configEntries = Object.entries(config)
    .map(([key, value]) => `      ${key}: ${JSON.stringify(value)}`)
    .join(",\n");

  return `{
${configEntries},
      plugins: [${pluginInit}]
    }`;
}

/**
 * Generate complete HTML presentation from spec
 */
export function generateFromSpec(spec: RevealJSSpec): string {
  const theme = spec.theme || "black";
  const plugins = spec.plugins || ["markdown", "highlight", "notes"];

  const slidesHtml = spec.slides.map((s) => generateSlideHtml(s)).join("\n\n");
  const pluginCss = generatePluginCss(plugins);
  const pluginScripts = generatePluginScripts(plugins);
  const configStr = generateConfig(spec);

  const customCssLink = spec.customCss
    ? `\n  <link rel="stylesheet" href="${spec.customCss}">`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${escapeHtml(spec.title)}</title>
  ${spec.author ? `<meta name="author" content="${escapeHtml(spec.author)}">` : ""}
  ${spec.description ? `<meta name="description" content="${escapeHtml(spec.description)}">` : ""}
  <link rel="stylesheet" href="${CDN_BASE}/dist/reset.css">
  <link rel="stylesheet" href="${CDN_BASE}/dist/reveal.css">
  <link rel="stylesheet" href="${CDN_BASE}/dist/theme/${theme}.css">
${pluginCss}${customCssLink}
</head>
<body>
  <div class="reveal">
    <div class="slides">
${slidesHtml}
    </div>
  </div>

${pluginScripts}
  <script src="${CDN_BASE}/dist/reveal.js"></script>
  <script>
    Reveal.initialize(${configStr});
  </script>
</body>
</html>`;
}

// === Main CLI Handler ===

async function main(args: string[]): Promise<void> {
  const parsed = parseArgs(args, {
    boolean: ["help", "verbose"],
    alias: { help: "h", verbose: "v" },
    default: { verbose: false },
  }) as ParsedArgs;

  if (parsed.help) {
    printHelp();
    Deno.exit(0);
  }

  const positionalArgs = parsed._.map(String);

  if (positionalArgs.length < 2) {
    console.error("Error: Both spec.json and output.html are required\n");
    printHelp();
    Deno.exit(1);
  }

  const specPath = positionalArgs[0];
  const outputPath = positionalArgs[1];

  try {
    // Read and parse specification
    const specText = await Deno.readTextFile(specPath);
    const spec = JSON.parse(specText) as RevealJSSpec;

    if (parsed.verbose) {
      console.error(`Reading: ${specPath}`);
      console.error(`Title: ${spec.title}`);
      console.error(`Theme: ${spec.theme || "black"}`);
      console.error(`Slides: ${spec.slides.length}`);
    }

    // Resolve relative paths in spec
    const specDir = dirname(resolve(specPath));

    // If customCss is relative, make it absolute or leave as-is for URL
    if (spec.customCss && !spec.customCss.startsWith("http")) {
      // For local files, we'd need to inline or copy - for now, keep path
      if (parsed.verbose) {
        console.error(`Custom CSS: ${spec.customCss}`);
      }
    }

    // Generate HTML
    const html = generateFromSpec(spec);

    // Write output
    await Deno.writeTextFile(outputPath, html);

    console.log(`Created: ${outputPath}`);

    if (parsed.verbose) {
      console.error(`Output size: ${html.length} bytes`);
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("Error: Invalid JSON in specification file");
      console.error(error.message);
    } else {
      console.error(
        "Error:",
        error instanceof Error ? error.message : String(error)
      );
    }
    Deno.exit(1);
  }
}

// === Entry Point ===

if (import.meta.main) {
  main(Deno.args);
}
