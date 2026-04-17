import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Question } from './question.entity';

@Entity('expected_answers')
export class ExpectedAnswer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'question_id' })
  questionId!: string;

  @Column({ type: 'jsonb' })
  body!: Record<string, unknown>;

  @ManyToOne('Question', (q: Question) => q.expectedAnswers)
  @JoinColumn({ name: 'question_id' })
  question!: Question;
}
