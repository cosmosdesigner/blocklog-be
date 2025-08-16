import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { User } from './user.entity';
import { Tag } from './tag.entity';

export enum BlockStatus {
  ONGOING = 'ongoing',
  RESOLVED = 'resolved'
}

@Entity('blocks')
export class Block {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  reason: string;

  @Column({
    type: 'enum',
    enum: BlockStatus,
    default: BlockStatus.ONGOING
  })
  status: BlockStatus;

  @CreateDateColumn()
  startedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  resolvedAt: Date | null;

  // Computed duration in milliseconds (can be calculated on-the-fly)
  @Column({ type: 'bigint', default: 0 })
  duration: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.blocks)
  user: User;

  @ManyToMany(() => Tag, tag => tag.blocks)
  @JoinTable({
    name: 'block_tags',
    joinColumn: { name: 'blockId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' }
  })
  tags: Tag[];
}
