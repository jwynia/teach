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
