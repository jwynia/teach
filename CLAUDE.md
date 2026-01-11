# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Context Network

This project uses a context network at `context/`. Start with:
- `context/status.md` - Current project state and active work
- `context/decisions.md` - Architecture decisions
- `context/glossary.md` - Domain vocabulary
- `context/questions.md` - Open research questions

Update `context/status.md` at session boundaries.

## Project Overview

Teach is a software project for researching and building course curricula with supporting teaching/coaching LLM agents. Courses are exportable into portable formats for a separate web application.

## Skill Preference Guidelines

**Always prefer project skills over built-in Claude Code tools when a skill exists for the task.** Skills encode domain expertise, structured methodologies, and optimizations that outperform ad-hoc tool usage.

### Key Skill-to-Tool Mappings

| Task | Use This Skill | Instead of |
|------|---------------|------------|
| Research & information gathering | `/research` | WebSearch + WebFetch sequences |
| Fact verification | `/fact-check` | Manual source checking |
| Complex claim analysis | `/claim-investigation` | WebSearch-based verification |
| PDF generation | `/pdf` | Generic file operations |
| Word documents | `/word` | Generic file operations |
| Spreadsheets | `/spreadsheet` | Generic file operations |
| Presentations | `/presentation` | Generic file operations |
| Dev server management | `/process-manager` | Manual bash commands |
| GitHub workflows | `/github-agile` | Manual gh commands |

### Why Skills Are Better

1. **Structured methodology** - Skills like research use multi-phase approaches (vocabulary discovery, counter-perspectives, confidence markers) that prevent common mistakes
2. **Integrated tooling** - Research uses Tavily CLI with advanced filtering; document skills use specialized generators
3. **Encoded expertise** - Skills capture best practices and anti-patterns learned from experience
4. **Reproducibility** - Skill scripts can be automated and produce consistent results
5. **Bias prevention** - Fact-check and claim-investigation skills enforce separation between generation and verification to prevent LLM self-confirmation

### When Built-in Tools Are Appropriate

- Quick, one-off operations where skill overhead isn't justified
- Tasks where no skill exists yet
- Initial exploration before committing to a structured approach

## Available Skills

This project has numerous installed skills in `.claude/skills/` to support curriculum development:

### Core Development
- **mastra-hono** - Build AI agents with Mastra v1 Beta + Hono (Node.js 22.13.0+ required)
- **skill-builder** - Create new diagnostic skills
- **context-network** - Bootstrap/maintain project context networks

### Research & Analysis
- **research** - Deep research with Tavily integration
- **fact-check**, **claim-investigation** - Verify claims and sources
- **requirements-analysis**, **requirements-elaboration** - Analyze project requirements
- **task-decomposition**, **task-breakdown** - Break down complex tasks

### Content Creation
- **brainstorming** - Structured ideation with constraint entropy
- **summarization**, **non-fiction-revision** - Content refinement
- **voice-analysis**, **speech-adaptation** - Analyze and adapt writing voice
- **competency** - Define learning competencies and progressions
- **gentle-teaching** - Educational content design approach

### Document Generation
- **pdf/pdf-generator** - Generate PDFs from templates or scratch
- **word/docx-generator** - Generate Word documents
- **spreadsheet/xlsx-generator** - Generate Excel spreadsheets
- **presentation/pptx-generator** - Generate PowerPoint presentations

### Project Management
- **github-agile** - GitHub issues, labels, PR templates
- **system-design** - Architecture decisions, component maps
- **architecture-decision**, **code-review** - Technical review processes

## Running Skill Scripts

All skill scripts are Deno TypeScript:

```bash
# Read-only scripts
deno run --allow-read .claude/skills/{skill}/scripts/{script}.ts [args]

# Scripts that write files
deno run --allow-read --allow-write .claude/skills/{skill}/scripts/{script}.ts [args]

# Scripts needing network/all permissions
deno run --allow-all .claude/skills/{skill}/scripts/{script}.ts [args]
```

## Skill Documentation

Each skill has a `SKILL.md` file documenting:
- When to use the skill
- Available states (for diagnostic skills)
- Scripts and their usage
- Integration with other skills
