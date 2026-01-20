# Gemini Image Generation Skill

Generate images using Google Gemini's native image generation capabilities.

## Setup

### Requirements

1. **Deno** - Install from https://deno.land
2. **Google AI API Key** - Get one at https://aistudio.google.com/apikey

### Configuration

Set your API key:
```bash
export GOOGLE_AI_API_KEY="your-key-here"
```

## Usage

### Basic Image Generation

Generate an image from a text prompt:

```bash
deno run --allow-net --allow-env --allow-read --allow-write \
  .claude/skills/gemini-image/scripts/generate-image.ts \
  --prompt "A cat eating a nano-banana in a fancy restaurant"
```

### With Reference Image

Generate an image based on both a prompt and a reference image:

```bash
deno run --allow-net --allow-env --allow-read --allow-write \
  .claude/skills/gemini-image/scripts/generate-image.ts \
  --prompt "Make this cat eat a nano-banana" \
  --image ./my-cat.png
```

### Specify Output File

```bash
deno run --allow-net --allow-env --allow-read --allow-write \
  .claude/skills/gemini-image/scripts/generate-image.ts \
  --prompt "A sunset over mountains" \
  --output ./sunset.png
```

## Options

| Option | Required | Default | Description |
|--------|----------|---------|-------------|
| `--prompt` | Yes | - | Text prompt for image generation |
| `--image` | No | - | Path to reference image (PNG, JPG, WEBP, GIF) |
| `--output` | No | `gemini-image-{timestamp}.png` | Output file path |
| `--model` | No | `gemini-2.5-flash-image` | Gemini model to use |
| `--help` | No | - | Show help message |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_AI_API_KEY` | Yes | Your Google AI API key |

## Supported Image Formats

Input images: PNG, JPG/JPEG, WEBP, GIF

Output: PNG

## Examples

```bash
# Simple generation
deno run --allow-net --allow-env --allow-write \
  .claude/skills/gemini-image/scripts/generate-image.ts \
  --prompt "A friendly robot waving hello"

# Transform existing image
deno run --allow-net --allow-env --allow-read --allow-write \
  .claude/skills/gemini-image/scripts/generate-image.ts \
  --prompt "Add a party hat to this person" \
  --image ./photo.jpg \
  --output ./party-photo.png
```

## Integration

The core generation logic can be imported for use in other scripts:

```typescript
import { generateImage } from ".claude/skills/gemini-image/scripts/generate-image.ts";

const result = await generateImage({
  prompt: "A beautiful sunset",
  apiKey: Deno.env.get("GOOGLE_AI_API_KEY")!,
});
```
