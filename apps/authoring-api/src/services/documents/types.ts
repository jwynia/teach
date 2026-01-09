import { z } from "zod";

// ============================================================================
// Common Types
// ============================================================================

export const ColorSchema = z.object({
  r: z.number().min(0).max(1),
  g: z.number().min(0).max(1),
  b: z.number().min(0).max(1),
});

export type Color = z.infer<typeof ColorSchema>;

export interface GenerationResult {
  buffer: Buffer;
  filename: string;
  contentType: string;
  metadata: {
    pageCount?: number;
    slideCount?: number;
    sheetCount?: number;
  };
}

// ============================================================================
// PDF Spec Types
// ============================================================================

export const TextElementSchema = z.object({
  type: z.literal("text"),
  x: z.number(),
  y: z.number(),
  text: z.string(),
  fontSize: z.number().optional().default(12),
  font: z
    .enum([
      "Helvetica",
      "HelveticaBold",
      "HelveticaOblique",
      "TimesRoman",
      "TimesRomanBold",
      "Courier",
      "CourierBold",
    ])
    .optional()
    .default("Helvetica"),
  color: ColorSchema.optional(),
  maxWidth: z.number().optional(),
  lineHeight: z.number().optional(),
  rotate: z.number().optional(),
});

export const ImageElementSchema = z.object({
  type: z.literal("image"),
  x: z.number(),
  y: z.number(),
  data: z.instanceof(Buffer).optional(),
  path: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  opacity: z.number().min(0).max(1).optional(),
  rotate: z.number().optional(),
});

export const RectangleElementSchema = z.object({
  type: z.literal("rectangle"),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  color: ColorSchema.optional(),
  borderColor: ColorSchema.optional(),
  borderWidth: z.number().optional(),
  opacity: z.number().min(0).max(1).optional(),
});

export const LineElementSchema = z.object({
  type: z.literal("line"),
  startX: z.number(),
  startY: z.number(),
  endX: z.number(),
  endY: z.number(),
  color: ColorSchema.optional(),
  thickness: z.number().optional().default(1),
  opacity: z.number().min(0).max(1).optional(),
});

export const CircleElementSchema = z.object({
  type: z.literal("circle"),
  x: z.number(),
  y: z.number(),
  radius: z.number(),
  color: ColorSchema.optional(),
  borderColor: ColorSchema.optional(),
  borderWidth: z.number().optional(),
  opacity: z.number().min(0).max(1).optional(),
});

export const TableElementSchema = z.object({
  type: z.literal("table"),
  x: z.number(),
  y: z.number(),
  rows: z.array(z.array(z.string())),
  columnWidths: z.array(z.number()),
  rowHeight: z.number().optional().default(20),
  fontSize: z.number().optional().default(10),
  headerBackground: ColorSchema.optional(),
  borderColor: ColorSchema.optional(),
  padding: z.number().optional().default(5),
});

export const PageElementSchema = z.discriminatedUnion("type", [
  TextElementSchema,
  ImageElementSchema,
  RectangleElementSchema,
  LineElementSchema,
  CircleElementSchema,
  TableElementSchema,
]);

export const PageSpecSchema = z.object({
  size: z
    .union([
      z.enum(["A4", "Letter", "Legal"]),
      z.tuple([z.number(), z.number()]),
    ])
    .optional()
    .default("Letter"),
  margins: z
    .object({
      top: z.number().optional().default(72),
      right: z.number().optional().default(72),
      bottom: z.number().optional().default(72),
      left: z.number().optional().default(72),
    })
    .optional(),
  elements: z.array(PageElementSchema),
});

export const PdfSpecSchema = z.object({
  title: z.string().optional(),
  author: z.string().optional(),
  subject: z.string().optional(),
  creator: z.string().optional().default("Teach Document Generator"),
  pages: z.array(PageSpecSchema),
});

export type TextElement = z.infer<typeof TextElementSchema>;
export type ImageElement = z.infer<typeof ImageElementSchema>;
export type RectangleElement = z.infer<typeof RectangleElementSchema>;
export type LineElement = z.infer<typeof LineElementSchema>;
export type CircleElement = z.infer<typeof CircleElementSchema>;
export type TableElement = z.infer<typeof TableElementSchema>;
export type PageElement = z.infer<typeof PageElementSchema>;
export type PageSpec = z.infer<typeof PageSpecSchema>;
export type PdfSpec = z.infer<typeof PdfSpecSchema>;

// ============================================================================
// DOCX Spec Types
// ============================================================================

export const TextRunSchema = z.object({
  text: z.string(),
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  underline: z.boolean().optional(),
  strike: z.boolean().optional(),
  color: z.string().optional(),
  highlight: z.string().optional(),
  fontSize: z.number().optional(),
});

export const ParagraphSpecSchema = z.object({
  type: z.literal("paragraph").optional().default("paragraph"),
  text: z.string().optional(),
  runs: z.array(TextRunSchema).optional(),
  heading: z.enum(["1", "2", "3", "4", "5", "6"]).optional(),
  alignment: z.enum(["left", "center", "right", "justify"]).optional(),
  bullet: z.boolean().optional(),
  numbering: z.boolean().optional(),
  spacing: z
    .object({
      before: z.number().optional(),
      after: z.number().optional(),
      line: z.number().optional(),
    })
    .optional(),
});

export const TableCellSpecSchema = z.object({
  content: z.string(),
  bold: z.boolean().optional(),
  shading: z.string().optional(),
  colSpan: z.number().optional(),
  rowSpan: z.number().optional(),
});

export const TableRowSpecSchema = z.object({
  cells: z.array(TableCellSpecSchema),
  isHeader: z.boolean().optional(),
});

export const DocxTableSpecSchema = z.object({
  type: z.literal("table"),
  rows: z.array(TableRowSpecSchema),
  columnWidths: z.array(z.number()).optional(),
  borders: z.boolean().optional().default(true),
});

export const PageBreakSpecSchema = z.object({
  type: z.literal("pageBreak"),
});

export const DocxContentSchema = z.discriminatedUnion("type", [
  ParagraphSpecSchema.extend({ type: z.literal("paragraph") }),
  DocxTableSpecSchema,
  PageBreakSpecSchema,
]);

export const DocxSectionSchema = z.object({
  header: z
    .object({
      paragraphs: z.array(ParagraphSpecSchema),
    })
    .optional(),
  footer: z
    .object({
      paragraphs: z.array(ParagraphSpecSchema),
    })
    .optional(),
  content: z.array(DocxContentSchema),
});

export const DocxSpecSchema = z.object({
  title: z.string().optional(),
  creator: z.string().optional().default("Teach Document Generator"),
  description: z.string().optional(),
  sections: z.array(DocxSectionSchema),
});

export type TextRun = z.infer<typeof TextRunSchema>;
export type ParagraphSpec = z.infer<typeof ParagraphSpecSchema>;
export type TableCellSpec = z.infer<typeof TableCellSpecSchema>;
export type TableRowSpec = z.infer<typeof TableRowSpecSchema>;
export type DocxTableSpec = z.infer<typeof DocxTableSpecSchema>;
export type DocxSection = z.infer<typeof DocxSectionSchema>;
export type DocxSpec = z.infer<typeof DocxSpecSchema>;

// ============================================================================
// XLSX Spec Types
// ============================================================================

export const CellSpecSchema = z.object({
  address: z.string(),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
  formula: z.string().optional(),
  format: z.string().optional(),
  bold: z.boolean().optional(),
  alignment: z.enum(["left", "center", "right"]).optional(),
});

export const ColumnSpecSchema = z.object({
  col: z.string(),
  width: z.number(),
  hidden: z.boolean().optional(),
});

export const MergeSpecSchema = z.object({
  range: z.string(),
});

export const SheetSpecSchema = z.object({
  name: z.string(),
  data: z.array(z.array(z.union([z.string(), z.number(), z.null()]))).optional(),
  cells: z.array(CellSpecSchema).optional(),
  columns: z.array(ColumnSpecSchema).optional(),
  merges: z.array(MergeSpecSchema).optional(),
  freezePane: z.string().optional(),
  autoFilter: z.string().optional(),
});

export const XlsxSpecSchema = z.object({
  title: z.string().optional(),
  creator: z.string().optional().default("Teach Document Generator"),
  sheets: z.array(SheetSpecSchema),
});

export type CellSpec = z.infer<typeof CellSpecSchema>;
export type ColumnSpec = z.infer<typeof ColumnSpecSchema>;
export type MergeSpec = z.infer<typeof MergeSpecSchema>;
export type SheetSpec = z.infer<typeof SheetSpecSchema>;
export type XlsxSpec = z.infer<typeof XlsxSpecSchema>;

// ============================================================================
// API Request/Response Types
// ============================================================================

export const DocumentGenerationRequestSchema = z.object({
  documentTypes: z.array(
    z.enum([
      "lecture-slides",
      "student-handout",
      "instructor-guide",
      "assessment-worksheet",
      "grading-rubric",
    ])
  ),
  format: z
    .object({
      slides: z.enum(["pptx", "revealjs"]).optional(),
    })
    .optional(),
  estimatedDuration: z.number().optional(),
});

export type DocumentGenerationRequest = z.infer<
  typeof DocumentGenerationRequestSchema
>;

export interface GeneratedDocumentResponse {
  type: string;
  filename: string;
  path: string;
  contentType: string;
  fileSize: number;
}
