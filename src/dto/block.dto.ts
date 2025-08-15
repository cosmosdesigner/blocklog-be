import { IsNotEmpty, IsString, IsOptional, IsEnum, IsArray, IsUUID, IsDateString } from 'class-validator';
import { BlockStatus } from '../entities/block.entity';
import { TagResponseDto } from './tag.dto';

export class CreateBlockDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  tagIds?: string[];
}

export class UpdateBlockDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsEnum(BlockStatus)
  @IsOptional()
  status?: BlockStatus;

  @IsDateString()
  @IsOptional()
  resolvedAt?: Date;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  tagIds?: string[];
}

export class BlockResponseDto {
  id: string;
  title: string;
  reason: string;
  status: BlockStatus;
  startedAt: Date;
  resolvedAt: Date | null;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
  tags: TagResponseDto[];
}

export class ResolveBlockDto {
  @IsDateString()
  @IsOptional()
  resolvedAt?: Date;
}

// Query DTOs for filtering and pagination
export class BlockQueryDto {
  @IsEnum(BlockStatus)
  @IsOptional()
  status?: BlockStatus;

  @IsString()
  @IsOptional()
  search?: string;

  @IsUUID('4', { each: true })
  @IsOptional()
  tagIds?: string[];

  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @IsOptional()
  page?: number = 1;

  @IsOptional()
  limit?: number = 10;
}
