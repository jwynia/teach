# Knowledge Representation

type: utility
mode: generative
triggers:
  - "knowledge management"
  - "context preservation"
  - "agent memory"
  - "knowledge schema"
  - "information retrieval"

## Purpose

Design effective knowledge representation and retrieval systems for multi-agent and single-agent systems. Provides frameworks for organizing information, managing context decay, and enabling efficient retrieval.

## Core Principle

**Remember what matters, find it when needed.** The goal isn't to remember everything—it's to identify what matters, encode relationships that enable reasoning, and retrieve the right information at the right time.

---

## Knowledge Hierarchy (DIKW)

| Level | Definition | Example | Decay Rate |
|-------|------------|---------|------------|
| **Data** | Raw facts without context | "Error count: 47" | Never (immutable) |
| **Information** | Data with context | "47 errors in auth module since deploy" | Context-dependent |
| **Knowledge** | Information with experience | "Auth errors spike when Redis latency >100ms" | Slow with reinforcement |
| **Wisdom** | Knowledge with principles | "Prioritize auth stability over features" | Very slow, cultural |

---

## Context Decay Patterns

Knowledge relevance decreases over time:

| Knowledge Type | Half-Life | Examples | Refresh Strategy |
|----------------|-----------|----------|------------------|
| **Procedural** | 24-48 hours | Line numbers, exact error messages, workarounds | Re-verify before use |
| **Structural** | 1-2 weeks | File organization, API signatures, schemas | Periodic validation |
| **Conceptual** | 1-3 months | Architecture patterns, design decisions | Triggered by changes |
| **Strategic** | 6-12 months | Project goals, principles, agreements | Scheduled reviews |

---

## Layered Context Model

Organize context by stability and scope:

### Global Context (Always Relevant)
- Project goals and constraints
- Architectural principles
- Security requirements
- Performance targets
- **Size limit:** ~1000 tokens
- **Update frequency:** Rare

### Session Context (Current Work)
- Active task details
- Recent decisions
- Working assumptions
- Open questions
- **Size limit:** ~5000 tokens
- **Update frequency:** Per task

### Local Context (Current Operation)
- Immediate file contents
- Current function scope
- Active variables
- Error states
- **Size limit:** ~10000 tokens
- **Update frequency:** Continuous

---

## Context Compression Techniques

### Summarization
- Progressive abstraction
- Compression ratio: 5:1
- Information loss: Moderate

### Reference Substitution
- Replace details with pointers: `See UserService.ts:L45-L550`
- Compression ratio: 100:1
- Information loss: None (if accessible)

### Pattern Extraction
- Identify and reference patterns
- Example: "Standard error pattern x10"
- Compression ratio: 10:1

---

## Retrieval Strategies

### Vector Similarity Search
1. Generate query embedding
2. Compare with stored embeddings
3. Rank by similarity score
4. Apply threshold filter
5. Return top-k results

### Faceted Search
Filter by multiple dimensions:
- Domain (frontend, backend, etc.)
- Complexity (trivial, small, medium, large)
- Tags (bug, feature, refactor)
- Date range

### Query Expansion
| Technique | Example |
|-----------|---------|
| **Synonym** | "auth error" → ["authentication error", "login failure"] |
| **Acronym** | "JWT" → ["JWT", "JSON Web Token"] |
| **Stemming** | "testing" → ["test", "tests", "tested"] |
| **Semantic** | "performance" → ["speed", "latency", "throughput"] |

---

## Memory Types

### Working Memory
- Capacity: 7 ± 2 items
- Focus item with full attention
- Context items with decreasing weights
- LRU replacement policy

### Episodic Memory
- Records of specific experiences
- What happened, when, what was learned
- Retrieval cues: similar errors, same location

### Semantic Memory
- General knowledge about concepts
- Relationships between concepts
- Common issues and solutions

### Procedural Memory
- Knowledge of how to perform tasks
- Step-by-step processes
- Tools and patterns for each step

---

## Quality Management

### Confidence Scoring

| Factor | Weight |
|--------|--------|
| Official documentation | 0.95 |
| Peer reviewed | 0.90 |
| Team consensus | 0.85 |
| Single developer | 0.70 |
| Speculation | 0.30 |

### Age Decay Formula
```
confidence = base_confidence × (0.5 ^ (age_days / half_life))
```

### Contradiction Detection
- Direct contradictions (A vs not-A)
- Temporal contradictions (timeline impossibilities)
- Semantic contradictions (conceptual conflicts)

---

## Anti-Patterns

### "Everything is Important"
**Problem:** 100,000+ items, 15% precision, 1:20 signal-to-noise

**Solution:** 5,000 curated items, 85% precision, 15:1 signal-to-noise

### "Never Forget"
**Problem:** Never delete, 1GB/month growth, 85% stale

**Solution:** Managed lifecycle with retention policies:
- Critical: Permanent
- Important: 1 year
- Operational: 3 months
- Temporary: 1 week

### "Context Bloat"
**Problem:** 50,000 tokens, 500 relevant, 30 sec processing

**Solution:** 5,000 tokens, 4,500 relevant, 2 sec processing

---

## Implementation Checklist

- [ ] Define knowledge hierarchy levels
- [ ] Establish decay policies by knowledge type
- [ ] Implement layered context model
- [ ] Set up compression strategies
- [ ] Configure retrieval mechanisms
- [ ] Establish confidence scoring
- [ ] Implement contradiction detection
- [ ] Create knowledge validation processes

---

## Integration Points

**Inbound:**
- When designing agent systems
- When planning knowledge storage
- When context limits become a problem

**Outbound:**
- To agent architecture design
- To context network development
- To retrieval system implementation

**Complementary:**
- `context-retrospective`: For evaluating knowledge system effectiveness
- `task-decomposition`: For understanding task knowledge needs
