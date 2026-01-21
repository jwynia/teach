#!/usr/bin/env -S deno run --allow-read --allow-write

/**
 * generate-template-proper.ts - Create PPTX template with proper placeholder XML
 *
 * Builds a PowerPoint template with actual placeholder shapes that PowerPoint
 * recognizes as editable areas. Uses JSZip to construct the XML directly.
 *
 * ## OOXML Placeholder Inheritance Model
 *
 * PowerPoint uses a hierarchical inheritance chain:
 *   Theme → Slide Master → Slide Layout → Slide
 *
 * KEY PRINCIPLES:
 *
 * 1. TEXT CONTENT DOES NOT INHERIT
 *    - Placeholder text in layouts (e.g., "{{course_title}}") does NOT appear on slides
 *    - Slides must include their own text content in <p:txBody>
 *
 * 2. TEXT FORMATTING CAN INHERIT
 *    - Define colors, sizes, bullets in layout's <a:lstStyle>/<a:lvl1pPr>/<a:defRPr>
 *    - Slides use empty <a:lstStyle/> to inherit from layout
 *    - Run properties use empty <a:rPr lang="en-US"/> to inherit from defRPr
 *
 * 3. PLACEHOLDER LINKING
 *    - Slides link to layouts via <p:ph type="..." idx=".../>
 *    - Type: "ctrTitle", "title", "subTitle", "body", etc.
 *    - idx: Distinguishes multiple same-type placeholders (body idx:1, body idx:2)
 *
 * 4. BULLET SUPPRESSION
 *    - Master's <p:bodyStyle> defines bullets for all body placeholders
 *    - Add <a:buNone/> in layout's <a:lvl1pPr> to suppress bullets
 *
 * ## Structure Generated
 *
 * - Slide Master: Defines default title/body styling (dark text, bullets)
 * - Slide Layouts (10): Override master for specific purposes (white text on dark bg, no bullets)
 * - Sample Slides (10): One per layout with {{placeholder}} text, inheriting formatting
 *
 * Usage:
 *   deno run --allow-read --allow-write scripts/generate-template-proper.ts <output.pptx>
 */

import { parseArgs } from "jsr:@std/cli@1.0.9/parse-args";
import JSZip from "npm:jszip@3.10.1";
import { DOMParser } from "npm:@xmldom/xmldom@0.8.10";

// === XML Namespaces for parsing ===
const NS = {
  p: "http://schemas.openxmlformats.org/presentationml/2006/main",
  a: "http://schemas.openxmlformats.org/drawingml/2006/main",
};

// === Constants ===
const EMU_PER_INCH = 914400; // English Metric Units per inch

// Convert inches to EMU
const toEmu = (inches: number): number => Math.round(inches * EMU_PER_INCH);

// === Color Scheme ===
const COLORS = {
  primaryBlue: "1B365D",
  accentTeal: "2E7D7A",
  lightGray: "F5F5F5",
  textDark: "333333",
  textMedium: "666666",
  white: "FFFFFF",
};

// === Slide Dimensions (16:9 in EMU) ===
const SLIDE_WIDTH = toEmu(10);
const SLIDE_HEIGHT = toEmu(5.625);
const MARGIN = toEmu(0.5);

// === XML Templates ===

const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout2.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout3.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout4.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout5.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout6.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout7.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout8.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout9.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout10.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
  <Override PartName="/ppt/slides/slide2.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
  <Override PartName="/ppt/slides/slide3.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
  <Override PartName="/ppt/slides/slide4.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
  <Override PartName="/ppt/slides/slide5.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
  <Override PartName="/ppt/slides/slide6.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
  <Override PartName="/ppt/slides/slide7.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
  <Override PartName="/ppt/slides/slide8.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
  <Override PartName="/ppt/slides/slide9.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
  <Override PartName="/ppt/slides/slide10.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
  <Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;

const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;

const coreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Professional Course Template</dc:title>
  <dc:creator>Teach Platform</dc:creator>
  <dc:subject>Course Presentation Template</dc:subject>
  <dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:modified>
</cp:coreProperties>`;

const appXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
  <Application>Teach Platform</Application>
  <Slides>10</Slides>
  <Company>Teach</Company>
</Properties>`;

const presentationXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" saveSubsetFonts="1">
  <p:sldMasterIdLst>
    <p:sldMasterId id="2147483648" r:id="rId1"/>
  </p:sldMasterIdLst>
  <p:sldIdLst>
    <p:sldId id="256" r:id="rId2"/>
    <p:sldId id="257" r:id="rId3"/>
    <p:sldId id="258" r:id="rId4"/>
    <p:sldId id="259" r:id="rId5"/>
    <p:sldId id="260" r:id="rId6"/>
    <p:sldId id="261" r:id="rId7"/>
    <p:sldId id="262" r:id="rId8"/>
    <p:sldId id="263" r:id="rId9"/>
    <p:sldId id="264" r:id="rId10"/>
    <p:sldId id="265" r:id="rId11"/>
  </p:sldIdLst>
  <p:sldSz cx="${SLIDE_WIDTH}" cy="${SLIDE_HEIGHT}"/>
  <p:notesSz cx="${SLIDE_HEIGHT}" cy="${SLIDE_WIDTH}"/>
</p:presentation>`;

const presentationRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide2.xml"/>
  <Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide3.xml"/>
  <Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide4.xml"/>
  <Relationship Id="rId6" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide5.xml"/>
  <Relationship Id="rId7" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide6.xml"/>
  <Relationship Id="rId8" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide7.xml"/>
  <Relationship Id="rId9" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide8.xml"/>
  <Relationship Id="rId10" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide9.xml"/>
  <Relationship Id="rId11" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide10.xml"/>
  <Relationship Id="rId12" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>
</Relationships>`;

// Theme with custom colors
const themeXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Professional Course Theme">
  <a:themeElements>
    <a:clrScheme name="Professional">
      <a:dk1><a:srgbClr val="${COLORS.textDark}"/></a:dk1>
      <a:lt1><a:srgbClr val="${COLORS.white}"/></a:lt1>
      <a:dk2><a:srgbClr val="${COLORS.primaryBlue}"/></a:dk2>
      <a:lt2><a:srgbClr val="${COLORS.lightGray}"/></a:lt2>
      <a:accent1><a:srgbClr val="${COLORS.primaryBlue}"/></a:accent1>
      <a:accent2><a:srgbClr val="${COLORS.accentTeal}"/></a:accent2>
      <a:accent3><a:srgbClr val="9BBB59"/></a:accent3>
      <a:accent4><a:srgbClr val="8064A2"/></a:accent4>
      <a:accent5><a:srgbClr val="4BACC6"/></a:accent5>
      <a:accent6><a:srgbClr val="F79646"/></a:accent6>
      <a:hlink><a:srgbClr val="${COLORS.accentTeal}"/></a:hlink>
      <a:folHlink><a:srgbClr val="${COLORS.textMedium}"/></a:folHlink>
    </a:clrScheme>
    <a:fontScheme name="Professional">
      <a:majorFont>
        <a:latin typeface="Arial"/>
        <a:ea typeface=""/>
        <a:cs typeface=""/>
      </a:majorFont>
      <a:minorFont>
        <a:latin typeface="Arial"/>
        <a:ea typeface=""/>
        <a:cs typeface=""/>
      </a:minorFont>
    </a:fontScheme>
    <a:fmtScheme name="Professional">
      <a:fillStyleLst>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
      </a:fillStyleLst>
      <a:lnStyleLst>
        <a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln>
        <a:ln w="25400"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln>
        <a:ln w="38100"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln>
      </a:lnStyleLst>
      <a:effectStyleLst>
        <a:effectStyle><a:effectLst/></a:effectStyle>
        <a:effectStyle><a:effectLst/></a:effectStyle>
        <a:effectStyle><a:effectLst/></a:effectStyle>
      </a:effectStyleLst>
      <a:bgFillStyleLst>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
      </a:bgFillStyleLst>
    </a:fmtScheme>
  </a:themeElements>
</a:theme>`;

// === Placeholder Helper ===
interface PlaceholderDef {
  type: "title" | "subTitle" | "body" | "ctrTitle" | "dt" | "ftr" | "sldNum";
  idx?: number;
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
  fontSize: number;
  bold?: boolean;
  color?: string;
  align?: "l" | "ctr" | "r";
  valign?: "t" | "ctr" | "b";
  noBullet?: boolean; // Suppress bullet points for this placeholder
}

function createPlaceholderShape(id: number, ph: PlaceholderDef): string {
  const idxAttr = ph.idx !== undefined ? ` idx="${ph.idx}"` : "";
  // Define color in lstStyle so slides can inherit it (not in rPr which is run-specific)
  const colorXml = ph.color
    ? `<a:solidFill><a:srgbClr val="${ph.color}"/></a:solidFill>`
    : `<a:solidFill><a:schemeClr val="tx1"/></a:solidFill>`;
  // Use <a:buNone/> to suppress bullets when noBullet is true
  const bulletXml = ph.noBullet ? "<a:buNone/>" : "";

  return `
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="${id}" name="${ph.type} ${id}"/>
          <p:cNvSpPr>
            <a:spLocks noGrp="1"/>
          </p:cNvSpPr>
          <p:nvPr>
            <p:ph type="${ph.type}"${idxAttr}/>
          </p:nvPr>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="${toEmu(ph.x)}" y="${toEmu(ph.y)}"/>
            <a:ext cx="${toEmu(ph.w)}" cy="${toEmu(ph.h)}"/>
          </a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
        </p:spPr>
        <p:txBody>
          <a:bodyPr anchor="${ph.valign || "ctr"}"/>
          <a:lstStyle>
            <a:lvl1pPr algn="${ph.align || "l"}">
              ${bulletXml}
              <a:defRPr sz="${ph.fontSize * 100}"${ph.bold ? ' b="1"' : ""}>
                ${colorXml}
              </a:defRPr>
            </a:lvl1pPr>
          </a:lstStyle>
          <a:p>
            <a:r>
              <a:rPr lang="en-US"/>
              <a:t>${ph.text}</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>`;
}

// Text shape (non-placeholder)
interface TextShapeDef {
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
  fontSize: number;
  bold?: boolean;
  italic?: boolean;
  color?: string;
  align?: "l" | "ctr" | "r";
  valign?: "t" | "ctr" | "b";
}

function createTextShape(id: number, ts: TextShapeDef): string {
  const colorXml = ts.color
    ? `<a:solidFill><a:srgbClr val="${ts.color}"/></a:solidFill>`
    : `<a:solidFill><a:schemeClr val="tx1"/></a:solidFill>`;

  return `
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="${id}" name="TextBox ${id}"/>
          <p:cNvSpPr txBox="1"/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="${toEmu(ts.x)}" y="${toEmu(ts.y)}"/>
            <a:ext cx="${toEmu(ts.w)}" cy="${toEmu(ts.h)}"/>
          </a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
          <a:noFill/>
        </p:spPr>
        <p:txBody>
          <a:bodyPr anchor="${ts.valign || "ctr"}"/>
          <a:lstStyle/>
          <a:p>
            <a:pPr algn="${ts.align || "l"}"/>
            <a:r>
              <a:rPr lang="en-US" sz="${ts.fontSize * 100}"${ts.bold ? ' b="1"' : ""}${ts.italic ? ' i="1"' : ""}>
                ${colorXml}
              </a:rPr>
              <a:t>${ts.text}</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>`;
}

// Rectangle shape
function createRectShape(id: number, x: number, y: number, w: number, h: number, fill: string, lineColor?: string): string {
  const lineXml = lineColor
    ? `<a:ln w="25400"><a:solidFill><a:srgbClr val="${lineColor}"/></a:solidFill></a:ln>`
    : `<a:ln><a:noFill/></a:ln>`;

  return `
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="${id}" name="Rectangle ${id}"/>
          <p:cNvSpPr/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="${toEmu(x)}" y="${toEmu(y)}"/>
            <a:ext cx="${toEmu(w)}" cy="${toEmu(h)}"/>
          </a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
          <a:solidFill><a:srgbClr val="${fill}"/></a:solidFill>
          ${lineXml}
        </p:spPr>
      </p:sp>`;
}

// === Dynamic Placeholder Extraction ===

interface ExtractedPlaceholder {
  type: string;           // "title", "body", "subTitle", "ctrTitle", etc. (or "textbox" for non-placeholders)
  idx?: number;           // Optional index for multiple same-type placeholders
  id: number;             // Shape ID from layout
  name: string;           // Shape name
  defaultText?: string;   // Text content from layout (e.g., "{{course_title}}")
  isTextBox?: boolean;    // True if this is a regular text box, not a placeholder
}

// Helper to get elements by tag name and namespace
function getElementsByTagNameNS(parent: Document | Element, ns: string, localName: string): Element[] {
  const elements = parent.getElementsByTagNameNS(ns, localName);
  const result: Element[] = [];
  for (let i = 0; i < elements.length; i++) {
    const el = elements.item(i);
    if (el) result.push(el);
  }
  return result;
}

// Extract all text content from a txBody element
function extractTextFromTxBody(txBody: Element): string {
  const textParts: string[] = [];
  const tElements = getElementsByTagNameNS(txBody, NS.a, "t");
  for (const t of tElements) {
    if (t.textContent) {
      textParts.push(t.textContent);
    }
  }
  return textParts.join("");
}

// Check if text contains placeholder pattern like {{something}}
function containsPlaceholderPattern(text: string): boolean {
  return /\{\{[^}]+\}\}/.test(text);
}

// Extract placeholder definitions from layout XML
function extractPlaceholdersFromLayoutXml(layoutXml: string): ExtractedPlaceholder[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(layoutXml, "text/xml");
  const placeholders: ExtractedPlaceholder[] = [];

  // Find all shape elements
  const shapes = getElementsByTagNameNS(doc, NS.p, "sp");

  for (const shape of shapes) {
    // Look for nvSpPr > nvPr > ph (placeholder definition)
    const nvSpPrList = getElementsByTagNameNS(shape, NS.p, "nvSpPr");
    if (nvSpPrList.length === 0) continue;
    const nvSpPr = nvSpPrList[0];

    // Get shape ID and name from cNvPr
    const cNvPrList = getElementsByTagNameNS(nvSpPr, NS.p, "cNvPr");
    const cNvPr = cNvPrList[0];
    const id = cNvPr ? parseInt(cNvPr.getAttribute("id") || "0", 10) : 0;
    const name = cNvPr ? cNvPr.getAttribute("name") || "" : "";

    // Extract text content from txBody
    let defaultText: string | undefined;
    const txBodyList = getElementsByTagNameNS(shape, NS.p, "txBody");
    if (txBodyList.length > 0) {
      defaultText = extractTextFromTxBody(txBodyList[0]);
    }

    const nvPrList = getElementsByTagNameNS(nvSpPr, NS.p, "nvPr");
    if (nvPrList.length === 0) continue;
    const nvPr = nvPrList[0];

    const phList = getElementsByTagNameNS(nvPr, NS.p, "ph");

    if (phList.length > 0) {
      // This is a proper placeholder shape
      const ph = phList[0];
      const type = ph.getAttribute("type") || "body";
      const idxAttr = ph.getAttribute("idx");
      const idx = idxAttr ? parseInt(idxAttr, 10) : undefined;

      placeholders.push({
        type,
        idx,
        id,
        name,
        defaultText: defaultText || undefined,
        isTextBox: false,
      });
    } else if (defaultText && containsPlaceholderPattern(defaultText)) {
      // This is a text box with {{placeholder}} text - include it too
      placeholders.push({
        type: "textbox",
        id,
        name,
        defaultText,
        isTextBox: true,
      });
    }
    // Skip shapes without placeholders and without {{...}} text (like labels, decorative elements)
  }

  return placeholders;
}

// Create a slide shape that references a layout placeholder
// Key insight: Text CONTENT must be in the slide (doesn't inherit from layout)
// Text FORMATTING inherits from layout's lstStyle when slide has empty lstStyle
function createSlideShape(id: number, ph: ExtractedPlaceholder): string {
  // Skip text boxes - they should now be placeholders in the layout
  if (ph.isTextBox) {
    return ""; // Text boxes don't get slide shapes - they need to be placeholders in layout
  }

  const idxAttr = ph.idx !== undefined ? ` idx="${ph.idx}"` : "";

  // Include the placeholder text from layout (e.g., "{{course_title}}")
  // Use empty lstStyle to inherit formatting from layout's lstStyle
  // Use empty rPr to inherit character formatting from lstStyle's defRPr
  const textContent = ph.defaultText || "";

  return `
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="${id}" name="${ph.type} ${id}"/>
          <p:cNvSpPr>
            <a:spLocks noGrp="1"/>
          </p:cNvSpPr>
          <p:nvPr>
            <p:ph type="${ph.type}"${idxAttr}/>
          </p:nvPr>
        </p:nvSpPr>
        <p:spPr/>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:r>
              <a:rPr lang="en-US"/>
              <a:t>${textContent}</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>`;
}

// Generate slide XML from a layout by extracting and referencing its placeholders
function createSlideFromLayout(layoutXml: string): string {
  const placeholders = extractPlaceholdersFromLayoutXml(layoutXml);

  const shapesXml = placeholders
    .map((ph, index) => createSlideShape(index + 2, ph)) // IDs start at 2 (1 is grpSp)
    .filter(xml => xml.trim() !== "") // Filter out empty shapes (text boxes)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr/>
${shapesXml}
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>`;
}

// === Slide Master ===
const slideMasterXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:bg>
      <p:bgRef idx="1001">
        <a:schemeClr val="bg1"/>
      </p:bgRef>
    </p:bg>
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
          <p:cNvPr id="2" name="Title Placeholder"/>
          <p:cNvSpPr>
            <a:spLocks noGrp="1"/>
          </p:cNvSpPr>
          <p:nvPr>
            <p:ph type="title"/>
          </p:nvPr>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="${MARGIN}" y="${toEmu(0.3)}"/>
            <a:ext cx="${SLIDE_WIDTH - MARGIN * 2}" cy="${toEmu(0.9)}"/>
          </a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
        </p:spPr>
        <p:txBody>
          <a:bodyPr anchor="b"/>
          <a:lstStyle>
            <a:lvl1pPr algn="l">
              <a:defRPr sz="3200" b="1">
                <a:solidFill><a:srgbClr val="${COLORS.primaryBlue}"/></a:solidFill>
              </a:defRPr>
            </a:lvl1pPr>
          </a:lstStyle>
          <a:p>
            <a:r>
              <a:rPr lang="en-US"/>
              <a:t>Click to edit title</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="3" name="Body Placeholder"/>
          <p:cNvSpPr>
            <a:spLocks noGrp="1"/>
          </p:cNvSpPr>
          <p:nvPr>
            <p:ph type="body" idx="1"/>
          </p:nvPr>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="${MARGIN}" y="${toEmu(1.4)}"/>
            <a:ext cx="${SLIDE_WIDTH - MARGIN * 2}" cy="${toEmu(3.9)}"/>
          </a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
        </p:spPr>
        <p:txBody>
          <a:bodyPr anchor="t"/>
          <a:lstStyle>
            <a:lvl1pPr marL="342900" indent="-342900">
              <a:buFont typeface="Arial"/>
              <a:buChar char="•"/>
              <a:defRPr sz="1800">
                <a:solidFill><a:srgbClr val="${COLORS.textDark}"/></a:solidFill>
              </a:defRPr>
            </a:lvl1pPr>
          </a:lstStyle>
          <a:p>
            <a:r>
              <a:rPr lang="en-US"/>
              <a:t>Click to edit content</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
  <p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst>
    <p:sldLayoutId id="2147483649" r:id="rId1"/>
    <p:sldLayoutId id="2147483650" r:id="rId2"/>
    <p:sldLayoutId id="2147483651" r:id="rId3"/>
    <p:sldLayoutId id="2147483652" r:id="rId4"/>
    <p:sldLayoutId id="2147483653" r:id="rId5"/>
    <p:sldLayoutId id="2147483654" r:id="rId6"/>
    <p:sldLayoutId id="2147483655" r:id="rId7"/>
    <p:sldLayoutId id="2147483656" r:id="rId8"/>
    <p:sldLayoutId id="2147483657" r:id="rId9"/>
    <p:sldLayoutId id="2147483658" r:id="rId10"/>
  </p:sldLayoutIdLst>
  <p:txStyles>
    <p:titleStyle>
      <a:lvl1pPr algn="l">
        <a:defRPr sz="3200" b="1">
          <a:solidFill><a:srgbClr val="${COLORS.primaryBlue}"/></a:solidFill>
          <a:latin typeface="Arial"/>
        </a:defRPr>
      </a:lvl1pPr>
    </p:titleStyle>
    <p:bodyStyle>
      <a:lvl1pPr marL="342900" indent="-342900">
        <a:buFont typeface="Arial"/>
        <a:buChar char="•"/>
        <a:defRPr sz="1800">
          <a:solidFill><a:srgbClr val="${COLORS.textDark}"/></a:solidFill>
          <a:latin typeface="Arial"/>
        </a:defRPr>
      </a:lvl1pPr>
      <a:lvl2pPr marL="742950" indent="-285750">
        <a:buFont typeface="Arial"/>
        <a:buChar char="–"/>
        <a:defRPr sz="1600">
          <a:solidFill><a:srgbClr val="${COLORS.textDark}"/></a:solidFill>
          <a:latin typeface="Arial"/>
        </a:defRPr>
      </a:lvl2pPr>
    </p:bodyStyle>
  </p:txStyles>
</p:sldMaster>`;

const slideMasterRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout2.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout3.xml"/>
  <Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout4.xml"/>
  <Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout5.xml"/>
  <Relationship Id="rId6" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout6.xml"/>
  <Relationship Id="rId7" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout7.xml"/>
  <Relationship Id="rId8" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout8.xml"/>
  <Relationship Id="rId9" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout9.xml"/>
  <Relationship Id="rId10" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout10.xml"/>
  <Relationship Id="rId11" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>`;

// === Layout Definitions ===

// Layout 1: Title Slide (dark background)
function createTitleSlideLayout(): string {
  const shapes = [
    createPlaceholderShape(2, {
      type: "ctrTitle",
      x: 0.5, y: 1.5, w: 9, h: 1.2,
      text: "{{course_title}}",
      fontSize: 44, bold: true, color: COLORS.white, align: "ctr", valign: "ctr",
      noBullet: true
    }),
    createPlaceholderShape(3, {
      type: "subTitle", idx: 1,
      x: 0.5, y: 2.8, w: 9, h: 0.6,
      text: "{{course_subtitle}}",
      fontSize: 20, color: COLORS.lightGray, align: "ctr", valign: "ctr",
      noBullet: true
    }),
    // Use body placeholders for instructor and date so they appear on slides
    createPlaceholderShape(4, {
      type: "body", idx: 2,
      x: 0.5, y: 4.2, w: 4, h: 0.4,
      text: "Instructor: {{instructor_name}}",
      fontSize: 14, color: COLORS.lightGray, align: "l", valign: "ctr",
      noBullet: true
    }),
    createPlaceholderShape(5, {
      type: "body", idx: 3,
      x: 5.5, y: 4.2, w: 4, h: 0.4,
      text: "{{course_date}}",
      fontSize: 14, color: COLORS.lightGray, align: "r", valign: "ctr",
      noBullet: true
    }),
  ];

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="title" preserve="1">
  <p:cSld name="Title Slide">
    <p:bg>
      <p:bgPr>
        <a:solidFill><a:srgbClr val="${COLORS.primaryBlue}"/></a:solidFill>
      </p:bgPr>
    </p:bg>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr/>
${shapes.join("\n")}
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sldLayout>`;
}

// Layout 2: Section Header (dark background)
function createSectionHeaderLayout(): string {
  const shapes = [
    createPlaceholderShape(2, {
      type: "title",
      x: 0.5, y: 2.0, w: 9, h: 1.0,
      text: "{{section_title}}",
      fontSize: 40, bold: true, color: COLORS.white, align: "ctr", valign: "ctr",
      noBullet: true
    }),
    createPlaceholderShape(3, {
      type: "body", idx: 1,
      x: 0.5, y: 3.2, w: 9, h: 0.8,
      text: "{{section_description}}",
      fontSize: 18, color: COLORS.lightGray, align: "ctr", valign: "t",
      noBullet: true
    }),
  ];

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="secHead" preserve="1">
  <p:cSld name="Section Header">
    <p:bg>
      <p:bgPr>
        <a:solidFill><a:srgbClr val="${COLORS.primaryBlue}"/></a:solidFill>
      </p:bgPr>
    </p:bg>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr/>
${shapes.join("\n")}
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sldLayout>`;
}

// Layout 3: Content Slide
function createContentLayout(): string {
  const shapes = [
    createPlaceholderShape(2, {
      type: "title",
      x: 0.5, y: 0.3, w: 9, h: 0.8,
      text: "{{slide_title}}",
      fontSize: 28, bold: true, color: COLORS.primaryBlue, align: "l", valign: "b",
      noBullet: true
    }),
    createPlaceholderShape(3, {
      type: "body", idx: 1,
      x: 0.5, y: 1.3, w: 9, h: 4.0,
      text: "{{main_content}}",
      fontSize: 18, color: COLORS.textDark, align: "l", valign: "t"
      // Keep bullets for main content
    }),
  ];

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="obj" preserve="1">
  <p:cSld name="Content">
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr/>
${shapes.join("\n")}
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sldLayout>`;
}

// Layout 4: Two Column
function createTwoColumnLayout(): string {
  const colWidth = (9 - 0.5) / 2; // 4.25 each with gap
  const shapes = [
    createPlaceholderShape(2, {
      type: "title",
      x: 0.5, y: 0.3, w: 9, h: 0.8,
      text: "{{slide_title}}",
      fontSize: 28, bold: true, color: COLORS.primaryBlue, align: "l", valign: "b",
      noBullet: true
    }),
    createPlaceholderShape(3, {
      type: "body", idx: 1,
      x: 0.5, y: 1.3, w: colWidth, h: 4.0,
      text: "{{left_column}}",
      fontSize: 16, color: COLORS.textDark, align: "l", valign: "t"
      // Keep bullets for column content
    }),
    createPlaceholderShape(4, {
      type: "body", idx: 2,
      x: 5.25, y: 1.3, w: colWidth, h: 4.0,
      text: "{{right_column}}",
      fontSize: 16, color: COLORS.textDark, align: "l", valign: "t"
      // Keep bullets for column content
    }),
  ];

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="twoObj" preserve="1">
  <p:cSld name="Two Column">
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr/>
${shapes.join("\n")}
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sldLayout>`;
}

// Layout 5: Competency
function createCompetencyLayout(): string {
  const shapes = [
    createPlaceholderShape(2, {
      type: "title",
      x: 0.5, y: 0.3, w: 9, h: 0.6,
      text: "{{competency_title}}",
      fontSize: 24, bold: true, color: COLORS.primaryBlue, align: "l", valign: "b",
      noBullet: true
    }),
    createRectShape(3, 0.5, 1.0, 9, 1.2, COLORS.lightGray, COLORS.accentTeal),
    // Use body placeholder so it appears on slides
    createPlaceholderShape(4, {
      type: "body", idx: 1,
      x: 0.7, y: 1.1, w: 8.6, h: 1.0,
      text: "{{competency_description}}",
      fontSize: 16, color: COLORS.textDark, align: "l", valign: "ctr",
      noBullet: true
    }),
    createTextShape(5, {
      x: 0.5, y: 2.4, w: 9, h: 0.5,
      text: "Learning Objectives:",
      fontSize: 18, bold: true, color: COLORS.primaryBlue, align: "l", valign: "b"
    }),
    createPlaceholderShape(6, {
      type: "body", idx: 2,
      x: 0.5, y: 2.9, w: 9, h: 2.4,
      text: "{{learning_objectives}}",
      fontSize: 16, color: COLORS.textDark, align: "l", valign: "t"
      // Keep bullets for objectives list
    }),
  ];

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" preserve="1">
  <p:cSld name="Competency">
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr/>
${shapes.join("\n")}
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sldLayout>`;
}

// Layout 6: Activity
function createActivityLayout(): string {
  const shapes = [
    createTextShape(2, {
      x: 0.5, y: 0.3, w: 1.5, h: 0.6,
      text: "Activity:",
      fontSize: 20, bold: true, color: COLORS.accentTeal, align: "l", valign: "b"
    }),
    createPlaceholderShape(3, {
      type: "title",
      x: 2.0, y: 0.3, w: 7.5, h: 0.6,
      text: "{{activity_title}}",
      fontSize: 24, bold: true, color: COLORS.primaryBlue, align: "l", valign: "b",
      noBullet: true
    }),
    createTextShape(4, {
      x: 0.5, y: 1.0, w: 2.0, h: 0.4,
      text: "Instructions:",
      fontSize: 14, bold: true, color: COLORS.textMedium, align: "l", valign: "b"
    }),
    createPlaceholderShape(5, {
      type: "body", idx: 1,
      x: 0.5, y: 1.4, w: 6.5, h: 2.8,
      text: "{{activity_instructions}}",
      fontSize: 16, color: COLORS.textDark, align: "l", valign: "t"
      // Keep bullets for instructions list
    }),
    createRectShape(6, 7.5, 1.0, 2.0, 0.8, "E8F4F3", COLORS.accentTeal),
    // Use placeholder so time estimate appears on slides
    createPlaceholderShape(7, {
      type: "body", idx: 2,
      x: 7.5, y: 1.0, w: 2.0, h: 0.8,
      text: "{{time_estimate}} min",
      fontSize: 18, bold: true, color: COLORS.primaryBlue, align: "ctr", valign: "ctr",
      noBullet: true
    }),
    createTextShape(8, {
      x: 0.5, y: 4.3, w: 2.5, h: 0.4,
      text: "Materials Needed:",
      fontSize: 14, bold: true, color: COLORS.textMedium, align: "l", valign: "b"
    }),
    // Use placeholder so materials appears on slides
    createPlaceholderShape(9, {
      type: "body", idx: 3,
      x: 3.0, y: 4.3, w: 6.5, h: 0.8,
      text: "{{materials_needed}}",
      fontSize: 14, color: COLORS.textDark, align: "l", valign: "t",
      noBullet: true
    }),
  ];

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" preserve="1">
  <p:cSld name="Activity">
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr/>
${shapes.join("\n")}
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sldLayout>`;
}

// Layout 7: Discussion
function createDiscussionLayout(): string {
  const shapes = [
    createPlaceholderShape(2, {
      type: "title",
      x: 0.5, y: 0.3, w: 9, h: 0.6,
      text: "Discussion",
      fontSize: 24, bold: true, color: COLORS.primaryBlue, align: "l", valign: "b",
      noBullet: true
    }),
    createRectShape(3, 0.5, 1.0, 9, 1.2, COLORS.lightGray),
    // Use placeholder so prompt appears on slides
    createPlaceholderShape(4, {
      type: "body", idx: 1,
      x: 0.7, y: 1.1, w: 8.6, h: 1.0,
      text: "{{discussion_prompt}}",
      fontSize: 20, color: COLORS.textDark, align: "l", valign: "ctr",
      noBullet: true
    }),
    createTextShape(5, {
      x: 0.5, y: 2.4, w: 9, h: 0.5,
      text: "Key Discussion Points:",
      fontSize: 16, bold: true, color: COLORS.accentTeal, align: "l", valign: "b"
    }),
    createPlaceholderShape(6, {
      type: "body", idx: 2,
      x: 0.5, y: 2.9, w: 9, h: 1.5,
      text: "{{discussion_points}}",
      fontSize: 16, color: COLORS.textDark, align: "l", valign: "t"
      // Keep bullets for discussion points list
    }),
    // Use placeholder so teaching notes appears on slides
    createPlaceholderShape(7, {
      type: "body", idx: 3,
      x: 0.5, y: 4.6, w: 9, h: 0.7,
      text: "Teaching Notes: {{teaching_notes}}",
      fontSize: 12, color: COLORS.textMedium, align: "l", valign: "t",
      noBullet: true
    }),
  ];

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" preserve="1">
  <p:cSld name="Discussion">
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr/>
${shapes.join("\n")}
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sldLayout>`;
}

// Layout 8: Quote
function createQuoteLayout(): string {
  const shapes = [
    // Decorative opening quote mark
    createTextShape(2, {
      x: 0.5, y: 0.8, w: 1, h: 1,
      text: "\u201C",
      fontSize: 120, color: COLORS.lightGray, align: "l", valign: "t"
    }),
    // Quote text
    createPlaceholderShape(3, {
      type: "body", idx: 1,
      x: 1.0, y: 1.5, w: 8, h: 2.5,
      text: "{{quote_text}}",
      fontSize: 32, color: COLORS.textDark, align: "ctr", valign: "ctr",
      noBullet: true
    }),
    // Attribution - use placeholder so it appears on slides
    createPlaceholderShape(4, {
      type: "body", idx: 2,
      x: 1.0, y: 4.2, w: 8, h: 0.5,
      text: "— {{attribution}}",
      fontSize: 18, color: COLORS.textMedium, align: "r", valign: "t",
      noBullet: true
    }),
  ];

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" preserve="1">
  <p:cSld name="Quote">
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr/>
${shapes.join("\n")}
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sldLayout>`;
}

// Layout 9: Full Image
function createFullImageLayout(): string {
  // For full image, we use a picture placeholder that spans the entire slide
  // and a semi-transparent caption bar at the bottom
  const shapes = [
    // Caption bar background (semi-transparent dark)
    createRectShape(2, 0, 4.625, 10, 1, "1B365D"),
    // Caption text - use placeholder so it appears on slides
    createPlaceholderShape(3, {
      type: "body", idx: 2,
      x: 0.5, y: 4.725, w: 9, h: 0.8,
      text: "{{image_caption}}",
      fontSize: 20, color: COLORS.white, align: "ctr", valign: "ctr",
      noBullet: true
    }),
  ];

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" preserve="1">
  <p:cSld name="Full Image">
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr/>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="4" name="Picture Placeholder"/>
          <p:cNvSpPr>
            <a:spLocks noGrp="1"/>
          </p:cNvSpPr>
          <p:nvPr>
            <p:ph type="pic" idx="1"/>
          </p:nvPr>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="0" y="0"/>
            <a:ext cx="${toEmu(10)}" cy="${toEmu(5.625)}"/>
          </a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
        </p:spPr>
      </p:sp>
${shapes.join("\n")}
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sldLayout>`;
}

// Layout 10: Big Text
function createBigTextLayout(): string {
  const shapes = [
    createPlaceholderShape(2, {
      type: "body", idx: 1,
      x: 0.5, y: 1.5, w: 9, h: 2.5,
      text: "{{big_text_content}}",
      fontSize: 54, bold: true, color: COLORS.primaryBlue, align: "ctr", valign: "ctr",
      noBullet: true
    }),
  ];

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" preserve="1">
  <p:cSld name="Big Text">
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr/>
${shapes.join("\n")}
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sldLayout>`;
}

// Layout rels (all point to slide master)
const layoutRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>`;

// === Sample Slides ===
// Note: createSlide is replaced by createSlideFromLayout (defined above)
// which dynamically extracts placeholders from layout XML

function createSlideRels(layoutNum: number): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout${layoutNum}.xml"/>
</Relationships>`;
}

// === Main Generation ===
async function generateTemplate(outputPath: string, verbose: boolean): Promise<void> {
  const zip = new JSZip();

  if (verbose) console.error("Creating PPTX structure...");

  // Root files
  zip.file("[Content_Types].xml", contentTypesXml);
  zip.file("_rels/.rels", relsXml);
  zip.file("docProps/core.xml", coreXml);
  zip.file("docProps/app.xml", appXml);

  // Presentation
  zip.file("ppt/presentation.xml", presentationXml);
  zip.file("ppt/_rels/presentation.xml.rels", presentationRelsXml);

  // Theme
  zip.file("ppt/theme/theme1.xml", themeXml);

  // Slide Master
  zip.file("ppt/slideMasters/slideMaster1.xml", slideMasterXml);
  zip.file("ppt/slideMasters/_rels/slideMaster1.xml.rels", slideMasterRelsXml);

  if (verbose) console.error("Creating slide layouts...");

  // Slide Layouts
  const layouts = [
    createTitleSlideLayout(),
    createSectionHeaderLayout(),
    createContentLayout(),
    createTwoColumnLayout(),
    createCompetencyLayout(),
    createActivityLayout(),
    createDiscussionLayout(),
    createQuoteLayout(),
    createFullImageLayout(),
    createBigTextLayout(),
  ];

  layouts.forEach((layoutXml, i) => {
    zip.file(`ppt/slideLayouts/slideLayout${i + 1}.xml`, layoutXml);
    zip.file(`ppt/slideLayouts/_rels/slideLayout${i + 1}.xml.rels`, layoutRelsXml);
  });

  if (verbose) console.error("Creating sample slides with dynamic placeholder extraction...");

  // Sample Slides (one per layout) - dynamically extract placeholders from each layout
  layouts.forEach((layoutXml, i) => {
    const slideXml = createSlideFromLayout(layoutXml);
    zip.file(`ppt/slides/slide${i + 1}.xml`, slideXml);
    zip.file(`ppt/slides/_rels/slide${i + 1}.xml.rels`, createSlideRels(i + 1));
  });

  if (verbose) console.error("Writing output file...");

  // Generate and save
  const content = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
  await Deno.writeFile(outputPath, content);

  console.log(`Created: ${outputPath}`);
  console.log(`\nTemplate includes 10 slide layouts with proper placeholders:`);
  console.log("  1. Title Slide - Course introduction (dark background)");
  console.log("  2. Section Header - Module dividers (dark background)");
  console.log("  3. Content - Standard content with title and body");
  console.log("  4. Two Column - Side-by-side comparison");
  console.log("  5. Competency - Learning objectives focus");
  console.log("  6. Activity - Exercise with time and materials");
  console.log("  7. Discussion - Q&A prompts and notes");
  console.log("  8. Quote - Impactful quote with attribution");
  console.log("  9. Full Image - Full-bleed image with caption");
  console.log("  10. Big Text - Single centered statement");
}

// === CLI ===
function printHelp(): void {
  console.log(`
generate-template-proper.ts - Create PPTX template with proper placeholders

Usage:
  deno run --allow-read --allow-write scripts/generate-template-proper.ts <output.pptx>

Options:
  -h, --help       Show this help
  -v, --verbose    Enable verbose output
`);
}

async function main(args: string[]): Promise<void> {
  const parsed = parseArgs(args, {
    boolean: ["help", "verbose"],
    alias: { help: "h", verbose: "v" },
  });

  if (parsed.help) {
    printHelp();
    Deno.exit(0);
  }

  const positionalArgs = parsed._.map(String);
  if (positionalArgs.length < 1) {
    console.error("Error: Output path required\n");
    printHelp();
    Deno.exit(1);
  }

  try {
    await generateTemplate(positionalArgs[0], parsed.verbose as boolean);
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : String(error));
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main(Deno.args);
}
