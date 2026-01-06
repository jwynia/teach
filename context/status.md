# Project Status

## Current State

Teach has completed Phase 1 (Foundation) of development. The monorepo structure is in place with four applications and three shared packages scaffolded.

## Active Work

- [x] Define core architecture and component boundaries
- [x] Set up monorepo with pnpm + Turborepo
- [x] Scaffold all applications and packages
- [ ] Install dependencies and verify builds
- [ ] Define course data model in @teach/types
- [ ] Implement first CRUD endpoints in authoring-api

## Recent Changes

| Date | Change | Impact |
|------|--------|--------|
| 2026-01-05 | Monorepo scaffolded | 4 apps, 3 packages ready for development |
| 2026-01-05 | Curriculum assistant agent created | Authoring API has first agent |
| 2026-01-05 | Teaching + coaching agents created | Delivery API has teaching agents |
| 2026-01-05 | Architecture decisions documented | DEC-002 through DEC-005 recorded |
| 2026-01-05 | Context network created | Persistent context now available |
| 2026-01-05 | Project initialized | README.md, CLAUDE.md, skills installed |

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
│   ├── types/             # Shared TypeScript types
│   └── course-schema/     # Course export format (Zod)
└── [config files]
```

## Blockers

None currently.

## Next Steps

1. Run `pnpm install` to install all dependencies
2. Add more course-related types to @teach/types
3. Implement course CRUD routes in authoring-api
4. Build course editor UI in authoring-app
5. Define how course export works in @teach/course-schema

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

*Last updated: 2026-01-05*
