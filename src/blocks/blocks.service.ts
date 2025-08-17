import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Block, BlockStatus } from '../entities/block.entity';
import { Tag } from '../entities/tag.entity';
import { User } from '../entities/user.entity';
import {
  CreateBlockDto,
  UpdateBlockDto,
  BlockQueryDto,
  BlockResponseDto,
} from '../dto';
import { PaginatedResponse } from '../common/interfaces';

@Injectable()
export class BlocksService {
  constructor(
    @InjectRepository(Block)
    private blockRepository: Repository<Block>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  async create(
    userId: string,
    createBlockDto: CreateBlockDto,
  ): Promise<BlockResponseDto> {
    const { title, reason, tagIds } = createBlockDto;

    // Create block
    const block = this.blockRepository.create({
      title,
      reason,
      status: BlockStatus.ONGOING,
      user: { id: userId } as User,
      startedAt: new Date(),
    });

    // Add tags if provided
    if (tagIds && tagIds.length > 0) {
      const tags = await this.tagRepository.find({
        where: { id: tagIds, user: { id: userId } } as any,
      });
      block.tags = tags;
    }

    const savedBlock = await this.blockRepository.save(block);
    return this.toBlockResponse(await this.findById(savedBlock.id, userId));
  }

  async findAll(
    userId: string,
    query: BlockQueryDto,
  ): Promise<PaginatedResponse<BlockResponseDto>> {
    const {
      status,
      search,
      tagIds,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = query;

    const queryBuilder = this.createQueryBuilder(userId);

    // Apply filters
    if (status) {
      queryBuilder.andWhere('block.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(block.title ILIKE :search OR block.reason ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (tagIds && tagIds.length > 0) {
      queryBuilder.andWhere('tag.id IN (:...tagIds)', { tagIds });
    }

    if (startDate) {
      queryBuilder.andWhere('block.startedAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('block.startedAt <= :endDate', { endDate });
    }

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Order by creation date (newest first)
    queryBuilder.orderBy('block.createdAt', 'DESC');

    const [blocks, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data: blocks.map((block) => this.toBlockResponse(block)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findById(id: string, userId: string): Promise<Block> {
    const block = await this.blockRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['tags'],
    });

    if (!block) {
      throw new NotFoundException('Block not found');
    }

    // Update duration for ongoing blocks
    if (block.status === BlockStatus.ONGOING) {
      block.duration = Date.now() - block.startedAt.getTime();
    }

    return block;
  }

  async findOne(id: string, userId: string): Promise<BlockResponseDto> {
    const block = await this.findById(id, userId);
    return this.toBlockResponse(block);
  }

  async update(
    id: string,
    userId: string,
    updateBlockDto: UpdateBlockDto,
  ): Promise<BlockResponseDto> {
    const block = await this.findById(id, userId);

    const { title, reason, status, resolvedAt, tagIds } = updateBlockDto;

    // Update basic fields
    if (title !== undefined) block.title = title;
    if (reason !== undefined) block.reason = reason;
    if (status !== undefined) {
      block.status = status;
      if (status === BlockStatus.RESOLVED && !block.resolvedAt) {
        block.resolvedAt = resolvedAt || new Date();
        block.duration = block.resolvedAt.getTime() - block.startedAt.getTime();
      } else if (status === BlockStatus.ONGOING) {
        block.resolvedAt = null;
        block.duration = 0;
      }
    }

    // Update tags if provided
    if (tagIds !== undefined) {
      if (tagIds.length > 0) {
        const tags = await this.tagRepository.find({
          where: { id: tagIds, user: { id: userId } } as any,
        });
        block.tags = tags;
      } else {
        block.tags = [];
      }
    }

    const updatedBlock = await this.blockRepository.save(block);
    return this.toBlockResponse(updatedBlock);
  }

  async resolve(
    id: string,
    userId: string,
    resolvedAt?: Date,
  ): Promise<BlockResponseDto> {
    const block = await this.findById(id, userId);

    if (block.status === BlockStatus.RESOLVED) {
      throw new ForbiddenException('Block is already resolved');
    }

    const resolveDate = resolvedAt || new Date();
    block.status = BlockStatus.RESOLVED;
    block.resolvedAt = resolveDate;
    block.duration = resolveDate.getTime() - block.startedAt.getTime();

    const updatedBlock = await this.blockRepository.save(block);
    return this.toBlockResponse(updatedBlock);
  }

  async remove(id: string, userId: string): Promise<void> {
    const block = await this.findById(id, userId);
    await this.blockRepository.remove(block);
  }

  async getOngoingBlocks(userId: string): Promise<BlockResponseDto[]> {
    const blocks = await this.blockRepository.find({
      where: { user: { id: userId }, status: BlockStatus.ONGOING },
      relations: ['tags'],
      order: { createdAt: 'DESC' },
    });

    return blocks.map((block) => {
      // Update duration for ongoing blocks
      block.duration = Date.now() - block.startedAt.getTime();
      return this.toBlockResponse(block);
    });
  }

  private createQueryBuilder(userId: string): SelectQueryBuilder<Block> {
    return this.blockRepository
      .createQueryBuilder('block')
      .leftJoinAndSelect('block.tags', 'tag')
      .where('block.user.id = :userId', { userId });
  }

  private toBlockResponse(block: Block): BlockResponseDto {
    return {
      id: block.id,
      title: block.title,
      reason: block.reason,
      status: block.status,
      startedAt: block.startedAt,
      resolvedAt: block.resolvedAt,
      duration: block.duration,
      createdAt: block.createdAt,
      updatedAt: block.updatedAt,
      tags:
        block.tags?.map((tag) => ({
          id: tag.id,
          name: tag.name,
          description: tag.description,
          color: tag.color,
          createdAt: tag.createdAt,
          updatedAt: tag.updatedAt,
        })) || [],
    };
  }
}
