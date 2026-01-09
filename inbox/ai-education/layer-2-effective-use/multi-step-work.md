# Multi-Step Work with AI: Why "Do It All at Once" Fails

When you have a complex task—research then write, analyze then recommend, explore then decide—there's a natural temptation to give it all to AI at once.

"Research the competitors and write a marketing strategy."

This feels efficient. It's not. The output will be mediocre at every stage, and the final result will disappoint.

Here's why, and what to do instead.

## The Problem: AI Races Toward the Finish

When AI can see the end goal, everything before it becomes an obstacle to clear, not work to do well.

**Ask for "research then strategy":**
- Research becomes shallow—just enough to justify moving on
- Strategy gets most of the attention because that's the "real" goal
- You end up with a strategy built on thin research

**Ask for "analyze then recommend":**
- Analysis is cursory—enough to enable recommendations
- Recommendations get the care
- Your recommendations rest on shaky analysis

This isn't a quirk—it's fundamental to how AI works. Language models are trained to complete tasks. When the task is visible, they orient toward finishing it. Everything between "here" and "done" is friction to minimize.

## The Compounding Problem

Early shortcuts don't just affect early work. They compound through everything built on top.

| If Research Is | Then Strategy Is |
|----------------|------------------|
| Shallow (covers obvious) | Built on incomplete picture |
| Surface-level | Missing non-obvious insights |
| Rushed | Based on first-found info, not best info |

A 20% shortcut in research doesn't cost you 20% of strategy quality. It costs you 20% of *everything the strategy depends on*.

Good research produces insights the AI couldn't have generated without it. Those insights produce a differentiated strategy. Without them, you get... the average strategy.

## The Solution: Hide the Goal

The fix is counterintuitive: don't tell AI what comes next.

**Instead of:** "Research competitors then write a strategy"

**Do:**
- Session 1: "Research our competitors thoroughly. Your deliverable is a complete competitive analysis."
- Session 2: "Based on this competitive analysis, develop a marketing strategy."

In Session 1, AI doesn't know a strategy is coming. Research IS the goal. It can be thorough because thoroughness is the point, not an obstacle to strategy.

In Session 2, AI receives thorough research as input. Now strategy work has a rich foundation.

## The Pattern: Phase Separation

For any multi-step task:

1. **Identify the phases** (explore → decide, research → write, analyze → recommend)
2. **Run each phase separately**
3. **Don't reveal future phases**
4. **Pass output forward, not instructions**

### What to Say

**Phase 1 prompt:**
> "Your task is to [PHASE 1 GOAL].
> Be thorough—this is the complete deliverable.
> Don't proceed beyond this phase."

**Phase 2 prompt:**
> "Here's [Phase 1 output].
> Based on this, your task is to [PHASE 2 GOAL]."

No mention of Phase 2 in Phase 1. No mention of how Phase 1 will be used. Each phase is presented as the complete mission.

## Example: Writing a Business Case

### The "All at Once" Approach (Don't Do This)

> "Research the problem we're trying to solve, analyze options, and write a business case recommending a solution."

You'll get:
- Token research (just enough to claim completion)
- Surface analysis (supports predetermined conclusion)
- Generic business case (sounds like every business case)

### The Phase-Separated Approach (Do This)

**Session 1:**
> "Research the problem of [X] thoroughly. Document what you find about causes, impacts, attempted solutions, and what's worked elsewhere. This is your complete deliverable."

**Session 2:**
> "Here's research on [X]. Based on this, analyze the possible solution approaches. For each, identify: how it addresses the root causes, implementation requirements, risks, and expected impact. This is your complete deliverable."

**Session 3:**
> "Here's our problem research and solution analysis. Write a business case recommending the best approach. Structure it as: problem summary, recommended solution, why this option, implementation plan, expected outcomes."

Each phase gets full attention. Each output becomes quality input for the next.

## Common Mistakes

### The Preview

**Wrong:** "We're going to do research, then analysis, then recommendations. Let's start with research."

**Why:** AI now knows research is step 1 of 3. Research becomes "thing to finish before the real work."

**Right:** "Research this topic thoroughly. Your deliverable is complete research findings."

### The Forward Reference

**Wrong:** "Research this so we can write a good strategy."

**Why:** "So we can" reveals the goal. Research becomes means to end.

**Right:** "Research this. Be thorough—completeness is the success criterion."

### The Implied Sequence

**Wrong:** "Phase 1 of 3: Research"

**Why:** Numbering reveals sequence and goal proximity.

**Right:** Just describe the task. No numbers, no "of X."

### The Efficiency Trap

**Wrong:** "Let's do research and analysis together to save time."

**Why:** They compete for attention. Both get shortchanged.

**Right:** Separate phases, even if it feels slower. Total time is often less because you avoid rework.

## When to Use This

### High Value

- **Research → synthesis** tasks
- **Exploration → decision** tasks
- **Analysis → recommendation** tasks
- **Draft → revision** tasks
- Anything where early work quality multiplies later work quality

### Lower Value

- Simple linear tasks where steps don't depend on each other
- Quick iterations where speed matters more than depth
- Tasks where the "goal" is obvious and not distracting

### Quick Test

Ask: "If the early phase is done shallowly, does it hurt the later phase?"

If yes, separate the phases.

## The Mental Model

Think of it like this: AI is a smart helper who can only focus on one thing at a time.

When you show them the whole project—"do this, then this, then this"—they get anxious about finishing. They rush early parts to get to later parts.

When you say "here's your task, just this, be thorough"—they can relax and do it well. Then you come back with the next task.

You're the project manager keeping the helper focused. Don't show them the whole plan. Show them today's work.

## Try This

Next time you have a multi-step request:

1. Write down the steps
2. Separate them into independent sessions
3. For each, frame it as the complete goal (not "step 1 of 3")
4. Pass output forward, not the master plan
5. Notice how much more thorough each phase becomes

The first time you see research that's *actually thorough* because the AI didn't know writing was coming, you'll understand why this matters.

---

**Related:**
- [Why AI Gives Mediocre Results](why-ai-gives-mediocre-results.md) - The underlying cause this addresses
- [Framework-First Prompting](framework-first-prompting.md) - Another application of separating phases
- [Beyond Good Enough](beyond-good-enough.md) - Iteration within and across phases
