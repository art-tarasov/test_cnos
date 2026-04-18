import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Quiz } from './quiz.entity';
import type { AttemptAnswer } from './attempt-answer.entity';

@Entity('quiz_attempts')
export class QuizAttempt {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'quiz_id', type: 'uuid' })
  quizId!: string;

  @Column({ name: 'participant_id', type: 'uuid' })
  participantId!: string;

  @Column({ type: 'int' })
  score!: number;

  @Column({ name: 'max_score', type: 'int' })
  maxScore!: number;

  @CreateDateColumn({ name: 'submitted_at' })
  submittedAt!: Date;

  @ManyToOne('Quiz')
  @JoinColumn({ name: 'quiz_id' })
  quiz!: Quiz;

  @OneToMany('AttemptAnswer', (a: AttemptAnswer) => a.attempt)
  answers!: AttemptAnswer[];
}
