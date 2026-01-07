// LLM Provider Factory
// Supports Anthropic, OpenAI, OpenRouter, and custom OpenAI-compatible endpoints

import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModelV1 } from "ai";

export interface ProviderConfig {
  provider: "anthropic" | "openai" | "openrouter" | "custom";
  model: string;
  apiKey: string;
  baseURL?: string;
  headers?: Record<string, string>;
}

/**
 * Create a custom fetch function that merges additional headers
 */
function createCustomFetch(headers: Record<string, string>) {
  return async (url: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const mergedHeaders = new Headers(init?.headers);
    for (const [key, value] of Object.entries(headers)) {
      mergedHeaders.set(key, value);
    }
    return fetch(url, { ...init, headers: mergedHeaders });
  };
}

/**
 * Create a language model instance from configuration
 */
export function createModel(config: ProviderConfig): LanguageModelV1 {
  const customFetch = config.headers
    ? createCustomFetch(config.headers)
    : undefined;

  switch (config.provider) {
    case "anthropic": {
      const anthropic = createAnthropic({
        apiKey: config.apiKey,
        baseURL: config.baseURL,
        fetch: customFetch,
      });
      return anthropic(config.model);
    }

    case "openai": {
      const openai = createOpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseURL,
        fetch: customFetch,
      });
      return openai(config.model);
    }

    case "openrouter": {
      const openrouter = createOpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseURL || "https://openrouter.ai/api/v1",
        fetch: customFetch,
      });
      return openrouter(config.model);
    }

    case "custom": {
      // Use OpenAI-compatible client for custom endpoints
      if (!config.baseURL) {
        throw new Error("LLM_BASE_URL is required for custom provider");
      }
      const custom = createOpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseURL,
        fetch: customFetch,
      });
      return custom(config.model);
    }

    default:
      throw new Error(`Unknown LLM provider: ${config.provider}`);
  }
}

/**
 * Get model configuration from environment variables
 *
 * Required env vars:
 *   LLM_PROVIDER - anthropic | openai | openrouter | custom
 *   LLM_MODEL    - Model name (e.g., claude-3-5-sonnet, gpt-4o)
 *   LLM_API_KEY  - API key for the provider
 *
 * Optional env vars:
 *   LLM_BASE_URL - Custom API endpoint URL
 *   LLM_HEADERS  - Additional headers as JSON (e.g., {"HTTP-Referer":"https://example.com"})
 */
export function getModelFromEnv(): LanguageModelV1 {
  const provider = process.env.LLM_PROVIDER as ProviderConfig["provider"] | undefined;
  const model = process.env.LLM_MODEL;
  const apiKey = process.env.LLM_API_KEY;

  if (!provider || !model || !apiKey) {
    throw new Error(
      "Missing required environment variables. Set LLM_PROVIDER, LLM_MODEL, and LLM_API_KEY.\n" +
      "Example:\n" +
      "  LLM_PROVIDER=anthropic\n" +
      "  LLM_MODEL=claude-3-5-sonnet\n" +
      "  LLM_API_KEY=your-api-key"
    );
  }

  const validProviders = ["anthropic", "openai", "openrouter", "custom"];
  if (!validProviders.includes(provider)) {
    throw new Error(
      `Invalid LLM_PROVIDER: ${provider}. Must be one of: ${validProviders.join(", ")}`
    );
  }

  let headers: Record<string, string> | undefined;
  if (process.env.LLM_HEADERS) {
    try {
      headers = JSON.parse(process.env.LLM_HEADERS);
    } catch {
      throw new Error(
        `Invalid LLM_HEADERS: must be valid JSON. Got: ${process.env.LLM_HEADERS}`
      );
    }
  }

  return createModel({
    provider,
    model,
    apiKey,
    baseURL: process.env.LLM_BASE_URL,
    headers,
  });
}
