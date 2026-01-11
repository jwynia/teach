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
