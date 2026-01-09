/**
 * DOCX Generation Service
 *
 * Converts DocxSpec objects into Word documents using the docx library.
 * Follows the same spec-driven pattern as pdf.service.ts.
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  Header,
  Footer,
  PageBreak,
  ITableCellOptions,
  ISectionOptions,
  convertInchesToTwip,
} from "docx";

import {
  DocxSpec,
  DocxSpecSchema,
  DocxSection,
  ParagraphSpec,
  TextRun as TextRunSpec,
  DocxTableSpec,
  TableRowSpec,
  TableCellSpec,
  GenerationResult,
} from "./types.js";

// ============================================================================
// Constants
// ============================================================================

const ALIGNMENT_MAP: Record<string, (typeof AlignmentType)[keyof typeof AlignmentType]> = {
  left: AlignmentType.LEFT,
  center: AlignmentType.CENTER,
  right: AlignmentType.RIGHT,
  justify: AlignmentType.JUSTIFIED,
};

const HEADING_MAP: Record<string, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
  "1": HeadingLevel.HEADING_1,
  "2": HeadingLevel.HEADING_2,
  "3": HeadingLevel.HEADING_3,
  "4": HeadingLevel.HEADING_4,
  "5": HeadingLevel.HEADING_5,
  "6": HeadingLevel.HEADING_6,
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Normalize color string by removing # prefix if present
 */
function normalizeColor(color?: string): string | undefined {
  if (!color) return undefined;
  return color.replace(/^#/, "");
}

// ============================================================================
// Element Builder Functions
// ============================================================================

// Valid highlight color values for docx
type HighlightColor =
  | "black"
  | "blue"
  | "cyan"
  | "darkBlue"
  | "darkCyan"
  | "darkGray"
  | "darkGreen"
  | "darkMagenta"
  | "darkRed"
  | "darkYellow"
  | "green"
  | "lightGray"
  | "magenta"
  | "red"
  | "white"
  | "yellow";

const VALID_HIGHLIGHTS = new Set<string>([
  "black", "blue", "cyan", "darkBlue", "darkCyan", "darkGray", "darkGreen",
  "darkMagenta", "darkRed", "darkYellow", "green", "lightGray", "magenta",
  "red", "white", "yellow",
]);

function normalizeHighlight(highlight?: string): HighlightColor | undefined {
  if (!highlight) return undefined;
  const lower = highlight.toLowerCase();
  if (VALID_HIGHLIGHTS.has(lower)) {
    return lower as HighlightColor;
  }
  // Default to yellow if invalid
  return "yellow";
}

/**
 * Build a TextRun from a spec
 */
function buildTextRun(spec: TextRunSpec): TextRun {
  return new TextRun({
    text: spec.text,
    bold: spec.bold,
    italics: spec.italic, // docx uses "italics" not "italic"
    underline: spec.underline ? {} : undefined, // docx expects object, not boolean
    strike: spec.strike,
    size: spec.fontSize ? spec.fontSize * 2 : undefined, // convert to half-points
    color: normalizeColor(spec.color),
    highlight: normalizeHighlight(spec.highlight),
  });
}

/**
 * Build a Paragraph from a spec
 */
function buildParagraph(spec: ParagraphSpec): Paragraph {
  const children: TextRun[] = [];

  // Handle simple text
  if (spec.text) {
    children.push(new TextRun(spec.text));
  }

  // Handle formatted runs
  if (spec.runs) {
    for (const run of spec.runs) {
      children.push(buildTextRun(run));
    }
  }

  return new Paragraph({
    children,
    heading: spec.heading ? HEADING_MAP[spec.heading] : undefined,
    alignment: spec.alignment ? ALIGNMENT_MAP[spec.alignment] : undefined,
    bullet: spec.bullet ? { level: 0 } : undefined,
    numbering: spec.numbering
      ? { reference: "default-numbering", level: 0 }
      : undefined,
    spacing: spec.spacing
      ? {
          before: spec.spacing.before,
          after: spec.spacing.after,
          line: spec.spacing.line,
        }
      : undefined,
  });
}

/**
 * Build a TableCell from a spec
 */
function buildTableCell(spec: TableCellSpec): TableCell {
  const cellOptions: ITableCellOptions = {
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: spec.content,
            bold: spec.bold,
          }),
        ],
      }),
    ],
    columnSpan: spec.colSpan,
    rowSpan: spec.rowSpan,
    shading: spec.shading ? { fill: normalizeColor(spec.shading) } : undefined,
  };

  return new TableCell(cellOptions);
}

/**
 * Build a TableRow from a spec
 */
function buildTableRow(spec: TableRowSpec): TableRow {
  return new TableRow({
    children: spec.cells.map(buildTableCell),
    tableHeader: spec.isHeader,
  });
}

/**
 * Build a Table from a spec
 */
function buildTable(spec: DocxTableSpec): Table {
  const rows = spec.rows.map(buildTableRow);

  // Default borders configuration
  const bordersConfig =
    spec.borders === false
      ? {
          top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        }
      : undefined;

  return new Table({
    rows,
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: bordersConfig,
    columnWidths: spec.columnWidths
      ? spec.columnWidths.map((w) => convertInchesToTwip(w))
      : undefined,
  });
}

/**
 * Build section content from a content array
 */
function buildSectionContent(
  content: DocxSection["content"]
): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  for (const item of content) {
    if (item.type === "paragraph") {
      elements.push(buildParagraph(item));
    } else if (item.type === "table") {
      elements.push(buildTable(item));
    } else if (item.type === "pageBreak") {
      elements.push(
        new Paragraph({
          children: [new PageBreak()],
        })
      );
    }
  }

  return elements;
}

/**
 * Build header paragraphs
 */
function buildHeaderFooterContent(
  spec: { paragraphs: ParagraphSpec[] }
): Paragraph[] {
  return spec.paragraphs.map(buildParagraph);
}

/**
 * Build a section from a spec
 */
function buildSection(spec: DocxSection): ISectionOptions {
  return {
    children: buildSectionContent(spec.content),
    headers: spec.header
      ? {
          default: new Header({
            children: buildHeaderFooterContent(spec.header),
          }),
        }
      : undefined,
    footers: spec.footer
      ? {
          default: new Footer({
            children: buildHeaderFooterContent(spec.footer),
          }),
        }
      : undefined,
  };
}

// ============================================================================
// Service Interface
// ============================================================================

export interface DocxService {
  generate(spec: DocxSpec): Promise<GenerationResult>;
}

export const docxService: DocxService = {
  async generate(spec: DocxSpec): Promise<GenerationResult> {
    // 1. Validate spec
    const validatedSpec = DocxSpecSchema.parse(spec);

    // 2. Build all sections
    const sections = validatedSpec.sections.map(buildSection);

    // 3. Create document with metadata and numbering configuration
    const doc = new Document({
      title: validatedSpec.title,
      creator: validatedSpec.creator || "Teach Document Generator",
      description: validatedSpec.description,
      // Numbering configuration for bullet and numbered lists
      numbering: {
        config: [
          {
            reference: "default-numbering",
            levels: [
              {
                level: 0,
                format: "decimal",
                text: "%1.",
                alignment: AlignmentType.START,
              },
            ],
          },
        ],
      },
      sections,
    });

    // 4. Generate buffer
    const buffer = await Packer.toBuffer(doc);

    // 5. Generate filename
    const title = validatedSpec.title || "document";
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase();
    const filename = `${sanitizedTitle}.docx`;

    // 6. Return result
    return {
      buffer: Buffer.from(buffer),
      filename,
      contentType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      metadata: {
        // DOCX doesn't expose page count without rendering
      },
    };
  },
};
