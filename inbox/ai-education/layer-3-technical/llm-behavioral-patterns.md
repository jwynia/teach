# LLM Behavioral Patterns: What Developers Need to Know

When you build with LLMs, you'll encounter predictable failure modes. These aren't bugs in specific models—they emerge from how LLMs are trained and operate. Understanding them helps you design systems that work *with* these tendencies rather than fighting them.

## The Core Problem

**LLMs optimize for completion, not quality.**

Training rewards task completion. "Helpful" in RLHF terms means "finished the thing." This creates systematic biases that persist across models and will persist across model versions, because they emerge from fundamental training mechanisms.

You cannot instruct your way out of these behaviors. You must design around them.

## The Five Patterns

### Pattern 1: Completion Reward Bias

**Mechanism:** RLHF training optimizes for human preference signals. Humans prefer completed tasks and agreeable responses. Models learn to prioritize finishing over correctness.

**What you'll see:**
- "Good enough" outputs when work is shallow
- Rushing through early steps of multi-step tasks
- Premature convergence on solutions
- Sycophantic agreement rather than pushback

**Research backing:**
> "When a response matches user views, it is more likely to be preferred... both humans and preference models prefer convincingly-written sycophantic responses over correct ones a non-negligible fraction of the time."
> — Anthropic, "Towards Understanding Sycophancy in Language Models"

**Design implication:** Don't trust the model to push back when something is incomplete. Build explicit completion criteria that must be met before proceeding.

---

### Pattern 2: Statistical Median Gravity

**Mechanism:** LLMs generate tokens by probability. The most probable tokens are the most common ones from training data. "Most common" means average, generic, cliché.

**What you'll see:**
- Generic solutions when novel ones are needed
- Ideas clustering around obvious approaches
- Predictable word choices (in creative tasks: "fire" → "desire", "heart" → "apart")
- Outputs that could fit any project in the category

**Research backing:**
> "Post-training alignment often reduces LLM diversity, leading to mode collapse... annotators systematically favor familiar text."
> — "Verbalized Sampling: How to Mitigate Mode Collapse"

> "While structured formatting improves consistency, it significantly reduces the diversity of model outputs in open-ended generation... this effect persists even under high-temperature decoding."
> — "The Price of Format: Diversity Collapse in LLMs"

**Design implication:** Instructions like "be creative" don't change token probabilities. To escape defaults, you need external pressure: constraints, blacklists, required elements, or injected randomness.

---

### Pattern 3: Forward Reference Gravitational Pull

**Mechanism:** When the model can see an end goal, intermediate work orients toward reaching that goal as quickly as possible. The goal exerts "gravity" that pulls attention forward.

**What you'll see:**
- Early phases treated as obstacles, not objectives
- Quality degradation in steps furthest from the visible goal
- Justifications for why current work is "sufficient"
- Attempts to skip ahead

**Research backing:**
> "Performance is highest when relevant information occurs at the very beginning (primacy bias) or end of its input context (recency bias), and performance significantly degrades when models must access and use information in the middle."
> — Liu et al., "Lost in the Middle" (ACL 2024)

**Design implication:** Hide the goal. If you want thorough research before writing, don't mention writing during the research phase. Any reference to future work—even phase numbering—activates the pull.

---

### Pattern 4: Goal Latching from Implicit Signals

**Mechanism:** LLMs detect goals not just from explicit instructions but from environmental signals. The presence of artifacts from a future phase signals that phase is the "real" goal.

**What you'll see:**
- Agent behavior changes based on what files exist, not what instructions say
- Reluctance to do work that seems "already done" elsewhere
- Constant attempts to advance to the phase implied by existing artifacts
- Instructions ignored in favor of contextual signals

**Real example:** Two fiction projects with identical prompts and instructions. Project A (no draft chapters) methodically iterates on outline. Project B (sample chapters exist) constantly declares outline "good enough" and pushes to start drafting. The sample chapters are an implicit goal beacon—their presence signals "drafting has begun," so outlining becomes an obstacle to clear.

**Research backing:**
> "Unlike for tasks such as classification, translation, or summarization, adding more ICL demonstrations for long-context LLMs does not systematically improve instruction following performance."
> — "Is In-Context Learning Sufficient for Instruction Following?"

**Design implication:** The environment must match the current phase. If you say "we're outlining" but draft files exist, the environment contradicts the instruction. The environment wins.

---

### Pattern 5: Multi-Task Degradation

**Mechanism:** When given multiple tasks, attention concentrates on the final task. Earlier tasks receive cursory treatment aimed at enabling the final task.

**What you'll see:**
- Task 1 of 3 gets minimal effort
- Task 2 of 3 gets moderate effort
- Task 3 of 3 gets full attention
- Quality inversely proportional to distance from final task

**Research backing:**
> "Performance degrades linearly with each additional reasoning step, highlighting challenges in maintaining coherence across extended logical chains."
> — "The Ultimate Guide to LLM Reasoning" (2025)

> "Introducing irrelevant numerical details in math problems reduces accuracy by 65%."
> — Mirzadeh et al., 2024 (GSM-NoOp)

**Design implication:** Separate multi-step work into individual tasks with no visibility of what comes next. The same three tasks, given sequentially as complete missions, produce dramatically better results than three tasks given together.

---

## Design Principles

### Principle 1: Hide the Goal

The model can only race toward goals it can see.

**Do:**
- Make each task THE task, not a step toward something else
- Remove references to future phases
- Avoid "Phase 1 of 5" numbering

**Don't:**
- "Complete Phase 1 (research) so we can move to Phase 2 (design)"
- "Before we can generate the draft..."
- Include artifacts from future phases in context

---

### Principle 2: Isolate Phases

Physical and contextual separation forces thorough work on each phase.

**Implementation:**
- Separate conversation/session per phase
- Remove artifacts from other phases during current work
- Use handoff documents rather than shared context
- Filter tool access to current-phase-relevant resources only

---

### Principle 3: Filter Context Aggressively

Every piece of context is a potential goal signal.

**Implementation:**
- Provide minimum viable context for current task
- Remove files/artifacts that signal other phases
- Treat context as attack surface for goal latching
- Use tools that filter access rather than granting full visibility

**Example:** A front-end agent should have `request_component(spec)` but not `create_component(code)`. If the capability shouldn't be used, it shouldn't exist.

---

### Principle 4: Require External Entropy

Statistical median gravity cannot be overcome by instruction.

**Implementation:**
- Provide explicit constraints (blacklists, required elements)
- Inject randomness from outside the model
- Use examples that demonstrate non-default choices
- Force orthogonal exploration before convergence

---

### Principle 5: Make Thoroughness the Completion State

If completion is the reward, redefine what "complete" means.

**Instead of:** "Analyze the code" (complete when any analysis exists)

**Try:** "Produce analysis covering: structure, dependencies, edge cases, performance implications, test coverage. Incomplete analysis cannot proceed."

Make "thorough" and "done" synonymous.

---

## Diagnostic Questions

When an LLM workflow produces poor results:

1. **Can the model see the end goal?** If yes, intermediate work is compromised.
2. **What implicit signals exist in context?** Files, artifacts, references to other phases.
3. **Is this one of several visible tasks?** Multi-task degradation may be occurring.
4. **What's the "most probable" output?** That's what you're getting without external pressure.
5. **Does the environment match the stated phase?** Contradictions resolve in favor of environment.

---

## Quick Reference

| Pattern | Symptom | Fix |
|---------|---------|-----|
| Completion Bias | Shallow work, premature "done" | Explicit completion criteria |
| Median Gravity | Generic, predictable outputs | External constraints, blacklists |
| Forward Pull | Early phases rushed | Hide future phases entirely |
| Goal Latching | Instructions ignored | Remove artifacts that signal other phases |
| Multi-Task Degradation | Early tasks cursory | Separate tasks, hide sequence |

---

## Key Insight

These patterns will persist across model versions because they emerge from:

1. **Training objectives** — Completion reward, RLHF preference optimization
2. **Generation mechanics** — Token probability, mode collapse toward typical outputs
3. **Attention architecture** — Position bias, context influence, recency effects

Effective LLM development accepts these realities and builds around them.

---

**Related:**
- [Context and Tokens](context-and-tokens.md) - How context windows work
- [Building Reliable Workflows](building-reliable-workflows.md) - Practical implementation patterns
- [Evaluation and Observability](evaluation-and-observability.md) - How to know if your system is working

**Foundation:**
- [Why AI Gives Mediocre Results](../layer-2-effective-use/why-ai-gives-mediocre-results.md) - Non-technical version of these patterns

**Full Technical Treatment:**
- `frameworks/agent-workflow/llm-process-design.md` - Complete framework with additional research citations
