# Code Review Diagnostic

type: diagnostic
mode: evaluative
triggers:
  - "review this code"
  - "check for issues"
  - "PR review"
  - "code quality"
  - "ready for review"

## Purpose

Systematic code review catches 60-90% of defects before production, reduces maintenance costs by 40%, and serves as effective knowledge transfer. This skill provides structured review guidance for both human reviewers and AI agents.

## Core Principle

**Review effectiveness degrades sharply with PR size.** Under 400 lines: highest defect detection. 400-800 lines: 50% less effective. 800+ lines: 90% less effective.

## Quick Reference: Review Effectiveness

| Factor | Optimal | Degraded |
|--------|---------|----------|
| PR size | < 400 lines | > 800 lines |
| Review time | < 60 minutes | > 90 minutes |
| Review speed | 200-400 LOC/hour | > 500 LOC/hour |
| Reviewers | 2 | 4+ (diminishing returns) |

## Quality Pyramid

| Level | Checks | Catches | Frequency |
|-------|--------|---------|-----------|
| 1. Automated | Lint, types, unit tests, security scan | 60% | Every commit |
| 2. Integration | Integration tests, contracts, performance | 25% | Every PR |
| 3. Human Review | Design, logic, maintainability, context | 15% | Significant changes |

---

## Review Focus Areas

### 1. Correctness

**Questions:**
- Does it solve the stated problem?
- Are edge cases handled?
- Is error handling complete?
- Are assumptions valid?

**Validation:**
- Test coverage adequate
- Business logic correct
- Data integrity maintained
- Concurrency handled

---

### 2. Maintainability

**Questions:**
- Is the code self-documenting?
- Can it be easily modified?
- Are abstractions appropriate?
- Is complexity justified?

**Indicators:**
- Clear naming
- Single responsibility
- Minimal coupling
- High cohesion

---

### 3. Performance

**Questions:**
- Are there obvious bottlenecks?
- Is caching appropriate?
- Are queries optimized?
- Is memory managed?

**Red Flags:**
- N+1 queries
- Unbounded loops
- Synchronous I/O in async context
- Memory leaks

---

### 4. Security

**Questions:**
- Is input validated?
- Are secrets protected?
- Is authentication checked?
- Are permissions verified?

**Critical Checks:**
- No hardcoded secrets
- SQL parameterized
- XSS prevention
- CSRF tokens

---

## Code Smells Checklist

### Method Level
| Smell | Threshold | Action |
|-------|-----------|--------|
| Long method | > 50 lines | Extract method |
| Long parameter list | > 5 params | Parameter object |
| Duplicate code | > 10 similar lines | Extract common |
| Dead code | Never called | Remove |

### Class Level
| Smell | Symptoms | Action |
|-------|----------|--------|
| God class | > 1000 lines, > 20 methods | Split class |
| Feature envy | Uses other class data excessively | Move method |
| Data clumps | Same parameter groups | Extract class |

### Architecture Level
| Smell | Detection | Action |
|-------|-----------|--------|
| Circular dependencies | Dependency cycles | Introduce interface |
| Unstable dependencies | Depends on volatile modules | Dependency inversion |

---

## Comment Guidelines

### Comment Types

**[BLOCKING]** - Must fix before merge
- Security vulnerabilities
- Data corruption risks
- Breaking API changes

**[MAJOR]** - Should fix before merge
- Missing tests
- Performance issues
- Code duplication

**[MINOR]** - Can fix in follow-up
- Style inconsistencies
- Documentation typos
- Naming improvements

**[QUESTION]** - Seeking clarification
- Design decisions
- Business logic
- External dependencies

### Effective Comment Pattern
```
Observation + Impact + Suggestion

Example:
"This method is 200 lines long [observation].
This makes it hard to understand and test [impact].
Consider extracting helper methods [suggestion]."
```

### Avoid
- Vague: "This could be better"
- Personal: "I don't like this"
- Nitpicky: "Missing period in comment"
- Overwhelming: 50+ minor style issues

---

## Review Readiness Checklist

### Before Requesting Review
- [ ] Feature fully implemented
- [ ] All tests written and passing
- [ ] Self-review performed
- [ ] No commented code or debug statements
- [ ] Coverage threshold met
- [ ] Linting clean
- [ ] Build succeeds
- [ ] Documentation updated
- [ ] PR description explains problem and solution

### PR Description Should Include
- Problem statement (why this change?)
- Solution approach (how does it solve it?)
- Testing strategy (how verified?)
- Breaking changes (if any)
- Review focus areas (where to look closely?)

---

## Complexity Thresholds

### Cyclomatic Complexity
| Range | Classification | Action |
|-------|----------------|--------|
| 1-10 | Simple | OK |
| 11-20 | Moderate | Consider refactoring |
| 21-50 | Complex | Refactor required |
| > 50 | Untestable | Must decompose |

### Cognitive Complexity
| Range | Classification | Factors |
|-------|----------------|---------|
| < 7 | Clear | Easy to understand |
| 7-15 | Acceptable | Some effort required |
| > 15 | Confusing | Refactor needed |

Factors increasing cognitive complexity:
- Nested structures (+1 per level)
- Flow breaking (continue, break)
- Recursive calls
- Unclear naming

---

## Quality Gates

### Commit Gate (Pre-commit)
- Syntax valid
- No merge conflicts
- Commit message format
- File size limits

### PR Gate (CI)
- Build success
- Test pass rate > 99%
- Coverage > 80%
- No critical vulnerabilities

### Deployment Gate (Pre-deploy)
- All PR gates pass
- Performance benchmarks met
- Security scan clean
- Rollback plan exists

---

## Anti-Patterns

### Rubber Stamp
Approving without thorough review. "LGTM" in < 1 minute.
**Fix:** Minimum review time, required comments, random audits.

### Nitpicking
50+ style comments, missing real issues.
**Fix:** Automate style checks, focus on logic/design, limit minor comments.

### Big Bang Review
2000+ line PRs that overwhelm.
**Fix:** Stack small PRs, feature flags, review drafts early.

---

## Security Scanning Categories

### Injection
- SQL injection
- Command injection
- LDAP injection
- XPath injection

**Detection:** Taint analysis, data flow tracking

### Authentication
- Hardcoded credentials
- Weak algorithms
- Missing authentication
- Session fixation

**Detection:** Secret scanning, configuration analysis

### Data Exposure
- Sensitive data in logs
- Unencrypted storage
- Information disclosure
- Path traversal

**Detection:** Data classification, entropy analysis

### Severity Classification
| Level | Definition | SLA |
|-------|------------|-----|
| Critical | Remote code execution possible | Fix immediately |
| High | Data breach possible | Fix within 24 hours |
| Medium | Limited impact | Fix within sprint |
| Low | Minimal risk | Fix when convenient |

---

## Review Metrics

### Efficiency
| Metric | Target |
|--------|--------|
| First review turnaround | < 4 hours |
| Review cycles | < 3 |
| PR to merge time | < 24 hours |

### Quality
| Metric | Target |
|--------|--------|
| Defect detection rate | > 80% |
| Post-merge defects | < 0.5 per PR |
| Review coverage | 100% |

---

## Integration Points

**Inbound:**
- After code implementation
- Before merge/deploy

**Outbound:**
- To `task-decomposition`: If PR too large
- To implementation: For fixes

**Complementary:**
- `github-agile`: For PR workflow
- `requirements-elaboration`: For unclear requirements
