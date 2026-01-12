# Feature Backlog

Detailed breakdown of features for the Teach course authoring and delivery platform.

## Target Users

**Primary**: Subject matter experts (SMEs) who need AI guidance to structure their knowledge into courses.

## Design Principles

- **Competency-based**: Observable capabilities ("Can..." format) with 4-level rubrics
- **Scenario-driven assessment**: Real-world scenarios test actual judgment, not memorization
- **Multi-audience support**: Content layered for general, practitioner, and specialist audiences
- **Document generation**: Automated creation of PPTX, PDF, DOCX teaching materials
- **Both sync and async verification**: Real-time conversation and written submission modes

---

## Epic 1: Foundation - Data Model & Database

### 1.1 Type Definitions ✅ COMPLETED
**File**: `packages/types/src/index.ts`

Added types:
- Core aliases: `RubricLevel`, `AudienceLayer`, `ScenarioVariantType`, `EvidenceType`
- Competency: `Competency`, `CompetencyCluster`, `CompetencyDependency`, `RubricCriterion`
- Scenarios: `Scenario`, `ScenarioVariant`, `ScenarioRubric`, `ScenarioCompetencyMap`
- Progression: `ProgressionPath`, `ProgressionStep`, `SkipLogicRule`
- Assessment: `AssessmentSession`, `CompetencyDemonstration`, `SessionEvaluation`
- Documents: `DocumentTemplate`, `GeneratedDocument`, `DocumentGenerationJob`

Extended: `Course`, `Unit`, `Lesson`, `Activity`, `LearnerProgress`, `AgentConfig`

### 1.2 Course Export Schema
**File**: `packages/course-schema/src/index.ts`

Add Zod schemas:
- `CompetencySchema` with description validation (must start with "Can ")
- `ScenarioSchema` with variants and rubric
- `ProgressionPathSchema`
- Extend `CourseExportSchema` to include `competencyFramework`

### 1.3 Authoring API Database
**Directory**: `apps/authoring-api/src/db/`

Tables:
- `courses`, `units`, `lessons`, `activities`
- `competency_clusters`, `competencies`, `competency_dependencies`
- `rubric_criteria`
- `scenarios`, `scenario_variants`, `scenario_competency_map`
- `progression_paths`, `progression_steps`, `skip_logic_rules`
- Junction tables: `lesson_competencies`, `activity_competencies`
- `agent_configs`

### 1.4 Delivery API Database
**Directory**: `apps/delivery-api/src/db/`

Tables:
- `learners`, `learner_enrollments`
- `lesson_progress`, `activity_progress`
- `competency_demonstrations`
- `assessment_results`
- `learning_sessions`
- `learner_questions`

---

## Epic 2: Authoring API - CRUD Endpoints

### 2.1 Course Management
**File**: `apps/authoring-api/src/routes/courses.ts`

| Endpoint | Description |
|----------|-------------|
| `GET /api/courses` | List all courses |
| `POST /api/courses` | Create course |
| `GET /api/courses/:id` | Get course with structure |
| `PUT /api/courses/:id` | Update course |
| `DELETE /api/courses/:id` | Delete course |
| `POST /api/courses/:id/export` | Export to portable format |

### 2.2 Content CRUD
**Files**: `routes/units.ts`, `routes/lessons.ts`, `routes/activities.ts`

Standard CRUD + reorder endpoints for units, lessons, activities.

### 2.3 Competency Framework
**File**: `apps/authoring-api/src/routes/competencies.ts`

- Clusters: CRUD for competency clusters
- Competencies: CRUD with "Can..." validation
- Rubrics: Set 4-level criteria per competency
- Dependencies: Manage prerequisite relationships

### 2.4 Scenario Management
**File**: `apps/authoring-api/src/routes/scenarios.ts`

- Scenarios: CRUD with core decision structure
- Variants: Update interview/assessment/ongoing variants
- Competency mapping: Link scenarios to competencies

### 2.5 Progression Paths
**File**: `apps/authoring-api/src/routes/paths.ts`

- Paths: CRUD for learning tracks
- Steps: Ordered competency sequence
- Skip logic: Rules for bypassing based on evidence

---

## Epic 3: Document Generation Pipeline

### 3.1 Template Management
**Directory**: `apps/authoring-api/storage/templates/`

- Default templates for PPTX, PDF, DOCX
- Custom templates per organization
- Template analysis and placeholder extraction

### 3.2 Document Generator Agent
**File**: `apps/authoring-api/src/mastra/agents/document-generator.ts`

Agent transforms course content into document specs:
- `generateLectureSlidesSpec` - PPTX from lessons
- `generateStudentHandoutSpec` - PDF handouts
- `generateInstructorGuideSpec` - DOCX guides
- `generateAssessmentWorksheetSpec` - PDF assessments

### 3.3 Generation Workflow
**File**: `apps/authoring-api/src/mastra/workflows/generate-teaching-materials.ts`

Steps: Validate → Generate specs → Call Deno generators → Store files

### 3.4 Generation Endpoints
**File**: `apps/authoring-api/src/routes/documents.ts`

- Generate materials per lesson
- Batch generation for entire course
- Job status tracking
- Download generated files

### 3.5 Output Types

| Type | Format | Contains |
|------|--------|----------|
| Lecture Slides | PPTX | Title, objectives, concepts, activities, summary |
| Student Handout | PDF | Objectives checklist, key concepts, vocabulary, notes |
| Instructor Guide | DOCX | Overview, timing, teaching notes, rubrics |
| Assessment Worksheet | PDF | Scenarios with response areas |

### 3.6 Image Generation for Slides
**Directory**: `apps/authoring-api/src/services/images/`

AI-powered image generation from `[IMAGE: description]` annotations in slide content.

**API**: fal.ai with FLUX models (see DEC-012)
- Cost: ~$0.008/megapixel (~$0.032 for 4 variations)
- Features: 16:9 aspect ratio, no watermark, batch generation

**Components**:
- `fal.service.ts` - fal.ai FLUX integration with caching
- `types.ts` - Zod schemas for generated images
- `routes/images.ts` - API endpoints for generation/selection
- Database: `generated_images` table

**UI**:
- ImageSelector component - 4-image grid with selection
- LessonEditor integration - "Generate Images" button

**Flow**:
1. Parse `[IMAGE: description]` from slide content
2. Generate 4 variations via fal.ai FLUX
3. Store images locally in `storage/generated/{courseId}/images/`
4. Author selects preferred variation
5. RevealJS export embeds selected image

**Plan file**: `.claude/plans/zesty-inventing-glacier.md`

---

## Epic 4: Learning Verification System

### 4.1 Assessment Agent
**File**: `apps/delivery-api/src/mastra/agents/assessment-agent.ts`

Specialized agent for competency evaluation:
- Present scenarios
- Evaluate against 4-level rubrics
- Provide constructive feedback
- Adapt follow-up questions

Tools:
- `presentScenarioTool`
- `evaluateResponseTool`
- `adaptFollowUpTool`
- `recordCompetencyEvidenceTool`
- `generateFeedbackTool`
- `checkProgressionGatesTool`

### 4.2 Real-Time Assessment
**File**: `apps/delivery-api/src/mastra/workflows/realtime-assessment-workflow.ts`

Conversational assessment with immediate feedback.

### 4.3 Async Assessment
**File**: `apps/delivery-api/src/mastra/workflows/async-assessment-workflow.ts`

Written submission with detailed evaluation report.

### 4.4 Assessment Endpoints
**File**: `apps/delivery-api/src/routes/assessment.ts`

Real-time: Start session, respond, complete
Async: Submit, get results
Progress: Competency profile, prerequisite gates

### 4.5 Feedback Loop
**File**: `apps/delivery-api/src/mastra/workflows/feedback-aggregation-workflow.ts`

Aggregate assessment data to identify gaps and improve courses.

---

## Epic 5: Authoring UI

### 5.1 Course Dashboard
Course list, create/edit/delete, export actions

### 5.2 Course Editor
Tab-based: Content | Competencies | Scenarios | Paths | Agents
Drag-and-drop ordering, rich text editing

### 5.3 Competency Framework Builder
Cluster management, competency forms with validation, dependency graph, rubric editor

### 5.4 Scenario Builder
Decision structure, variant editors, rubric builder, competency mapping

### 5.5 Progression Path Designer
Visual path builder, step ordering, minimum viable competencies

### 5.6 Document Generation UI
Material type selection, template picker, progress indicator

### 5.7 AI Assistant Panel
Chat with curriculum-assistant, context-aware suggestions

---

## Epic 6: Delivery UI Enhancements

### 6.1 Assessment Interface
Scenario presentation, real-time chat, async submission, results display

### 6.2 Progress Dashboard
Competency heatmap, evidence timeline, progression visualization

---

## Implementation Phases

| Phase | Focus | Epics |
|-------|-------|-------|
| 1 | Foundation | 1.1-1.4, 2.1-2.3 |
| 2 | Competency Framework | 2.3-2.5, 5.3-5.5 |
| 3 | Document Generation | 3.1-3.5, 5.6 |
| 4 | Learning Verification | 4.1-4.5, 6.1-6.2 |
| 5 | Polish | 4.5, UI refinements |

---

## Key Design Decisions

See `context/decisions.md` for full decision records.

- **DEC-006**: Competency-based data model derived from competency skill
- **DEC-007**: 4-level rubric (not_demonstrated, partial, competent, strong)
- **DEC-008**: Scenario variants (interview, assessment, ongoing)

---

## Code Review Backlog (2026-01-07)

Issues identified during comprehensive code review. Prioritized by impact.

### High Priority

| ID | Issue | Location | Description |
|----|-------|----------|-------------|
| ~~CR-001~~ | ~~Missing ANTHROPIC_API_KEY documentation~~ | ~~`apps/authoring-api/`~~ | **RESOLVED** - Implemented flexible LLM provider factory with `LLM_PROVIDER`, `LLM_MODEL`, `LLM_API_KEY`, `LLM_BASE_URL`, `LLM_HEADERS` env vars. Supports Anthropic, OpenAI, OpenRouter, and custom endpoints. See `.env.example` files. |
| CR-002 | Circular dependency detection not implemented | `apps/authoring-api/src/mastra/tools/competency-tools.ts:621` | `analyze-dependencies` tool has `deepestChain: 0` stub. Should detect circular deps and compute actual chain depth. |
| CR-003 | Beta dependencies may break | `apps/authoring-api/package.json` | Using `@mastra/core: beta`, `@mastra/hono: beta`, `@mastra/libsql: beta`. Should pin to specific beta versions. |

### Medium Priority

| ID | Issue | Location | Description |
|----|-------|----------|-------------|
| CR-004 | Hardcoded CORS origins | `apps/authoring-api/src/index.ts:14-17` | CORS origins hardcoded. Should use `ALLOWED_ORIGINS` env var for production flexibility. |
| CR-005 | React 19 with React 18 types | `apps/authoring-app/package.json` | Using `react@19.0.0` but `@types/react@18.3.18`. May cause type mismatches. Update types when available. |
| CR-006 | Missing error boundaries | `apps/authoring-app/src/` | No React error boundaries. Uncaught render errors crash entire app. Add error boundary component. |
| CR-007 | Course existence not validated in tools | `competency-tools.ts` | Some tools (e.g., `create-competency`) don't verify courseId exists before insert. FK constraint catches it but with poor error message. |

### Low Priority (Acceptable for Local Dev Tool)

| ID | Issue | Location | Description |
|----|-------|----------|-------------|
| CR-008 | No authentication | All APIs | No auth/authz. Acceptable for local single-user tool. Document this limitation. |
| CR-009 | No CSRF protection | All APIs | No CSRF tokens. Not needed for same-origin localhost requests. |
| CR-010 | No rate limiting | All APIs | No request rate limiting. Could be issue if exposed. Document as local-only. |

### Informational (Good Patterns Found)

| Pattern | Location | Description |
|---------|----------|-------------|
| ✅ Parameterized SQL | All route files, tool files | All database queries use parameterized queries. No SQL injection risk. |
| ✅ Zod validation | All route files | Input validation on all endpoints using `@hono/zod-validator`. |
| ✅ FK constraints | `001_initial_schema.sql` | Proper foreign key constraints with CASCADE deletes. |
| ✅ React escaping | All React components | No `dangerouslySetInnerHTML`. React auto-escapes text content. |
| ✅ Vite proxy | `vite.config.ts` | API proxy properly configured for dev environment. |

---

*Last updated: 2026-01-07*
