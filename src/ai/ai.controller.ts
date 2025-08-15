import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AiService, BlockAnalysisRequest } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Block } from '../entities/block.entity';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { AuthenticatedRequest } from '../common/interfaces';

class AnalyzeBlockDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsOptional()
  context?: string;
}

class SimilarBlocksDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  reason: string;
}

class GenerateResolutionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  reason: string;
}

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    private readonly aiService: AiService,
    @InjectRepository(Block)
    private blockRepository: Repository<Block>,
  ) {}

  @Get('status')
  getAiStatus() {
    return {
      available: this.aiService.isAvailable(),
      message: this.aiService.isAvailable() 
        ? 'AI service is available' 
        : 'AI service is not configured. Please set GOOGLE_AI_API_KEY environment variable.',
    };
  }

  @Post('analyze')
  async analyzeBlock(@Request() req: AuthenticatedRequest, @Body() analyzeBlockDto: AnalyzeBlockDto) {
    if (!this.aiService.isAvailable()) {
      throw new BadRequestException('AI service is not available');
    }

    const { title, reason, context } = analyzeBlockDto;

    return this.aiService.analyzeBlock({
      title,
      reason,
      context,
    });
  }

  @Post('similar')
  async findSimilarBlocks(@Request() req: AuthenticatedRequest, @Body() similarBlocksDto: SimilarBlocksDto) {
    if (!this.aiService.isAvailable()) {
      throw new BadRequestException('AI service is not available');
    }

    const { title, reason } = similarBlocksDto;
    const userId = req.user.id;

    // Get user's past blocks for comparison
    const pastBlocks = await this.blockRepository.find({
      where: { user: { id: userId } },
      select: ['title', 'reason'],
      order: { createdAt: 'DESC' },
      take: 20, // Limit to recent 20 blocks to avoid token limits
    });

    const pastBlocksData = pastBlocks.map(block => ({
      title: block.title,
      reason: block.reason,
    }));

    return this.aiService.getSimilarBlockSuggestions(title, reason, pastBlocksData);
  }

  @Post('resolve')
  async generateResolution(@Request() req: AuthenticatedRequest, @Body() generateResolutionDto: GenerateResolutionDto) {
    if (!this.aiService.isAvailable()) {
      throw new BadRequestException('AI service is not available');
    }

    const { title, reason } = generateResolutionDto;

    return this.aiService.generateBlockResolution(title, reason);
  }
}
