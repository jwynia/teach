# Project Status

## Current State

Teach has **started Phase 3** of the feature backlog. PDF generation service is complete with student handout support. DOCX and XLSX pending.

## Active Work

### Phase 1: Foundation (COMPLETE)
- [x] Define comprehensive feature backlog (6 epics)
- [x] Extend type definitions with competency framework types
- [x] Extend course export schema with Zod validation
- [x] Set up authoring API database with LibSQL migrations
- [x] Set up delivery API database with LibSQL migrations
- [x] Create course CRUD endpoints
- [x] Create unit/lesson/activity CRUD endpoints
- [x] Create competency framework endpoints

### Phase 2: Competency Framework APIs & UI (COMPLETE)
- [x] Scenario management endpoints (CRUD, variants, rubrics, competency mapping)
- [x] Progression path endpoints (CRUD, steps, reordering)
- [x] Skip logic rule endpoints (CRUD)
- [x] Competency framework UI components (clusters, competencies, rubrics, dependencies)
- [x] Course management pages with routing
- [x] Shared UI component library (Input, Label, Textarea, Select, Tabs, Dialog, Badge)
- [x] Update curriculum-assistant agent with competency awareness

### Phase 3: Document Generation (IN PROGRESS)
- [x] Design document generation system (`context/document-generation.md`)
- [x] Add pdf-lib, docx, xlsx dependencies
- [x] Create Zod schemas for PDF/DOCX/XLSX specs (`services/documents/types.ts`)
- [x] Implement PDF service (`services/documents/pdf.service.ts`)
- [x] Create student handout spec builder
- [x] Create database migration for generated_documents table
- [x] Create document generation API endpoints
- [ ] Implement DOCX service
- [ ] Implement XLSX service
- [ ] Create instructor guide spec builder
- [ ] Create grading rubric spec builder

### Completed Previously
- [x] Define core architecture and component boundaries
- [x] Set up monorepo with pnpm + Turborepo
- [x] Scaffold all applications and packages
- [x] Create curriculum-assistant, teaching, and coaching agents

## Recent Changes

| Date | Change | Impact |
|------|--------|--------|
| 2026-01-08 | PDF generation service complete | Student handout generation via pdf-lib, API endpoints, database tracking |
| 2026-01-08 | Document generation types | Zod schemas for PDF/DOCX/XLSX specs in services/documents/types.ts |
| 2026-01-08 | Document generation routes | POST /api/lessons/:id/documents, GET /api/documents/:id/download |
| 2026-01-07 | RevealJS generator skill created | New document generation target for HTML presentations, API endpoint added |
| 2026-01-07 | Flexible LLM provider configuration | Agents now support Anthropic, OpenAI, OpenRouter, custom endpoints via env vars |
| 2026-01-07 | Code review completed | 10 issues identified (3 high, 4 medium, 3 low), 5 good patterns documented |
| 2026-01-07 | Curriculum-assistant agent updated | 9 competency tools, competency-aware instructions |
| 2026-01-07 | Phase 2 complete | All APIs, UI, and agent ready |
| 2026-01-07 | Competency framework UI complete | Full CRUD for clusters, competencies, rubrics, dependencies |
| 2026-01-07 | Shared UI library expanded | Added Input, Label, Textarea, Select, Tabs, Dialog, Badge, Separator |
| 2026-01-07 | Course management pages added | CoursesPage, CourseDetailPage with tabs |
| 2026-01-07 | Scenario management API complete | scenarios.ts with 14 endpoints for scenarios, variants, rubrics |
| 2026-01-07 | Progression path API complete | paths.ts with 11 endpoints for paths, steps, reordering |
| 2026-01-07 | Skip logic API complete | skipLogic router with 5 CRUD endpoints |
| 2026-01-06 | Phase 1 complete | All foundation work done |
| 2026-01-06 | Competency endpoints created | Clusters, competencies, rubrics, dependencies API |
| 2026-01-06 | Content CRUD endpoints created | Courses, units, lessons, activities API |
| 2026-01-06 | Database migrations set up | Both APIs have LibSQL with auto-migration |
| 2026-01-06 | Course schema extended | Full Zod validation for competency framework |
| 2026-01-06 | Extended @teach/types with competency model | 40+ new types added |
| 2026-01-06 | Feature backlog created | 6 epics, 5 phases defined |
| 2026-01-05 | Monorepo scaffolded | 4 apps, 3 packages ready |

## Feature Backlog Overview

See `context/backlog.md` for detailed breakdown.

| Epic | Description | Status |
|------|-------------|--------|
| Epic 1 | Foundation - Data Model & Database | **Complete** |
| Epic 2 | Authoring API - CRUD Endpoints | **Complete** |
| Epic 3 | Document Generation Pipeline | **In Progress** (PDF complete) |
| Epic 4 | Learning Verification System | Pending |
| Epic 5 | Authoring UI | **In Progress** |
| Epic 6 | Delivery UI Enhancements | Pending |

### Implementation Phases
1. **Phase 1**: Types, schemas, databases, basic CRUD (COMPLETE)
2. **Phase 2**: Competency framework APIs and UI (COMPLETE)
3. **Phase 3** (Next): Document generation pipeline
4. **Phase 4**: Learning verification system
5. **Phase 5**: Polish and feedback loops

## Project Structure

```
teach/
├── apps/
│   ├── authoring-api/     # Hono + Mastra (port 4000)
│   ├── authoring-app/     # React + Vite (port 5173)
│   ├── delivery-api/      # Hono + Mastra (port 4001)
│   └── delivery-app/      # React + Vite (port 5174)
├── packages/
│   ├── ui/                # Shared shadcn components
│   ├── types/             # Shared TypeScript types (EXTENDED)
│   └── course-schema/     # Course export format (Zod)
└── context/               # Context network
```

## Key Files Modified This Session

**Authoring App UI (New):**
- `apps/authoring-app/src/App.tsx` - Routes for courses and course detail pages
- `apps/authoring-app/src/pages/CoursesPage.tsx` - Course list with create dialog
- `apps/authoring-app/src/pages/CourseDetailPage.tsx` - Tabbed course editor with competency management
- `apps/authoring-app/src/hooks/useApi.ts` - Data fetching hooks for all API endpoints
- `apps/authoring-app/src/components/competencies/CompetencyList.tsx` - Clustered competency list
- `apps/authoring-app/src/components/competencies/CompetencyForm.tsx` - Create/edit competency dialog
- `apps/authoring-app/src/components/competencies/ClusterForm.tsx` - Create/edit cluster dialog
- `apps/authoring-app/src/components/competencies/RubricEditor.tsx` - 4-level rubric editor
- `apps/authoring-app/src/components/competencies/CompetencyDetail.tsx` - Detail view with rubric and dependencies

**Shared UI Components (New):**
- `packages/ui/src/components/ui/input.tsx`
- `packages/ui/src/components/ui/label.tsx`
- `packages/ui/src/components/ui/textarea.tsx`
- `packages/ui/src/components/ui/select.tsx`
- `packages/ui/src/components/ui/tabs.tsx`
- `packages/ui/src/components/ui/dialog.tsx`
- `packages/ui/src/components/ui/badge.tsx`
- `packages/ui/src/components/ui/separator.tsx`

**Phase 2 API Routes:**
- `apps/authoring-api/src/routes/scenarios.ts` - Scenario CRUD, variants, rubrics, competency mapping
- `apps/authoring-api/src/routes/paths.ts` - Progression paths, steps, skip logic rules

**Curriculum Assistant Agent (Updated):**
- `apps/authoring-api/src/mastra/agents/curriculum-assistant.ts` - Competency-aware agent with 9 tools
- `apps/authoring-api/src/mastra/tools/competency-tools.ts` - Tools for listing, creating, and analyzing competencies

**RevealJS Generator Skill (New):**
- `.claude/skills/presentation/revealjs-generator/SKILL.md` - Skill documentation
- `.claude/skills/presentation/revealjs-generator/scripts/generate-from-markdown.ts` - Markdown → RevealJS HTML
- `.claude/skills/presentation/revealjs-generator/scripts/generate-scratch.ts` - JSON spec → RevealJS HTML
- `.claude/skills/presentation/revealjs-generator/assets/revealjs-spec-schema.json` - JSON schema for spec validation
- `apps/authoring-api/src/routes/courses.ts` - Added `POST /:id/export/revealjs` endpoint

## Blockers

None currently.

## Code Review

Comprehensive code review completed 2026-01-07. See `context/backlog.md` → "Code Review Backlog" section for 10 issues identified.

## Next Steps

1. Continue Phase 3: Document generation pipeline (RevealJS complete, PDF/DOCX/XLSX pending)
2. Build scenario management UI in authoring-app
3. Build progression path designer UI in authoring-app
4. Address code review backlog items

## Commands

```bash
# Install dependencies
pnpm install

# Run authoring system
pnpm dev:authoring-api  # Start API on port 4000
pnpm dev:authoring-app  # Start frontend on port 5173

# Run delivery system
pnpm dev:delivery-api   # Start API on port 4001
pnpm dev:delivery-app   # Start frontend on port 5174

# Run everything
pnpm dev
```

---

*Last updated: 2026-01-07*
