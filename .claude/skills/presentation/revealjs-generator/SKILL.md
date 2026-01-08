# RevealJS Generator Skill

Generate RevealJS HTML presentations from Markdown or JSON specifications. Creates browser-ready slide decks with themes, speaker notes, syntax highlighting, and more.

## When to Use

- Creating lecture slides from markdown notes
- Generating course presentations from structured data
- Building interactive slide decks with code highlighting
- Producing presentations that work in any browser without software

## When NOT to Use

- Need PowerPoint (.pptx) format → Use `pptx-generator` skill
- Need PDF output directly → Use `pdf-generator` skill (or RevealJS's built-in ?print-pdf)
- Offline presentations without CDN access → Consider bundled output mode

## Prerequisites

- **Deno** installed (https://deno.land)

No additional dependencies - uses CDN-hosted RevealJS assets.

---

## Quick Start

### From Markdown (Primary)

```bash
# Generate presentation from markdown
deno run --allow-read --allow-write scripts/generate-from-markdown.ts slides.md presentation.html

# Open in browser
open presentation.html
```

### From JSON Spec (Advanced)

```bash
# Generate from JSON specification
deno run --allow-read --allow-write scripts/generate-scratch.ts spec.json presentation.html
```

---

## Markdown Format

Create presentations using simple markdown with slide separators:

```markdown
---
title: My Presentation
author: Your Name
theme: black
---

# Title Slide
Subtitle or description

---

## First Topic
- Bullet point one
- Bullet point two
- Bullet point three

Note: These are speaker notes. Only visible in presenter view (press S).

---

## Code Example

```javascript
function hello() {
  console.log("Hello, RevealJS!");
}
```

---

## Nested Slides

This is a horizontal slide.

--

### Vertical Slide 1

Press down arrow to see this.

--

### Vertical Slide 2

Another vertical slide.

---

## Final Slide

Thank you!
```

### Separators

| Separator | Purpose |
|-----------|---------|
| `---` | New horizontal slide |
| `--` | Vertical slide (nested under previous) |
| `Note:` | Speaker notes (press S to view) |

### Front Matter Options

```yaml
---
title: Presentation Title
author: Author Name
theme: black           # black, white, league, beige, night, serif, simple, solarized
transition: slide      # none, fade, slide, convex, concave, zoom
controls: true         # Show navigation arrows
progress: true         # Show progress bar
slideNumber: true      # Show slide numbers
hash: true             # Enable URL hash navigation
---
```

---

## JSON Specification (Advanced)

For complex presentations requiring precise control:

```json
{
  "title": "Advanced Presentation",
  "theme": "league",
  "config": {
    "controls": true,
    "progress": true,
    "slideNumber": "c/t",
    "transition": "fade",
    "transitionSpeed": "fast"
  },
  "plugins": ["highlight", "notes", "math"],
  "slides": [
    {
      "content": "<h1>Title Slide</h1><p>Subtitle here</p>",
      "background": { "color": "003366" }
    },
    {
      "markdown": "## Markdown Slide\n\n- Works in JSON too\n- Mix and match",
      "notes": "Speaker notes for this slide"
    },
    {
      "content": "<h2>Parent Slide</h2>",
      "vertical": [
        { "markdown": "### Child 1\nVertical slide content" },
        { "markdown": "### Child 2\nMore vertical content" }
      ]
    }
  ]
}
```

### Slide Options

| Option | Type | Description |
|--------|------|-------------|
| `content` | string | HTML content for the slide |
| `markdown` | string | Markdown content (converted to HTML) |
| `background` | object | `{ color?, image?, video?, size?, opacity? }` |
| `notes` | string | Speaker notes |
| `vertical` | array | Nested vertical slides |
| `transition` | string | Override transition for this slide |
| `autoAnimate` | boolean | Enable auto-animate |
| `attributes` | object | Custom data attributes |

---

## Available Themes

| Theme | Description |
|-------|-------------|
| `black` | Black background, white text (default) |
| `white` | White background, black text |
| `league` | Gray background, dramatic |
| `beige` | Beige background, warm |
| `night` | Dark blue background |
| `serif` | Serif fonts, traditional |
| `simple` | Minimal, clean |
| `solarized` | Solarized color scheme |
| `blood` | Dark red accents |
| `moon` | Dark theme with blue |

---

## Features

### Speaker Notes

Press `S` during presentation to open speaker view with:
- Current slide
- Next slide preview
- Speaker notes
- Timer

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `→` / `Space` | Next slide |
| `←` | Previous slide |
| `↓` | Next vertical slide |
| `↑` | Previous vertical slide |
| `S` | Speaker view |
| `F` | Fullscreen |
| `O` | Overview mode |
| `Esc` | Exit overview/fullscreen |
| `B` | Blackout screen |

### PDF Export

1. Open presentation in Chrome/Chromium
2. Add `?print-pdf` to URL: `file:///path/to/slides.html?print-pdf`
3. Print to PDF (Cmd/Ctrl + P)
4. Set margins to "None" for best results

---

## Script Reference

| Script | Permissions | Purpose |
|--------|-------------|---------|
| `generate-from-markdown.ts` | `--allow-read --allow-write` | Convert markdown to RevealJS HTML |
| `generate-scratch.ts` | `--allow-read --allow-write` | Generate from JSON specification |

### Command Options

```bash
# generate-from-markdown.ts
deno run --allow-read --allow-write scripts/generate-from-markdown.ts <input.md> <output.html> [options]

Options:
  -h, --help       Show help
  -v, --verbose    Verbose output
  --theme <name>   Override theme (black, white, league, etc.)
  --title <title>  Override presentation title

# generate-scratch.ts
deno run --allow-read --allow-write scripts/generate-scratch.ts <spec.json> <output.html> [options]

Options:
  -h, --help       Show help
  -v, --verbose    Verbose output
```

---

## Examples

### Simple Lecture

```markdown
---
title: Introduction to Python
theme: simple
---

# Introduction to Python

A beginner's guide

---

## What is Python?

- High-level programming language
- Easy to read and write
- Great for beginners

Note: Emphasize that Python reads almost like English

---

## Hello World

```python
print("Hello, World!")
```

Output: `Hello, World!`

---

## Questions?

Thank you for attending!
```

### Code-Heavy Presentation

```markdown
---
title: JavaScript Best Practices
theme: night
---

# JavaScript Best Practices

Modern patterns for clean code

---

## Arrow Functions

```javascript
// Traditional
function add(a, b) {
  return a + b;
}

// Arrow
const add = (a, b) => a + b;
```

---

## Async/Await

```javascript
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    return await response.json();
  } catch (error) {
    console.error('Failed:', error);
  }
}
```
```

### Course Module Presentation

```markdown
---
title: Data Privacy Fundamentals
author: Training Team
theme: white
---

# Data Privacy Fundamentals

Module 1: Understanding PII

---

## Learning Objectives

By the end of this module, you will be able to:

- Define personally identifiable information (PII)
- Classify data sensitivity levels
- Apply privacy principles to real scenarios

---

## What is PII?

--

### Direct Identifiers

- Full name
- Social Security Number
- Email address
- Phone number

--

### Indirect Identifiers

- Date of birth
- ZIP code
- Job title
- IP address

Note: Indirect identifiers can become PII when combined

---

## Knowledge Check

What would you do if you received an email with customer SSNs?

Note: Discussion question - no single right answer, assess their reasoning
```

---

## Common Issues

### Slides not rendering

- Check markdown syntax (especially code blocks with triple backticks)
- Ensure `---` separators have blank lines before/after
- Verify front matter is valid YAML

### Themes not loading

- Requires internet connection for CDN themes
- Check theme name spelling (case-sensitive)
- For offline use, consider bundled output mode

### Speaker notes not appearing

- Press `S` to open speaker view
- Notes must start with `Note:` on its own line
- Check browser popup blocker settings

---

## Limitations

- Requires internet for CDN resources (unless bundled)
- No built-in animation timeline editor
- Custom themes require CSS knowledge
- Video backgrounds need direct URLs (no upload)

---

## Related Skills

- **pptx-generator** - PowerPoint output for corporate environments
- **pdf-generator** - Static document generation
- **competency** - Design competency frameworks for course content
