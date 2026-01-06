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
