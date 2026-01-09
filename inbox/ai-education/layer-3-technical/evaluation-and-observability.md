# Evaluation and Observability: How to Know If Your AI System Works

You've built an LLM-powered system. It works in testing. How do you know it's working in production? How do you catch problems before users do? How do you improve it over time?

This article covers evaluation strategies and observability patterns for LLM systems.

## Why LLM Observability Is Different

Traditional software is deterministic. Same input → same output. Tests that pass keep passing. Logs tell you what happened.

LLM systems are:
- **Non-deterministic** — Same input can produce different outputs
- **Silently wrong** — Failures look like normal responses
- **Drifting** — Behavior changes as models update
- **Subjective** — "Good" output is often judgment-dependent

You need different approaches.

---

## What to Measure

### Functional Metrics

| Metric | What It Tells You |
|--------|-------------------|
| **Task success rate** | Did the output accomplish the goal? |
| **Format compliance** | Did output match expected structure? |
| **Factual accuracy** | Were claims correct? (sample-based) |
| **Relevance** | Was output appropriate to input? |
| **Completeness** | Did output address all requirements? |

### Operational Metrics

| Metric | What It Tells You |
|--------|-------------------|
| **Latency (p50, p95, p99)** | How fast are responses? |
| **Token usage** | Costs per request, efficiency |
| **Error rates** | API failures, validation failures |
| **Retry rates** | Stability of underlying service |
| **Context utilization** | Are you approaching limits? |

### Safety Metrics

| Metric | What It Tells You |
|--------|-------------------|
| **Refusal rate** | How often does the model decline? |
| **Content policy violations** | Harmful content generated |
| **PII leakage** | Sensitive data in outputs |
| **Hallucination rate** | Made-up facts (sample-based) |

---

## Evaluation Strategies

### Strategy 1: Automated Evaluation

Use code to check what's checkable automatically.

**What you can automate:**
- Format validation (JSON valid? Schema match?)
- Length constraints (within limits?)
- Required element presence (does it contain X?)
- Keyword/phrase detection
- Response time thresholds

**Example:**
```python
def evaluate_response(response, expected_schema):
    scores = {}

    # Format check
    try:
        data = json.loads(response)
        scores["valid_json"] = 1.0
    except:
        scores["valid_json"] = 0.0
        return scores

    # Schema compliance
    try:
        expected_schema.validate(data)
        scores["schema_compliant"] = 1.0
    except ValidationError:
        scores["schema_compliant"] = 0.0

    # Required fields
    required = ["summary", "recommendations"]
    scores["completeness"] = sum(1 for f in required if f in data) / len(required)

    return scores
```

### Strategy 2: LLM-as-Judge

Use a separate LLM call to evaluate quality.

**When to use:**
- Subjective quality (is this helpful? clear? appropriate?)
- Comparison (is A better than B?)
- Complex criteria that can't be coded

**Example:**
```python
def judge_response(original_request, response):
    prompt = f"""Evaluate this response on a scale of 1-5 for:
    - Relevance: Does it address the request?
    - Clarity: Is it easy to understand?
    - Completeness: Does it cover all aspects?

    Request: {original_request}
    Response: {response}

    Return JSON: {{"relevance": X, "clarity": X, "completeness": X, "reasoning": "..."}}
    """
    return judge_model.complete(prompt)
```

**Caveats:**
- LLM-as-judge has its own biases (prefers longer responses, matches training distribution)
- Use different model for judging than generating
- Calibrate against human judgment on sample
- More expensive (second LLM call per evaluation)

### Strategy 3: Human Evaluation

Sample outputs for human review.

**When to use:**
- High-stakes domains
- Subjective quality calibration
- Building evaluation datasets
- Catching issues automation misses

**Practical approach:**
1. Sample 1-5% of production outputs randomly
2. Route to human reviewers
3. Score on defined rubric
4. Track trends over time
5. Investigate score drops

**Rubric example:**
```
1 - Unusable (wrong, harmful, or completely off-topic)
2 - Poor (significant issues, wouldn't use without major edits)
3 - Acceptable (minor issues, usable with light editing)
4 - Good (solid output, minimal edits needed)
5 - Excellent (better than expected, no edits needed)
```

### Strategy 4: Comparison Testing

Compare model versions or prompt changes.

**A/B testing:**
- Route traffic to variants
- Measure same metrics across variants
- Statistical significance before conclusions

**Regression testing:**
- Maintain test set of input → expected output pairs
- Run against new versions
- Flag regressions

**Example test case:**
```yaml
- id: customer_refund_request
  input: "I want to return this product, order #12345"
  expected_intent: "refund_request"
  expected_entities:
    - order_number: "12345"
  min_acceptable_similarity: 0.9
```

---

## Observability Infrastructure

### Logging Requirements

Log every LLM interaction:

```python
log_entry = {
    "timestamp": datetime.now().isoformat(),
    "request_id": request_id,
    "model": "gpt-4",
    "input_tokens": 1234,
    "output_tokens": 567,
    "latency_ms": 2340,
    "prompt": prompt,  # or hash if sensitive
    "response": response,  # or hash if sensitive
    "status": "success",  # or error type
    "metadata": {
        "user_id": user_id,
        "feature": "summarization",
        "version": "v2.1"
    }
}
```

**What to log:**
- Full request and response (or hashes for privacy)
- Token counts and costs
- Latency
- Model and version
- Any validation results
- Downstream outcomes (if trackable)

### Dashboards

**Real-time:**
- Request rate
- Error rate
- Latency percentiles
- Token usage

**Daily/weekly:**
- Quality scores (from evaluation)
- Cost trends
- Error type breakdown
- Model performance comparison

### Alerting

| Condition | Priority | Action |
|-----------|----------|--------|
| Error rate > 5% | High | Page on-call |
| Latency p95 > 10s | Medium | Investigate |
| Quality score drop > 10% | Medium | Review samples |
| Token usage spike > 200% | Medium | Cost investigation |
| Refusal rate > 20% | Medium | Check prompts |

---

## Feedback Loops

### Implicit Feedback

Track user behavior that indicates quality:

- **Acceptance rate** — Did user use the output?
- **Edit distance** — How much did user modify it?
- **Retry rate** — Did user try again (dissatisfied)?
- **Completion rate** — Did user finish the flow?
- **Time to action** — How long before user proceeded?

**Example:**
```python
def track_acceptance(session_id, generated_output, final_output):
    edit_distance = levenshtein_ratio(generated_output, final_output)
    log_metric("acceptance_ratio", 1 - edit_distance, session_id=session_id)
```

### Explicit Feedback

Collect direct user ratings:

- Thumbs up/down
- 1-5 star ratings
- "Was this helpful?" prompts
- Free-form feedback

**Design tips:**
- Make it low-friction (one click)
- Ask at the right moment (after user has evaluated)
- Don't ask every time (survey fatigue)
- Close the loop (show you're acting on feedback)

### Feedback → Improvement Cycle

```
Collect feedback (implicit + explicit)
    ↓
Analyze patterns (what's failing? why?)
    ↓
Hypothesize improvements (prompt change? model change?)
    ↓
Test offline (regression tests, human eval)
    ↓
Deploy to subset (A/B test)
    ↓
Measure impact
    ↓
Roll out or roll back
```

---

## Common Failure Patterns

### Drift Detection

Model behavior changes over time:
- Provider updates model
- Training distribution shifts
- Your data distribution shifts

**Detection:**
- Track quality metrics continuously
- Compare current vs. historical distributions
- Alert on significant changes

### Silent Failures

Output is wrong but looks normal:
- Hallucinated facts that sound plausible
- Wrong answer with high confidence
- Subtle misunderstanding of request

**Detection:**
- Sample-based human review
- Factual verification on subset
- Cross-reference with ground truth where available

### Edge Case Accumulation

Rare failures that accumulate:
- Unusual input formats
- Languages/domains underrepresented in training
- Adversarial or unusual user behavior

**Detection:**
- Error clustering (what do failures have in common?)
- Input distribution monitoring
- Dedicated test sets for known edge cases

---

## Building an Evaluation Dataset

### Start With Production

1. Sample production inputs
2. Get ground truth (human labels, known correct answers)
3. Define rubrics for subjective quality
4. Version your dataset

### Evolve Over Time

- Add examples that expose failures
- Include edge cases you discover
- Balance across input types
- Prune examples that no longer differentiate

### Use It

- Run on every model/prompt change
- Gate deployments on regression tests
- Track scores over time
- Investigate any drops

---

## Quick Reference

| Component | Implementation |
|-----------|---------------|
| **Automated eval** | Format validation, schema checks, required elements |
| **LLM-as-judge** | Subjective quality, use different model from generator |
| **Human eval** | Sample 1-5%, defined rubric, track trends |
| **Logging** | Every interaction, tokens, latency, outcomes |
| **Dashboards** | Real-time ops + periodic quality trends |
| **Alerts** | Error rate, latency, quality drops, cost spikes |
| **Feedback** | Implicit (behavior) + explicit (ratings) |
| **Test sets** | Production-derived, versioned, run on every change |

---

**Related:**
- [LLM Behavioral Patterns](llm-behavioral-patterns.md) - What failure modes to watch for
- [Context and Tokens](context-and-tokens.md) - Token usage monitoring
- [Building Reliable Workflows](building-reliable-workflows.md) - Building observable systems

**Foundation:**
- [Beyond Good Enough](../layer-2-effective-use/beyond-good-enough.md) - Non-technical quality iteration
