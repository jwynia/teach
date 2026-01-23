// PPTX Document Generation Service
// Template-based generation with dynamic layout discovery

import { readFile } from "fs/promises";
import JSZip from "jszip";
import { type GenerationResult } from "./types.js";
import {
  type SlideType,
  type SlideData,
  type PptxGenerationOptions,
  type DiscoveredLayout,
  type TextReplacement,
  getSlideFiles,
  discoverLayoutsFromZip,
  loadLayoutsFromManifest,
  buildLayoutMap,
  findMatchingLayout,
  populatePlaceholders,
  DEFAULT_TEMPLATE_PATH,
  DEFAULT_TEMPLATE_ID,
} from "./pptx-template-utils.js";

// Re-export types for external use
export type { SlideType, SlideData, PptxGenerationOptions };

// ============================================================================
// Service Interface
// ============================================================================

export interface PptxService {
  generateFromSlides(
    slides: SlideData[],
    options: PptxGenerationOptions
  ): Promise<GenerationResult>;
}

// ============================================================================
// XML Namespaces
// ============================================================================

const NS = {
  a: "http://schemas.openxmlformats.org/drawingml/2006/main",
  p: "http://schemas.openxmlformats.org/presentationml/2006/main",
  r: "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
  rel: "http://schemas.openxmlformats.org/package/2006/relationships",
};

// ============================================================================
// Service Implementation
// ============================================================================

class PptxServiceImpl implements PptxService {
  async generateFromSlides(
    slides: SlideData[],
    options: PptxGenerationOptions
  ): Promise<GenerationResult> {
    if (slides.length === 0) {
      throw new Error("At least one slide is required");
    }

    // 1. Load template
    const templatePath = options.templatePath || DEFAULT_TEMPLATE_PATH;
    const templateId = options.templateId || DEFAULT_TEMPLATE_ID;

    let templateData: Buffer;
    try {
      templateData = await readFile(templatePath);
    } catch {
      throw new Error(
        `PPTX template not found at ${templatePath}. Please ensure the template file exists.`
      );
    }

    const zip = await JSZip.loadAsync(templateData);

    // 2. Discover layouts (from manifest first, then dynamic discovery)
    let layouts = await loadLayoutsFromManifest(templateId);
    if (!layouts) {
      layouts = await discoverLayoutsFromZip(zip);
    }

    if (layouts.length === 0) {
      throw new Error("No layouts found in template");
    }

    // 3. Build layout lookup map
    const layoutMap = buildLayoutMap(layouts);
    console.log("[PPTX Debug] Layout map keys:", [...layoutMap.keys()]);

    // 4. Extract template slides for reuse
    const templateSlides = await this.extractTemplateSlides(zip, layouts);
    console.log("[PPTX Debug] Template slides loaded:", [...templateSlides.keys()]);

    // 5. Clear existing slides from output
    await this.clearExistingSlides(zip);

    // 6. Process each content slide
    const slideNotes: Map<number, string> = new Map();

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const slideType: SlideType = slide.type || (i === 0 ? "title" : "default");
      const outputSlideNum = i + 1;

      // Find matching layout
      const layout = findMatchingLayout(layoutMap, slideType);
      console.log(`[PPTX Debug] Slide ${outputSlideNum}: type="${slideType}" → layout="${layout.name}" (template slide ${layout.slideNumber}), placeholders:`, layout.placeholders);

      // Get template slide content
      const templateSlide = templateSlides.get(layout.slideNumber);
      if (!templateSlide) {
        console.warn(`Template slide ${layout.slideNumber} not found, using first slide`);
        continue;
      }

      // Populate placeholders
      const replacements = populatePlaceholders(
        layout.placeholders,
        slide,
        options
      );

      // Apply replacements to slide XML
      let slideXml = templateSlide.slideXml;
      slideXml = this.applyReplacements(slideXml, replacements);

      // Write slide to output
      zip.file(`ppt/slides/slide${outputSlideNum}.xml`, slideXml);

      // Copy relationships file
      if (templateSlide.relsXml) {
        zip.file(
          `ppt/slides/_rels/slide${outputSlideNum}.xml.rels`,
          templateSlide.relsXml
        );
      }

      // Track speaker notes
      if (slide.notes) {
        slideNotes.set(outputSlideNum, slide.notes);
      }
    }

    // 7. Update presentation structure
    await this.updatePresentationXml(zip, slides.length);
    await this.updatePresentationRels(zip, slides.length);
    await this.updateContentTypes(zip, slides.length);

    // 8. Add speaker notes
    if (slideNotes.size > 0) {
      await this.addSpeakerNotes(zip, slideNotes, slides.length);
    }

    // 9. Generate output
    const outputData = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    const filename =
      options.title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase() + ".pptx";

    return {
      buffer: Buffer.from(outputData),
      filename,
      contentType:
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      metadata: {
        slideCount: slides.length,
      },
    };
  }

  // ============================================================================
  // Template Slide Extraction
  // ============================================================================

  private async extractTemplateSlides(
    zip: JSZip,
    layouts: DiscoveredLayout[]
  ): Promise<Map<number, { slideXml: string; relsXml: string | null }>> {
    const slides = new Map<number, { slideXml: string; relsXml: string | null }>();

    for (const layout of layouts) {
      const slidePath = `ppt/slides/slide${layout.slideNumber}.xml`;
      const relsPath = `ppt/slides/_rels/slide${layout.slideNumber}.xml.rels`;

      const slideFile = zip.file(slidePath);
      if (!slideFile) continue;

      const slideXml = await slideFile.async("string");
      const relsFile = zip.file(relsPath);
      const relsXml = relsFile ? await relsFile.async("string") : null;

      slides.set(layout.slideNumber, { slideXml, relsXml });
    }

    return slides;
  }

  // ============================================================================
  // Slide Management
  // ============================================================================

  private async clearExistingSlides(zip: JSZip): Promise<void> {
    const slideFiles = getSlideFiles(zip);
    for (const path of slideFiles) {
      zip.remove(path);
      const relsPath = path.replace("slides/", "slides/_rels/") + ".rels";
      if (zip.file(relsPath)) {
        zip.remove(relsPath);
      }
    }
  }

  private applyReplacements(xml: string, replacements: TextReplacement[]): string {
    let result = xml;

    for (const replacement of replacements) {
      // Escape special regex characters in tag
      const escapedTag = replacement.tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escapedTag, "g");
      result = result.replace(regex, this.escapeXmlText(replacement.value));
    }

    return result;
  }

  private escapeXmlText(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  // ============================================================================
  // Presentation Structure Updates
  // ============================================================================

  private async updatePresentationXml(zip: JSZip, slideCount: number): Promise<void> {
    const presPath = "ppt/presentation.xml";
    const presFile = zip.file(presPath);
    if (!presFile) return;

    let presXml = await presFile.async("string");

    // Build new sldIdLst content
    const sldIdEntries = Array.from({ length: slideCount }, (_, i) =>
      `<p:sldId id="${256 + i}" r:id="rId${i + 2}"/>`
    ).join("\n    ");

    // Replace the sldIdLst content
    presXml = presXml.replace(
      /<p:sldIdLst>[\s\S]*?<\/p:sldIdLst>/,
      `<p:sldIdLst>\n    ${sldIdEntries}\n  </p:sldIdLst>`
    );

    zip.file(presPath, presXml);
  }

  private async updatePresentationRels(zip: JSZip, slideCount: number): Promise<void> {
    const relsPath = "ppt/_rels/presentation.xml.rels";
    const relsFile = zip.file(relsPath);
    if (!relsFile) return;

    let relsXml = await relsFile.async("string");

    // Remove existing slide relationships
    relsXml = relsXml.replace(
      /<Relationship[^>]*Type="http:\/\/schemas\.openxmlformats\.org\/officeDocument\/2006\/relationships\/slide"[^>]*\/>\s*/g,
      ""
    );

    // Build new slide relationships
    const slideRels = Array.from({ length: slideCount }, (_, i) =>
      `<Relationship Id="rId${i + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`
    ).join("\n  ");

    // Insert new relationships before closing tag
    relsXml = relsXml.replace(
      "</Relationships>",
      `  ${slideRels}\n</Relationships>`
    );

    zip.file(relsPath, relsXml);
  }

  private async updateContentTypes(zip: JSZip, slideCount: number): Promise<void> {
    const ctPath = "[Content_Types].xml";
    const ctFile = zip.file(ctPath);
    if (!ctFile) return;

    let ctXml = await ctFile.async("string");

    // Remove existing slide overrides
    ctXml = ctXml.replace(
      /<Override[^>]*PartName="\/ppt\/slides\/slide\d+\.xml"[^>]*\/>/g,
      ""
    );

    // Add new slide overrides
    const slideContentType =
      "application/vnd.openxmlformats-officedocument.presentationml.slide+xml";
    const overrides = Array.from({ length: slideCount }, (_, i) =>
      `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="${slideContentType}"/>`
    ).join("");

    ctXml = ctXml.replace("</Types>", `${overrides}</Types>`);

    zip.file(ctPath, ctXml);
  }

  // ============================================================================
  // Speaker Notes
  // ============================================================================

  private async addSpeakerNotes(
    zip: JSZip,
    slideNotes: Map<number, string>,
    slideCount: number
  ): Promise<void> {
    // Create notes master
    zip.file("ppt/notesMasters/notesMaster1.xml", this.generateNotesMasterXml());
    zip.file(
      "ppt/notesMasters/_rels/notesMaster1.xml.rels",
      this.generateNotesMasterRelsXml()
    );

    // Create notes slides
    for (const [slideNum, notes] of slideNotes) {
      zip.file(
        `ppt/notesSlides/notesSlide${slideNum}.xml`,
        this.generateNotesSlideXml(notes)
      );
      zip.file(
        `ppt/notesSlides/_rels/notesSlide${slideNum}.xml.rels`,
        this.generateNotesSlideRelsXml(slideNum)
      );

      // Update slide relationships to link to notes
      const relsPath = `ppt/slides/_rels/slide${slideNum}.xml.rels`;
      const relsFile = zip.file(relsPath);

      if (relsFile) {
        let relsXml = await relsFile.async("string");

        if (!relsXml.includes("relationships/notesSlide")) {
          const rIdMatches = relsXml.match(/Id="rId(\d+)"/g) || [];
          let maxRId = 0;
          for (const match of rIdMatches) {
            const num = parseInt(match.match(/rId(\d+)/)?.[1] || "0", 10);
            if (num > maxRId) maxRId = num;
          }
          const newRId = `rId${maxRId + 1}`;

          const newRel = `<Relationship Id="${newRId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide" Target="../notesSlides/notesSlide${slideNum}.xml"/>`;
          relsXml = relsXml.replace(
            "</Relationships>",
            `${newRel}\n</Relationships>`
          );
          zip.file(relsPath, relsXml);
        }
      }
    }

    // Update presentation.xml.rels to include notesMaster
    const presRelsPath = "ppt/_rels/presentation.xml.rels";
    const presRelsFile = zip.file(presRelsPath);
    if (presRelsFile) {
      let presRelsXml = await presRelsFile.async("string");

      if (!presRelsXml.includes("relationships/notesMaster")) {
        const rIdMatches = presRelsXml.match(/Id="rId(\d+)"/g) || [];
        let maxRId = 0;
        for (const match of rIdMatches) {
          const num = parseInt(match.match(/rId(\d+)/)?.[1] || "0", 10);
          if (num > maxRId) maxRId = num;
        }
        const newRId = `rId${maxRId + 1}`;

        const newRel = `<Relationship Id="${newRId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesMaster" Target="notesMasters/notesMaster1.xml"/>`;
        presRelsXml = presRelsXml.replace(
          "</Relationships>",
          `${newRel}\n</Relationships>`
        );
        zip.file(presRelsPath, presRelsXml);
      }
    }

    // Update [Content_Types].xml
    const ctPath = "[Content_Types].xml";
    const ctFile = zip.file(ctPath);
    if (ctFile) {
      let ctXml = await ctFile.async("string");

      if (!ctXml.includes("notesMaster+xml")) {
        const notesMasterOverride = `<Override PartName="/ppt/notesMasters/notesMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesMaster+xml"/>`;
        ctXml = ctXml.replace("</Types>", `${notesMasterOverride}\n</Types>`);
      }

      for (const slideNum of slideNotes.keys()) {
        const partName = `/ppt/notesSlides/notesSlide${slideNum}.xml`;
        if (!ctXml.includes(partName)) {
          const notesSlideOverride = `<Override PartName="${partName}" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml"/>`;
          ctXml = ctXml.replace("</Types>", `${notesSlideOverride}\n</Types>`);
        }
      }

      zip.file(ctPath, ctXml);
    }
  }

  private generateNotesMasterXml(): string {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:notesMaster xmlns:a="${NS.a}" xmlns:r="${NS.r}" xmlns:p="${NS.p}">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="2" name="Slide Image Placeholder"/>
          <p:cNvSpPr><a:spLocks noGrp="1" noRot="1" noChangeAspect="1"/></p:cNvSpPr>
          <p:nvPr><p:ph type="sldImg"/></p:nvPr>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="381000" y="685800"/>
            <a:ext cx="6096000" cy="3429000"/>
          </a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
          <a:noFill/>
          <a:ln w="12700"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill></a:ln>
        </p:spPr>
      </p:sp>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="3" name="Notes Placeholder"/>
          <p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr>
          <p:nvPr><p:ph type="body" idx="1"/></p:nvPr>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="381000" y="4343400"/>
            <a:ext cx="6096000" cy="4114800"/>
          </a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
        </p:spPr>
        <p:txBody>
          <a:bodyPr vert="horz" lIns="91440" tIns="45720" rIns="91440" bIns="45720" rtlCol="0"/>
          <a:lstStyle/>
          <a:p><a:pPr lvl="0"/><a:r><a:rPr lang="en-US"/><a:t></a:t></a:r></a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:notesMaster>`;
  }

  private generateNotesMasterRelsXml(): string {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="${NS.rel}">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>`;
  }

  private generateNotesSlideXml(notesText: string): string {
    const paragraphs = notesText
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter((p) => p);

    const paragraphsXml =
      paragraphs.length > 0
        ? paragraphs
            .map(
              (p) =>
                `<a:p><a:r><a:rPr lang="en-US" dirty="0"/><a:t>${this.escapeXmlText(
                  p.replace(/\n/g, " ")
                )}</a:t></a:r></a:p>`
            )
            .join("")
        : `<a:p><a:r><a:rPr lang="en-US" dirty="0"/><a:t>${this.escapeXmlText(
            notesText
          )}</a:t></a:r></a:p>`;

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:notes xmlns:a="${NS.a}" xmlns:r="${NS.r}" xmlns:p="${NS.p}">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="2" name="Slide Image Placeholder"/>
          <p:cNvSpPr><a:spLocks noGrp="1" noRot="1" noChangeAspect="1"/></p:cNvSpPr>
          <p:nvPr><p:ph type="sldImg"/></p:nvPr>
        </p:nvSpPr>
        <p:spPr/>
      </p:sp>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="3" name="Notes Placeholder"/>
          <p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr>
          <p:nvPr><p:ph type="body" idx="1"/></p:nvPr>
        </p:nvSpPr>
        <p:spPr/>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          ${paragraphsXml}
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:notes>`;
  }

  private generateNotesSlideRelsXml(slideNumber: number): string {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="${NS.rel}">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesMaster" Target="../notesMasters/notesMaster1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="../slides/slide${slideNumber}.xml"/>
</Relationships>`;
  }
}

// Export singleton instance
export const pptxService: PptxService = new PptxServiceImpl();
