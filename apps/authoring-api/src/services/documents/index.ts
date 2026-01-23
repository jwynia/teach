// Document Generation Services - Barrel Export

// Types
export * from "./types.js";

// Services
export { pdfService, type PdfService } from "./pdf.service.js";
export { docxService, type DocxService } from "./docx.service.js";
export {
  pptxService,
  type PptxService,
  type SlideData,
  type SlideType,
  type PptxGenerationOptions,
} from "./pptx.service.js";

export {
  discoverLayoutsFromZip,
  loadLayoutsFromManifest,
  buildLayoutMap,
  findMatchingLayout,
  populatePlaceholders,
  DEFAULT_TEMPLATE_PATH,
  DEFAULT_TEMPLATE_ID,
  type DiscoveredLayout,
  type TextReplacement,
} from "./pptx-template-utils.js";

// Spec Builders
export {
  buildStudentHandoutSpec,
  type CourseData,
  type LessonData,
  type CompetencyData,
  type ActivityData,
  type StudentHandoutOptions,
} from "./spec-builders/student-handout.builder.js";

export {
  buildInstructorGuideSpec,
  type InstructorGuideOptions,
} from "./spec-builders/instructor-guide.builder.js";
