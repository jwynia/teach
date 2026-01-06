# Open Research Questions

Questions and hypotheses being explored during the research/planning phase.

## Architecture Questions

### Q1: How should curriculum be structured as data?
**Status**: Open
**Context**: Need to define the data model for curriculum/courses

Considerations:
- Hierarchical (curriculum → unit → lesson → activity)?
- Graph-based (competencies with dependencies)?
- Hybrid approach?

**Related decisions**: None yet

---

### Q2: What's the boundary between curriculum authoring and course delivery?
**Status**: Resolved
**Context**: Project spans both creation (authoring) and consumption (delivery via web app)

**Resolution**: Clean separation via export format. See DEC-003.
- Authoring API handles course creation and agent configuration
- Delivery API runs exported courses with hydrated agents
- @teach/course-schema defines the contract between systems

---

### Q3: What's the right agent architecture?
**Status**: Resolved
**Context**: Multiple agent types mentioned (teaching, coaching, assessment)

**Resolution**: Multiple specialized agents using Mastra framework. See DEC-003.
- Authoring: curriculum-assistant agent
- Delivery: teaching-agent, coaching-agent (assessment-agent planned)
- Each agent has focused role and instructions

---

## Content Questions

### Q4: What curriculum frameworks should we support?
**Status**: Open
**Context**: Many approaches to curriculum design exist

Considerations:
- Competency-based?
- Objective-based?
- Problem-based learning?
- Multiple frameworks as options?

---

### Q5: How granular should competency tracking be?
**Status**: Open
**Context**: Need to track learner progress

Considerations:
- Per-lesson completion?
- Fine-grained skill mastery?
- Self-assessment vs. agent assessment?

---

## Technical Questions

### Q6: What's the portable export format?
**Status**: Partially Resolved
**Context**: Courses need to run in separate web application

**Resolution**: JSON export defined in @teach/course-schema. Includes:
- Course metadata (id, title, description)
- Content hierarchy (units → lessons → activities)
- Agent configurations (teaching, coaching, assessment)
- Assets (optional, base64 or URLs)

Remaining work: Implement export/import utilities, refine schema based on actual usage.

---

### Q7: How do agents persist learner context?
**Status**: Open
**Context**: Coaching/teaching agents need memory of learner progress

Considerations:
- Session-based only?
- Persistent learner profiles?
- Privacy implications?

---

## Resolved Questions

*(Move questions here once resolved, with link to relevant decision)*

None yet.
