import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../entities/tag.entity';
import { User } from '../entities/user.entity';
import { CreateTagDto, UpdateTagDto, TagResponseDto } from '../dto';
import { TagStats } from '../common/interfaces';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  async create(userId: string, createTagDto: CreateTagDto): Promise<TagResponseDto> {
    const { name, description, color } = createTagDto;

    // Check if tag with same name already exists for this user
    const existingTag = await this.tagRepository.findOne({
      where: { name, user: { id: userId } },
    });

    if (existingTag) {
      throw new ConflictException('Tag with this name already exists');
    }

    const tag = this.tagRepository.create({
      name,
      description,
      color: color || '#3B82F6',
      user: { id: userId } as User,
    });

    const savedTag = await this.tagRepository.save(tag);
    return this.toTagResponse(savedTag);
  }

  async findAll(userId: string): Promise<TagResponseDto[]> {
    const tags = await this.tagRepository.find({
      where: { user: { id: userId } },
      order: { name: 'ASC' },
    });

    return tags.map(tag => this.toTagResponse(tag));
  }

  async findById(id: string, userId: string): Promise<Tag> {
    const tag = await this.tagRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['blocks'],
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return tag;
  }

  async findOne(id: string, userId: string): Promise<TagResponseDto> {
    const tag = await this.findById(id, userId);
    return this.toTagResponse(tag);
  }

  async update(id: string, userId: string, updateTagDto: UpdateTagDto): Promise<TagResponseDto> {
    const tag = await this.findById(id, userId);
    const { name, description, color } = updateTagDto;

    // Check if updating to a name that already exists (different tag)
    if (name && name !== tag.name) {
      const existingTag = await this.tagRepository.findOne({
        where: { name, user: { id: userId } },
      });

      if (existingTag && existingTag.id !== id) {
        throw new ConflictException('Tag with this name already exists');
      }
    }

    // Update fields
    if (name !== undefined) tag.name = name;
    if (description !== undefined) tag.description = description;
    if (color !== undefined) tag.color = color;

    const updatedTag = await this.tagRepository.save(tag);
    return this.toTagResponse(updatedTag);
  }

  async remove(id: string, userId: string): Promise<void> {
    const tag = await this.findById(id, userId);
    await this.tagRepository.remove(tag);
  }

  async getTagStats(userId: string): Promise<TagStats[]> {
    const result = await this.tagRepository
      .createQueryBuilder('tag')
      .leftJoin('tag.blocks', 'block')
      .select([
        'tag.id as "tagId"',
        'tag.name as "tagName"',
        'tag.color as "tagColor"',
        'COUNT(block.id)::int as "totalBlocks"',
        'COALESCE(SUM(block.duration), 0)::bigint as "totalDuration"',
        'COALESCE(AVG(block.duration), 0)::bigint as "averageDuration"',
      ])
      .where('tag.user.id = :userId', { userId })
      .groupBy('tag.id, tag.name, tag.color')
      .orderBy('totalDuration', 'DESC')
      .getRawMany();

    return result.map(row => ({
      tagId: row.tagId,
      tagName: row.tagName,
      tagColor: row.tagColor,
      totalBlocks: parseInt(row.totalBlocks),
      totalDuration: parseInt(row.totalDuration),
      averageDuration: parseInt(row.averageDuration),
    }));
  }

  private toTagResponse(tag: Tag): TagResponseDto {
    return {
      id: tag.id,
      name: tag.name,
      description: tag.description,
      color: tag.color,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    };
  }
}
