# Project Status

## Current State

Teach has **completed Phase 1 (Foundation)** of the feature backlog. All core infrastructure is in place: types, schemas, databases, and CRUD APIs for courses, content, and competencies.

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

### Phase 2: Next Up
- [ ] Scenario management endpoints
- [ ] Progression path endpoints
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

**Types & Schema:**
- `packages/types/src/index.ts` - 40+ types for competency framework
- `packages/course-schema/src/index.ts` - Zod schemas for competencies, scenarios, export

**Authoring API:**
- `apps/authoring-api/src/db/client.ts` - LibSQL database client
- `apps/authoring-api/src/db/migrate.ts` - Migration runner
- `apps/authoring-api/src/db/migrations/001_initial_schema.sql` - All tables
- `apps/authoring-api/src/routes/courses.ts` - Course CRUD + export
- `apps/authoring-api/src/routes/units.ts` - Unit CRUD
- `apps/authoring-api/src/routes/lessons.ts` - Lesson CRUD
- `apps/authoring-api/src/routes/activities.ts` - Activity CRUD
- `apps/authoring-api/src/routes/competencies.ts` - Competency framework CRUD

**Delivery API:**
- `apps/delivery-api/src/db/client.ts` - LibSQL database client
- `apps/delivery-api/src/db/migrate.ts` - Migration runner
- `apps/delivery-api/src/db/migrations/001_initial_schema.sql` - Learner tables

**Context Network:**
- `context/status.md` - Updated with progress
- `context/backlog.md` - Created with feature breakdown
- `context/decisions.md` - Added DEC-006, DEC-007, DEC-008

## Blockers

None currently.

## Next Steps

1. Extend `packages/course-schema/src/index.ts` with Zod schemas
2. Set up database migrations for authoring-api
3. Set up database migrations for delivery-api
4. Implement course CRUD endpoints

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

*Last updated: 2026-01-06*
