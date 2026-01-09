// Document Generation Services - Barrel Export

// Types
export * from "./types.js";

// Services
export { pdfService, type PdfService } from "./pdf.service.js";

// Spec Builders
export {
  buildStudentHandoutSpec,
  type CourseData,
  type LessonData,
  type CompetencyData,
  type ActivityData,
  type StudentHandoutOptions,
} from "./spec-builders/student-handout.builder.js";
