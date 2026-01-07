# Project Status

## Current State

Teach has **completed Phase 2 API endpoints** of the feature backlog. Scenario and progression path APIs are now complete. Next: Competency framework UI components.

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

### Phase 2: Competency Framework APIs (IN PROGRESS)
- [x] Scenario management endpoints (CRUD, variants, rubrics, competency mapping)
- [x] Progression path endpoints (CRUD, steps, reordering)
- [x] Skip logic rule endpoints (CRUD)
- [ ] Competency framework UI components
- [ ] Update curriculum-assistant agent with competency awareness

### Completed Previously
- [x] Define core architecture and component boundaries
- [x] Set up monorepo with pnpm + Turborepo
- [x] Scaffold all applications and packages
- [x] Create curriculum-assistant, teaching, and coaching agents

## Recent Changes

| Date | Change | Impact |
|------|--------|--------|
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
| Epic 1 | Foundation - Data Model & Database | **In Progress** |
| Epic 2 | Authoring API - CRUD Endpoints | Pending |
| Epic 3 | Document Generation Pipeline | Pending |
| Epic 4 | Learning Verification System | Pending |
| Epic 5 | Authoring UI | Pending |
| Epic 6 | Delivery UI Enhancements | Pending |

### Implementation Phases
1. **Phase 1** (Current): Types, schemas, databases, basic CRUD
2. **Phase 2**: Competency framework APIs and UI
3. **Phase 3**: Document generation pipeline
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

**Phase 2 API Routes (New):**
- `apps/authoring-api/src/routes/scenarios.ts` - Scenario CRUD, variants, rubrics, competency mapping
- `apps/authoring-api/src/routes/paths.ts` - Progression paths, steps, skip logic rules
- `apps/authoring-api/src/index.ts` - Route registrations for new endpoints

**Phase 1 Files (Previous):**
- `packages/types/src/index.ts` - 40+ types for competency framework
- `packages/course-schema/src/index.ts` - Zod schemas for competencies, scenarios, export
- `apps/authoring-api/src/db/migrations/001_initial_schema.sql` - All tables
- `apps/authoring-api/src/routes/courses.ts` - Course CRUD + export
- `apps/authoring-api/src/routes/competencies.ts` - Competency framework CRUD

## Blockers

None currently.

## Next Steps

1. Build competency framework UI components in authoring-app
2. Update curriculum-assistant agent with competency awareness
3. Start Phase 3: Document generation pipeline

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
