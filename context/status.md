# Project Status

## Current State

**RESOLVED**: Authoring API is now **FULLY OPERATIONAL** after successful dependency restoration. All critical blockers have been resolved and the API is ready for continued development.

Teach has **completed Phase 3 dependency restoration** and can now continue with document generation pipeline development. PDF and DOCX generation services are complete and verified working. XLSX service pending.

## Active Work

### **COMPLETED**: Authoring API Restoration Plan (SUCCESS ✅)
All critical issues have been resolved and the API is fully operational.

**Issues Resolved:**
- ✅ Security issue fixed: Removed exposed API key from .env.example
- ✅ Dependencies installed: Used npm to bypass broken pnpm
- ✅ Package versions corrected: Fixed outdated pptx-automizer and pptxgenjs versions
- ✅ Shared workspace packages built: @teach/types and @teach/course-schema compiled
- ✅ Database initialized: SQLite database created with all migrations applied
- ✅ API verified: Startup successful, endpoints tested, database operations confirmed

**Current Environment Status:**
- ✅ Node.js v22.16.0 (meets >=22.13.0 requirement)
- ✅ npm package manager (bypassed broken pnpm)
- ✅ User has proper .env with valid OpenRouter API key
- ✅ Complete project structure exists
- ✅ All dependencies installed and working
- ✅ Security issues resolved

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
- [x] **Verify API endpoints working** (all 6 tested 2026-01-09)
- [x] Implement DOCX service (`services/documents/docx.service.ts`)
- [x] Create instructor guide spec builder (`spec-builders/instructor-guide.builder.ts`)
- [ ] Implement XLSX service
- [ ] Create grading rubric spec builder (XLSX)

### Phase 3.5: Image Generation for Slides (PLANNED)
- [ ] Add @fal-ai/client dependency
- [ ] Create database migration for generated_images table
- [ ] Create fal.ai service (`services/images/fal.service.ts`)
- [ ] Create image generation API endpoints (`routes/images.ts`)
- [ ] Update RevealJS export to embed selected images
- [ ] Create ImageSelector UI component
- [ ] Update LessonEditor with "Generate Images" button

**Design Decision:** Use fal.ai FLUX models for image generation (DEC-012)
- Lower cost (~$0.008/megapixel vs $0.04 for Google Imagen)
- No visible watermark
- 16:9 aspect ratio support for slides
- Estimated cost: ~$3.20 for 20-lesson course

**Plan file:** `.claude/plans/zesty-inventing-glacier.md`

### Completed Previously
- [x] Define core architecture and component boundaries
- [x] Set up monorepo with pnpm + Turborepo
- [x] Scaffold all applications and packages
- [x] Create curriculum-assistant, teaching, and coaching agents

## Recent Changes

| Date | Change | Impact |
|------|--------|--------|
| 2026-01-12 | **RESOLVED**: Authoring API fully operational | Dependencies installed via npm, database initialized, all endpoints verified working |
| 2026-01-12 | **SECURITY**: API key security issue resolved | Removed exposed OpenRouter key from .env.example, replaced with placeholder |
| 2026-01-12 | **TECHNICAL**: Bypassed broken pnpm | Used npm for dependency installation, fixed package version conflicts |
| 2026-01-10 | RevealJS presentation theming system | 8 pre-built themes with color palettes, section backgrounds, custom theme generator from seed colors |
| 2026-01-10 | Presentation theme UI | Settings tab in CourseDetailPage with ThemeSelector component for choosing/generating themes |
| 2026-01-10 | Theme API endpoints | CRUD for themes, course theme assignment, theme generation from seed color |
| 2026-01-10 | Research-based slide generation (DEC-009) | LLM generates varied slide types based on Mayer, Alley, Reynolds research; see `context/document-generation.md` |
| 2026-01-10 | Slide annotation system | Markdown annotations for type/layout/visuals parsed for enhanced RevealJS rendering |
| 2026-01-10 | teach-course-builder skill created | CLI scripts to transform source documents into courses via authoring API |
| 2026-01-09 | Course Content Editor UI implemented | Content tab with Units/Lessons hierarchy, markdown editor with preview, CRUD operations |
| 2026-01-09 | DOCX service implemented | `docxService.generate()` creates Word documents from DocxSpec objects |
| 2026-01-09 | Instructor guide builder created | `buildInstructorGuideSpec()` generates DOCX specs with objectives, activities, timing |
| 2026-01-09 | Document generation API verified | All 6 endpoints tested: generate, list, metadata, download, delete, course-list |
| 2026-01-09 | Fixed env loading in authoring-api | Added `--env-file=.env` to dev script in package.json |
| 2026-01-09 | Process manager skill created | `.claude/skills/process-manager/` for managing dev servers |
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
| Epic 3 | Document Generation Pipeline | **In Progress** (PDF/DOCX complete, XLSX pending) |
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
│   ├── authoring-api/     # Hono + Mastra (port 4000) - OPERATIONAL ✅
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

**DOCX Generation (New):**
- `apps/authoring-api/src/services/documents/docx.service.ts` - DOCX generation using docx library
- `apps/authoring-api/src/services/documents/spec-builders/instructor-guide.builder.ts` - Instructor guide spec builder
- `apps/authoring-api/src/services/documents/index.ts` - Updated exports for docxService
- `apps/authoring-api/src/routes/documents.ts` - Added instructor-guide handling

**Course Content Editor (New):**
- `apps/authoring-app/src/components/content/ContentList.tsx` - Unit/lesson hierarchy with reordering
- `apps/authoring-app/src/components/content/UnitForm.tsx` - Create/edit unit dialog
- `apps/authoring-app/src/components/content/LessonForm.tsx` - Create/edit lesson dialog
- `apps/authoring-app/src/components/content/LessonEditor.tsx` - Lesson detail view with markdown editor
- `apps/authoring-app/src/components/content/MarkdownEditor.tsx` - Markdown edit/preview component
- `apps/authoring-app/src/hooks/useApi.ts` - Added Unit/Lesson types and hooks
- `apps/authoring-app/src/pages/CourseDetailPage.tsx` - Wired up Content tab

**teach-course-builder Skill (New):**
- `.claude/skills/teach-course-builder/SKILL.md` - Skill documentation and workflow
- `.claude/skills/teach-course-builder/scripts/api-client.ts` - Shared API client module
- `.claude/skills/teach-course-builder/scripts/analyze-sources.ts` - Analyze source documents
- `.claude/skills/teach-course-builder/scripts/create-course.ts` - Create course via API
- `.claude/skills/teach-course-builder/scripts/add-unit.ts` - Add unit to course
- `.claude/skills/teach-course-builder/scripts/add-lesson.ts` - Add lesson to unit
- `.claude/skills/teach-course-builder/scripts/add-competency.ts` - Add competency to course
- `.claude/skills/teach-course-builder/scripts/list-courses.ts` - List existing courses
- `.claude/skills/teach-course-builder/templates/course-plan.md` - Course plan template

**Presentation Theming System (New):**
- `apps/authoring-api/src/db/migrations/004_add_presentation_themes.sql` - Theme table and 8 pre-built themes
- `apps/authoring-api/src/services/themes/types.ts` - Theme type definitions and Zod schemas
- `apps/authoring-api/src/services/themes/generator.ts` - Color palette and theme CSS generation
- `apps/authoring-api/src/routes/themes.ts` - Theme CRUD and course theme endpoints
- `apps/authoring-api/src/routes/courses.ts` - Updated RevealJS export to use stored themes
- `apps/authoring-app/src/components/settings/ThemeSelector.tsx` - Theme selection UI
- `apps/authoring-app/src/hooks/useApi.ts` - Added theme types and hooks

## Blockers

**No current blockers.** All critical issues have been resolved:

**✅ Resolved Issues:**
- Dependencies installed: All required packages available via npm
- Shared packages built: @teach/types and @teach/course-schema compiled
- Database operational: SQLite initialized with all migrations
- API endpoints verified: All routes responding correctly
- Security issues fixed: No exposed API keys

## Code Review

Comprehensive code review completed 2026-01-07. See `context/backlog.md` → "Code Review Backlog" section for 10 issues identified.

## Next Steps

**CURRENT PRIORITIES** (Authoring API now operational):
1. **Complete Phase 3**: Implement XLSX service and grading rubric builder
2. **Build Authoring UI**: Scenario management and progression path designer
3. **Continue Development**: Address code review backlog items
4. **Phase 4 Planning**: Learning verification system design

**Ready for Development:**
- All APIs operational and tested
- Database schema complete with migrations
- Dependencies resolved and stable
- Development environment fully functional

## Commands

```bash
# Dependencies already installed ✅
# Use npm (pnpm is broken in this environment)

# Run authoring system
cd apps/authoring-api && npm run dev     # Start API on port 4000 ✅
cd apps/authoring-app && npm run dev     # Start frontend on port 5173

# Run delivery system  
cd apps/delivery-api && npm run dev      # Start API on port 4001
cd apps/delivery-app && npm run dev      # Start frontend on port 5174

# Build shared packages (if needed)
cd packages/types && npm run build
cd packages/course-schema && npm run build
```

---

*Last updated: 2026-01-12 - Authoring API restoration completed successfully*
