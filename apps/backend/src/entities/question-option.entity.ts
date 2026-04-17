import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Question } from './question.entity';
import type { QuestionAnswer } from './question-answer.entity';

@Entity('question_options')
export class QuestionOption {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'question_id', type: 'uuid' })
  questionId!: string;

  @Column({ type: 'jsonb' })
  body!: Record<string, unknown>;

  @Column({ type: 'int' })
  position!: number;

  @ManyToOne('Question', (q: Question) => q.options)
  @JoinColumn({ name: 'question_id' })
  question!: Question;

  @OneToMany('QuestionAnswer', (qa: QuestionAnswer) => qa.option)
  answers!: QuestionAnswer[];
}
