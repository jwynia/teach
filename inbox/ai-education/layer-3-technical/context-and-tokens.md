# Context and Tokens: What Developers Need to Know

Understanding how LLMs handle context is essential for building reliable applications. This article covers the mechanics of context windows, token economics, and practical strategies for context management.

## How Context Works

### Tokens, Not Characters

LLMs don't process text character by character. They process **tokens**—chunks of text that typically represent 3-4 characters for English text.

**Examples:**
- "hello" = 1 token
- "indescribable" = 3 tokens ("in", "describ", "able")
- Code and structured text often tokenize less efficiently
- Non-English languages may use more tokens per word

**Why it matters:** Costs and limits are measured in tokens. A 4,000-word document might be 5,000-6,000 tokens. Plan accordingly.

### The Context Window

The context window is everything the model "sees" during a single request:

```
[System prompt] + [Conversation history] + [User message] + [Generated response]
```

All of this must fit within the model's context limit (e.g., 8K, 32K, 128K, 200K tokens depending on model).

**Key insight:** Context windows are not unlimited memory. They're a fixed-size buffer that includes both input AND output. A 32K context model generating a 4K response has 28K for everything else.

### Context Is Expensive

| Model Class | Approximate Cost (per 1M tokens) |
|-------------|----------------------------------|
| Small/fast (GPT-4o-mini, Claude Haiku) | $0.15-0.25 input, $0.60-1.00 output |
| Medium (GPT-4o, Claude Sonnet) | $2.50-3.00 input, $10-15 output |
| Large (Claude Opus, GPT-4 Turbo) | $15-30 input, $60-75 output |

**Output tokens cost more than input tokens**—typically 3-5x more. This affects design decisions.

---

## Position Matters

### The "Lost in the Middle" Problem

Research shows LLMs pay most attention to content at the beginning and end of context, with degraded performance for content in the middle.

> "Performance is highest when relevant information occurs at the very beginning (primacy bias) or end of its input context (recency bias), and performance significantly degrades when models must access and use information in the middle."
> — Liu et al., "Lost in the Middle" (ACL 2024)

**Practical implications:**
- Put critical instructions at the beginning (system prompt)
- Put the current task/question at the end
- Don't rely on information buried in the middle of long documents

### Position Strategy

| Position | Best For |
|----------|----------|
| **Beginning** | System instructions, persona, constraints |
| **Middle** | Reference material, documents, examples |
| **End** | Current task, user query, what you want done |

If something MUST be acted on, put it at the end.

---

## Context Management Strategies

### Strategy 1: Minimum Viable Context

Include only what's needed for the current task. More context isn't always better.

**Problems with too much context:**
- Lost in the middle effect
- Goal latching from irrelevant artifacts (see [LLM Behavioral Patterns](llm-behavioral-patterns.md))
- Higher costs
- Slower responses
- More opportunities for distraction

**Ask:** "If I removed this from context, would the output get worse?" If not, remove it.

### Strategy 2: Structured Context Sections

Label sections clearly so the model can navigate:

```
## System Instructions
[Your core instructions]

## Reference Document
[The document to analyze]

## Current Task
[What you want done right now]
```

Clear structure helps the model understand what to prioritize.

### Strategy 3: Summarization Checkpoints

For long conversations, periodically summarize and compact history:

```
[Full system prompt]
[Summary of conversation so far]
[Last 2-3 exchanges in full]
[Current user message]
```

This preserves continuity while managing token count.

### Strategy 4: Retrieval-Augmented Generation (RAG)

Instead of putting everything in context, retrieve only relevant information on demand.

**Basic RAG pattern:**
1. Embed your documents into a vector database
2. When a query comes in, retrieve the most relevant chunks
3. Include only those chunks in context
4. Generate response

**When to use RAG:**
- Knowledge base is larger than context window
- Most queries only need a small subset of information
- Content changes frequently (easier to update vectors than fine-tuning)

**When RAG adds complexity without benefit:**
- All information fits comfortably in context
- Every query needs the same information
- Real-time retrieval latency is unacceptable

---

## Token Budgeting

For production applications, plan your token budget:

| Component | Typical Budget |
|-----------|----------------|
| System prompt | 500-2,000 tokens |
| Conversation history | Variable (manage actively) |
| Retrieved context (RAG) | 2,000-8,000 tokens |
| User message | 100-1,000 tokens |
| Response buffer | 1,000-4,000 tokens |

**Example budget for 32K context model:**
- System: 1,500 tokens
- History: 8,000 tokens (managed, summarized)
- RAG retrieval: 6,000 tokens
- User message: 500 tokens
- Response: 4,000 tokens
- **Buffer**: 12,000 tokens (safety margin)

Leave buffer. Context limits are hard failures.

---

## Common Mistakes

### Mistake 1: Context Maximalism

**Pattern:** Include everything "in case it's useful."

**Problem:** More context = more noise, higher costs, lost-in-the-middle issues, goal latching risks.

**Fix:** Curate aggressively. Less is often more.

### Mistake 2: Ignoring Position

**Pattern:** Dump documents in, ask question at end.

**Problem:** Critical information buried in middle may be ignored.

**Fix:** Structure intentionally. Put must-use information at beginning or end.

### Mistake 3: Unlimited History

**Pattern:** Keep appending conversation history forever.

**Problem:** Context fills up, old messages are truncated unpredictably, costs escalate.

**Fix:** Active history management—summarization, sliding windows, or explicit compaction.

### Mistake 4: Hardcoding Context Limits

**Pattern:** Assume a specific context window size.

**Problem:** Model capabilities change; different models have different limits; leaves no buffer.

**Fix:** Design for flexibility. Track actual usage. Leave margins.

### Mistake 5: Ignoring Output Tokens

**Pattern:** Budget only for input.

**Problem:** Output tokens cost more AND count against context limit.

**Fix:** Include expected output length in planning. `max_tokens` parameter doesn't prevent context overflow—it truncates output.

---

## Practical Guidelines

### For Chatbots and Assistants

- Keep system prompt concise but complete
- Implement conversation summarization at ~50% of context budget
- Consider "memory" as separate from conversation history
- Test behavior at context limits before production

### For Document Processing

- Chunk documents strategically (semantic boundaries, not arbitrary splits)
- Include sufficient overlap between chunks for continuity
- Process chunks independently when possible
- Aggregate results after processing, not during

### For Agents and Workflows

- Each step should have minimal context for its task
- Pass results forward, not full context
- Avoid accumulated context across many steps
- Clear context between phases when possible

### For RAG Systems

- Tune retrieval chunk size (512-1024 tokens is common starting point)
- Test retrieval quality separately from generation quality
- Consider re-ranking retrieved chunks before including
- Monitor which retrieved content actually gets used

---

## Monitoring and Debugging

Track these metrics:

| Metric | Why It Matters |
|--------|----------------|
| Tokens per request (input/output) | Cost control, limit management |
| Context utilization % | Are you approaching limits? |
| Retrieval relevance (for RAG) | Is retrieved content actually useful? |
| Truncation events | When did you hit limits? |

When things go wrong:
1. Check actual token counts (not character estimates)
2. Verify position of critical information
3. Look for goal-latching artifacts in context
4. Test with reduced context to isolate issues

---

## Quick Reference

| Principle | Action |
|-----------|--------|
| Less is more | Include only what's needed |
| Position matters | Critical info at start and end |
| Budget output | Reserve tokens for response |
| Manage history | Summarize or window, don't accumulate |
| Leave buffer | Don't use 100% of context limit |

---

**Related:**
- [LLM Behavioral Patterns](llm-behavioral-patterns.md) - Why context matters for behavior
- [Building Reliable Workflows](building-reliable-workflows.md) - Implementing context management in workflows
- [Evaluation and Observability](evaluation-and-observability.md) - Monitoring context usage

**Going Deeper:**
- [Multi-Step Work with AI](../layer-2-effective-use/multi-step-work.md) - Non-technical context management principles
