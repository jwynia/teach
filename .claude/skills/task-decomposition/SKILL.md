# Task Decomposition Diagnostic

type: diagnostic
mode: assistive
triggers:
  - "task too big"
  - "can't estimate this"
  - "overwhelmed by scope"
  - "where do I start"
  - "epic needs breakdown"
  - "dependency problems"

## Purpose

Transform overwhelming development tasks into manageable units by respecting cognitive limits, creating clear boundaries, and enabling parallel work. Tasks properly decomposed achieve 3x higher completion rates and 60% fewer defects.

## Core Principle

**The goal isn't more tasks—it's the right tasks.** Tasks small enough to understand completely, large enough to deliver value, independent enough to avoid blocking.

## Quick Reference: Cognitive Limits

| Limit | Threshold | Implication |
|-------|-----------|-------------|
| Working memory | 7±2 items | Max concepts per task |
| Context switch recovery | 23 minutes | Minimize task switching |
| Files examined | 15-20 max | Bound task scope |
| Days before completion drops | 2-3 days | Keep tasks under this |
| Complex tasks per day | 2-3 | Don't overplan |

## Task Duration Success Rates

| Duration | Completion Rate |
|----------|-----------------|
| < 2 hours | 95% |
| 2-4 hours | 90% |
| 4-8 hours (1 day) | 80% |
| 2-3 days | 60% |
| 1 week | 35% |
| 2 weeks | 20% |
| > 2 weeks | <10% |

---

## Diagnostic States

| State | Signal | Core Issue |
|-------|--------|------------|
| TD1 | "Can't estimate" | Too big to understand |
| TD2 | "Where do I start" | No clear entry point |
| TD3 | "Blocked on X" | Dependency problem |
| TD4 | "Never finishes" | No clear done criteria |
| TD5 | "Keeps growing" | Scope creep |
| TD6 | "Unknown technology" | Need spike first |

---

### TD1: Too Big to Understand

**Symptoms:**
- Estimates range wildly (4 hours to 4 weeks)
- Can't hold all requirements in mind
- "It depends on..." keeps appearing
- More than 7 concepts to track

**Diagnostic Questions:**
1. How many files would need to change?
2. How many different concepts are involved?
3. Can you explain the whole task in 2 minutes?
4. Does this cross architectural boundaries?

**Interventions:**

**Apply INVEST criteria:**
- **I**ndependent: Can be developed in any order
- **N**egotiable: Details can be refined
- **V**aluable: Delivers user/business value
- **E**stimable: Size can be assessed
- **S**mall: Fits in single iteration
- **T**estable: Clear acceptance criteria

**Decomposition patterns:**

1. **Vertical Slicing** (preferred for features):
```
Feature: User Profile Management

Slice 1: View basic profile (4h)
  - UI: Profile display
  - API: GET /profile
  - DB: Read profile

Slice 2: Edit profile name (6h)
  - UI: Edit dialog
  - API: PATCH /profile/name
  - DB: Update profile

Each slice is independently deployable
```

2. **Walking Skeleton** (for new systems):
```
Minimal end-to-end first:
1. Hello World page
2. One GET endpoint
3. Single table
4. Basic deploy

Then flesh out incrementally
```

---

### TD2: No Clear Entry Point

**Symptoms:**
- Task is a cloud of requirements
- Multiple valid starting points
- Paralysis about first step
- Everything seems connected

**Diagnostic Questions:**
1. What's the minimal thing that would prove the approach works?
2. Which part has the highest uncertainty?
3. What would you demo first?
4. What's the user-visible starting point?

**Interventions:**

**Front-load risk:**
- Start with highest-uncertainty items
- Build proof of concept for risky parts
- Validate integration points early

**Tracer bullet approach:**
```
Objective: Validate architecture decision

Step 1: Minimal Service A (1h)
  - Hardcoded response

Step 2: Minimal Service B (1h)
  - Simple transformation

Step 3: Integrate (2h)
  - Prove they communicate

Total: 4 hours to decision point
```

**Find the walking skeleton:**
- What's the thinnest slice through all layers?
- Build that first, then widen

---

### TD3: Dependency Problems

**Symptoms:**
- "Blocked on X"
- Diamond dependencies
- Integration conflicts
- Coordination overhead

**Diagnostic Questions:**
1. What specifically blocks progress?
2. Can you mock the dependency?
3. Is the dependency real or assumed?
4. Can the interface be defined without the implementation?

**Interventions:**

**Dependency breaking patterns:**

1. **Interface Contracts:**
```
Problem: Frontend blocked on backend API

Solution:
1. Define OpenAPI contract together
2. Frontend mocks from contract
3. Backend implements to contract
4. Integrate when both ready
```

2. **Feature Flags:**
```
Problem: Features must deploy together

Solution:
1. Wrap in feature flag
2. Deploy independently
3. Enable when ready
```

3. **Branch by Abstraction:**
```
Problem: Can't refactor while adding features

Solution:
1. Create abstraction layer
2. New implementation behind it
3. Switch when ready
4. Remove old version
```

**Linearize when possible:**
```
Before: A → B, A → C, D needs (B, C)
After:  A → B → C' → D

(Modify C to not conflict with B)
```

---

### TD4: No Clear Done Criteria

**Symptoms:**
- "It's almost done" forever
- Continuous scope additions
- No way to verify completion
- "Good enough" is undefined

**Diagnostic Questions:**
1. What would you test to verify it works?
2. What's the user action that proves success?
3. What error handling is required?
4. What's explicitly out of scope?

**Interventions:**

**Define acceptance criteria:**
```yaml
Task: User authentication

Acceptance:
- Given valid credentials
  When user submits login
  Then user sees dashboard

- Given invalid credentials
  When user submits login
  Then error message appears

- Given expired session
  When user takes action
  Then redirect to login

Out of scope:
- Password reset
- Remember me
- SSO
```

**Time-box to force done:**
- "We have 4 hours to build the best version possible"
- Constraints force prioritization

---

### TD5: Scope Creep

**Symptoms:**
- Task keeps growing
- New requirements appear mid-task
- "While we're here..." additions
- Original estimate becomes meaningless

**Diagnostic Questions:**
1. What was the original scope?
2. What's been added since?
3. Are additions essential or nice-to-have?
4. Should additions be separate tasks?

**Interventions:**

**Freeze scope, spawn tasks:**
```
Original: Implement user login
Additions discovered:
  → Password reset (new task)
  → Remember me (new task)
  → Audit logging (new task)

Keep original scope. New tasks go to backlog.
```

**Minimum viable version:**
- What's the smallest version that solves the problem?
- Ship that, iterate based on feedback

---

### TD6: Need Spike First

**Symptoms:**
- Estimate variance > 4x
- New technology/framework
- Multiple viable approaches
- "I need to research..."

**Diagnostic Questions:**
1. What exactly is unknown?
2. What would reduce the uncertainty?
3. What's the minimum experiment to decide?
4. How long should research take?

**Interventions:**

**Time-boxed spike:**
```yaml
Task: Investigate message queue options
Time box: 8 hours maximum

Deliverables:
- Identify 2-3 viable options
- Proof of concept for top choice
- Document trade-offs
- Revised implementation estimate

Success criteria:
- Can make informed technology decision
- Can estimate implementation confidently
```

**Spike then implement:**
```
Day 1: Spike - build POC, document findings
Day 2: Implementation - now with knowledge
```

---

## Estimation Techniques

### Three-Point Estimation
```
O = Optimistic (everything perfect)
L = Likely (normal case)
P = Pessimistic (major issues)

PERT estimate: (O + 4L + P) / 6
```

### Complexity Sizing (Fibonacci)
| Points | Meaning |
|--------|---------|
| 1 | Trivial, < 1 hour |
| 2 | Simple, 1-2 hours |
| 3 | Standard, 2-4 hours |
| 5 | Moderate, 4-8 hours |
| 8 | Complex, 1-2 days |
| 13 | Very complex, 2-3 days |
| 21 | **Too large, must decompose** |

### Evidence-Based Adjustment
```
New task estimate: 14 hours
Similar past tasks ran 1.4x over
Adjustment: 14 × 1.4 = 19.6 hours
```

---

## Anti-Patterns

### Big Bang Delivery
Building complete system before any delivery.
**Fix:** Vertical slices, incremental value.

### Technical Tasks Without Value
"Set up database," "Create service layer."
**Fix:** Include in feature tasks: "User can view products (includes DB)."

### Research Forever
Unbounded investigation.
**Fix:** Time-boxed spikes with deliverables.

### Perfect Decomposition
Over-analyzing before starting.
**Fix:** Decompose next 2 weeks. Details for later work emerge.

---

## Decomposition Checklist

Before starting any task:

- [ ] Can hold all requirements in working memory?
- [ ] Duration under 2-3 days?
- [ ] Clear acceptance criteria exist?
- [ ] Dependencies identified and broken where possible?
- [ ] Can be completed independently?
- [ ] Delivers verifiable value?
- [ ] Estimate confidence is high?

If any "no" → further decomposition needed.

---

## Integration Points

**Inbound:**
- From planning/backlog refinement
- When estimation fails

**Outbound:**
- To `requirements-elaboration` for unclear requirements
- To `code-review` after implementation

**Complementary:**
- `github-agile`: For tracking decomposed work
- `system-design`: For architectural boundaries
