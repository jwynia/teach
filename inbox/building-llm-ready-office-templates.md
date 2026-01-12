# Building LLM-Ready Office Templates for Programmatic Generation

**JavaScript libraries for Office document generation have fundamentally different capabilities**: PptxGenJS cannot import existing templates at all, while pptx-automizer excels at template manipulation. This architectural reality should drive your template strategy—either define everything in code, or build templates specifically designed for pptx-automizer's element-targeting system. For Word documents, the `docx` library generates from scratch with full style control, while docxtemplater fills existing templates with placeholder syntax. Understanding these constraints before building templates prevents frustrating mismatches between template design and library capabilities.

## The PPTX template hierarchy demands precise construction

PowerPoint's three-layer inheritance system—**slide master → slide layouts → individual slides**—determines what properties cascade and override. The slide master sits at the top of this hierarchy in `ppt/slideMasters/slideMaster1.xml`, defining default fonts, colors, bullet styles, and the color mapping (`<p:clrMap>`). Slide layouts inherit from the master and specify placeholder arrangements for specific content patterns. Individual slides then inherit from their assigned layout, overriding only what's explicitly changed.

**Master-level elements should include**: background styling, footer/date/slide number placeholders, company logos, default text styles, bullet formatting, and shape templates. **Layout-level elements include**: specific placeholder positions and sizes, layout-specific overrides, and any formatting that varies between layout types. **Slide-level content** consists of actual text, images, and charts—plus any content-specific formatting overrides.

OOXML defines specific placeholder types through the `type` attribute: `title`, `ctrTitle`, `subTitle`, `body`, `chart`, `tbl`, `pic`, `media`, `dgm`, `obj`, `dt`, `ftr`, and `sldNum`. The critical attributes for programmatic access are `idx` (index for linking placeholders across layers), `type` (content type), and `sz` (size hints like `full`, `half`, `quarter`). Consistent `idx` values across master/layout/slide layers enable reliable inheritance.

Theme definitions live in `ppt/theme/theme1.xml` and contain three components. The color scheme defines 12 slots: dark1/light1 (typically text/background), dark2/light2, six accent colors, and hyperlink colors. The font scheme specifies major fonts (headings) and minor fonts (body text). The effect scheme controls shadows, reflections, and glows. Templates using theme references like `<a:schemeClr val="accent1"/>` adapt automatically when themes change—a significant advantage over hardcoded RGB values.

## PptxGenJS generates from scratch—it cannot import templates

PptxGenJS explicitly lists "Importing Existing Presentations and/or Templates" as an **unimplemented feature not on the roadmap**. This fundamental limitation means you must define all slide masters programmatically:

```javascript
pptx.defineSlideMaster({
  title: "MASTER_SLIDE",
  background: { color: "FFFFFF" },
  objects: [
    { rect: { x: 0, y: 5.3, w: "100%", h: 0.75, fill: { color: "F1F1F1" } } },
    { placeholder: { 
        options: { name: "body", type: "body", x: 0.6, y: 1.5, w: 12, h: 5.25 },
        text: "(placeholder text)" 
      }
    }
  ],
  slideNumber: { x: 0.3, y: "90%" }
});
```

The library supports creating charts, tables, images, and scheme colors. Placeholders work through the `placeholder` property with types including `title`, `body`, `image`, `chart`, `table`, and `media`. Reference placeholders by name when adding content: `slide.addText("Content", { placeholder: "body" })`. PptxGenJS works in both browser and Node.js environments with minimal dependencies (just JSZip).

**For LLM agents using PptxGenJS**: Store your complete slide master definitions, color schemes, and layout specifications in configuration files. The agent generates presentations entirely from code—there's no template file to modify, only programmatic definitions to execute.

## pptx-automizer enables true template-based generation

Unlike PptxGenJS, pptx-automizer is designed specifically for template modification. It loads existing .pptx files, merges slides from multiple templates, and modifies elements by name or creationId:

```javascript
const automizer = new Automizer({
  templateDir: './templates',
  outputDir: './output',
  useCreationIds: false,        // Use shape names vs XML creationIds
  autoImportSlideMasters: true, // Preserve master inheritance
  removeExistingSlides: true,   // Start with empty output
});

let pres = automizer
  .loadRoot('BrandTemplate.pptx')
  .load('ChartSlides.pptx', 'charts')
  .load('ContentSlides.pptx', 'content');

pres.addSlide('charts', 1, (slide) => {
  slide.modifyElement('SalesChart', [
    modify.setChartData({ series: [...], categories: [...] })
  ]);
  slide.modifyElement('TitlePlaceholder', 
    modify.replaceText([{ replace: '{{title}}', by: { text: 'Q4 Results' } }])
  );
});
```

**Element targeting works two ways**. By name (default): access shapes through their Selection Pane name in PowerPoint (Alt+F10). By creationId (more stable): use the XML `creationId` attribute that survives shape renaming. Enable globally with `useCreationIds: true` or use fallback selectors: `{ creationId: '{E43D12C3...}', name: 'ShapeName' }`.

Key limitations include server-side only operation (requires Node.js), no direct SlideLayout modification (modify master as workaround), and potential animation breakage when shapes change. Complex content in layouts—charts and images specifically—may break during master auto-import.

**For LLM agents using pptx-automizer**: Create a template library organized by content type (ChartSlides.pptx, TableSlides.pptx, ContentSlides.pptx). Name every element consistently using the Selection Pane. The agent selects slides from appropriate templates and modifies named elements with data.

## Word template structure centers on style inheritance

DOCX files follow a strict formatting precedence: **document defaults → table styles → numbering styles → paragraph styles → character styles → direct formatting**. Each layer can override the previous, with direct formatting (inline bold, manual font changes) trumping everything—which is precisely why corporate templates break so often.

The `styles.xml` file contains all style definitions. A well-structured style includes:

```xml
<w:style w:type="paragraph" w:styleId="Heading1">
  <w:name w:val="heading 1"/>
  <w:basedOn w:val="Normal"/>      <!-- Inheritance chain -->
  <w:next w:val="Normal"/>         <!-- Style after pressing Enter -->
  <w:qFormat/>                     <!-- Shows in Quick Styles -->
  <w:pPr>                          <!-- Paragraph properties -->
    <w:outlineLvl w:val="0"/>      <!-- For TOC/navigation -->
  </w:pPr>
  <w:rPr>                          <!-- Run/character properties -->
    <w:b/>
    <w:color w:themeColor="accent1"/>
  </w:rPr>
</w:style>
```

**Style types serve different purposes**. Paragraph styles (¶ symbol) format entire paragraphs—spacing, alignment, indentation. Character styles (a symbol) format text spans within paragraphs—bold emphasis, code formatting. Linked styles (¶a) act as either depending on selection context. Table styles control table formatting. Numbering styles reference list definitions.

Numbering uses a two-tier system that frequently confuses template builders. **Abstract numbering definitions** (`<w:abstractNum>`) define the "template"—format, text pattern, indentation. **Concrete numbering instances** (`<w:num>`) reference abstract definitions and can override specific levels. Paragraphs reference concrete instances via `<w:numPr>` with level (`<w:ilvl>`) and instance ID (`<w:numId>`).

## The docx library generates documents programmatically with full control

The `docx` npm library (~1.1M weekly downloads) creates Word documents from scratch using a declarative TypeScript API. It provides complete control over styles, numbering, sections, and formatting:

```typescript
import { Document, Paragraph, TextRun, HeadingLevel, Packer } from "docx";

const doc = new Document({
  styles: {
    paragraphStyles: [{
      id: "CustomBody",
      name: "Custom Body",
      basedOn: "Normal",
      next: "Normal",
      quickFormat: true,
      run: { font: "Calibri", size: 24 }, // Half-points
      paragraph: { spacing: { before: 120, after: 120 } }
    }]
  },
  numbering: {
    config: [{
      reference: "my-bullets",
      levels: [{ 
        level: 0, 
        format: LevelFormat.BULLET, 
        text: "•",
        style: { paragraph: { indent: { left: 720, hanging: 360 } } }
      }]
    }]
  },
  sections: [{
    children: [
      new Paragraph({ text: "Report Title", heading: HeadingLevel.HEADING_1 }),
      new Paragraph({ 
        style: "CustomBody",
        children: [new TextRun("Styled content here")]
      }),
      new Paragraph({
        text: "Bullet point",
        numbering: { reference: "my-bullets", level: 0 }
      })
    ]
  }]
});

const buffer = await Packer.toBuffer(doc);
```

The library works in both Node.js and browser environments. It provides excellent TypeScript definitions, making it well-suited for LLM agents that can generate type-safe code. **Key limitation**: it cannot read or modify existing documents—it's generation-only.

## Docxtemplater fills existing templates with placeholder syntax

For template-based Word generation, docxtemplater (~400K monthly downloads) takes a fundamentally different approach. Create templates in Word with `{placeholder}` syntax, then render with data:

```typescript
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";

const content = fs.readFileSync("template.docx", "binary");
const doc = new Docxtemplater(new PizZip(content), {
  paragraphLoop: true,
  linebreaks: true
});

doc.render({
  client_name: "Acme Corp",
  items: [
    { name: "Widget A", price: 100 },
    { name: "Widget B", price: 200 }
  ]
});
```

Template syntax supports loops (`{#array}...{/array}`), conditionals (`{#condition}...{/condition}`), and raw XML insertion (`{@rawXml}`). **Critical pitfall**: Word often splits placeholder text into multiple XML runs, breaking the parser. Type placeholders in one action without backspacing, or use the library's parser options to handle fragmented tags.

Enterprise modules (paid) add image insertion (`{%image}`), HTML-to-Word conversion (`{~html}`), dynamic styling, and table generation. For LLM agents, docxtemplater excels when templates are designed by humans and data comes from the agent—the agent doesn't need to understand Word's XML structure.

## Corporate templates fail through predictable anti-patterns

**Direct formatting instead of styles** represents the most pervasive problem. When users manually apply bold, change fonts, or adjust spacing instead of using styles, documents become unmaintainable. Detection: look for style entries like "Body Text + Bold" or "Normal + Right" in the Styles pane. The Style Inspector reveals direct formatting in its "Plus" section. Cleanup: `Ctrl+Space` removes character formatting; `Ctrl+Q` removes paragraph formatting.

**Broken inheritance in PowerPoint** occurs when slides get copied between presentations using "Keep Source Formatting." This creates duplicate masters like "1_Office Theme", "2_Office Theme"—orphaned layouts that bloat file size and create inconsistency. Detection: View → Slide Master should show a single parent master for most presentations.

**"Fake templates"** are designed slides without proper master/layout structure. The Reset button won't work; Slide Master view shows default Office setup instead of custom layouts. True templates define everything at the master level, allowing Reset to snap content to proper placeholder positions.

**Placeholder inheritance breaks** when placeholders are deleted and recreated rather than modified in place. The `idx` attribute linking placeholders across master/layout/slide layers gets lost. Quote from BrightCarbon: "if you delete placeholders or layouts from the master, you can seriously mess up your template, breaking it beyond [easy] repair."

**Style proliferation** accumulates through OCR documents, track changes, and cross-document pasting. Corporate templates often contain hundreds of unused or poorly-named styles. **Numbering corruption** occurs when documents merge or styles import incorrectly—headings display black rectangles instead of numbers.

## Template design strategies for reliable LLM generation

**For PptxGenJS-based systems**: Define complete slide master specifications in structured configuration. Store color palettes, font definitions, placeholder positions, and layout patterns as data the LLM agent can reference. The agent generates JavaScript code that calls `defineSlideMaster()` and builds slides programmatically. No template file exists—everything lives in code.

**For pptx-automizer-based systems**: Create a curated template library with consistent naming conventions. Name every shape using the Selection Pane (Alt+F10): `TitlePlaceholder`, `MainChart`, `DataTable`, `FooterText`. Use prefixes for organization: `ph_title`, `chart_sales`, `img_logo`. The LLM agent receives a template manifest describing available slides, element names, and expected data shapes. It selects appropriate slides and populates named elements.

**For docx library systems**: Define a style schema mapping semantic content types to Word styles. The agent works with abstractions like "heading", "body", "bullet" that map to `Heading1`, `BodyText`, `ListBullet1`. Store style definitions and numbering configurations in reusable modules the agent imports.

**For docxtemplater systems**: Design templates with clearly documented placeholders and loops. Provide the agent with a data schema showing expected structure: `{title: string, sections: [{heading: string, content: string}]}`. The agent generates data objects matching the schema; docxtemplater handles all Word formatting.

## Practical recommendations for template construction

Start by creating themes before touching slide masters. Define your color scheme (12 slots), font scheme (headings and body), and effect scheme in PowerPoint's theme editor. Save as `.thmx` file for reuse. Only then customize the slide master—all text should reference theme fonts, all colors should use scheme colors rather than hardcoded RGB values.

**Preserve default layouts** even if unused. PowerPoint uses hidden properties (layout name, type, placeholder count, `idx` attributes) to map slides when copying between presentations. Deleted defaults cause orphaning. Modify layouts in place rather than deleting and recreating.

**For Word templates**, define all needed styles before adding content. Disable "Automatically update" for every style—this setting causes local formatting changes to propagate globally. Link multilevel lists to heading styles for proper TOC generation. Use the built-in style names (Normal, Heading 1-9) for maximum compatibility with automated tools.

**Test templates rigorously**: Insert new slides and verify Reset works. Paste unformatted text and confirm styles apply correctly. Open in Slide Master/Styles view to verify no orphaned or duplicate elements exist. Generate test documents with your chosen library and open in Office to confirm proper formatting.

## Recommended template architecture for LLM agents

```
templates/
├── pptx/
│   ├── RootTemplate.pptx      # Empty base with all masters/themes
│   ├── ChartSlides.pptx       # Slides with chart placeholders
│   ├── TableSlides.pptx       # Slides with table layouts
│   ├── ContentSlides.pptx     # Text-heavy layouts
│   └── manifest.json          # Element names, slide indices, data shapes
├── docx/
│   ├── ReportTemplate.docx    # Placeholder-based for docxtemplater
│   ├── styles-config.ts       # Style definitions for docx library
│   └── numbering-config.ts    # List definitions
└── themes/
    └── brand-theme.thmx       # Shared color/font definitions
```

The manifest file describes what the LLM agent can work with—available layouts, element names, expected data types. This separation between template structure (maintained by designers) and content generation (performed by agents) enables reliable, consistent document creation while preserving brand integrity.

## Conclusion

The path to LLM-ready templates requires understanding both Office's internal architecture and JavaScript library limitations. **PptxGenJS demands code-only approaches**—no template files, just programmatic definitions. **pptx-automizer enables template modification** but requires meticulous element naming. **The docx library provides full programmatic control** for Word generation, while **docxtemplater bridges human-designed templates** with agent-generated data.

Corporate templates fail primarily through direct formatting overuse, broken inheritance chains, and placeholder deletion. Building clean templates means defining everything through styles and masters, using theme references instead of hardcoded values, preserving default layouts, and testing that Reset/inheritance works correctly.

For LLM agents, the key insight is creating **explicit mappings between semantic content and template structures**—whether that's a manifest of named elements for pptx-automizer, a style schema for the docx library, or a data schema for docxtemplater. This abstraction layer lets agents work with meaningful content types while the template handles all formatting complexity.