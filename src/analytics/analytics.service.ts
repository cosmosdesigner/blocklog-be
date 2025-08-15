import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Block, BlockStatus } from '../entities/block.entity';
import { DashboardStats, MonthlyStats, DailyStats } from '../common/interfaces';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Block)
    private blockRepository: Repository<Block>,
  ) {}

  async getDashboardStats(userId: string): Promise<DashboardStats> {
    // Get basic counts
    const totalBlocks = await this.blockRepository.count({
      where: { user: { id: userId } },
    });

    const ongoingBlocks = await this.blockRepository.count({
      where: { user: { id: userId }, status: BlockStatus.ONGOING },
    });

    const resolvedBlocks = await this.blockRepository.count({
      where: { user: { id: userId }, status: BlockStatus.RESOLVED },
    });

    // Get time-based statistics
    const timeStats = await this.blockRepository
      .createQueryBuilder('block')
      .select([
        'COALESCE(SUM(CASE WHEN block.status = :resolvedStatus THEN block.duration ELSE EXTRACT(EPOCH FROM NOW() - block.startedAt) * 1000 END), 0)::bigint as "totalTimeBlocked"',
        'COALESCE(AVG(CASE WHEN block.status = :resolvedStatus THEN block.duration ELSE EXTRACT(EPOCH FROM NOW() - block.startedAt) * 1000 END), 0)::bigint as "averageBlockTime"',
      ])
      .where('block.user.id = :userId', { userId })
      .setParameters({ resolvedStatus: BlockStatus.RESOLVED })
      .getRawOne();

    // Get longest block
    const longestBlockQuery = await this.blockRepository
      .createQueryBuilder('block')
      .select([
        'block.id as id',
        'block.title as title',
        'CASE WHEN block.status = :resolvedStatus THEN block.duration ELSE EXTRACT(EPOCH FROM NOW() - block.startedAt) * 1000 END as duration',
      ])
      .where('block.user.id = :userId', { userId })
      .setParameters({ resolvedStatus: BlockStatus.RESOLVED })
      .orderBy('duration', 'DESC')
      .limit(1)
      .getRawOne();

    const longestBlock = longestBlockQuery ? {
      id: longestBlockQuery.id,
      title: longestBlockQuery.title,
      duration: parseInt(longestBlockQuery.duration),
    } : null;

    return {
      totalBlocks,
      ongoingBlocks,
      resolvedBlocks,
      totalTimeBlocked: parseInt(timeStats.totalTimeBlocked || '0'),
      averageBlockTime: parseInt(timeStats.averageBlockTime || '0'),
      longestBlock,
    };
  }

  async getMonthlyStats(userId: string, year?: number): Promise<MonthlyStats[]> {
    const targetYear = year || new Date().getFullYear();

    const result = await this.blockRepository
      .createQueryBuilder('block')
      .select([
        'EXTRACT(YEAR FROM block.startedAt)::int as year',
        'EXTRACT(MONTH FROM block.startedAt)::int as month',
        'COUNT(block.id)::int as "totalBlocks"',
        'COALESCE(SUM(CASE WHEN block.status = :resolvedStatus THEN block.duration ELSE EXTRACT(EPOCH FROM NOW() - block.startedAt) * 1000 END), 0)::bigint as "totalDuration"',
        'COALESCE(AVG(CASE WHEN block.status = :resolvedStatus THEN block.duration ELSE EXTRACT(EPOCH FROM NOW() - block.startedAt) * 1000 END), 0)::bigint as "averageDuration"',
      ])
      .where('block.user.id = :userId', { userId })
      .andWhere('EXTRACT(YEAR FROM block.startedAt) = :year', { year: targetYear })
      .setParameters({ resolvedStatus: BlockStatus.RESOLVED })
      .groupBy('EXTRACT(YEAR FROM block.startedAt), EXTRACT(MONTH FROM block.startedAt)')
      .orderBy('year, month')
      .getRawMany();

    return result.map(row => ({
      year: parseInt(row.year),
      month: parseInt(row.month),
      totalBlocks: parseInt(row.totalBlocks),
      totalDuration: parseInt(row.totalDuration),
      averageDuration: parseInt(row.averageDuration),
    }));
  }

  async getDailyStats(userId: string, year?: number, month?: number): Promise<DailyStats[]> {
    const targetYear = year || new Date().getFullYear();
    const targetMonth = month || new Date().getMonth() + 1;

    const result = await this.blockRepository
      .createQueryBuilder('block')
      .select([
        'DATE(block.startedAt) as date',
        'COUNT(block.id)::int as "totalBlocks"',
        'ARRAY_AGG(block.title) as "blockTitles"',
        'COALESCE(SUM(CASE WHEN block.status = :resolvedStatus THEN block.duration ELSE EXTRACT(EPOCH FROM NOW() - block.startedAt) * 1000 END), 0)::bigint as "totalDuration"',
      ])
      .where('block.user.id = :userId', { userId })
      .andWhere('EXTRACT(YEAR FROM block.startedAt) = :year', { year: targetYear })
      .andWhere('EXTRACT(MONTH FROM block.startedAt) = :month', { month: targetMonth })
      .setParameters({ resolvedStatus: BlockStatus.RESOLVED })
      .groupBy('DATE(block.startedAt)')
      .orderBy('date')
      .getRawMany();

    return result.map(row => ({
      date: row.date,
      totalBlocks: parseInt(row.totalBlocks),
      blockTitles: row.blockTitles || [],
      totalDuration: parseInt(row.totalDuration),
    }));
  }

  async getYearlyCalendarData(userId: string, year?: number): Promise<DailyStats[]> {
    const targetYear = year || new Date().getFullYear();

    const result = await this.blockRepository
      .createQueryBuilder('block')
      .select([
        'DATE(block.startedAt) as date',
        'COUNT(block.id)::int as "totalBlocks"',
        'ARRAY_AGG(block.title) as "blockTitles"',
        'COALESCE(SUM(CASE WHEN block.status = :resolvedStatus THEN block.duration ELSE EXTRACT(EPOCH FROM NOW() - block.startedAt) * 1000 END), 0)::bigint as "totalDuration"',
      ])
      .where('block.user.id = :userId', { userId })
      .andWhere('EXTRACT(YEAR FROM block.startedAt) = :year', { year: targetYear })
      .setParameters({ resolvedStatus: BlockStatus.RESOLVED })
      .groupBy('DATE(block.startedAt)')
      .orderBy('date')
      .getRawMany();

    return result.map(row => ({
      date: row.date,
      totalBlocks: parseInt(row.totalBlocks),
      blockTitles: row.blockTitles || [],
      totalDuration: parseInt(row.totalDuration),
    }));
  }

  async exportUserData(userId: string) {
    const blocks = await this.blockRepository.find({
      where: { user: { id: userId } },
      relations: ['tags'],
      order: { createdAt: 'DESC' },
    });

    const exportData = {
      exportDate: new Date().toISOString(),
      totalBlocks: blocks.length,
      blocks: blocks.map(block => ({
        id: block.id,
        title: block.title,
        reason: block.reason,
        status: block.status,
        startedAt: block.startedAt,
        resolvedAt: block.resolvedAt,
        duration: block.duration,
        createdAt: block.createdAt,
        updatedAt: block.updatedAt,
        tags: block.tags?.map(tag => ({
          id: tag.id,
          name: tag.name,
          color: tag.color,
        })) || [],
      })),
    };

    return exportData;
  }
}
