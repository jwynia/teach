import { PdfSpec, PageElement } from "../types.js";

// ============================================================================
// Input Data Types (mirror database row structures)
// ============================================================================

export interface CourseData {
  id: string;
  title: string;
  description: string;
}

export interface LessonData {
  id: string;
  title: string;
  description: string;
  content: {
    type: "markdown" | "html";
    body: string;
  };
}

export interface CompetencyData {
  id: string;
  code: string;
  title: string;
  description: string;
}

export interface ActivityData {
  id: string;
  type: string;
  title: string;
  instructions: string;
}

export interface StudentHandoutOptions {
  pageSize?: "A4" | "Letter";
  includeNotes?: boolean;
  notesLines?: number;
}

// ============================================================================
// Layout Constants
// ============================================================================

const COLORS = {
  black: { r: 0, g: 0, b: 0 },
  darkGray: { r: 0.3, g: 0.3, b: 0.3 },
  lightGray: { r: 0.85, g: 0.85, b: 0.85 },
  headerBg: { r: 0.95, g: 0.95, b: 0.95 },
  checkboxBlue: { r: 0.2, g: 0.4, b: 0.8 },
};

// Page dimensions for Letter size (612 x 792 points)
const PAGE = {
  width: 612,
  height: 792,
  marginTop: 72,
  marginBottom: 72,
  marginLeft: 72,
  marginRight: 72,
};

const CONTENT_WIDTH = PAGE.width - PAGE.marginLeft - PAGE.marginRight;

// ============================================================================
// Text Processing Utilities
// ============================================================================

function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s+/g, "") // headers
    .replace(/\*\*(.+?)\*\*/g, "$1") // bold
    .replace(/\*(.+?)\*/g, "$1") // italic
    .replace(/__(.+?)__/g, "$1") // bold underscore
    .replace(/_(.+?)_/g, "$1") // italic underscore
    .replace(/`(.+?)`/g, "$1") // inline code
    .replace(/\[(.+?)\]\(.+?\)/g, "$1") // links
    .replace(/^\s*[-*+]\s+/gm, "• ") // bullet points
    .replace(/^\s*\d+\.\s+/gm, "") // numbered lists
    .replace(/>\s+/g, "") // blockquotes
    .trim();
}

function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  const avgCharWidth = fontSize * 0.5; // Approximate for Helvetica
  const charsPerLine = Math.floor(maxWidth / avgCharWidth);

  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= charsPerLine) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines;
}

function extractKeyPoints(content: string): string[] {
  const stripped = stripMarkdown(content);

  // Split into paragraphs and take meaningful ones
  const paragraphs = stripped
    .split(/\n\n+/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter((p) => p.length > 20 && p.length < 500);

  // Return up to 5 key points
  return paragraphs.slice(0, 5);
}

// ============================================================================
// Element Builders
// ============================================================================

function buildHeader(
  course: CourseData,
  lesson: LessonData,
  yPos: number
): { elements: PageElement[]; newY: number } {
  const elements: PageElement[] = [];

  // Header background
  elements.push({
    type: "rectangle",
    x: PAGE.marginLeft - 10,
    y: yPos - 50,
    width: CONTENT_WIDTH + 20,
    height: 60,
    color: COLORS.headerBg,
  });

  // Course title (smaller)
  elements.push({
    type: "text",
    x: PAGE.marginLeft,
    y: yPos - 15,
    text: course.title,
    fontSize: 10,
    font: "Helvetica",
    color: COLORS.darkGray,
  });

  // Lesson title (larger)
  elements.push({
    type: "text",
    x: PAGE.marginLeft,
    y: yPos - 35,
    text: lesson.title,
    fontSize: 18,
    font: "HelveticaBold",
    color: COLORS.black,
  });

  // Divider line
  elements.push({
    type: "line",
    startX: PAGE.marginLeft,
    startY: yPos - 55,
    endX: PAGE.width - PAGE.marginRight,
    endY: yPos - 55,
    color: COLORS.darkGray,
    thickness: 1,
  });

  return { elements, newY: yPos - 75 };
}

function buildObjectivesSection(
  competencies: CompetencyData[],
  yPos: number
): { elements: PageElement[]; newY: number } {
  const elements: PageElement[] = [];

  if (competencies.length === 0) {
    return { elements, newY: yPos };
  }

  // Section heading
  elements.push({
    type: "text",
    x: PAGE.marginLeft,
    y: yPos,
    text: "Learning Objectives",
    fontSize: 14,
    font: "HelveticaBold",
    color: COLORS.black,
  });

  let currentY = yPos - 25;

  for (const comp of competencies) {
    // Checkbox square
    elements.push({
      type: "rectangle",
      x: PAGE.marginLeft,
      y: currentY - 10,
      width: 12,
      height: 12,
      borderColor: COLORS.checkboxBlue,
      borderWidth: 1,
    });

    // Competency description (wrapped if needed)
    const text = comp.description.startsWith("Can ")
      ? comp.description
      : `Can ${comp.description.toLowerCase()}`;

    const lines = wrapText(text, CONTENT_WIDTH - 25, 11);

    for (let i = 0; i < lines.length; i++) {
      elements.push({
        type: "text",
        x: PAGE.marginLeft + 20,
        y: currentY - (i * 14),
        text: lines[i],
        fontSize: 11,
        font: "Helvetica",
        color: COLORS.black,
      });
    }

    currentY -= lines.length * 14 + 8;
  }

  return { elements, newY: currentY - 15 };
}

function buildKeyConceptsSection(
  content: string,
  yPos: number
): { elements: PageElement[]; newY: number } {
  const elements: PageElement[] = [];

  const keyPoints = extractKeyPoints(content);
  if (keyPoints.length === 0) {
    return { elements, newY: yPos };
  }

  // Section heading
  elements.push({
    type: "text",
    x: PAGE.marginLeft,
    y: yPos,
    text: "Key Concepts",
    fontSize: 14,
    font: "HelveticaBold",
    color: COLORS.black,
  });

  let currentY = yPos - 25;

  for (const point of keyPoints) {
    // Bullet
    elements.push({
      type: "text",
      x: PAGE.marginLeft,
      y: currentY,
      text: "•",
      fontSize: 11,
      font: "Helvetica",
      color: COLORS.darkGray,
    });

    // Point text (wrapped)
    const lines = wrapText(point, CONTENT_WIDTH - 20, 11);
    for (let i = 0; i < lines.length; i++) {
      elements.push({
        type: "text",
        x: PAGE.marginLeft + 15,
        y: currentY - (i * 14),
        text: lines[i],
        fontSize: 11,
        font: "Helvetica",
        color: COLORS.black,
      });
    }

    currentY -= lines.length * 14 + 8;
  }

  return { elements, newY: currentY - 15 };
}

function buildActivitiesSection(
  activities: ActivityData[],
  yPos: number
): { elements: PageElement[]; newY: number } {
  const elements: PageElement[] = [];

  if (activities.length === 0) {
    return { elements, newY: yPos };
  }

  // Section heading
  elements.push({
    type: "text",
    x: PAGE.marginLeft,
    y: yPos,
    text: "Activities",
    fontSize: 14,
    font: "HelveticaBold",
    color: COLORS.black,
  });

  let currentY = yPos - 25;

  for (const activity of activities) {
    // Activity title
    elements.push({
      type: "text",
      x: PAGE.marginLeft,
      y: currentY,
      text: activity.title,
      fontSize: 12,
      font: "HelveticaBold",
      color: COLORS.black,
    });

    currentY -= 18;

    // Instructions (wrapped)
    const instructionLines = wrapText(activity.instructions, CONTENT_WIDTH - 10, 10);
    for (let i = 0; i < Math.min(instructionLines.length, 4); i++) {
      elements.push({
        type: "text",
        x: PAGE.marginLeft + 10,
        y: currentY - (i * 13),
        text: instructionLines[i] + (i === 3 && instructionLines.length > 4 ? "..." : ""),
        fontSize: 10,
        font: "Helvetica",
        color: COLORS.darkGray,
      });
    }

    currentY -= Math.min(instructionLines.length, 4) * 13 + 15;
  }

  return { elements, newY: currentY - 10 };
}

function buildNotesSection(
  yPos: number,
  lineCount: number = 10
): { elements: PageElement[]; newY: number } {
  const elements: PageElement[] = [];

  // Section heading
  elements.push({
    type: "text",
    x: PAGE.marginLeft,
    y: yPos,
    text: "Notes",
    fontSize: 14,
    font: "HelveticaBold",
    color: COLORS.black,
  });

  let currentY = yPos - 25;
  const lineSpacing = 25;

  // Draw horizontal lines for notes
  for (let i = 0; i < lineCount && currentY > PAGE.marginBottom + lineSpacing; i++) {
    elements.push({
      type: "line",
      startX: PAGE.marginLeft,
      startY: currentY,
      endX: PAGE.width - PAGE.marginRight,
      endY: currentY,
      color: COLORS.lightGray,
      thickness: 0.5,
    });
    currentY -= lineSpacing;
  }

  return { elements, newY: currentY };
}

// ============================================================================
// Main Builder Function
// ============================================================================

export function buildStudentHandoutSpec(
  course: CourseData,
  lesson: LessonData,
  competencies: CompetencyData[],
  activities: ActivityData[],
  options: StudentHandoutOptions = {}
): PdfSpec {
  const { pageSize = "Letter", includeNotes = true, notesLines = 8 } = options;

  const pages: { size: "A4" | "Letter"; elements: PageElement[] }[] = [];
  let currentPage: PageElement[] = [];
  let yPos = PAGE.height - PAGE.marginTop;

  // Helper to check if we need a new page
  const checkPageBreak = (neededSpace: number) => {
    if (yPos - neededSpace < PAGE.marginBottom) {
      pages.push({ size: pageSize, elements: currentPage });
      currentPage = [];
      yPos = PAGE.height - PAGE.marginTop;
    }
  };

  // Build header
  const header = buildHeader(course, lesson, yPos);
  currentPage.push(...header.elements);
  yPos = header.newY;

  // Build objectives section
  if (competencies.length > 0) {
    checkPageBreak(100);
    const objectives = buildObjectivesSection(competencies, yPos);
    currentPage.push(...objectives.elements);
    yPos = objectives.newY;
  }

  // Build key concepts section
  if (lesson.content.body) {
    checkPageBreak(100);
    const concepts = buildKeyConceptsSection(lesson.content.body, yPos);
    currentPage.push(...concepts.elements);
    yPos = concepts.newY;
  }

  // Build activities section
  if (activities.length > 0) {
    checkPageBreak(80);
    const acts = buildActivitiesSection(activities, yPos);
    currentPage.push(...acts.elements);
    yPos = acts.newY;
  }

  // Build notes section
  if (includeNotes) {
    checkPageBreak(80);
    const notes = buildNotesSection(yPos, notesLines);
    currentPage.push(...notes.elements);
  }

  // Add final page
  pages.push({ size: pageSize, elements: currentPage });

  return {
    title: `${lesson.title} - Student Handout`,
    author: course.title,
    subject: lesson.description,
    creator: "Teach Document Generator",
    pages,
  };
}
