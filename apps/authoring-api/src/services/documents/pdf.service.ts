import {
  PDFDocument,
  StandardFonts,
  rgb,
  degrees,
  PageSizes,
  PDFPage,
  PDFFont,
} from "pdf-lib";
import {
  PdfSpec,
  PdfSpecSchema,
  PageSpec,
  TextElement,
  ImageElement,
  RectangleElement,
  LineElement,
  CircleElement,
  TableElement,
  GenerationResult,
  Color,
} from "./types.js";

// ============================================================================
// Constants
// ============================================================================

type FontName =
  | "Helvetica"
  | "HelveticaBold"
  | "HelveticaOblique"
  | "TimesRoman"
  | "TimesRomanBold"
  | "Courier"
  | "CourierBold";

const FONT_MAP: Record<FontName, (typeof StandardFonts)[keyof typeof StandardFonts]> = {
  Helvetica: StandardFonts.Helvetica,
  HelveticaBold: StandardFonts.HelveticaBold,
  HelveticaOblique: StandardFonts.HelveticaOblique,
  TimesRoman: StandardFonts.TimesRoman,
  TimesRomanBold: StandardFonts.TimesRomanBold,
  Courier: StandardFonts.Courier,
  CourierBold: StandardFonts.CourierBold,
};

const PAGE_SIZES: Record<string, [number, number]> = {
  A4: PageSizes.A4,
  Letter: PageSizes.Letter,
  Legal: PageSizes.Legal,
};

// ============================================================================
// Utility Functions
// ============================================================================

function getColor(color?: Color) {
  if (!color) return rgb(0, 0, 0);
  return rgb(color.r, color.g, color.b);
}

// ============================================================================
// Element Drawing Functions
// ============================================================================

function drawText(
  page: PDFPage,
  element: TextElement,
  fonts: Map<string, PDFFont>
): void {
  const fontName = element.font || "Helvetica";
  const font = fonts.get(fontName);
  if (!font) throw new Error(`Font not found: ${fontName}`);

  const fontSize = element.fontSize || 12;

  const options: Parameters<PDFPage["drawText"]>[1] = {
    x: element.x,
    y: element.y,
    size: fontSize,
    font,
    color: getColor(element.color),
  };

  if (element.maxWidth) {
    options.maxWidth = element.maxWidth;
    options.lineHeight = element.lineHeight || fontSize * 1.2;
  }

  if (element.rotate) {
    options.rotate = degrees(element.rotate);
  }

  page.drawText(element.text, options);
}

async function drawImage(
  page: PDFPage,
  element: ImageElement,
  pdfDoc: PDFDocument
): Promise<void> {
  if (!element.data) {
    throw new Error("Image data is required (Buffer)");
  }

  const imageData = element.data;

  // Detect image type from buffer magic bytes
  const isPng =
    imageData[0] === 0x89 &&
    imageData[1] === 0x50 &&
    imageData[2] === 0x4e &&
    imageData[3] === 0x47;

  const isJpeg = imageData[0] === 0xff && imageData[1] === 0xd8;

  let image;
  if (isPng) {
    image = await pdfDoc.embedPng(imageData);
  } else if (isJpeg) {
    image = await pdfDoc.embedJpg(imageData);
  } else {
    throw new Error("Unsupported image format (must be PNG or JPEG)");
  }

  const dims = image.scale(1);
  const width = element.width || dims.width;
  const height = element.height || dims.height;

  const options: Parameters<PDFPage["drawImage"]>[1] = {
    x: element.x,
    y: element.y,
    width,
    height,
  };

  if (element.opacity !== undefined) {
    options.opacity = element.opacity;
  }

  if (element.rotate) {
    options.rotate = degrees(element.rotate);
  }

  page.drawImage(image, options);
}

function drawRectangle(page: PDFPage, element: RectangleElement): void {
  const options: Parameters<PDFPage["drawRectangle"]>[0] = {
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
  };

  if (element.color) {
    options.color = getColor(element.color);
  }

  if (element.borderColor) {
    options.borderColor = getColor(element.borderColor);
    options.borderWidth = element.borderWidth || 1;
  }

  if (element.opacity !== undefined) {
    options.opacity = element.opacity;
  }

  page.drawRectangle(options);
}

function drawLine(page: PDFPage, element: LineElement): void {
  page.drawLine({
    start: { x: element.startX, y: element.startY },
    end: { x: element.endX, y: element.endY },
    color: getColor(element.color),
    thickness: element.thickness || 1,
    opacity: element.opacity,
  });
}

function drawCircle(page: PDFPage, element: CircleElement): void {
  const options: Parameters<PDFPage["drawCircle"]>[0] = {
    x: element.x,
    y: element.y,
    size: element.radius,
  };

  if (element.color) {
    options.color = getColor(element.color);
  }

  if (element.borderColor) {
    options.borderColor = getColor(element.borderColor);
    options.borderWidth = element.borderWidth || 1;
  }

  if (element.opacity !== undefined) {
    options.opacity = element.opacity;
  }

  page.drawCircle(options);
}

function drawTable(
  page: PDFPage,
  element: TableElement,
  fonts: Map<string, PDFFont>
): void {
  const font = fonts.get("Helvetica");
  if (!font) throw new Error("Helvetica font not found");

  const fontSize = element.fontSize || 10;
  const rowHeight = element.rowHeight || 20;
  const padding = element.padding || 5;
  const borderColor = getColor(element.borderColor || { r: 0, g: 0, b: 0 });

  let currentY = element.y;

  for (let rowIndex = 0; rowIndex < element.rows.length; rowIndex++) {
    const row = element.rows[rowIndex];
    let currentX = element.x;

    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const cellWidth = element.columnWidths[colIndex] || 100;
      const cellText = row[colIndex];

      // Draw cell background for header
      if (rowIndex === 0 && element.headerBackground) {
        page.drawRectangle({
          x: currentX,
          y: currentY - rowHeight,
          width: cellWidth,
          height: rowHeight,
          color: getColor(element.headerBackground),
        });
      }

      // Draw cell border
      page.drawRectangle({
        x: currentX,
        y: currentY - rowHeight,
        width: cellWidth,
        height: rowHeight,
        borderColor,
        borderWidth: 0.5,
      });

      // Draw cell text
      page.drawText(cellText, {
        x: currentX + padding,
        y: currentY - rowHeight + padding + 2,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });

      currentX += cellWidth;
    }

    currentY -= rowHeight;
  }
}

// ============================================================================
// Core Generation Function
// ============================================================================

async function processPage(
  pdfDoc: PDFDocument,
  pageSpec: PageSpec,
  fonts: Map<string, PDFFont>
): Promise<void> {
  // Determine page size
  let pageSize: [number, number] = PageSizes.Letter;
  if (pageSpec.size) {
    if (Array.isArray(pageSpec.size)) {
      pageSize = pageSpec.size;
    } else if (PAGE_SIZES[pageSpec.size]) {
      pageSize = PAGE_SIZES[pageSpec.size];
    }
  }

  const page = pdfDoc.addPage(pageSize);

  // Draw elements
  for (const element of pageSpec.elements) {
    switch (element.type) {
      case "text":
        drawText(page, element, fonts);
        break;
      case "image":
        await drawImage(page, element, pdfDoc);
        break;
      case "rectangle":
        drawRectangle(page, element);
        break;
      case "line":
        drawLine(page, element);
        break;
      case "circle":
        drawCircle(page, element);
        break;
      case "table":
        drawTable(page, element, fonts);
        break;
    }
  }
}

// ============================================================================
// Service Interface
// ============================================================================

export interface PdfService {
  generate(spec: PdfSpec): Promise<GenerationResult>;
}

export const pdfService: PdfService = {
  async generate(spec: PdfSpec): Promise<GenerationResult> {
    // Validate spec
    const validatedSpec = PdfSpecSchema.parse(spec);

    // Create document
    const pdfDoc = await PDFDocument.create();

    // Set metadata
    if (validatedSpec.title) pdfDoc.setTitle(validatedSpec.title);
    if (validatedSpec.author) pdfDoc.setAuthor(validatedSpec.author);
    if (validatedSpec.subject) pdfDoc.setSubject(validatedSpec.subject);
    if (validatedSpec.creator) pdfDoc.setCreator(validatedSpec.creator);

    // Embed fonts
    const fonts = new Map<string, PDFFont>();
    for (const [name, fontEnum] of Object.entries(FONT_MAP)) {
      fonts.set(name, await pdfDoc.embedFont(fontEnum));
    }

    // Process each page
    for (const pageSpec of validatedSpec.pages) {
      await processPage(pdfDoc, pageSpec, fonts);
    }

    // Save to buffer
    const pdfBytes = await pdfDoc.save();
    const buffer = Buffer.from(pdfBytes);

    // Generate filename
    const title = validatedSpec.title || "document";
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase();
    const filename = `${sanitizedTitle}.pdf`;

    return {
      buffer,
      filename,
      contentType: "application/pdf",
      metadata: {
        pageCount: pdfDoc.getPageCount(),
      },
    };
  },
};
