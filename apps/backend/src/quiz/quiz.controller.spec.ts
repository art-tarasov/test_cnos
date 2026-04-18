import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Quiz, QuizStatus } from '../entities/quiz.entity';
import { Question, QuestionType } from '../entities/question.entity';
import { UserRole } from '../entities/user.entity';
import type { JwtPayload } from '../auth/jwt.strategy';

const USER: JwtPayload = { sub: 'user-uuid', email: 'a@b.com', role: UserRole.AUTHOR };
const QUIZ_ID = 'quiz-uuid';
const QUESTION_ID = 'q-uuid';

const mockQuiz: Quiz = {
  id: QUIZ_ID,
  title: 'Test Quiz',
  description: null,
  status: QuizStatus.DRAFT,
  authorId: USER.sub,
  createdAt: new Date(),
  updatedAt: new Date(),
  author: {} as never,
  questions: [],
};

const mockQuestion: Question = {
  id: QUESTION_ID,
  quizId: QUIZ_ID,
  type: QuestionType.SINGLE_CHOICE,
  body: { text: 'Q?' },
  position: 1,
  points: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
  quiz: {} as never,
  options: [],
  answers: [],
  expectedAnswers: [],
};

const mockQuizService = {
  createQuiz: jest.fn(),
  getQuiz: jest.fn(),
  updateQuiz: jest.fn(),
  deleteQuiz: jest.fn(),
  createQuestion: jest.fn(),
  listQuestions: jest.fn(),
  updateQuestion: jest.fn(),
  deleteQuestion: jest.fn(),
  createOption: jest.fn(),
  setAnswerKey: jest.fn(),
};

const allowGuard = {
  canActivate: (ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<{ user: JwtPayload }>();
    req.user = USER;
    return true;
  },
};

describe('QuizController', () => {
  let controller: QuizController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizController],
      providers: [{ provide: QuizService, useValue: mockQuizService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(allowGuard)
      .compile();

    controller = module.get<QuizController>(QuizController);
    jest.clearAllMocks();
  });

  describe('POST /quizzes', () => {
    it('delegates to quizService.createQuiz with userId and dto', async () => {
      mockQuizService.createQuiz.mockResolvedValue(mockQuiz);

      const result = await controller.createQuiz(USER, { title: 'Test Quiz' });

      expect(mockQuizService.createQuiz).toHaveBeenCalledWith(USER.sub, { title: 'Test Quiz' });
      expect(result).toEqual(mockQuiz);
    });
  });

  describe('GET /quizzes/:id', () => {
    it('delegates to quizService.getQuiz with id and userId', async () => {
      mockQuizService.getQuiz.mockResolvedValue(mockQuiz);

      const result = await controller.getQuiz(USER, QUIZ_ID);

      expect(mockQuizService.getQuiz).toHaveBeenCalledWith(QUIZ_ID, USER.sub);
      expect(result).toEqual(mockQuiz);
    });
  });

  describe('PATCH /quizzes/:id', () => {
    it('delegates to quizService.updateQuiz', async () => {
      const updated = { ...mockQuiz, title: 'New' };
      mockQuizService.updateQuiz.mockResolvedValue(updated);

      const result = await controller.updateQuiz(USER, QUIZ_ID, { title: 'New' });

      expect(mockQuizService.updateQuiz).toHaveBeenCalledWith(QUIZ_ID, USER.sub, { title: 'New' });
      expect(result.title).toBe('New');
    });
  });

  describe('DELETE /quizzes/:id', () => {
    it('delegates to quizService.deleteQuiz', async () => {
      mockQuizService.deleteQuiz.mockResolvedValue(undefined);

      await controller.deleteQuiz(USER, QUIZ_ID);

      expect(mockQuizService.deleteQuiz).toHaveBeenCalledWith(QUIZ_ID, USER.sub);
    });
  });

  describe('POST /quizzes/:quizId/questions', () => {
    it('delegates to quizService.createQuestion', async () => {
      mockQuizService.createQuestion.mockResolvedValue(mockQuestion);
      const dto = { type: 'single_choice', body: { text: 'Q?' }, position: 1, points: 5 };

      const result = await controller.createQuestion(USER, QUIZ_ID, dto);

      expect(mockQuizService.createQuestion).toHaveBeenCalledWith(QUIZ_ID, USER.sub, dto);
      expect(result).toEqual(mockQuestion);
    });
  });

  describe('GET /quizzes/:quizId/questions', () => {
    it('delegates to quizService.listQuestions', async () => {
      mockQuizService.listQuestions.mockResolvedValue([mockQuestion]);

      const result = await controller.listQuestions(USER, QUIZ_ID);

      expect(mockQuizService.listQuestions).toHaveBeenCalledWith(QUIZ_ID, USER.sub);
      expect(result).toEqual([mockQuestion]);
    });
  });

  describe('PATCH /quizzes/:quizId/questions/:questionId', () => {
    it('delegates to quizService.updateQuestion', async () => {
      const updated = { ...mockQuestion, points: 20 };
      mockQuizService.updateQuestion.mockResolvedValue(updated);

      const result = await controller.updateQuestion(USER, QUIZ_ID, QUESTION_ID, { points: 20 });

      expect(mockQuizService.updateQuestion).toHaveBeenCalledWith(
        QUIZ_ID,
        QUESTION_ID,
        USER.sub,
        { points: 20 },
      );
      expect(result.points).toBe(20);
    });
  });

  describe('DELETE /quizzes/:quizId/questions/:questionId', () => {
    it('delegates to quizService.deleteQuestion', async () => {
      mockQuizService.deleteQuestion.mockResolvedValue(undefined);

      await controller.deleteQuestion(USER, QUIZ_ID, QUESTION_ID);

      expect(mockQuizService.deleteQuestion).toHaveBeenCalledWith(QUIZ_ID, QUESTION_ID, USER.sub);
    });
  });

  describe('POST /quizzes/:quizId/questions/:questionId/options', () => {
    it('delegates to quizService.createOption', async () => {
      const option = { id: 'opt-uuid', questionId: QUESTION_ID, body: { text: 'A' }, position: 1 };
      mockQuizService.createOption.mockResolvedValue(option);
      const dto = { body: { text: 'A' }, position: 1 };

      const result = await controller.createOption(USER, QUIZ_ID, QUESTION_ID, dto);

      expect(mockQuizService.createOption).toHaveBeenCalledWith(QUIZ_ID, QUESTION_ID, USER.sub, dto);
      expect(result).toEqual(option);
    });
  });

  describe('POST /quizzes/:quizId/questions/:questionId/answer-key', () => {
    it('delegates to quizService.setAnswerKey for choice question', async () => {
      const answers = [{ questionId: QUESTION_ID, optionId: 'opt-uuid' }];
      mockQuizService.setAnswerKey.mockResolvedValue(answers);
      const dto = { optionIds: ['opt-uuid'] };

      const result = await controller.setAnswerKey(USER, QUIZ_ID, QUESTION_ID, dto);

      expect(mockQuizService.setAnswerKey).toHaveBeenCalledWith(
        QUIZ_ID,
        QUESTION_ID,
        USER.sub,
        dto,
      );
      expect(result).toEqual(answers);
    });
  });
});
