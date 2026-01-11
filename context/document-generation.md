# Document Generation System Design

## Overview

Transform course content into teaching materials using native Node.js libraries. Supports PPTX, PDF, DOCX, XLSX, and RevealJS HTML output.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       API Layer (Hono)                          │
│  routes/documents.ts - REST endpoints for generation/download   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Mastra Agent Layer                           │
│  agents/document-generator.ts - AI-powered spec transformation  │
│  Tools: generate-lecture-slides, generate-student-handout, etc. │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Service Layer (Node.js)                      │
│  services/documents/                                            │
│    ├── pdf.service.ts   (pdf-lib 1.17.1)                       │
│    ├── docx.service.ts  (docx 9.0.2)                           │
│    ├── pptx.service.ts  (pptxgenjs 3.12.0)                     │
│    ├── xlsx.service.ts  (xlsx 0.18.5)                          │
│    └── revealjs.service.ts (pure HTML)                         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Storage Layer                                │
│  storage/generated/{courseId}/{lessonId}/{filename}             │
│  Database: generated_documents, document_generation_jobs        │
└─────────────────────────────────────────────────────────────────┘
```

## Document Types

| Type | Format | Library | Content Source |
|------|--------|---------|----------------|
| Lecture Slides | PPTX | pptxgenjs | Lesson content, competencies, activities |
| Lecture Preview | RevealJS HTML | (pure HTML) | Same as PPTX, browser-viewable |
| Student Handout | PDF | pdf-lib | Objectives, key concepts, notes area |
| Instructor Guide | DOCX | docx | Lesson plan, timing, rubrics, answer keys |
| Grading Rubric | XLSX | xlsx | Competency matrix with 4-level criteria |
| Assessment Worksheet | PDF | pdf-lib | Scenario prompts, response areas |

## Directory Structure

```
apps/authoring-api/src/
├── services/documents/
│   ├── index.ts                    # Barrel exports
│   ├── types.ts                    # Zod schemas for all specs
│   ├── pdf.service.ts              # PDF generation
│   ├── docx.service.ts             # DOCX generation
│   ├── pptx.service.ts             # PPTX generation
│   ├── xlsx.service.ts             # XLSX generation
│   ├── revealjs.service.ts         # RevealJS HTML generation
│   └── spec-builders/
│       ├── lecture-slides.builder.ts
│       ├── student-handout.builder.ts
│       ├── instructor-guide.builder.ts
│       ├── assessment-worksheet.builder.ts
│       └── grading-rubric.builder.ts
├── mastra/
│   ├── agents/document-generator.ts
│   └── tools/document-tools.ts
├── routes/documents.ts
└── db/migrations/002_document_generation.sql
```

## API Endpoints

### Lesson Documents
```
POST /api/lessons/:lessonId/documents
Body: {
  "documentTypes": ["lecture-slides", "student-handout", "instructor-guide"],
  "format": { "slides": "pptx" | "revealjs" },
  "estimatedDuration": 60
}
Response: { "generated": [{ type, filename, path, contentType }] }
```

### Live Preview (RevealJS)
```
GET /api/lessons/:lessonId/documents/preview/revealjs?theme=black
Response: HTML (text/html)
```

### Course Rubric
```
GET /api/courses/:courseId/documents/rubric?download=true
Response: XLSX file
```

### Batch Generation
```
POST /api/courses/:courseId/documents/batch
Body: {
  "lessonIds": ["...", "..."],
  "documentTypes": ["lecture-slides", "student-handout"]
}
Response: { "jobId": "...", "status": "processing" }

GET /api/documents/jobs/:jobId
Response: { "status": "complete", "progress": {...}, "results": [...] }
```

### Download
```
GET /api/documents/:docId/download
Response: File with Content-Disposition header
```

## Spec Formats

### PPTX Spec
```typescript
interface PptxSpec {
  title: string;
  author?: string;
  slides: Array<{
    background?: { color: string };
    notes?: string;
    elements: Array<{
      type: "text" | "table";
      x: number; y: number; w: number; h: number;
      options: TextOptions | TableOptions;
    }>;
  }>;
}
```

### PDF Spec
```typescript
interface PdfSpec {
  title: string;
  author?: string;
  pages: Array<{
    size?: "A4" | "Letter";
    elements: Array<{
      type: "text" | "rectangle" | "table" | "line";
      // position and style options
    }>;
  }>;
}
```

### DOCX Spec
```typescript
interface DocxSpec {
  title: string;
  creator?: string;
  sections: Array<{
    header?: { paragraphs: ParagraphSpec[] };
    footer?: { paragraphs: ParagraphSpec[] };
    content: Array<ParagraphSpec | TableSpec | { pageBreak: true }>;
  }>;
}
```

### XLSX Spec
```typescript
interface XlsxSpec {
  title?: string;
  sheets: Array<{
    name: string;
    data?: (string | number | null)[][];
    cells?: Array<{ address: string; value?: any; formula?: string }>;
    columns?: Array<{ col: string; width: number }>;
    freezePane?: string;
    autoFilter?: string;
  }>;
}
```

### RevealJS Spec
```typescript
interface RevealSpec {
  title: string;
  theme?: "black" | "white" | "league" | ...;
  slides: Array<{
    content?: string;  // HTML
    markdown?: string;
    notes?: string;
    background?: { color: string };
    vertical?: SlideSpec[];
  }>;
}
```

## Mastra Tools

| Tool ID | Description | Input | Output |
|---------|-------------|-------|--------|
| `get-lesson-data` | Retrieve lesson with content, activities, competencies | lessonId | Full lesson data |
| `generate-lecture-slides` | Create PPTX or RevealJS | lessonId, format | filename, path |
| `generate-student-handout` | Create PDF handout | lessonId | filename, path |
| `generate-instructor-guide` | Create DOCX guide | lessonId, duration | filename, path |
| `generate-grading-rubric` | Create XLSX rubric | courseId | filename, path |

## Database Schema

```sql
-- Generated documents tracking
CREATE TABLE generated_documents (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  unit_id TEXT REFERENCES units(id) ON DELETE CASCADE,
  lesson_id TEXT REFERENCES lessons(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  template_id TEXT,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  checksum TEXT NOT NULL,
  metadata TEXT NOT NULL DEFAULT '{}',
  generated_at TEXT NOT NULL,
  generated_by TEXT
);

-- Batch generation jobs
CREATE TABLE document_generation_jobs (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_ids TEXT NOT NULL,
  document_types TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'processing', 'complete', 'failed')),
  progress_current INTEGER NOT NULL DEFAULT 0,
  progress_total INTEGER NOT NULL DEFAULT 0,
  started_at TEXT,
  completed_at TEXT,
  results TEXT,
  errors TEXT
);
```

## Course Data → Document Mapping

### Lecture Slides

See [DEC-009: Research-Based Slide Generation](/context/decisions.md#dec-009-research-based-slide-generation) for the decision rationale.

#### Research Foundation

Slide generation follows three authoritative sources:

1. **Mayer's Cognitive Theory of Multimedia Learning**
   - Coherence: Remove extraneous information
   - Signaling: Highlight essential content with visual cues
   - Segmenting: One idea per slide
   - Spatial Contiguity: Place related text/visuals together
   - Pre-training: Introduce key terms before complex content
   - Multimedia: Combine words and pictures

2. **Assertion-Evidence Framework** (Michael Alley, Penn State)
   - Headlines are complete sentences stating the key message (not topic phrases)
   - Body is visual evidence (diagram, image, data), not bullet lists
   - Research shows better comprehension and retention

3. **Presentation Zen** (Garr Reynolds)
   - Signal-to-noise ratio: Every element serves a purpose
   - Three-second rule: Content graspable in 3 seconds
   - Visual dominance over text

#### Slide Types

| Type | When to Use | Structure | Research Basis |
|------|-------------|-----------|----------------|
| **assertion** | Core concept | Sentence headline + visual evidence | Alley assertion-evidence |
| **definition** | New terms | Term + one-sentence definition | Mayer pre-training |
| **process** | Sequential steps | Numbered visual steps | Mayer segmenting |
| **comparison** | Contrasting ideas | Side-by-side table | Mayer spatial contiguity |
| **quote** | Memorable insight | Large quote + attribution | Reynolds signal-to-noise |
| **question** | Engagement/reflection | Single provocative question | Mayer coherence |
| **example** | Concrete illustration | Scenario description | Mayer multimedia |
| **summary** | Recap | 3-5 key takeaways as sentences | Mayer segmenting |

#### Markdown Annotations

Slides use inline annotations for enhanced rendering:

```markdown
<!-- type: assertion -->
<!-- layout: image-right -->
## Complete sentence stating the key assertion

[IMAGE: description of supporting visual evidence]

Note: Speaker notes for the presenter
```

**Available Annotations:**

| Annotation | Purpose | Values |
|------------|---------|--------|
| `<!-- type: X -->` | Slide type | assertion, definition, process, comparison, quote, question, example, summary |
| `<!-- layout: X -->` | Layout hint | single, two-column, image-left, image-right, full-image |
| `[IMAGE: desc]` | Visual placeholder | Description of needed image |
| `[DIAGRAM: desc]` | Diagram placeholder | Description of needed diagram |
| `Note:` | Speaker notes | RevealJS native format |

#### Anti-Patterns to Avoid

- Multiple bullet points per slide (violates Segmenting)
- Topic headlines like "Benefits" instead of "AI reduces manual work by 40%" (violates assertion-evidence)
- Walls of text (violates Three-second rule)
- Same slide format repeated (creates monotony)
- Decorative content that doesn't support the assertion (violates Coherence)

#### Implementation

- **LLM Prompt**: `apps/authoring-api/src/routes/lessons.ts` - POST /api/lessons/:id/generate-slides
- **Annotation Parser**: `apps/authoring-api/src/routes/courses.ts` - parseSlideAnnotations()
- **CSS Styling**: Embedded in generateRevealJSFromMarkdown() function

#### Legacy Mapping (deprecated)
- ~~Title Slide~~: Course.title, Lesson.title
- ~~Objectives Slide~~: Competency.title from lesson competencies
- ~~Content Slides~~: Lesson.content.body parsed into bullets
- ~~Activity Slides~~: Activity.title, Activity.instructions
- ~~Summary Slide~~: Questions prompt

*Use slide_content field with research-based generation instead.*

### Student Handout
- **Header**: Course.title, Lesson.title
- **Objectives Checklist**: Competency.description ("Can..." statements)
- **Key Concepts**: Lesson.content.body
- **Activities**: Activity.instructions
- **Notes Section**: Blank lines for writing

### Instructor Guide
- **Overview**: Course.title, Lesson.title, duration, competency codes
- **Lesson Plan Table**: Time | Activity | Notes
- **Detailed Content**: Lesson.content.body with teaching notes
- **Rubrics**: RubricCriterion for each competency (4 levels)
- **Activity Guides**: Activity instructions with expected responses

### Grading Rubric (XLSX)
- **Sheet 1 "Competency Rubric"**: Code | Title | Not Demonstrated | Partial | Competent | Strong
- **Sheet 2 "Indicators"**: Code | Level | Specific indicators

## Design Decisions

### DEC-009: Native Node.js Generation
Port Deno scripts to Node.js using same npm packages (pdf-lib, docx, pptxgenjs, xlsx). No subprocess calls.

**Rationale**: Simpler deployment, better error handling, direct integration with Mastra tools.

### DEC-010: Spec-Based Pipeline
Two-step process: (1) Build spec from course data, (2) Generate document from spec.

**Rationale**: Separation of concerns, cacheable specs, same spec → multiple formats, debuggable intermediate format.

### DEC-011: RevealJS for Live Preview
Use RevealJS HTML for in-browser preview instead of rendering PPTX to images.

**Rationale**: No server-side rendering dependencies, works directly in browser, learners can use RevealJS output for presentations, supports ?print-pdf for PDF export.

## Implementation Notes

### Service Pattern
Each service exports a singleton instance and a `generate(spec)` method returning `GenerationResult`:

```typescript
interface GenerationResult {
  buffer: Buffer;
  filename: string;
  contentType: string;
  metadata: { pageCount?: number; slideCount?: number };
}
```

### Spec Builder Pattern
Each builder is a pure function: `buildXxxSpec(courseData, lessonData, options) → Spec`

### Storage Strategy
- Files stored at `storage/generated/{courseId}/{lessonId}/{filename}`
- Database tracks metadata in `generated_documents` table
- Files deleted when lesson deleted (via CASCADE)

### Error Handling
- Validate specs with Zod before generation
- Wrap library errors with descriptive messages
- Return 400 for validation errors, 500 for generation failures

## Dependencies

```json
{
  "pdf-lib": "^1.17.1",
  "docx": "^9.0.2",
  "pptxgenjs": "^3.12.0",
  "xlsx": "^0.18.5"
}
```

## Related Files

- `packages/types/src/index.ts` - Existing DocumentMaterialType, GeneratedDocument types
- `apps/authoring-api/src/routes/courses.ts:POST /:id/export/revealjs` - Existing RevealJS pattern
- `.claude/skills/pdf/pdf-generator/` - Reference Deno implementation
- `.claude/skills/presentation/pptx-generator/` - Reference Deno implementation
- `.claude/skills/word/docx-generator/` - Reference Deno implementation
- `.claude/skills/spreadsheet/xlsx-generator/` - Reference Deno implementation

---

*Created: 2026-01-08*
