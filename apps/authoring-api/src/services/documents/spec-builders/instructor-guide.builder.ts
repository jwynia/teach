/**
 * Instructor Guide DOCX Spec Builder
 *
 * Builds a DocxSpec for instructor guide documents from course/lesson data.
 * Includes learning objectives, activities with timing, and facilitation notes.
 */

import { DocxSpec, DocxSection, ParagraphSpec, DocxTableSpec } from "../types.js";
import { CourseData, LessonData, CompetencyData, ActivityData } from "./student-handout.builder.js";

// ============================================================================
// Types
// ============================================================================

export interface InstructorGuideOptions {
  includeTimingNotes?: boolean;
  includeFacilitationTips?: boolean;
  includeAssessmentNotes?: boolean;
}

// ============================================================================
// Content Builders
// ============================================================================

type DocxContent = ParagraphSpec | DocxTableSpec | { type: "pageBreak" };

function buildTitleSection(
  course: CourseData,
  lesson: LessonData
): DocxContent[] {
  const content: DocxContent[] = [];

  // Course title
  content.push({
    type: "paragraph",
    text: course.title,
    heading: "1",
    alignment: "center",
    spacing: { after: 100 },
  });

  // Instructor Guide subtitle
  content.push({
    type: "paragraph",
    runs: [
      { text: "Instructor Guide: ", bold: true },
      { text: lesson.title },
    ],
    heading: "2",
    alignment: "center",
    spacing: { after: 200 },
  });

  // Lesson description
  if (lesson.description) {
    content.push({
      type: "paragraph",
      runs: [
        { text: "Overview: ", bold: true },
        { text: lesson.description },
      ],
      spacing: { after: 200 },
    });
  }

  return content;
}

function buildLearningObjectivesSection(
  competencies: CompetencyData[]
): DocxContent[] {
  const content: DocxContent[] = [];

  if (competencies.length === 0) {
    return content;
  }

  // Section heading
  content.push({
    type: "paragraph",
    text: "Learning Objectives",
    heading: "3",
    spacing: { before: 200, after: 100 },
  });

  // Build table rows
  const tableRows = [
    {
      cells: [
        { content: "Code", bold: true, shading: "DDDDDD" },
        { content: "Competency", bold: true, shading: "DDDDDD" },
        { content: "Assessment Notes", bold: true, shading: "DDDDDD" },
      ],
      isHeader: true,
    },
    ...competencies.map((comp) => ({
      cells: [
        { content: comp.code || "—" },
        { content: comp.title },
        { content: "" }, // Empty for instructor to fill in
      ],
    })),
  ];

  content.push({
    type: "table",
    rows: tableRows,
    columnWidths: [1, 3, 2],
    borders: true,
  });

  return content;
}

function buildActivitiesSection(
  activities: ActivityData[],
  options: InstructorGuideOptions
): DocxContent[] {
  const content: DocxContent[] = [];

  if (activities.length === 0) {
    return content;
  }

  const {
    includeTimingNotes = true,
    includeFacilitationTips = true,
  } = options;

  // Section heading
  content.push({
    type: "paragraph",
    text: "Activities & Facilitation",
    heading: "3",
    spacing: { before: 300, after: 100 },
  });

  for (const activity of activities) {
    // Activity title with type
    content.push({
      type: "paragraph",
      runs: [
        { text: activity.title, bold: true },
        { text: ` (${activity.type})`, italic: true },
      ],
      spacing: { before: 200, after: 50 },
    });

    // Instructions
    if (activity.instructions) {
      content.push({
        type: "paragraph",
        text: activity.instructions,
        spacing: { after: 100 },
      });
    }

    // Timing notes placeholder
    if (includeTimingNotes) {
      content.push({
        type: "paragraph",
        runs: [
          { text: "Suggested Time: ", bold: true, italic: true },
          { text: "_____ minutes" },
        ],
        spacing: { after: 50 },
      });
    }

    // Facilitation tips placeholder
    if (includeFacilitationTips) {
      content.push({
        type: "paragraph",
        runs: [{ text: "Facilitation Tips:", bold: true, italic: true }],
        spacing: { after: 50 },
      });

      // Empty lines for notes
      content.push({
        type: "paragraph",
        text: "________________________________________________________________________",
        spacing: { after: 50 },
      });
      content.push({
        type: "paragraph",
        text: "________________________________________________________________________",
        spacing: { after: 100 },
      });
    }
  }

  return content;
}

function buildAssessmentSection(
  competencies: CompetencyData[],
  options: InstructorGuideOptions
): DocxContent[] {
  const content: DocxContent[] = [];

  if (!options.includeAssessmentNotes || competencies.length === 0) {
    return content;
  }

  // Section heading
  content.push({
    type: "paragraph",
    text: "Assessment Guidelines",
    heading: "3",
    spacing: { before: 300, after: 100 },
  });

  content.push({
    type: "paragraph",
    text: "Use the following criteria to assess student competency:",
    spacing: { after: 100 },
  });

  for (const comp of competencies) {
    content.push({
      type: "paragraph",
      runs: [
        { text: `${comp.code || "—"}: `, bold: true },
        { text: comp.title },
      ],
      bullet: true,
      spacing: { after: 50 },
    });

    if (comp.description) {
      content.push({
        type: "paragraph",
        text: comp.description,
        spacing: { after: 100 },
      });
    }
  }

  return content;
}

function buildNotesSection(): DocxContent[] {
  const content: DocxContent[] = [];

  // Section heading
  content.push({
    type: "paragraph",
    text: "Additional Notes",
    heading: "3",
    spacing: { before: 300, after: 100 },
  });

  // Empty lines for notes
  for (let i = 0; i < 10; i++) {
    content.push({
      type: "paragraph",
      text: "________________________________________________________________________",
      spacing: { after: 50 },
    });
  }

  return content;
}

// ============================================================================
// Main Builder Function
// ============================================================================

export function buildInstructorGuideSpec(
  course: CourseData,
  lesson: LessonData,
  competencies: CompetencyData[],
  activities: ActivityData[],
  options: InstructorGuideOptions = {}
): DocxSpec {
  const {
    includeTimingNotes = true,
    includeFacilitationTips = true,
    includeAssessmentNotes = true,
  } = options;

  const resolvedOptions = {
    includeTimingNotes,
    includeFacilitationTips,
    includeAssessmentNotes,
  };

  // Build all content sections
  const content: DocxContent[] = [
    ...buildTitleSection(course, lesson),
    ...buildLearningObjectivesSection(competencies),
    ...buildActivitiesSection(activities, resolvedOptions),
    ...buildAssessmentSection(competencies, resolvedOptions),
    ...buildNotesSection(),
  ];

  // Build the main section with header and footer
  const mainSection: DocxSection = {
    header: {
      paragraphs: [
        {
          type: "paragraph",
          runs: [
            { text: course.title, bold: true },
            { text: "  |  INSTRUCTOR GUIDE" },
          ],
          alignment: "left",
        },
      ],
    },
    footer: {
      paragraphs: [
        {
          type: "paragraph",
          text: "Confidential - For Instructor Use Only",
          alignment: "center",
        },
      ],
    },
    content,
  };

  return {
    title: `${lesson.title} - Instructor Guide`,
    creator: "Teach Document Generator",
    description: `Instructor guide for ${lesson.title} in ${course.title}`,
    sections: [mainSection],
  };
}
