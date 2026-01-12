// Template validation service with LLM-powered error assistance
// Validates PPTX and RevealJS templates and provides helpful error messages

import { mastra } from "../mastra/index.js";
import { readFile } from "fs/promises";
import { join, extname } from "path";

// ============================================================================
// Types
// ============================================================================

export interface TechnicalValidationError {
  code: string;
  severity: "error" | "warning" | "suggestion";
  message: string;
  context?: string;
  location?: {
    slide_number?: number;
    element_name?: string;
    line_number?: number;
  };
}

export interface LLMEnhancedError {
  code: string;
  severity: "error" | "warning" | "suggestion";
  technical_message: string;
  llm_assistance: {
    user_friendly_explanation: string;
    why_this_matters: string;
    step_by_step_fix: string[];
    example?: string;
    related_concepts?: string[];
  };
  location?: {
    slide_number?: number;
    element_name?: string;
    line_number?: number;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: TechnicalValidationError[];
  warnings: TechnicalValidationError[];
  extractedPlaceholders: string[];
  missingRequiredElements: string[];
  llm_enhanced_errors?: LLMEnhancedError[];
}

export interface TemplateManifest {
  placeholders: Array<{
    name: string;
    description: string;
    required: boolean;
    location?: string;
  }>;
  layouts?: Array<{
    name: string;
    required_elements: string[];
  }>;
  frontmatter_fields?: Array<{
    name: string;
    required: boolean;
  }>;
}

// ============================================================================
// LLM Error Assistant Service
// ============================================================================

export class LLMErrorAssistant {
  
  async enhanceValidationError(
    error: TechnicalValidationError,
    templateType: "pptx" | "revealjs",
    userContext?: string
  ): Promise<LLMEnhancedError> {
    const prompt = this.buildErrorAssistancePrompt(error, templateType, userContext);
    
    try {
      const response = await mastra.llm.generate(prompt, { maxTokens: 500 });
      const assistance = this.parseAssistanceResponse(response);
      
      return {
        code: error.code,
        severity: error.severity,
        technical_message: error.message,
        llm_assistance: assistance,
        location: error.location
      };
    } catch (llmError) {
      console.error("LLM error assistance failed:", llmError);
      
      // Fallback to basic error message if LLM fails
      return {
        code: error.code,
        severity: error.severity,
        technical_message: error.message,
        llm_assistance: this.getFallbackAssistance(error, templateType),
        location: error.location
      };
    }
  }

  async enhanceAllErrors(
    errors: TechnicalValidationError[],
    templateType: "pptx" | "revealjs",
    userContext?: string
  ): Promise<LLMEnhancedError[]> {
    const enhanced: LLMEnhancedError[] = [];
    
    // Process errors in batches to avoid overwhelming the LLM
    for (const error of errors) {
      try {
        const enhancedError = await this.enhanceValidationError(error, templateType, userContext);
        enhanced.push(enhancedError);
      } catch (error) {
        console.error("Failed to enhance error:", error);
      }
    }
    
    return enhanced;
  }

  private buildErrorAssistancePrompt(
    error: TechnicalValidationError,
    templateType: "pptx" | "revealjs",
    userContext?: string
  ): string {
    const contextInfo = userContext ? `\nUser context: ${userContext}` : "";
    
    return `
You are an expert technical writing assistant helping course authors fix template issues. A user is trying to upload a ${templateType} template for course generation and encountered this technical error:

Error Code: ${error.code}
Severity: ${error.severity}
Technical Message: ${error.message}
Context: ${error.context || "N/A"}
Location: ${JSON.stringify(error.location || {})}${contextInfo}

Please provide helpful guidance in this EXACT JSON format:

{
  "user_friendly_explanation": "A clear explanation of what went wrong in non-technical language",
  "why_this_matters": "Why this issue prevents course generation from working properly", 
  "step_by_step_fix": [
    "Step 1: Specific action to take",
    "Step 2: Another specific action",
    "Step 3: Final verification step"
  ],
  "example": "Optional concrete example if helpful",
  "related_concepts": ["Optional array", "of related concepts", "that might help"]
}

Guidelines:
- The user is likely an educator or trainer, not a technical person
- Focus on practical guidance they can follow in PowerPoint/text editor
- Be specific about menu locations, button names, exact text to type
- Use encouraging, helpful tone
- If the error is about missing placeholders, explain what placeholders are and why they matter
- If it's about file format, explain the technical requirement in simple terms
- Provide examples when they would be genuinely helpful

Do not include anything outside the JSON format. Ensure valid JSON syntax.
`;
  }

  private parseAssistanceResponse(response: string): LLMEnhancedError["llm_assistance"] {
    try {
      // Try to parse the LLM response as JSON
      const cleanedResponse = response.trim();
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse LLM response:", parseError);
      
      // If JSON parsing fails, extract key information manually
      return {
        user_friendly_explanation: "There was an issue with your template that needs to be fixed.",
        why_this_matters: "This prevents the course generator from creating documents properly.",
        step_by_step_fix: [
          "1. Review the technical error message above",
          "2. Check our template guidelines in the help documentation", 
          "3. If you need assistance, contact support with the error details"
        ]
      };
    }
  }

  private getFallbackAssistance(
    error: TechnicalValidationError,
    templateType: "pptx" | "revealjs"
  ): LLMEnhancedError["llm_assistance"] {
    // Provide basic assistance based on common error patterns
    const common: Record<string, Partial<LLMEnhancedError["llm_assistance"]>> = {
      "PPTX_MISSING_NAMED_ELEMENTS": {
        user_friendly_explanation: "Your PowerPoint template is missing properly named elements that our course generator needs to place content automatically.",
        why_this_matters: "Without named elements, our system won't know where to put course titles, content, or other materials.",
        step_by_step_fix: [
          "1. Open your PowerPoint template",
          "2. Go to View → Slide Master", 
          "3. Select each layout and rename placeholders using the Selection Pane (Alt+F10)",
          "4. Use clear names like 'TitlePlaceholder', 'MainContent', etc.",
          "5. Save and re-upload your template"
        ]
      },
      "REVEALJS_INVALID_FRONTMATTER": {
        user_friendly_explanation: "The configuration section at the top of your template file has formatting errors.",
        why_this_matters: "Invalid configuration prevents RevealJS from loading your presentation properly.",
        step_by_step_fix: [
          "1. Open your .md template file",
          "2. Check the section between the '---' markers at the top",
          "3. Ensure each line follows 'property: value' format",
          "4. Fix any missing colons or quotation marks",
          "5. Save and re-upload"
        ]
      }
    };

    return {
      user_friendly_explanation: "There was an issue with your template that needs to be fixed.",
      why_this_matters: "This prevents the course generator from working properly with your template.",
      step_by_step_fix: [
        "1. Review the technical error details",
        "2. Check our template guidelines",
        "3. Contact support if you need assistance"
      ],
      ...common[error.code]
    };
  }
}

// ============================================================================
// Template Validators
// ============================================================================

export class PPTXValidator {
  async validate(filePath: string): Promise<ValidationResult> {
    try {
      // For now, we'll do basic file validation
      // TODO: Implement actual PPTX parsing with pptx-automizer
      
      const fileBuffer = await readFile(filePath);
      const errors: TechnicalValidationError[] = [];
      const warnings: TechnicalValidationError[] = [];
      
      // Basic file validation
      if (fileBuffer.length === 0) {
        errors.push({
          code: "PPTX_EMPTY_FILE",
          severity: "error",
          message: "Template file is empty",
          context: "File size is 0 bytes"
        });
      }

      // Check if it's actually a PPTX file (basic magic number check)
      const isZip = fileBuffer.subarray(0, 4).toString('hex') === '504b0304';
      if (!isZip) {
        errors.push({
          code: "PPTX_INVALID_FORMAT",
          severity: "error", 
          message: "File is not a valid PPTX format",
          context: "Missing ZIP magic number signature"
        });
      }

      // TODO: Add more sophisticated validation:
      // - Parse PPTX structure
      // - Check for slide masters
      // - Validate named elements
      // - Extract placeholders
      // - Verify required layouts

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        extractedPlaceholders: [], // TODO: Extract from actual PPTX
        missingRequiredElements: [] // TODO: Compare against manifest
      };

    } catch (error) {
      return {
        isValid: false,
        errors: [{
          code: "PPTX_VALIDATION_FAILED",
          severity: "error",
          message: "Failed to validate PPTX template",
          context: (error as Error).message
        }],
        warnings: [],
        extractedPlaceholders: [],
        missingRequiredElements: []
      };
    }
  }
}

export class RevealJSValidator {
  async validate(filePath: string): Promise<ValidationResult> {
    try {
      const content = await readFile(filePath, 'utf-8');
      const errors: TechnicalValidationError[] = [];
      const warnings: TechnicalValidationError[] = [];
      
      // Validate frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!frontmatterMatch) {
        errors.push({
          code: "REVEALJS_MISSING_FRONTMATTER",
          severity: "error",
          message: "Template is missing required frontmatter configuration",
          context: "RevealJS templates must start with YAML frontmatter between --- markers"
        });
      } else {
        try {
          // Basic YAML validation
          const yamlContent = frontmatterMatch[1];
          const lines = yamlContent.split('\n');
          
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line && !line.startsWith('#') && !line.includes(':')) {
              errors.push({
                code: "REVEALJS_INVALID_FRONTMATTER",
                severity: "error",
                message: `Invalid YAML syntax at line ${i + 2}`,
                context: `Line missing colon: "${line}"`,
                location: { line_number: i + 2 }
              });
            }
          }
        } catch (yamlError) {
          errors.push({
            code: "REVEALJS_INVALID_FRONTMATTER", 
            severity: "error",
            message: "Invalid YAML in frontmatter",
            context: (yamlError as Error).message
          });
        }
      }

      // Extract placeholders
      const placeholders = this.extractPlaceholders(content);
      
      // Check for required slides structure
      const slideCount = (content.match(/\n---\n/g) || []).length;
      if (slideCount === 0) {
        warnings.push({
          code: "REVEALJS_NO_SLIDE_SEPARATORS",
          severity: "warning",
          message: "Template has no slide separators (---)",
          context: "RevealJS uses --- to separate slides"
        });
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        extractedPlaceholders: placeholders,
        missingRequiredElements: [] // TODO: Compare against manifest
      };

    } catch (error) {
      return {
        isValid: false,
        errors: [{
          code: "REVEALJS_VALIDATION_FAILED",
          severity: "error",
          message: "Failed to validate RevealJS template",
          context: (error as Error).message
        }],
        warnings: [],
        extractedPlaceholders: [],
        missingRequiredElements: []
      };
    }
  }

  private extractPlaceholders(content: string): string[] {
    const placeholderRegex = /\{\{([^}]+)\}\}/g;
    const placeholders: string[] = [];
    let match;
    
    while ((match = placeholderRegex.exec(content)) !== null) {
      const placeholder = `{{${match[1]}}}`;
      if (!placeholders.includes(placeholder)) {
        placeholders.push(placeholder);
      }
    }
    
    return placeholders;
  }
}

// ============================================================================
// Main Validation Service
// ============================================================================

export class TemplateValidationService {
  private llmAssistant: LLMErrorAssistant;
  private pptxValidator: PPTXValidator;
  private revealJSValidator: RevealJSValidator;

  constructor() {
    this.llmAssistant = new LLMErrorAssistant();
    this.pptxValidator = new PPTXValidator();
    this.revealJSValidator = new RevealJSValidator();
  }

  async validateTemplate(
    filePath: string,
    templateType: "pptx" | "revealjs",
    userContext?: string
  ): Promise<ValidationResult> {
    let result: ValidationResult;

    // Run appropriate validator
    if (templateType === "pptx") {
      result = await this.pptxValidator.validate(filePath);
    } else {
      result = await this.revealJSValidator.validate(filePath);
    }

    // Enhance errors with LLM assistance
    if (result.errors.length > 0 || result.warnings.length > 0) {
      const allErrors = [...result.errors, ...result.warnings];
      const enhancedErrors = await this.llmAssistant.enhanceAllErrors(
        allErrors, 
        templateType, 
        userContext
      );
      
      result.llm_enhanced_errors = enhancedErrors;
    }

    return result;
  }

  async generateManifest(
    filePath: string,
    templateType: "pptx" | "revealjs"
  ): Promise<TemplateManifest> {
    if (templateType === "revealjs") {
      const content = await readFile(filePath, 'utf-8');
      const placeholders = this.revealJSValidator["extractPlaceholders"](content);
      
      return {
        placeholders: placeholders.map(placeholder => ({
          name: placeholder,
          description: `Placeholder: ${placeholder}`,
          required: false // TODO: Determine from template analysis
        }))
      };
    }

    // TODO: Implement PPTX manifest generation
    return {
      placeholders: []
    };
  }
}

// Export singleton instance
export const templateValidationService = new TemplateValidationService();