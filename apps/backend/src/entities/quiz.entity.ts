import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { User } from './user.entity';
import type { Question } from './question.entity';

export enum QuizStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ nullable: true, type: 'varchar' })
  description!: string | null;

  @Column({ type: 'enum', enum: QuizStatus, default: QuizStatus.DRAFT })
  status!: QuizStatus;

  @Column({ name: 'author_id' })
  authorId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne('User', (user: User) => user.quizzes)
  @JoinColumn({ name: 'author_id' })
  author!: User;

  @OneToMany('Question', (question: Question) => question.quiz)
  questions!: Question[];
}
