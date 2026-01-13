#!/usr/bin/env -S deno run --allow-read --allow-write

/**
 * generate-template.ts - Create PPTX template with proper slide masters
 *
 * Generates a PowerPoint template with correctly structured slide masters
 * and layouts using PptxGenJS's defineSlideMaster() API.
 *
 * Usage:
 *   deno run --allow-read --allow-write scripts/generate-template.ts <output.pptx>
 *
 * Example:
 *   deno run --allow-read --allow-write scripts/generate-template.ts \
 *     ../../storage/starter-templates/pptx/professional-course-template-v1.0.pptx
 */

import { parseArgs } from "jsr:@std/cli@1.0.9/parse-args";
// deno-lint-ignore no-explicit-any
const PptxGenJS: any = (await import("npm:pptxgenjs@3.12.0")).default;

// === Color Scheme ===
const COLORS = {
  primaryBlue: "1B365D",
  accentTeal: "2E7D7A",
  lightGray: "F5F5F5",
  textDark: "333333",
  textMedium: "666666",
  background: "FFFFFF",
  white: "FFFFFF",
};

// === Slide Dimensions (16:9) ===
const SLIDE = {
  width: 10,
  height: 5.625,
  margin: 0.5,
};

// === Font Settings ===
const FONTS = {
  heading: "Arial",
  body: "Arial",
};

// === Help ===
function printHelp(): void {
  console.log(`
generate-template.ts - Create PPTX template with proper slide masters

Usage:
  deno run --allow-read --allow-write scripts/generate-template.ts <output.pptx>

Arguments:
  <output.pptx>    Path for output PowerPoint template file

Options:
  -h, --help       Show this help message
  -v, --verbose    Enable verbose output

Example:
  deno run --allow-read --allow-write scripts/generate-template.ts template.pptx
`);
}

// === Main Template Generation ===
async function generateTemplate(
  outputPath: string,
  verbose: boolean
): Promise<void> {
  // deno-lint-ignore no-explicit-any
  const pptx: any = new PptxGenJS();

  // Set presentation metadata
  pptx.title = "Professional Course Template";
  pptx.subject = "Course Presentation Template";
  pptx.author = "Teach Platform";
  pptx.company = "Teach";

  // Set layout to 16:9
  pptx.defineLayout({ name: "CUSTOM_16_9", width: SLIDE.width, height: SLIDE.height });
  pptx.layout = "CUSTOM_16_9";

  if (verbose) console.error("Defining slide masters...");

  // === 1. TITLE SLIDE ===
  pptx.defineSlideMaster({
    title: "TITLE_SLIDE",
    background: { color: COLORS.primaryBlue },
    objects: [
      // Course title
      {
        text: {
          text: "{{course_title}}",
          options: {
            x: SLIDE.margin,
            y: 1.5,
            w: SLIDE.width - SLIDE.margin * 2,
            h: 1.2,
            fontSize: 44,
            fontFace: FONTS.heading,
            color: COLORS.white,
            bold: true,
            align: "center",
            valign: "middle",
          },
        },
      },
      // Subtitle
      {
        text: {
          text: "{{course_subtitle}}",
          options: {
            x: SLIDE.margin,
            y: 2.8,
            w: SLIDE.width - SLIDE.margin * 2,
            h: 0.6,
            fontSize: 20,
            fontFace: FONTS.body,
            color: COLORS.lightGray,
            align: "center",
            valign: "middle",
          },
        },
      },
      // Instructor name
      {
        text: {
          text: "Instructor: {{instructor_name}}",
          options: {
            x: SLIDE.margin,
            y: 4.2,
            w: (SLIDE.width - SLIDE.margin * 2) / 2,
            h: 0.4,
            fontSize: 14,
            fontFace: FONTS.body,
            color: COLORS.lightGray,
            align: "left",
            valign: "middle",
          },
        },
      },
      // Date
      {
        text: {
          text: "{{course_date}}",
          options: {
            x: SLIDE.width / 2,
            y: 4.2,
            w: (SLIDE.width - SLIDE.margin * 2) / 2,
            h: 0.4,
            fontSize: 14,
            fontFace: FONTS.body,
            color: COLORS.lightGray,
            align: "right",
            valign: "middle",
          },
        },
      },
    ],
  });

  // === 2. SECTION HEADER ===
  pptx.defineSlideMaster({
    title: "SECTION_HEADER",
    background: { color: COLORS.primaryBlue },
    objects: [
      // Section title
      {
        text: {
          text: "{{section_title}}",
          options: {
            x: SLIDE.margin,
            y: 2.0,
            w: SLIDE.width - SLIDE.margin * 2,
            h: 1.0,
            fontSize: 40,
            fontFace: FONTS.heading,
            color: COLORS.white,
            bold: true,
            align: "center",
            valign: "middle",
          },
        },
      },
      // Section description
      {
        text: {
          text: "{{section_description}}",
          options: {
            x: SLIDE.margin,
            y: 3.2,
            w: SLIDE.width - SLIDE.margin * 2,
            h: 0.8,
            fontSize: 18,
            fontFace: FONTS.body,
            color: COLORS.lightGray,
            align: "center",
            valign: "top",
          },
        },
      },
    ],
  });

  // === 3. CONTENT SLIDE ===
  pptx.defineSlideMaster({
    title: "CONTENT",
    background: { color: COLORS.background },
    objects: [
      // Title
      {
        text: {
          text: "{{slide_title}}",
          options: {
            x: SLIDE.margin,
            y: 0.3,
            w: SLIDE.width - SLIDE.margin * 2,
            h: 0.8,
            fontSize: 28,
            fontFace: FONTS.heading,
            color: COLORS.primaryBlue,
            bold: true,
            align: "left",
            valign: "middle",
          },
        },
      },
      // Main content area
      {
        text: {
          text: "{{main_content}}",
          options: {
            x: SLIDE.margin,
            y: 1.3,
            w: SLIDE.width - SLIDE.margin * 2,
            h: 4.0,
            fontSize: 18,
            fontFace: FONTS.body,
            color: COLORS.textDark,
            align: "left",
            valign: "top",
          },
        },
      },
    ],
  });

  // === 4. TWO COLUMN ===
  pptx.defineSlideMaster({
    title: "TWO_COLUMN",
    background: { color: COLORS.background },
    objects: [
      // Title
      {
        text: {
          text: "{{slide_title}}",
          options: {
            x: SLIDE.margin,
            y: 0.3,
            w: SLIDE.width - SLIDE.margin * 2,
            h: 0.8,
            fontSize: 28,
            fontFace: FONTS.heading,
            color: COLORS.primaryBlue,
            bold: true,
            align: "left",
            valign: "middle",
          },
        },
      },
      // Left column
      {
        text: {
          text: "{{left_column}}",
          options: {
            x: SLIDE.margin,
            y: 1.3,
            w: (SLIDE.width - SLIDE.margin * 3) / 2,
            h: 4.0,
            fontSize: 16,
            fontFace: FONTS.body,
            color: COLORS.textDark,
            align: "left",
            valign: "top",
          },
        },
      },
      // Right column
      {
        text: {
          text: "{{right_column}}",
          options: {
            x: SLIDE.width / 2 + SLIDE.margin / 2,
            y: 1.3,
            w: (SLIDE.width - SLIDE.margin * 3) / 2,
            h: 4.0,
            fontSize: 16,
            fontFace: FONTS.body,
            color: COLORS.textDark,
            align: "left",
            valign: "top",
          },
        },
      },
    ],
  });

  // === 5. COMPETENCY OVERVIEW ===
  pptx.defineSlideMaster({
    title: "COMPETENCY",
    background: { color: COLORS.background },
    objects: [
      // Competency title/code
      {
        text: {
          text: "{{competency_title}}",
          options: {
            x: SLIDE.margin,
            y: 0.3,
            w: SLIDE.width - SLIDE.margin * 2,
            h: 0.6,
            fontSize: 24,
            fontFace: FONTS.heading,
            color: COLORS.primaryBlue,
            bold: true,
            align: "left",
            valign: "middle",
          },
        },
      },
      // Competency description box
      {
        rect: {
          x: SLIDE.margin,
          y: 1.0,
          w: SLIDE.width - SLIDE.margin * 2,
          h: 1.2,
          fill: { color: COLORS.lightGray },
          line: { color: COLORS.accentTeal, width: 2 },
        },
      },
      {
        text: {
          text: "{{competency_description}}",
          options: {
            x: SLIDE.margin + 0.2,
            y: 1.1,
            w: SLIDE.width - SLIDE.margin * 2 - 0.4,
            h: 1.0,
            fontSize: 16,
            fontFace: FONTS.body,
            color: COLORS.textDark,
            align: "left",
            valign: "middle",
          },
        },
      },
      // Learning objectives header
      {
        text: {
          text: "Learning Objectives:",
          options: {
            x: SLIDE.margin,
            y: 2.4,
            w: SLIDE.width - SLIDE.margin * 2,
            h: 0.5,
            fontSize: 18,
            fontFace: FONTS.heading,
            color: COLORS.primaryBlue,
            bold: true,
            align: "left",
            valign: "middle",
          },
        },
      },
      // Learning objectives content
      {
        text: {
          text: "{{learning_objectives}}",
          options: {
            x: SLIDE.margin,
            y: 2.9,
            w: SLIDE.width - SLIDE.margin * 2,
            h: 2.4,
            fontSize: 16,
            fontFace: FONTS.body,
            color: COLORS.textDark,
            align: "left",
            valign: "top",
          },
        },
      },
    ],
  });

  // === 6. ACTIVITY INSTRUCTIONS ===
  pptx.defineSlideMaster({
    title: "ACTIVITY",
    background: { color: COLORS.background },
    objects: [
      // Activity prefix
      {
        text: {
          text: "Activity:",
          options: {
            x: SLIDE.margin,
            y: 0.3,
            w: 1.0,
            h: 0.6,
            fontSize: 20,
            fontFace: FONTS.heading,
            color: COLORS.accentTeal,
            bold: true,
            align: "left",
            valign: "middle",
          },
        },
      },
      // Activity title
      {
        text: {
          text: "{{activity_title}}",
          options: {
            x: SLIDE.margin + 1.1,
            y: 0.3,
            w: SLIDE.width - SLIDE.margin * 2 - 1.1,
            h: 0.6,
            fontSize: 24,
            fontFace: FONTS.heading,
            color: COLORS.primaryBlue,
            bold: true,
            align: "left",
            valign: "middle",
          },
        },
      },
      // Instructions header
      {
        text: {
          text: "Instructions:",
          options: {
            x: SLIDE.margin,
            y: 1.0,
            w: 2.0,
            h: 0.4,
            fontSize: 14,
            fontFace: FONTS.heading,
            color: COLORS.textMedium,
            bold: true,
            align: "left",
            valign: "middle",
          },
        },
      },
      // Instructions content
      {
        text: {
          text: "{{activity_instructions}}",
          options: {
            x: SLIDE.margin,
            y: 1.4,
            w: SLIDE.width - SLIDE.margin * 2 - 2.5,
            h: 2.8,
            fontSize: 16,
            fontFace: FONTS.body,
            color: COLORS.textDark,
            align: "left",
            valign: "top",
          },
        },
      },
      // Time estimate box
      {
        rect: {
          x: SLIDE.width - SLIDE.margin - 2.0,
          y: 1.0,
          w: 2.0,
          h: 0.8,
          fill: { color: "E8F4F3" }, // Light teal
          line: { color: COLORS.accentTeal, width: 1 },
        },
      },
      {
        text: {
          text: "{{time_estimate}} min",
          options: {
            x: SLIDE.width - SLIDE.margin - 2.0,
            y: 1.0,
            w: 2.0,
            h: 0.8,
            fontSize: 18,
            fontFace: FONTS.heading,
            color: COLORS.primaryBlue,
            bold: true,
            align: "center",
            valign: "middle",
          },
        },
      },
      // Materials header
      {
        text: {
          text: "Materials Needed:",
          options: {
            x: SLIDE.margin,
            y: 4.3,
            w: 2.5,
            h: 0.4,
            fontSize: 14,
            fontFace: FONTS.heading,
            color: COLORS.textMedium,
            bold: true,
            align: "left",
            valign: "middle",
          },
        },
      },
      // Materials content
      {
        text: {
          text: "{{materials_needed}}",
          options: {
            x: SLIDE.margin + 2.5,
            y: 4.3,
            w: SLIDE.width - SLIDE.margin * 2 - 2.5,
            h: 0.8,
            fontSize: 14,
            fontFace: FONTS.body,
            color: COLORS.textDark,
            align: "left",
            valign: "top",
          },
        },
      },
    ],
  });

  // === 7. Q&A / DISCUSSION ===
  pptx.defineSlideMaster({
    title: "DISCUSSION",
    background: { color: COLORS.background },
    objects: [
      // Discussion header
      {
        text: {
          text: "Discussion",
          options: {
            x: SLIDE.margin,
            y: 0.3,
            w: SLIDE.width - SLIDE.margin * 2,
            h: 0.6,
            fontSize: 24,
            fontFace: FONTS.heading,
            color: COLORS.primaryBlue,
            bold: true,
            align: "left",
            valign: "middle",
          },
        },
      },
      // Discussion prompt box
      {
        rect: {
          x: SLIDE.margin,
          y: 1.0,
          w: SLIDE.width - SLIDE.margin * 2,
          h: 1.2,
          fill: { color: COLORS.lightGray },
        },
      },
      {
        text: {
          text: "{{discussion_prompt}}",
          options: {
            x: SLIDE.margin + 0.2,
            y: 1.1,
            w: SLIDE.width - SLIDE.margin * 2 - 0.4,
            h: 1.0,
            fontSize: 20,
            fontFace: FONTS.body,
            color: COLORS.textDark,
            align: "left",
            valign: "middle",
          },
        },
      },
      // Key points header
      {
        text: {
          text: "Key Discussion Points:",
          options: {
            x: SLIDE.margin,
            y: 2.4,
            w: SLIDE.width - SLIDE.margin * 2,
            h: 0.5,
            fontSize: 16,
            fontFace: FONTS.heading,
            color: COLORS.accentTeal,
            bold: true,
            align: "left",
            valign: "middle",
          },
        },
      },
      // Discussion points
      {
        text: {
          text: "{{discussion_points}}",
          options: {
            x: SLIDE.margin,
            y: 2.9,
            w: SLIDE.width - SLIDE.margin * 2,
            h: 1.5,
            fontSize: 16,
            fontFace: FONTS.body,
            color: COLORS.textDark,
            align: "left",
            valign: "top",
          },
        },
      },
      // Teaching notes (instructor only - styled differently)
      {
        text: {
          text: "Teaching Notes: {{teaching_notes}}",
          options: {
            x: SLIDE.margin,
            y: 4.6,
            w: SLIDE.width - SLIDE.margin * 2,
            h: 0.7,
            fontSize: 12,
            fontFace: FONTS.body,
            color: COLORS.textMedium,
            italic: true,
            align: "left",
            valign: "top",
          },
        },
      },
    ],
  });

  if (verbose) console.error("Creating sample slides...");

  // === Create Sample Slides ===

  // Slide 1: Title
  const slide1 = pptx.addSlide({ masterName: "TITLE_SLIDE" });
  slide1.addNotes("Instructor introduction notes go here. Welcome participants and set expectations for the session.");

  // Slide 2: Section Header
  const slide2 = pptx.addSlide({ masterName: "SECTION_HEADER" });
  slide2.addNotes("Section instructor notes. Provide context for this module and transition from previous content.");

  // Slide 3: Content
  const slide3 = pptx.addSlide({ masterName: "CONTENT" });
  slide3.addNotes("Slide instructor notes. Key talking points and additional context for this slide.");

  // Slide 4: Two Column
  const slide4 = pptx.addSlide({ masterName: "TWO_COLUMN" });
  slide4.addNotes("Two column notes. Use this layout for comparisons or presenting related information side by side.");

  // Slide 5: Competency
  const slide5 = pptx.addSlide({ masterName: "COMPETENCY" });
  slide5.addNotes("Competency assessment notes. How to evaluate learner progress on this competency.");

  // Slide 6: Activity
  const slide6 = pptx.addSlide({ masterName: "ACTIVITY" });
  slide6.addNotes("Activity facilitation notes. Tips for running this activity effectively.");

  // Slide 7: Discussion
  const slide7 = pptx.addSlide({ masterName: "DISCUSSION" });
  slide7.addNotes("Discussion facilitation tips. Watch for common misconceptions and guide conversation constructively.");

  if (verbose) console.error("Writing output file...");

  // Write the file
  const data = await pptx.write({ outputType: "nodebuffer" });
  await Deno.writeFile(outputPath, new Uint8Array(data as ArrayBuffer));

  console.log(`Created: ${outputPath}`);
  console.log(`\nTemplate includes ${7} slide masters:`);
  console.log("  1. TITLE_SLIDE - Course introduction");
  console.log("  2. SECTION_HEADER - Module/section dividers");
  console.log("  3. CONTENT - Standard content slides");
  console.log("  4. TWO_COLUMN - Side-by-side comparisons");
  console.log("  5. COMPETENCY - Learning objectives focus");
  console.log("  6. ACTIVITY - Exercise instructions");
  console.log("  7. DISCUSSION - Q&A and discussion prompts");
}

// === Main Entry Point ===
async function main(args: string[]): Promise<void> {
  const parsed = parseArgs(args, {
    boolean: ["help", "verbose"],
    alias: { help: "h", verbose: "v" },
    default: { verbose: false },
  });

  if (parsed.help) {
    printHelp();
    Deno.exit(0);
  }

  const positionalArgs = parsed._.map(String);

  if (positionalArgs.length < 1) {
    console.error("Error: Output path is required\n");
    printHelp();
    Deno.exit(1);
  }

  const outputPath = positionalArgs[0];

  try {
    await generateTemplate(outputPath, parsed.verbose as boolean);
  } catch (error) {
    console.error(
      "Error:",
      error instanceof Error ? error.message : String(error)
    );
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main(Deno.args);
}
