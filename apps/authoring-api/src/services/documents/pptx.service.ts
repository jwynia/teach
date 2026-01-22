// PPTX Document Generation Service
// Generates PowerPoint presentations from slide data using pptxgenjs

import PptxGenJS from "pptxgenjs";
import { type GenerationResult } from "./types.js";

// ============================================================================
// Types
// ============================================================================

export type SlideType =
  | "title"
  | "assertion"
  | "definition"
  | "process"
  | "comparison"
  | "quote"
  | "question"
  | "example"
  | "summary"
  | "default";

export interface SlideData {
  title: string;
  content: string[];
  notes?: string;
  type?: SlideType;
}

export interface PptxGenerationOptions {
  title: string;
  subtitle?: string;
}

export interface PptxService {
  generateFromSlides(
    slides: SlideData[],
    options: PptxGenerationOptions
  ): Promise<GenerationResult>;
}

// ============================================================================
// Service Implementation
// ============================================================================

// Color palette
const COLORS = {
  primary: "003366",
  secondary: "666666",
  text: "333333",
  accent: "0066CC",
  light: "F5F5F5",
};

class PptxServiceImpl implements PptxService {
  async generateFromSlides(
    slides: SlideData[],
    options: PptxGenerationOptions
  ): Promise<GenerationResult> {
    if (slides.length === 0) {
      throw new Error("At least one slide is required");
    }

    // Create presentation
    const pptx = new PptxGenJS();

    // Set metadata
    pptx.title = options.title;
    pptx.author = "Teach Authoring System";

    // Add slides
    for (let i = 0; i < slides.length; i++) {
      const slideData = slides[i];
      const slide = pptx.addSlide();
      const slideType = slideData.type || (i === 0 ? "title" : "default");

      this.renderSlide(slide, slideData, slideType, options);

      // Speaker notes
      if (slideData.notes) {
        slide.addNotes(slideData.notes);
      }
    }

    // Generate buffer
    const buffer = await pptx.write({ outputType: "nodebuffer" });

    // Generate filename from title
    const filename =
      options.title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase() + ".pptx";

    return {
      buffer: Buffer.from(buffer as ArrayBuffer),
      filename,
      contentType:
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      metadata: {
        slideCount: slides.length,
      },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private renderSlide(slide: any, data: SlideData, type: SlideType, options: PptxGenerationOptions): void {
    switch (type) {
      case "title":
        this.renderTitleSlide(slide, data, options);
        break;
      case "quote":
        this.renderQuoteSlide(slide, data);
        break;
      case "definition":
        this.renderDefinitionSlide(slide, data);
        break;
      case "question":
        this.renderQuestionSlide(slide, data);
        break;
      case "comparison":
        this.renderComparisonSlide(slide, data);
        break;
      case "process":
        this.renderProcessSlide(slide, data);
        break;
      case "summary":
        this.renderSummarySlide(slide, data);
        break;
      case "assertion":
      case "example":
      case "default":
      default:
        this.renderContentSlide(slide, data);
        break;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private renderTitleSlide(slide: any, data: SlideData, options: PptxGenerationOptions): void {
    slide.addText(data.title, {
      x: 0.5,
      y: 2,
      w: 9,
      h: 1.5,
      fontSize: 44,
      bold: true,
      color: COLORS.primary,
      align: "center",
    });

    if (options.subtitle) {
      slide.addText(options.subtitle, {
        x: 0.5,
        y: 3.5,
        w: 9,
        h: 0.8,
        fontSize: 24,
        color: COLORS.secondary,
        align: "center",
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private renderContentSlide(slide: any, data: SlideData): void {
    // Title (assertion headline)
    slide.addText(data.title, {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 1,
      fontSize: 28,
      bold: true,
      color: COLORS.primary,
    });

    // Content as bullet points
    if (data.content.length > 0) {
      const bulletItems = data.content.map((text) => ({
        text,
        options: { bullet: true as const, breakLine: true },
      }));

      slide.addText(bulletItems, {
        x: 0.5,
        y: 1.5,
        w: 9,
        h: 4,
        fontSize: 18,
        color: COLORS.text,
        valign: "top",
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private renderQuoteSlide(slide: any, data: SlideData): void {
    // Large centered quote
    const quoteText = data.content.join(" ") || data.title;
    slide.addText(`"${quoteText}"`, {
      x: 1,
      y: 1.5,
      w: 8,
      h: 3.5,
      fontSize: 32,
      italic: true,
      color: COLORS.primary,
      align: "center",
      valign: "middle",
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private renderDefinitionSlide(slide: any, data: SlideData): void {
    // Term as title
    slide.addText(data.title, {
      x: 0.5,
      y: 1,
      w: 9,
      h: 1,
      fontSize: 36,
      bold: true,
      color: COLORS.accent,
      align: "center",
    });

    // Definition
    if (data.content.length > 0) {
      slide.addText(data.content.join("\n\n"), {
        x: 1,
        y: 2.5,
        w: 8,
        h: 2.5,
        fontSize: 22,
        color: COLORS.text,
        align: "center",
        valign: "top",
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private renderQuestionSlide(slide: any, data: SlideData): void {
    // Large centered question
    slide.addText(data.title, {
      x: 0.5,
      y: 2,
      w: 9,
      h: 2,
      fontSize: 36,
      bold: true,
      color: COLORS.primary,
      align: "center",
      valign: "middle",
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private renderComparisonSlide(slide: any, data: SlideData): void {
    // Title
    slide.addText(data.title, {
      x: 0.5,
      y: 0.3,
      w: 9,
      h: 0.8,
      fontSize: 24,
      bold: true,
      color: COLORS.primary,
    });

    // Parse table content from markdown if present
    const tableRows: string[][] = [];
    for (const line of data.content) {
      if (line.includes("|")) {
        const cells = line
          .split("|")
          .map((c) => c.trim())
          .filter((c) => c && !c.match(/^-+$/));
        if (cells.length > 0) {
          tableRows.push(cells);
        }
      }
    }

    if (tableRows.length > 0) {
      const tableData = tableRows.map((row, rowIdx) =>
        row.map((cell) => ({
          text: cell,
          options: {
            bold: rowIdx === 0,
            fill: rowIdx === 0 ? { color: COLORS.light } : undefined,
          },
        }))
      );

      slide.addTable(tableData, {
        x: 0.5,
        y: 1.3,
        w: 9,
        colW: tableRows[0] ? Array(tableRows[0].length).fill(9 / tableRows[0].length) : [4.5, 4.5],
        border: { pt: 1, color: COLORS.secondary },
        fontSize: 14,
        color: COLORS.text,
        valign: "middle",
        align: "center",
      });
    } else {
      // Fall back to bullet points
      this.renderContentSlide(slide, data);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private renderProcessSlide(slide: any, data: SlideData): void {
    // Title
    slide.addText(data.title, {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.8,
      fontSize: 24,
      bold: true,
      color: COLORS.primary,
    });

    // Numbered steps
    if (data.content.length > 0) {
      const numberedItems = data.content.map((text, idx) => ({
        text: `${idx + 1}. ${text}`,
        options: { breakLine: true },
      }));

      slide.addText(numberedItems, {
        x: 0.5,
        y: 1.5,
        w: 9,
        h: 4,
        fontSize: 18,
        color: COLORS.text,
        valign: "top",
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private renderSummarySlide(slide: any, data: SlideData): void {
    // Title
    slide.addText(data.title || "Key Takeaways", {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.8,
      fontSize: 28,
      bold: true,
      color: COLORS.primary,
    });

    // Key points with checkmark bullets
    if (data.content.length > 0) {
      const items = data.content.map((text) => ({
        text: `✓ ${text}`,
        options: { breakLine: true },
      }));

      slide.addText(items, {
        x: 0.5,
        y: 1.5,
        w: 9,
        h: 4,
        fontSize: 18,
        color: COLORS.text,
        valign: "top",
      });
    }
  }
}

// Export singleton instance
export const pptxService: PptxService = new PptxServiceImpl();
