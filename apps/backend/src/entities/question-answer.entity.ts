import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import type { Question } from './question.entity';
import type { QuestionOption } from './question-option.entity';

@Entity('question_answers')
export class QuestionAnswer {
  @PrimaryColumn({ name: 'question_id', type: 'uuid' })
  questionId!: string;

  @PrimaryColumn({ name: 'option_id', type: 'uuid' })
  optionId!: string;

  @ManyToOne('Question', (q: Question) => q.answers)
  @JoinColumn({ name: 'question_id' })
  question!: Question;

  @ManyToOne('QuestionOption', (opt: QuestionOption) => opt.answers)
  @JoinColumn({ name: 'option_id' })
  option!: QuestionOption;
}
