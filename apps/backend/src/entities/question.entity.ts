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
import type { Quiz } from './quiz.entity';
import type { QuestionOption } from './question-option.entity';
import type { QuestionAnswer } from './question-answer.entity';
import type { ExpectedAnswer } from './expected-answer.entity';

export enum QuestionType {
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  SHORT_TEXT = 'short_text',
}

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'quiz_id' })
  quizId!: string;

  @Column({ type: 'enum', enum: QuestionType })
  type!: QuestionType;

  @Column({ type: 'jsonb' })
  body!: Record<string, unknown>;

  @Column({ type: 'int' })
  position!: number;

  @Column({ type: 'int' })
  points!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne('Quiz', (quiz: Quiz) => quiz.questions)
  @JoinColumn({ name: 'quiz_id' })
  quiz!: Quiz;

  @OneToMany('QuestionOption', (opt: QuestionOption) => opt.question)
  options!: QuestionOption[];

  @OneToMany('QuestionAnswer', (qa: QuestionAnswer) => qa.question)
  answers!: QuestionAnswer[];

  @OneToMany('ExpectedAnswer', (ea: ExpectedAnswer) => ea.question)
  expectedAnswers!: ExpectedAnswer[];
}
