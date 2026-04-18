import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Quiz, QuizStatus } from '../entities/quiz.entity';
import { Question, QuestionType } from '../entities/question.entity';
import { QuizAttempt } from '../entities/quiz-attempt.entity';
import { AttemptAnswer } from '../entities/attempt-answer.entity';
import type { SubmitAttemptDto } from './dto/submit-attempt.dto';

export interface ParticipateOption {
  id: string;
  body: Record<string, unknown>;
  position: number;
}

export interface ParticipateQuestion {
  id: string;
  type: QuestionType;
  body: Record<string, unknown>;
  position: number;
  points: number;
  options: ParticipateOption[];
}

export interface ParticipateView {
  id: string;
  title: string;
  description: string | null;
  questions: ParticipateQuestion[];
}

export interface AnswerResult {
  questionId: string;
  correct: boolean;
  pointsAwarded: number;
}

export interface AttemptResult {
  attemptId: string;
  score: number;
  maxScore: number;
  answers: AnswerResult[];
}

const CHOICE_TYPES = new Set<QuestionType>([
  QuestionType.SINGLE_CHOICE,
  QuestionType.MULTIPLE_CHOICE,
  QuestionType.TRUE_FALSE,
]);

@Injectable()
export class ParticipationService {
  constructor(
    @InjectRepository(Quiz) private readonly quizRepo: Repository<Quiz>,
    @InjectRepository(Question) private readonly questionRepo: Repository<Question>,
    @InjectRepository(QuizAttempt) private readonly attemptRepo: Repository<QuizAttempt>,
    @InjectRepository(AttemptAnswer) private readonly attemptAnswerRepo: Repository<AttemptAnswer>,
  ) {}

  async getParticipateView(quizId: string): Promise<ParticipateView> {
    const quiz = await this.quizRepo.findOne({ where: { id: quizId } });
    if (quiz === null) throw new NotFoundException('Quiz not found');
    if (quiz.status === QuizStatus.DRAFT) throw new ForbiddenException('Quiz is not published');

    const questions = await this.questionRepo.find({
      where: { quizId },
      relations: ['options'],
      order: { position: 'ASC' },
    });

    return {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      questions: questions
        .sort((a, b) => a.position - b.position)
        .map((q) => ({
          id: q.id,
          type: q.type,
          body: q.body,
          position: q.position,
          points: q.points,
          options: CHOICE_TYPES.has(q.type)
            ? q.options.map((o) => ({ id: o.id, body: o.body, position: o.position }))
            : [],
        })),
    };
  }

  async submitAttempt(
    quizId: string,
    participantId: string,
    dto: SubmitAttemptDto,
  ): Promise<AttemptResult> {
    const quiz = await this.quizRepo.findOne({ where: { id: quizId } });
    if (quiz === null) throw new NotFoundException('Quiz not found');
    if (quiz.status === QuizStatus.DRAFT) throw new ForbiddenException('Quiz is not published');

    const questions = await this.questionRepo.find({
      where: { quizId },
      relations: ['answers', 'expectedAnswers'],
    });

    this.validateAnswerCoverage(questions, dto);

    const answerMap = new Map(dto.answers.map((a) => [a.questionId, a]));
    let score = 0;
    const maxScore = questions.reduce((sum, q) => sum + q.points, 0);

    const answerResults: AnswerResult[] = questions.map((q) => {
      const submitted = answerMap.get(q.id)!;
      const { correct, pointsAwarded } = this.scoreAnswer(q, submitted);
      score += pointsAwarded;
      return { questionId: q.id, correct, pointsAwarded };
    });

    const attempt = this.attemptRepo.create({ quizId, participantId, score, maxScore });
    const savedAttempt = await this.attemptRepo.save(attempt);

    const answerEntities = questions.map((q) => {
      const submitted = answerMap.get(q.id)!;
      const result = answerResults.find((r) => r.questionId === q.id)!;
      return this.attemptAnswerRepo.create({
        attemptId: savedAttempt.id,
        questionId: q.id,
        optionIds: submitted.optionIds ?? null,
        textAnswer: submitted.textAnswer ?? null,
        correct: result.correct,
        pointsAwarded: result.pointsAwarded,
      });
    });
    await this.attemptAnswerRepo.save(answerEntities);

    return {
      attemptId: savedAttempt.id,
      score,
      maxScore,
      answers: answerResults,
    };
  }

  async getAttempt(quizId: string, attemptId: string, requesterId: string): Promise<AttemptResult> {
    const attempt = await this.attemptRepo.findOne({
      where: { id: attemptId, quizId },
      relations: ['answers'],
    });
    if (attempt === null) throw new NotFoundException('Attempt not found');
    if (attempt.participantId !== requesterId) throw new ForbiddenException('Not your attempt');

    return {
      attemptId: attempt.id,
      score: attempt.score,
      maxScore: attempt.maxScore,
      answers: attempt.answers.map((a) => ({
        questionId: a.questionId,
        correct: a.correct,
        pointsAwarded: a.pointsAwarded,
      })),
    };
  }

  // --- private helpers ---

  private validateAnswerCoverage(
    questions: Question[],
    dto: SubmitAttemptDto,
  ): void {
    const questionIds = new Set(questions.map((q) => q.id));
    const submittedIds = dto.answers.map((a) => a.questionId);

    if (new Set(submittedIds).size !== submittedIds.length) {
      throw new BadRequestException('Duplicate questionId in submission');
    }

    for (const q of questions) {
      if (!submittedIds.includes(q.id)) {
        throw new BadRequestException(`Missing answer for question ${q.id}`);
      }
    }

    for (const a of dto.answers) {
      if (!questionIds.has(a.questionId)) {
        throw new BadRequestException(`Unknown questionId: ${a.questionId}`);
      }
    }
  }

  private scoreAnswer(
    question: Question,
    submitted: { optionIds?: string[]; textAnswer?: string },
  ): { correct: boolean; pointsAwarded: number } {
    if (question.type === QuestionType.SHORT_TEXT) {
      const expected = question.expectedAnswers[0];
      if (expected === undefined) return { correct: false, pointsAwarded: 0 };
      const expectedText = String((expected.body as Record<string, unknown>)['text'] ?? '');
      const correct =
        (submitted.textAnswer ?? '').toLowerCase() === expectedText.toLowerCase();
      return { correct, pointsAwarded: correct ? question.points : 0 };
    }

    if (CHOICE_TYPES.has(question.type)) {
      const correctIds = new Set(question.answers.map((a) => a.optionId));
      const submittedSet = new Set(submitted.optionIds ?? []);
      const correct =
        correctIds.size === submittedSet.size &&
        [...correctIds].every((id) => submittedSet.has(id));
      return { correct, pointsAwarded: correct ? question.points : 0 };
    }

    return { correct: false, pointsAwarded: 0 };
  }
}
