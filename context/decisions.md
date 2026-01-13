# Architecture Decisions

Record of key decisions made during project development.

## Decision Template

When adding a new decision, use this format:

```markdown
### DEC-XXX: Decision Title

**Date**: YYYY-MM-DD
**Status**: Proposed | Accepted | Superseded | Deprecated

**Context**: What situation or problem prompted this decision?

**Decision**: What was decided?

**Rationale**: Why was this chosen over alternatives?

**Consequences**: What are the implications (positive and negative)?

**Alternatives Considered**:
- Alternative 1: Why rejected
- Alternative 2: Why rejected
```

---

## Decisions

### DEC-001: Single Domain Context Structure

**Date**: 2026-01-05
**Status**: Accepted

**Context**: Setting up initial context network structure. Project has interconnected concerns (curriculum, agents, web export) that could be separated into domains or kept unified.

**Decision**: Use single-domain structure without separating curriculum/agents/webapp into subdirectories.

**Rationale**: Project is in early research phase. Premature separation creates artificial boundaries before we understand true component relationships. Easier to expand later than to merge prematurely separated domains.

**Consequences**:
- Simpler navigation initially
- May need restructuring as architecture solidifies
- All research/decisions in flat structure

**Alternatives Considered**:
- Three domains (curriculum/, agents/, webapp/): Rejected as premature
- Two domains (content+agents/, webapp/): Also premature before understanding relationships

---

### DEC-002: Monorepo Structure

**Date**: 2026-01-05
**Status**: Accepted

**Context**: Needed to decide how to organize multiple applications (authoring API, authoring app, delivery API, delivery app) and shared packages.

**Decision**: Use a pnpm monorepo with Turborepo for build orchestration.

**Rationale**: Monorepo enables shared types, easier cross-package development, and unified tooling. pnpm workspaces provide efficient dependency management. Turborepo handles build caching and task orchestration.

**Consequences**:
- Shared @teach/types, @teach/ui, @teach/course-schema packages
- Single repository for all applications
- Unified CI/CD pipeline possible
- Requires workspace-aware tooling

**Alternatives Considered**:
- Separate repositories: Rejected due to coordination overhead and type sharing challenges
- npm workspaces: pnpm preferred for better performance and stricter dependency handling

---

### DEC-003: Dual API Architecture

**Date**: 2026-01-05
**Status**: Accepted

**Context**: Need to separate course authoring (for curriculum developers) from course delivery (for learners).

**Decision**: Two separate Hono + Mastra APIs:
- `authoring-api` (port 4000): Full-featured API for course creation, agent configuration
- `delivery-api` (port 4001): Lighter API for running exported courses with teaching/coaching agents

**Rationale**: Separation of concerns allows:
- Different deployment models (authoring can be centralized, delivery can be distributed)
- Different security requirements (authoring needs auth, delivery can be simpler)
- Course portability via export format

**Consequences**:
- Need well-defined export format (@teach/course-schema)
- Delivery API must be able to hydrate agents from exported configs
- Some code duplication between APIs

**Alternatives Considered**:
- Single API: Rejected as it conflates author and learner concerns
- Delivery API as proxy to authoring: Rejected as it requires authoring API to always be available

---

### DEC-004: SQLite with LibSQLStore

**Date**: 2026-01-05
**Status**: Accepted

**Context**: Need persistent storage for Mastra agents (conversation memory, state).

**Decision**: Use SQLite via Mastra's LibSQLStore integration.

**Rationale**: SQLite is simple, file-based, and great for development. LibSQLStore is natively supported by Mastra. Can migrate to Turso (hosted LibSQL) for production.

**Consequences**:
- Simple local development (no database server needed)
- Each API has its own database file
- Production migration path to Turso is straightforward

**Alternatives Considered**:
- PostgreSQL: Overkill for initial development, adds infrastructure complexity
- In-memory only: Loses state between restarts

---

### DEC-005: Shared UI Component Package

**Date**: 2026-01-05
**Status**: Accepted

**Context**: Two React frontends (authoring-app, delivery-app) will share UI components.

**Decision**: Create @teach/ui package with shared shadcn components and utilities.

**Rationale**: Consistent design language across apps, reduced code duplication, single source of truth for component styling.

**Consequences**:
- Both apps import from @teach/ui
- Components must be designed for both contexts
- shadcn components installed to @teach/ui, not individual apps

**Alternatives Considered**:
- Independent shadcn installs: Would lead to divergent styling and duplication
- Authoring-first, extract later: Deferred complexity but would require later refactoring

---

### DEC-006: Competency-Based Data Model

**Date**: 2026-01-06
**Status**: Accepted

**Context**: Need to define how course content relates to learning outcomes. Traditional approaches track lesson completion, but this doesn't verify actual capability.

**Decision**: Adopt a competency-based data model derived from the competency skill patterns:
- Observable competencies ("Can..." format) instead of knowledge statements
- 4-level rubric: not_demonstrated, partial, competent, strong
- Scenario-based assessment with three variants (interview, assessment, ongoing)
- Progression paths with dependency relationships
- Audience layers (general, practitioner, specialist)

**Rationale**:
- Observable capabilities are testable by multiple independent observers
- 4-level rubric provides meaningful differentiation beyond pass/fail
- Scenario variants support different contexts (hiring, onboarding, ongoing)
- Progression dependencies ensure foundational competencies before advanced ones
- Audience layers allow same content at different depths

**Consequences**:
- More complex data model than simple lesson tracking
- Requires scenario authoring, not just content
- Assessment agent needs sophisticated evaluation logic
- Richer analytics possible on competency gaps

**Alternatives Considered**:
- Simple completion tracking: Rejected as it doesn't verify learning
- Pass/fail assessment: Rejected as too coarse-grained
- Bloom's taxonomy levels: Too abstract, not observable

---

### DEC-007: Document Generation via Skill Integration

**Date**: 2026-01-06
**Status**: Accepted

**Context**: SMEs need teaching materials (slides, handouts, guides) generated from course content without manual document creation.

**Decision**: Integrate existing document generation skills (pptx-generator, pdf-generator, docx-generator) via:
- Document generator agent transforms course content to JSON specs
- Mastra workflow orchestrates the generation pipeline
- Deno scripts called as subprocesses for actual document creation
- Template-based and from-scratch generation supported

**Rationale**: Leverages existing, tested generator skills rather than building new document generation. Agent-assisted transformation handles the intelligence; scripts handle the mechanics.

**Consequences**:
- Dependency on Deno runtime for generation scripts
- JSON spec format must match skill expectations
- Template management adds complexity
- Can evolve independently of core application

**Alternatives Considered**:
- Pure Node.js libraries (pptxgenjs, pdf-lib): Would duplicate existing skill functionality
- External API services: Adds latency and cost
- Manual creation only: Doesn't serve SME target users

---

### DEC-008: Dual Assessment Modes

**Date**: 2026-01-06
**Status**: Accepted

**Context**: Learning verification needs to support different learner situations and assessment styles.

**Decision**: Support both real-time conversational and async written submission modes:
- Real-time: Agent adapts follow-up questions based on responses
- Async: Learner submits written response, gets detailed feedback later
- Both evaluate against same competency rubrics
- Evidence recorded regardless of mode

**Rationale**:
- Real-time allows probing and clarification, richer assessment
- Async scales better, allows learner reflection time
- Some learners perform better in one mode vs other
- Both produce comparable competency evidence

**Consequences**:
- Two workflow implementations needed
- Agent instructions must handle both modes
- UI must support chat and form interfaces
- Feedback format differs between modes

**Alternatives Considered**:
- Real-time only: Excludes learners who need reflection time
- Async only: Loses opportunity for adaptive follow-up
- Separate rubrics per mode: Creates comparability issues

---

### DEC-009: Research-Based Slide Generation

**Date**: 2026-01-10
**Status**: Accepted

**Context**: Initial LLM slide generation produced monotonous output (title + 4 bullet points for every slide), violating presentation and instructional design best practices.

**Decision**: Adopt research-grounded slide generation principles from three authoritative sources:

1. **Mayer's Cognitive Theory of Multimedia Learning** (Cambridge University Press)
   - Coherence: Remove extraneous information
   - Signaling: Highlight essential content
   - Segmenting: One idea per slide
   - Spatial Contiguity: Place related text/visuals together
   - Pre-training: Introduce key terms first

2. **Assertion-Evidence Framework** (Michael Alley, Penn State)
   - Headlines are complete sentences stating the key message
   - Body is visual evidence (diagram, image, data), not bullet lists
   - Research shows better comprehension and retention vs. bullet slides

3. **Presentation Zen** (Garr Reynolds)
   - Signal-to-noise ratio: Every element serves a purpose
   - Three-second rule: Content graspable in 3 seconds
   - Visual dominance over text

**Implementation**:
- LLM prompt includes 8 slide types: assertion, definition, process, comparison, quote, question, example, summary
- Markdown annotations: `<!-- type: X -->`, `<!-- layout: X -->`, `[IMAGE: description]`, `Note:`
- RevealJS export parses annotations for type-specific CSS styling
- Anti-patterns explicitly listed in prompt

**Rationale**:
- Cognitive science basis (Mayer's research) provides evidence for effectiveness
- Assertion-evidence research shows measurable learning improvements
- Varied slide types maintain engagement and match content purpose
- Annotations enable enhanced rendering without breaking standard markdown

**Consequences**:
- Richer, more varied slide output
- Visual placeholder hints require later image selection
- More complex prompt but produces better instructional design
- Principles documented in `context/document-generation.md`

**Alternatives Considered**:
- Simple bullet-point generation: Rejected as cognitively inferior
- Two-phase generation (analyze then generate): Deferred as enhancement if single-prompt insufficient

**Research Sources**:
- Mayer, R.E. (2009). *Multimedia Learning*. Cambridge University Press.
- Alley, M. (2013). *The Craft of Scientific Presentations*. Springer.
- Reynolds, G. (2012). *Presentation Zen*. New Riders.
- assertion-evidence.org - Penn State research

---

### DEC-010: Native Node.js Document Generation

**Date**: 2026-01-08
**Status**: Accepted

**Context**: Original plan called for Deno subprocess calls to existing generator skills. This added complexity with process management, error handling, and permission flags.

**Decision**: Port document generation to native Node.js using the same npm packages (pdf-lib 1.17.1, docx 9.0.2, pptxgenjs 3.12.0, xlsx 0.18.5).

**Rationale**: Simpler deployment, better error handling, direct integration with Mastra tools, no subprocess management, type safety across the stack.

**Consequences**:
- Document generation services run in-process
- Same JSON spec format as original skills
- Deno skills remain as reference implementations

---

### DEC-011: RevealJS for Live Preview

**Date**: 2026-01-08
**Status**: Accepted

**Context**: Need browser-viewable preview of presentation slides without server-side PPTX rendering.

**Decision**: Use RevealJS HTML for in-browser preview instead of rendering PPTX to images.

**Rationale**:
- No server-side rendering dependencies
- Works directly in browser
- Learners can use RevealJS output directly for presentations
- Supports `?print-pdf` for PDF export
- Theming via CSS variables

**Consequences**:
- Two output formats: PPTX for download, RevealJS for preview/use
- Theme system needed for consistent styling
- Annotation parsing shared between both outputs

---

### DEC-012: fal.ai FLUX for Image Generation

**Date**: 2026-01-11
**Status**: Accepted

**Context**: Slide annotations include `[IMAGE: description]` placeholders that need AI-generated images. Evaluated Google Imagen 4, fal.ai FLUX, and Replicate.

**Decision**: Use fal.ai with FLUX models for generating images from slide annotation descriptions.

**Rationale**:
- **Cost**: ~$0.008/megapixel vs Google Imagen $0.04/image (5x cheaper)
- **No watermark**: Google Imagen adds visible SynthID watermark
- **Aspect ratio**: Native 16:9 support via `image_size: "landscape_16_9"`
- **Batch support**: `num_images: 4` generates variations in single request
- **Developer experience**: `@fal-ai/client` npm package with queue-based async and polling

**Implementation**:
- Generate 4 variations per annotation (~$0.032 total)
- Store in `storage/generated/{courseId}/images/`
- Author selects preferred variation via ImageSelector UI
- Cache by prompt hash to avoid regeneration
- RevealJS export embeds selected images

**Cost Estimate**:
- 4 variations per annotation: ~$0.032
- 5 annotations per lesson: ~$0.16
- 20-lesson course: ~$3.20 total

**Consequences**:
- External API dependency (requires FAL_KEY)
- Async generation with polling needed
- Images stored locally (not in database)
- Selection UI required in authoring app

**Alternatives Considered**:
- **Google Imagen 4**: More expensive, visible watermark, requires Google Cloud
- **Replicate**: Similar to fal.ai but less optimized pricing for FLUX
- **Local Stable Diffusion**: Requires GPU, complex setup, defeats cloud-first approach

**Plan File**: `.claude/plans/zesty-inventing-glacier.md`

---

### DEC-013: PPTX Speaker Notes from Transcript

**Date**: 2026-01-13
**Status**: Accepted

**Context**: When generating slides from lesson transcript/narrative content, the verbatim transcript should be preserved as speaker notes for each slide. This supports:
- Presenter reference during live delivery
- TTS voiceover for automated video generation
- Consistency between slide content and spoken narrative

RevealJS export already supports speaker notes via `Note:` annotations parsed into `<aside class="notes">`. PPTX requires separate XML infrastructure.

**Decision**: Extend the PPTX generator to create proper PowerPoint speaker notes by:

1. **Notes Master** (`ppt/notesMasters/notesMaster1.xml`): Template defining notes page layout with slide preview and text area
2. **Notes Slides** (`ppt/notesSlides/noteSlideN.xml`): One per slide containing the transcript text
3. **Relationships**:
   - Slide → Notes slide link in `ppt/slides/_rels/slideN.xml.rels`
   - Notes slide → Notes master link in `ppt/notesSlides/_rels/noteSlideN.xml.rels`
   - Presentation → Notes master link in `ppt/presentation.xml.rels`
4. **Content Types**: Override entries for `notesSlide+xml` and `notesMaster+xml`

**Implementation Location**: `/.claude/skills/presentation/pptx-generator/scripts/generate-from-template.ts`

**XML Structure**:
```
ppt/
├── notesMasters/
│   ├── notesMaster1.xml
│   └── _rels/notesMaster1.xml.rels
├── notesSlides/
│   ├── noteSlide1.xml (contains slide 1 transcript)
│   ├── noteSlide2.xml
│   └── _rels/
│       ├── noteSlide1.xml.rels
│       └── noteSlide2.xml.rels
```

**Rationale**:
- Native PowerPoint notes pane is universally supported
- Notes visible in Presenter View during slideshow
- Notes export to PDF with `File > Print > Print Layout: Notes`
- Verbatim transcript enables future TTS integration
- Maintains consistency with RevealJS speaker notes support

**Consequences**:
- More complex PPTX generation (7 additional XML file types)
- Larger PPTX file size (minimal, text only)
- Notes master styling is basic (can be enhanced later)
- Enables TTS video automation pipeline

**Alternatives Considered**:
- **Template placeholder `{{teaching_notes}}`**: Only works for visible slide content, not PowerPoint's notes pane
- **Third-party library (pptxgenjs)**: Would require rewriting generator; current JSZip approach is working well
- **Skip PPTX notes, use RevealJS only**: Loses PowerPoint's native presenter view support
