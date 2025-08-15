import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface BlockAnalysisRequest {
  title: string;
  reason: string;
  context?: string;
}

export interface BlockAnalysisResponse {
  suggestions: string[];
  category: string;
  severity: 'low' | 'medium' | 'high';
  estimatedDuration?: string;
  resources?: string[];
  nextSteps?: string[];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GOOGLE_AI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    } else {
      this.logger.warn('Google AI API key not configured. AI features will be disabled.');
    }
  }

  async analyzeBlock(blockData: BlockAnalysisRequest): Promise<BlockAnalysisResponse> {
    if (!this.model) {
      throw new BadRequestException('AI service is not configured');
    }

    const { title, reason, context } = blockData;

    const prompt = this.buildAnalysisPrompt(title, reason, context);

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseAnalysisResponse(text);
    } catch (error) {
      this.logger.error('Error analyzing block with AI:', error);
      throw new BadRequestException('Failed to analyze block');
    }
  }

  async getSimilarBlockSuggestions(
    currentTitle: string,
    currentReason: string,
    pastBlocks: Array<{ title: string; reason: string; resolution?: string }>
  ): Promise<{ similarBlocks: string[]; suggestions: string[] }> {
    if (!this.model) {
      throw new BadRequestException('AI service is not configured');
    }

    const prompt = this.buildSimilarityPrompt(currentTitle, currentReason, pastBlocks);

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseSimilarityResponse(text);
    } catch (error) {
      this.logger.error('Error finding similar blocks:', error);
      throw new BadRequestException('Failed to find similar blocks');
    }
  }

  async generateBlockResolution(title: string, reason: string): Promise<{ resolutionSteps: string[]; preventionTips: string[] }> {
    if (!this.model) {
      throw new BadRequestException('AI service is not configured');
    }

    const prompt = this.buildResolutionPrompt(title, reason);

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseResolutionResponse(text);
    } catch (error) {
      this.logger.error('Error generating resolution:', error);
      throw new BadRequestException('Failed to generate resolution');
    }
  }

  private buildAnalysisPrompt(title: string, reason: string, context?: string): string {
    return `
You are a productivity expert analyzing a work blocker. Please analyze the following blocker and provide structured feedback.

Title: "${title}"
Reason: "${reason}"
${context ? `Context: "${context}"` : ''}

Please provide a JSON response with the following structure:
{
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "category": "category_name",
  "severity": "low|medium|high",
  "estimatedDuration": "time estimate",
  "resources": ["resource1", "resource2"],
  "nextSteps": ["step1", "step2", "step3"]
}

Categories should be one of: "technical", "communication", "process", "external_dependency", "resource", "knowledge", "other"
Severity should reflect the impact on productivity.
Provide actionable, specific suggestions.
`;
  }

  private buildSimilarityPrompt(
    currentTitle: string,
    currentReason: string,
    pastBlocks: Array<{ title: string; reason: string; resolution?: string }>
  ): string {
    const pastBlocksText = pastBlocks
      .map((block, index) => `${index + 1}. Title: "${block.title}", Reason: "${block.reason}"${block.resolution ? `, Resolution: "${block.resolution}"` : ''}`)
      .join('\n');

    return `
You are analyzing work blockers to find similarities and patterns.

Current Blocker:
Title: "${currentTitle}"
Reason: "${currentReason}"

Past Blockers:
${pastBlocksText}

Please analyze the current blocker against past blockers and provide a JSON response:
{
  "similarBlocks": ["similar block titles"],
  "suggestions": ["actionable suggestions based on past resolutions"]
}

Focus on finding blockers with similar root causes or themes.
`;
  }

  private buildResolutionPrompt(title: string, reason: string): string {
    return `
You are a problem-solving expert. Help resolve this work blocker with actionable steps.

Title: "${title}"
Reason: "${reason}"

Please provide a JSON response with:
{
  "resolutionSteps": ["step1", "step2", "step3"],
  "preventionTips": ["tip1", "tip2", "tip3"]
}

Resolution steps should be specific, actionable, and ordered by priority.
Prevention tips should help avoid similar blockers in the future.
`;
  }

  private parseAnalysisResponse(text: string): BlockAnalysisResponse {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          suggestions: parsed.suggestions || [],
          category: parsed.category || 'other',
          severity: parsed.severity || 'medium',
          estimatedDuration: parsed.estimatedDuration,
          resources: parsed.resources || [],
          nextSteps: parsed.nextSteps || [],
        };
      }
      throw new Error('No JSON found in response');
    } catch (error) {
      this.logger.warn('Failed to parse AI response as JSON, falling back to text parsing');
      // Fallback to basic parsing
      return {
        suggestions: [text.trim()],
        category: 'other',
        severity: 'medium',
      };
    }
  }

  private parseSimilarityResponse(text: string): { similarBlocks: string[]; suggestions: string[] } {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          similarBlocks: parsed.similarBlocks || [],
          suggestions: parsed.suggestions || [],
        };
      }
      throw new Error('No JSON found in response');
    } catch (error) {
      return {
        similarBlocks: [],
        suggestions: [text.trim()],
      };
    }
  }

  private parseResolutionResponse(text: string): { resolutionSteps: string[]; preventionTips: string[] } {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          resolutionSteps: parsed.resolutionSteps || [],
          preventionTips: parsed.preventionTips || [],
        };
      }
      throw new Error('No JSON found in response');
    } catch (error) {
      return {
        resolutionSteps: [text.trim()],
        preventionTips: [],
      };
    }
  }

  isAvailable(): boolean {
    return !!this.model;
  }
}
