# Building Reliable Workflows: Practical Patterns for Production LLM Systems

Moving from "it works in a demo" to "it works in production" requires different thinking. This article covers patterns for building LLM systems that fail gracefully and work consistently.

## The Reliability Problem

LLMs are fundamentally non-deterministic. The same input can produce different outputs. Outputs may not match expected formats. The model might refuse, hallucinate, or go off-track.

**Production systems need:**
- Predictable output formats
- Graceful error handling
- Fallback strategies
- Observability into what's happening
- Cost and latency controls

## Structured Outputs

### Why Structure Matters

Unstructured LLM output is unreliable for downstream processing. "Parse the response" becomes fragile code that breaks on edge cases.

**Unstructured (fragile):**
```
User: Extract the person's name and age from this text.
AI: The person mentioned is John Smith, who is 34 years old.
```

Now you need regex or another LLM call to extract "John Smith" and "34". What if the model says "thirty-four" or "John Smith (age 34)" or "34-year-old John Smith"?

**Structured (reliable):**
```json
{
  "name": "John Smith",
  "age": 34
}
```

Parse once, use everywhere.

### Implementation Approaches

**1. JSON Mode / Structured Output APIs**

Most providers now offer structured output modes:
- OpenAI: `response_format: { type: "json_schema", json_schema: {...} }`
- Anthropic: Tool use with defined schemas
- Local models: Guidance, Outlines, or grammar-constrained decoding

**2. Tool/Function Calling**

Define tools with explicit parameter schemas. The model "calls" the tool with structured arguments.

```python
tools = [{
    "name": "extract_person",
    "parameters": {
        "type": "object",
        "properties": {
            "name": {"type": "string"},
            "age": {"type": "integer"}
        },
        "required": ["name", "age"]
    }
}]
```

The model returns structured tool calls, not free-form text.

**3. Schema Validation**

Whatever approach you use, validate outputs against schemas before processing:

```python
from pydantic import BaseModel, ValidationError

class Person(BaseModel):
    name: str
    age: int

try:
    person = Person.model_validate_json(llm_output)
except ValidationError as e:
    # Handle malformed output
```

### Structure Failure Modes

| Failure | Cause | Mitigation |
|---------|-------|------------|
| Missing fields | Model skipped required data | Schema validation, retry with explicit prompt |
| Wrong types | "34" instead of 34 | Type coercion or validation rejection |
| Extra fields | Model added unexpected data | Strict schema validation |
| Malformed JSON | Truncation, formatting errors | JSON repair libraries, retry |
| Refusal | Model declined the task | Detect refusal patterns, fallback logic |

---

## Error Handling Patterns

### Pattern 1: Retry with Backoff

Transient failures (rate limits, timeouts) often succeed on retry.

```python
@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(min=1, max=60),
    retry=retry_if_exception_type(RateLimitError)
)
def call_llm(prompt):
    return client.complete(prompt)
```

**When to retry:**
- Rate limit errors (429)
- Timeout errors
- Transient API errors (500, 503)

**When NOT to retry:**
- Validation errors (bad output format)
- Content policy violations
- Authentication errors

### Pattern 2: Fallback Chains

When primary approach fails, fall back to alternatives.

```python
def process_with_fallbacks(input):
    # Try primary model
    try:
        return call_gpt4(input)
    except (RateLimitError, TimeoutError):
        pass

    # Fallback to faster/cheaper model
    try:
        return call_gpt4_mini(input)
    except Exception:
        pass

    # Fallback to cached/default response
    return get_cached_response(input)
```

**Fallback strategies:**
- Different model (cheaper, faster)
- Cached responses for common inputs
- Simplified task (extract less, summarize shorter)
- Graceful degradation message to user

### Pattern 3: Validation and Retry

When output doesn't match expectations, retry with feedback.

```python
def extract_with_validation(text, max_attempts=3):
    for attempt in range(max_attempts):
        result = call_llm(text)

        try:
            validated = schema.validate(result)
            return validated
        except ValidationError as e:
            if attempt < max_attempts - 1:
                # Retry with error feedback
                text = f"""Previous attempt failed validation: {e}

Please try again, ensuring output matches the required format.

Original request: {text}"""
            else:
                raise
```

### Pattern 4: Human-in-the-Loop Escalation

For high-stakes tasks, route failures to humans.

```python
def process_claim(claim):
    result = llm_process(claim)
    confidence = result.get("confidence", 0)

    if confidence < 0.7:
        return queue_for_human_review(claim, result)

    if not validate_business_rules(result):
        return queue_for_human_review(claim, result)

    return result
```

---

## Workflow Architecture

### Single Call vs. Chain vs. Agent

| Architecture | Use When | Trade-offs |
|--------------|----------|------------|
| **Single call** | Task is straightforward, output is simple | Fastest, cheapest, least flexible |
| **Chain** | Fixed sequence of steps, predictable flow | More capable, still deterministic |
| **Agent** | Dynamic task requiring tool use, branching logic | Most capable, least predictable |

**Single Call Example:**
```
Summarize this document → Summary
```

**Chain Example:**
```
Extract entities → Classify entities → Generate report
```

**Agent Example:**
```
"Research competitors and recommend pricing"
→ Agent decides: search web, read documents, calculate, iterate until done
```

### When to Use Agents

Agents (LLM decides what to do next) are powerful but add complexity and unpredictability.

**Good agent use cases:**
- Open-ended research tasks
- Multi-tool scenarios where order isn't predetermined
- Tasks requiring dynamic adaptation
- Exploratory work where the path isn't known upfront

**Avoid agents when:**
- Steps are known and fixed (use chains)
- Predictability is critical
- Cost control is essential (agents can loop indefinitely)
- Task is simple enough for single call

### Chain Design Principles

1. **Each step has one job** — Don't combine analysis and generation
2. **Validate between steps** — Check output before passing forward
3. **Steps are independently testable** — Can you test step 2 without running step 1?
4. **Context is explicit** — Pass only what the next step needs
5. **Failures are recoverable** — Can you retry a step without rerunning everything?

---

## Practical Patterns

### Pattern: Separation of Concerns

Don't ask one call to do everything.

**Instead of:**
```
Analyze this document, extract key points, translate to Spanish, and format as HTML.
```

**Try:**
```
Step 1: Analyze and extract key points → structured data
Step 2: Translate structured data → translated data
Step 3: Format as HTML → final output
```

Each step is testable, debuggable, and can use different models.

### Pattern: Pre-Processing and Post-Processing

Keep deterministic logic outside the LLM.

```python
def process_document(doc):
    # Pre-process (deterministic)
    cleaned = remove_boilerplate(doc)
    chunks = split_into_chunks(cleaned)

    # LLM processing
    summaries = [summarize(chunk) for chunk in chunks]

    # Post-process (deterministic)
    combined = merge_summaries(summaries)
    formatted = apply_template(combined)

    return formatted
```

The LLM handles what LLMs are good at. Everything else is regular code.

### Pattern: Caching

LLM calls are expensive and often repetitive.

```python
@cache(ttl=3600)  # Cache for 1 hour
def get_embedding(text):
    return client.embed(text)

@cache(ttl=86400)  # Cache for 1 day
def classify_intent(user_message):
    # Exact same input → exact same output
    return client.classify(user_message)
```

**Cache candidates:**
- Embeddings (deterministic for same input)
- Classification tasks (limited output space)
- Frequent identical queries
- Reference document processing

**Don't cache:**
- Conversational responses (context-dependent)
- Creative generation (variety is the point)
- Time-sensitive information

### Pattern: Rate Limiting and Queuing

Protect against runaway costs and API limits.

```python
from ratelimit import limits, sleep_and_retry

@sleep_and_retry
@limits(calls=100, period=60)  # 100 calls per minute
def rate_limited_call(prompt):
    return client.complete(prompt)
```

For production systems:
- Queue requests during high load
- Prioritize by importance
- Set budget limits that halt processing
- Alert on unusual usage patterns

---

## Anti-Patterns

### Anti-Pattern: Hope-Based Error Handling

**Pattern:** Wrap everything in try/except and hope for the best.

**Problem:** You can't improve what you can't see. Silent failures accumulate.

**Fix:** Log failures with context. Monitor error rates. Alert on anomalies.

### Anti-Pattern: Unbounded Agents

**Pattern:** Let agents run until they decide they're done.

**Problem:** Infinite loops, runaway costs, unpredictable behavior.

**Fix:** Maximum iterations, token budgets, time limits, human checkpoints.

### Anti-Pattern: Monolithic Prompts

**Pattern:** One giant prompt that does everything.

**Problem:** Hard to debug, can't test parts independently, changes have unpredictable effects.

**Fix:** Decompose into steps. Each step has one job.

### Anti-Pattern: Trusting Output Types

**Pattern:** Assume the model returns what you asked for.

**Problem:** Models return strings. "34" is not the same as 34.

**Fix:** Validate and coerce types explicitly. Schema validation on every output.

---

## Quick Reference

| Principle | Implementation |
|-----------|---------------|
| Structure outputs | JSON mode, tool calling, schema validation |
| Handle failures | Retry, fallback, escalate |
| Decompose complexity | Chains over monoliths |
| Validate everything | Between every step |
| Limit scope | Token budgets, iteration limits |
| Cache wisely | Embeddings, classification, repeated work |
| Monitor always | Logs, metrics, alerts |

---

**Related:**
- [LLM Behavioral Patterns](llm-behavioral-patterns.md) - Why workflows fail
- [Context and Tokens](context-and-tokens.md) - Managing context in workflows
- [Evaluation and Observability](evaluation-and-observability.md) - Knowing if your workflow works

**Foundation:**
- [Multi-Step Work with AI](../layer-2-effective-use/multi-step-work.md) - Non-technical workflow principles
