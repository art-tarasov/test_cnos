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
import { QuestionOption } from '../entities/question-option.entity';
import { QuestionAnswer } from '../entities/question-answer.entity';
import { ExpectedAnswer } from '../entities/expected-answer.entity';
import type { CreateQuizDto } from './dto/create-quiz.dto';
import type { UpdateQuizDto } from './dto/update-quiz.dto';
import type { CreateQuestionDto } from './dto/create-question.dto';
import type { UpdateQuestionDto } from './dto/update-question.dto';
import type { CreateOptionDto } from './dto/create-option.dto';
import type { SetAnswerKeyDto } from './dto/set-answer-key.dto';

const CHOICE_TYPES = new Set<QuestionType>([
  QuestionType.SINGLE_CHOICE,
  QuestionType.MULTIPLE_CHOICE,
  QuestionType.TRUE_FALSE,
]);

const VALID_STATUSES = new Set<string>(Object.values(QuizStatus));
const VALID_QUESTION_TYPES = new Set<string>(Object.values(QuestionType));

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz) private readonly quizzes: Repository<Quiz>,
    @InjectRepository(Question) private readonly questions: Repository<Question>,
    @InjectRepository(QuestionOption) private readonly options: Repository<QuestionOption>,
    @InjectRepository(QuestionAnswer) private readonly answers: Repository<QuestionAnswer>,
    @InjectRepository(ExpectedAnswer)
    private readonly expectedAnswers: Repository<ExpectedAnswer>,
  ) {}

  // --- helpers ---

  private async requireOwnedQuiz(quizId: string, userId: string): Promise<Quiz> {
    const quiz = await this.quizzes.findOne({ where: { id: quizId } });
    if (quiz === null) throw new NotFoundException('Quiz not found');
    if (quiz.authorId !== userId) throw new ForbiddenException('Not the quiz author');
    return quiz;
  }

  private async requireOwnedQuestion(
    quizId: string,
    questionId: string,
    userId: string,
  ): Promise<Question> {
    await this.requireOwnedQuiz(quizId, userId);
    const question = await this.questions.findOne({ where: { id: questionId, quizId } });
    if (question === null) throw new NotFoundException('Question not found');
    return question;
  }

  // --- quizzes ---

  async createQuiz(userId: string, dto: CreateQuizDto): Promise<Quiz> {
    if (!dto.title || dto.title.trim() === '') {
      throw new BadRequestException('title is required');
    }
    const quiz = this.quizzes.create({
      title: dto.title,
      description: dto.description ?? null,
      status: QuizStatus.DRAFT,
      authorId: userId,
    });
    return this.quizzes.save(quiz);
  }

  async getQuiz(quizId: string, userId: string): Promise<Quiz> {
    return this.requireOwnedQuiz(quizId, userId);
  }

  async updateQuiz(quizId: string, userId: string, dto: UpdateQuizDto): Promise<Quiz> {
    const quiz = await this.requireOwnedQuiz(quizId, userId);

    if (dto.status !== undefined) {
      if (!VALID_STATUSES.has(dto.status)) {
        throw new BadRequestException(`Invalid status value: ${dto.status}`);
      }
      const newStatus = dto.status as QuizStatus;
      if (quiz.status === QuizStatus.PUBLISHED && newStatus !== QuizStatus.PUBLISHED) {
        throw new BadRequestException('Invalid status transition: published → draft');
      }
      quiz.status = newStatus;
    }

    if (dto.title !== undefined) {
      quiz.title = dto.title;
    }
    if (dto.description !== undefined) {
      quiz.description = dto.description ?? null;
    }

    return this.quizzes.save(quiz);
  }

  async deleteQuiz(quizId: string, userId: string): Promise<void> {
    await this.requireOwnedQuiz(quizId, userId);
    await this.quizzes.delete({ id: quizId });
  }

  // --- questions ---

  async createQuestion(
    quizId: string,
    userId: string,
    dto: CreateQuestionDto,
  ): Promise<Question> {
    await this.requireOwnedQuiz(quizId, userId);

    if (!dto.type) throw new BadRequestException('type is required');
    if (!dto.body || !dto.body.text) throw new BadRequestException('body.text is required');
    if (dto.position === undefined || dto.position === null) {
      throw new BadRequestException('position is required');
    }
    if (dto.points === undefined || dto.points === null) {
      throw new BadRequestException('points is required');
    }
    if (!VALID_QUESTION_TYPES.has(dto.type)) {
      throw new BadRequestException(`Invalid question type: ${dto.type}`);
    }

    const question = this.questions.create({
      quizId,
      type: dto.type as QuestionType,
      body: dto.body as Record<string, unknown>,
      position: dto.position,
      points: dto.points,
    });
    return this.questions.save(question);
  }

  async listQuestions(quizId: string, userId: string): Promise<Question[]> {
    await this.requireOwnedQuiz(quizId, userId);
    return this.questions.find({ where: { quizId }, order: { position: 'ASC' } });
  }

  async updateQuestion(
    quizId: string,
    questionId: string,
    userId: string,
    dto: UpdateQuestionDto,
  ): Promise<Question> {
    const question = await this.requireOwnedQuestion(quizId, questionId, userId);

    if (dto.body !== undefined) {
      question.body = dto.body as Record<string, unknown>;
    }
    if (dto.position !== undefined) {
      question.position = dto.position;
    }
    if (dto.points !== undefined) {
      question.points = dto.points;
    }

    return this.questions.save(question);
  }

  async deleteQuestion(quizId: string, questionId: string, userId: string): Promise<void> {
    await this.requireOwnedQuestion(quizId, questionId, userId);
    await this.questions.delete({ id: questionId });
  }

  // --- options ---

  async createOption(
    quizId: string,
    questionId: string,
    userId: string,
    dto: CreateOptionDto,
  ): Promise<QuestionOption> {
    const question = await this.requireOwnedQuestion(quizId, questionId, userId);

    if (question.type === QuestionType.SHORT_TEXT) {
      throw new BadRequestException('Options are not valid for short_text questions');
    }
    if (!dto.body || !dto.body.text) throw new BadRequestException('body.text is required');
    if (dto.position === undefined || dto.position === null) {
      throw new BadRequestException('position is required');
    }

    const option = this.options.create({
      questionId,
      body: dto.body as Record<string, unknown>,
      position: dto.position,
    });
    return this.options.save(option);
  }

  // --- answer key ---

  async setAnswerKey(
    quizId: string,
    questionId: string,
    userId: string,
    dto: SetAnswerKeyDto,
  ): Promise<QuestionAnswer[] | ExpectedAnswer> {
    const question = await this.requireOwnedQuestion(quizId, questionId, userId);

    if (question.type === QuestionType.SHORT_TEXT) {
      if (!dto.expectedAnswer || !dto.expectedAnswer.text) {
        throw new BadRequestException(
          'expectedAnswer.text is required for short_text questions',
        );
      }
      if (dto.optionIds !== undefined) {
        throw new BadRequestException('optionIds is not valid for short_text questions');
      }
      await this.expectedAnswers.delete({ questionId });
      const ea = this.expectedAnswers.create({
        questionId,
        body: dto.expectedAnswer as Record<string, unknown>,
      });
      return this.expectedAnswers.save(ea);
    }

    if (!CHOICE_TYPES.has(question.type)) {
      throw new BadRequestException(
        `Cannot set answer key for question type: ${question.type}`,
      );
    }
    if (dto.expectedAnswer !== undefined) {
      throw new BadRequestException('expectedAnswer is not valid for choice questions');
    }
    if (!dto.optionIds || dto.optionIds.length === 0) {
      throw new BadRequestException('optionIds is required for choice questions');
    }

    await this.answers.delete({ questionId });
    const newAnswers = dto.optionIds.map((optionId) =>
      this.answers.create({ questionId, optionId }),
    );
    return this.answers.save(newAnswers);
  }
}
