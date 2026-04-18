import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { QuizAttempt } from './quiz-attempt.entity';

@Entity('attempt_answers')
export class AttemptAnswer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'attempt_id', type: 'uuid' })
  attemptId!: string;

  @Column({ name: 'question_id', type: 'uuid' })
  questionId!: string;

  @Column({ name: 'option_ids', type: 'jsonb', nullable: true })
  optionIds!: string[] | null;

  @Column({ name: 'text_answer', type: 'varchar', nullable: true })
  textAnswer!: string | null;

  @Column({ type: 'boolean' })
  correct!: boolean;

  @Column({ name: 'points_awarded', type: 'int' })
  pointsAwarded!: number;

  @ManyToOne('QuizAttempt', (a: QuizAttempt) => a.answers)
  @JoinColumn({ name: 'attempt_id' })
  attempt!: QuizAttempt;
}
