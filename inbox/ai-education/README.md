# Working with AI: A Practical Guide

Standalone articles about working effectively with AI tools like ChatGPT, Claude, and other large language models. Each article is designed to be read independently in 5-10 minutes.

## Who This Is For

These guides are organized in three layers for different experience levels:

| Layer | Audience | Focus |
|-------|----------|-------|
| **Layer 1: Foundations** | Office workers starting with AI | What AI is, basic patterns, when to use it |
| **Layer 2: Effective Use** | Regular users wanting better results | Why AI gives mediocre output, techniques that work |
| **Layer 3: Technical** | Developers building with AI | Behavioral patterns, architecture, evaluation |

You can start at any layer. Each article stands alone.

## The Articles

### Layer 1: Foundations

For people new to AI chat tools.

| Article | What You'll Learn |
|---------|-------------------|
| [What AI Is and Isn't](layer-1-foundations/what-ai-is-and-isnt.md) | How LLMs actually work, why they're confident but wrong |
| [Basic Prompting](layer-1-foundations/basic-prompting.md) | Simple patterns that get better results |
| [When to Use AI](layer-1-foundations/when-to-use-ai.md) | Good uses, bad uses, the "confident intern" test |
| [Data and Privacy](layer-1-foundations/data-privacy-basics.md) | What's safe to share, what isn't |

### Layer 2: Effective Use

For people who use AI regularly but want better results.

| Article | What You'll Learn |
|---------|-------------------|
| [Why AI Gives Mediocre Results](layer-2-effective-use/why-ai-gives-mediocre-results.md) | The behavioral patterns that produce "good enough" output |
| [Framework-First Prompting](layer-2-effective-use/framework-first-prompting.md) | How to get quality output instead of average output |
| [Multi-Step Work with AI](layer-2-effective-use/multi-step-work.md) | Why "do it all at once" fails and what to do instead |
| [Beyond Good Enough](layer-2-effective-use/beyond-good-enough.md) | Iteration patterns that actually improve quality |

### Layer 3: Technical

For developers and technical users building with AI.

| Article | What You'll Learn |
|---------|-------------------|
| [LLM Behavioral Patterns](layer-3-technical/llm-behavioral-patterns.md) | The 5 patterns with research citations |
| [Context and Tokens](layer-3-technical/context-and-tokens.md) | How context works, what to prioritize |
| [Building Reliable Workflows](layer-3-technical/building-reliable-workflows.md) | Structured outputs, error handling, when to use agents |
| [Evaluation and Observability](layer-3-technical/evaluation-and-observability.md) | How to know if your AI integration is working |

## How the Layers Connect

**Layer 1 → Layer 2**: Once you're comfortable with basic AI use, Layer 2 explains *why* you sometimes get disappointing results and how to fix it.

**Layer 2 → Layer 3**: If you're building AI into products or workflows, Layer 3 provides the technical foundation and research backing for the patterns in Layer 2.

**Layer 3 → Layer 1**: Developers can use Layer 1 materials to onboard non-technical colleagues.

## Key Insight Across All Layers

**AI produces statistically average output by default.**

This isn't a bug—it's how the technology works. LLMs predict the most probable next word. "Most probable" means "most common." Common means average.

Getting non-average results requires understanding this and working with it, not against it. That's what these guides teach.

## Using These Materials

These articles are designed to be:

- **Standalone**: Read any article without prerequisites
- **Shareable**: Send individual articles to colleagues
- **Actionable**: Each ends with something to try
- **Concise**: 1000-2000 words, readable in one sitting

## Source Materials

These articles are adapted from frameworks in the operating-frameworks project:

- `frameworks/agent-workflow/llm-process-design.md` - Research-backed behavioral patterns
- `frameworks/agent-workflow/sequential-focus.md` - Phase separation techniques
- `organization/patterns/framework-first-prompting.md` - The framework-first pattern
- `frameworks/competency/ai-literacy-competency.md` - Competency structure

See those documents for the full technical treatment with citations.