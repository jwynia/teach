#!/usr/bin/env -S deno run --allow-net --allow-env --allow-read --allow-write

/**
 * Gemini Image Generation CLI
 *
 * Generate images using Google Gemini's native image generation capabilities.
 * Uses the REST API directly for maximum Deno compatibility.
 *
 * Usage:
 *   deno run --allow-net --allow-env --allow-read --allow-write generate-image.ts --prompt "Your prompt"
 *   deno run --allow-net --allow-env --allow-read --allow-write generate-image.ts --prompt "Transform this" --image ./input.png
 */

// === TYPES ===

interface GenerateOptions {
  prompt: string;
  imagePath?: string;
  outputPath: string;
  model: string;
  apiKey: string;
}

interface GenerateResult {
  outputPath: string;
  text?: string;
}

interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
    finishReason?: string;
  }>;
  error?: {
    code: number;
    message: string;
    status: string;
  };
}

// === ARGUMENT PARSING ===

function parseArgs(args: string[]): Map<string, string | boolean> {
  const result = new Map<string, string | boolean>();
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const nextArg = args[i + 1];
      if (nextArg && !nextArg.startsWith("--")) {
        result.set(key, nextArg);
        i++;
      } else {
        result.set(key, true);
      }
    }
  }
  return result;
}

function printHelp(): void {
  console.log(`
Gemini Image Generation CLI

Usage:
  deno run --allow-net --allow-env --allow-read --allow-write generate-image.ts [options]

Options:
  --prompt <text>     Text prompt for image generation (required)
  --image <path>      Path to reference image (optional)
  --output <path>     Output file path (default: gemini-image-{timestamp}.png)
  --model <name>      Model to use (default: gemini-2.5-flash-image)
  --help              Show this help message

Environment Variables:
  GOOGLE_AI_API_KEY   Your Google AI API key (required)
                      Get one at: https://aistudio.google.com/apikey

Examples:
  # Generate from text prompt only
  deno run --allow-net --allow-env --allow-write generate-image.ts \\
    --prompt "A cat eating a nano-banana in a fancy restaurant"

  # Generate with reference image
  deno run --allow-net --allow-env --allow-read --allow-write generate-image.ts \\
    --prompt "Add a party hat to this cat" \\
    --image ./my-cat.png \\
    --output ./party-cat.png
`);
}

// === MIME TYPE DETECTION ===

function getMimeType(filePath: string): string {
  const ext = filePath.toLowerCase().split(".").pop() || "";
  const mimeTypes: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    gif: "image/gif",
  };
  return mimeTypes[ext] || "image/png";
}

// === BASE64 ENCODING ===

function encodeBase64(data: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]);
  }
  return btoa(binary);
}

function decodeBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// === CORE GENERATION ===

export async function generateImage(
  options: GenerateOptions
): Promise<GenerateResult> {
  // Build the prompt parts
  const parts: GeminiPart[] = [];

  // Add text prompt
  parts.push({ text: options.prompt });

  // Add reference image if provided
  if (options.imagePath) {
    try {
      const imageData = await Deno.readFile(options.imagePath);
      const base64Image = encodeBase64(imageData);
      const mimeType = getMimeType(options.imagePath);

      parts.push({
        inlineData: {
          mimeType,
          data: base64Image,
        },
      });

      console.error(`Loaded reference image: ${options.imagePath} (${mimeType})`);
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        throw new Error(`Reference image not found: ${options.imagePath}`);
      }
      throw error;
    }
  }

  console.error(`Generating image with model: ${options.model}`);
  console.error(`Prompt: ${options.prompt}`);

  // Call the Gemini REST API
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${options.model}:generateContent?key=${options.apiKey}`;

  const requestBody = {
    contents: [
      {
        parts,
      },
    ],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
    },
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `API error (${response.status})`;
    try {
      const errorJson = JSON.parse(errorText);
      if (errorJson.error?.message) {
        errorMessage = `API error: ${errorJson.error.message}`;
      }
    } catch {
      errorMessage = `API error (${response.status}): ${errorText}`;
    }
    throw new Error(errorMessage);
  }

  const result: GeminiResponse = await response.json();

  // Process the response
  let resultText: string | undefined;
  let imageSaved = false;

  if (!result.candidates || result.candidates.length === 0) {
    throw new Error("No response candidates returned from API");
  }

  const candidate = result.candidates[0];
  if (!candidate.content || !candidate.content.parts) {
    throw new Error("No content parts in response");
  }

  for (const part of candidate.content.parts) {
    if (part.text) {
      resultText = part.text;
      console.error(`Response text: ${part.text}`);
    } else if (part.inlineData) {
      const imageData = decodeBase64(part.inlineData.data);
      await Deno.writeFile(options.outputPath, imageData);
      console.log(`Image saved: ${options.outputPath}`);
      imageSaved = true;
    }
  }

  if (!imageSaved) {
    console.error("Warning: No image was returned in the response");
  }

  return {
    outputPath: options.outputPath,
    text: resultText,
  };
}

// === MAIN ===

async function main(): Promise<void> {
  const args = parseArgs(Deno.args);

  // Show help
  if (args.has("help") || args.has("h") || Deno.args.length === 0) {
    printHelp();
    Deno.exit(0);
  }

  // Get API key
  const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
  if (!apiKey) {
    console.error("Error: GOOGLE_AI_API_KEY environment variable is not set");
    console.error("Get your API key at: https://aistudio.google.com/apikey");
    Deno.exit(1);
  }

  // Get prompt (required)
  const prompt = args.get("prompt") as string | undefined;
  if (!prompt) {
    console.error("Error: --prompt is required");
    console.error("Use --help for usage information");
    Deno.exit(1);
  }

  // Get optional arguments
  const imagePath = args.get("image") as string | undefined;
  const model = (args.get("model") as string) || "gemini-2.5-flash-image";

  // Generate output path if not specified
  let outputPath = args.get("output") as string | undefined;
  if (!outputPath) {
    const timestamp = Date.now();
    outputPath = `gemini-image-${timestamp}.png`;
  }

  try {
    await generateImage({
      prompt,
      imagePath,
      outputPath,
      model,
      apiKey,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error("An unknown error occurred");
    }
    Deno.exit(1);
  }
}

main();
