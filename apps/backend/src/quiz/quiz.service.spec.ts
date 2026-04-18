import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { Quiz, QuizStatus } from '../entities/quiz.entity';
import { Question, QuestionType } from '../entities/question.entity';
import { QuestionOption } from '../entities/question-option.entity';
import { QuestionAnswer } from '../entities/question-answer.entity';
import { ExpectedAnswer } from '../entities/expected-answer.entity';

const OWNER_ID = 'owner-uuid';
const OTHER_ID = 'other-uuid';
const QUIZ_ID = 'quiz-uuid';
const QUESTION_ID = 'question-uuid';
const OPTION_ID = 'option-uuid';

const makeQuiz = (overrides: Partial<Quiz> = {}): Quiz =>
  ({
    id: QUIZ_ID,
    title: 'My Quiz',
    description: null,
    status: QuizStatus.DRAFT,
    authorId: OWNER_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
    author: {} as never,
    questions: [],
    ...overrides,
  } as Quiz);

const makeQuestion = (overrides: Partial<Question> = {}): Question =>
  ({
    id: QUESTION_ID,
    quizId: QUIZ_ID,
    type: QuestionType.SINGLE_CHOICE,
    body: { text: 'What is 2+2?' },
    position: 1,
    points: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
    quiz: {} as never,
    options: [],
    answers: [],
    expectedAnswers: [],
    ...overrides,
  } as Question);

const mockQuizRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

const mockQuestionRepo = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

const mockOptionRepo = {
  create: jest.fn(),
  save: jest.fn(),
};

const mockAnswerRepo = {
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

const mockExpectedAnswerRepo = {
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

describe('QuizService', () => {
  let service: QuizService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
        { provide: getRepositoryToken(Quiz), useValue: mockQuizRepo },
        { provide: getRepositoryToken(Question), useValue: mockQuestionRepo },
        { provide: getRepositoryToken(QuestionOption), useValue: mockOptionRepo },
        { provide: getRepositoryToken(QuestionAnswer), useValue: mockAnswerRepo },
        { provide: getRepositoryToken(ExpectedAnswer), useValue: mockExpectedAnswerRepo },
      ],
    }).compile();

    service = module.get<QuizService>(QuizService);
    jest.clearAllMocks();
  });

  // AC1 — createQuiz
  describe('createQuiz', () => {
    it('creates quiz with draft status and authorId', async () => {
      const quiz = makeQuiz();
      mockQuizRepo.create.mockReturnValue(quiz);
      mockQuizRepo.save.mockResolvedValue(quiz);

      const result = await service.createQuiz(OWNER_ID, { title: 'My Quiz' });

      expect(result.status).toBe(QuizStatus.DRAFT);
      expect(result.authorId).toBe(OWNER_ID);
      const [created] = mockQuizRepo.create.mock.calls[0] as [Partial<Quiz>];
      expect(created.status).toBe(QuizStatus.DRAFT);
      expect(created.authorId).toBe(OWNER_ID);
    });

    it('throws 400 when title is missing', async () => {
      await expect(service.createQuiz(OWNER_ID, { title: '' })).rejects.toThrow(
        BadRequestException,
      );
      expect(mockQuizRepo.save).not.toHaveBeenCalled();
    });
  });

  // AC2, AC11 — getQuiz ownership at service layer
  describe('getQuiz', () => {
    it('returns quiz for owner', async () => {
      const quiz = makeQuiz();
      mockQuizRepo.findOne.mockResolvedValue(quiz);

      const result = await service.getQuiz(QUIZ_ID, OWNER_ID);

      expect(result.id).toBe(QUIZ_ID);
    });

    it('throws 404 when quiz not found', async () => {
      mockQuizRepo.findOne.mockResolvedValue(null);

      await expect(service.getQuiz(QUIZ_ID, OWNER_ID)).rejects.toThrow(NotFoundException);
    });

    it('throws 403 (not 404) when requester is not the author — AC11', async () => {
      mockQuizRepo.findOne.mockResolvedValue(makeQuiz());

      await expect(service.getQuiz(QUIZ_ID, OTHER_ID)).rejects.toThrow(ForbiddenException);
    });
  });

  // AC3 — updateQuiz
  describe('updateQuiz', () => {
    it('updates title and description', async () => {
      const quiz = makeQuiz();
      mockQuizRepo.findOne.mockResolvedValue(quiz);
      mockQuizRepo.save.mockImplementation(async (q: Quiz) => q);

      const result = await service.updateQuiz(QUIZ_ID, OWNER_ID, {
        title: 'New Title',
        description: 'desc',
      });

      expect(result.title).toBe('New Title');
      expect(result.description).toBe('desc');
    });

    it('allows draft → published transition', async () => {
      const quiz = makeQuiz({ status: QuizStatus.DRAFT });
      mockQuizRepo.findOne.mockResolvedValue(quiz);
      mockQuizRepo.save.mockImplementation(async (q: Quiz) => q);

      const result = await service.updateQuiz(QUIZ_ID, OWNER_ID, { status: 'published' });

      expect(result.status).toBe(QuizStatus.PUBLISHED);
    });

    it('throws 400 for invalid status value', async () => {
      mockQuizRepo.findOne.mockResolvedValue(makeQuiz());

      await expect(
        service.updateQuiz(QUIZ_ID, OWNER_ID, { status: 'archived' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws 400 for published → draft (terminal state)', async () => {
      mockQuizRepo.findOne.mockResolvedValue(makeQuiz({ status: QuizStatus.PUBLISHED }));

      await expect(
        service.updateQuiz(QUIZ_ID, OWNER_ID, { status: 'draft' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws 400 for published → published (terminal state)', async () => {
      mockQuizRepo.findOne.mockResolvedValue(makeQuiz({ status: QuizStatus.PUBLISHED }));

      await expect(
        service.updateQuiz(QUIZ_ID, OWNER_ID, { status: 'published' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws 403 when requester is not the author — AC11', async () => {
      mockQuizRepo.findOne.mockResolvedValue(makeQuiz());

      await expect(service.updateQuiz(QUIZ_ID, OTHER_ID, { title: 'x' })).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // AC4 — deleteQuiz
  describe('deleteQuiz', () => {
    it('deletes quiz for owner', async () => {
      mockQuizRepo.findOne.mockResolvedValue(makeQuiz());
      mockQuizRepo.delete.mockResolvedValue({ affected: 1 });

      await service.deleteQuiz(QUIZ_ID, OWNER_ID);

      expect(mockQuizRepo.delete).toHaveBeenCalledWith({ id: QUIZ_ID });
    });

    it('throws 403 when requester is not the author — AC11', async () => {
      mockQuizRepo.findOne.mockResolvedValue(makeQuiz());

      await expect(service.deleteQuiz(QUIZ_ID, OTHER_ID)).rejects.toThrow(ForbiddenException);
      expect(mockQuizRepo.delete).not.toHaveBeenCalled();
    });
  });

  // AC5 — createQuestion
  describe('createQuestion', () => {
    it('creates question for quiz owner', async () => {
      const question = makeQuestion();
      mockQuizRepo.findOne.mockResolvedValue(makeQuiz());
      mockQuestionRepo.create.mockReturnValue(question);
      mockQuestionRepo.save.mockResolvedValue(question);

      const result = await service.createQuestion(QUIZ_ID, OWNER_ID, {
        type: 'single_choice',
        body: { text: 'What?' },
        position: 1,
        points: 5,
      });

      expect(result.type).toBe(QuestionType.SINGLE_CHOICE);
    });

    it('throws 400 for missing type', async () => {
      mockQuizRepo.findOne.mockResolvedValue(makeQuiz());

      await expect(
        service.createQuestion(QUIZ_ID, OWNER_ID, {
          type: '',
          body: { text: 'x' },
          position: 1,
          points: 5,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws 400 for invalid type enum value', async () => {
      mockQuizRepo.findOne.mockResolvedValue(makeQuiz());

      await expect(
        service.createQuestion(QUIZ_ID, OWNER_ID, {
          type: 'essay',
          body: { text: 'x' },
          position: 1,
          points: 5,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws 400 for missing body.text', async () => {
      mockQuizRepo.findOne.mockResolvedValue(makeQuiz());

      await expect(
        service.createQuestion(QUIZ_ID, OWNER_ID, {
          type: 'single_choice',
          body: { text: '' },
          position: 1,
          points: 5,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws 403 when requester is not the author — AC11', async () => {
      mockQuizRepo.findOne.mockResolvedValue(makeQuiz());

      await expect(
        service.createQuestion(QUIZ_ID, OTHER_ID, {
          type: 'single_choice',
          body: { text: 'x' },
          position: 1,
          points: 5,
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // AC6 — listQuestions
  describe('listQuestions', () => {
    it('returns questions ordered by position for owner', async () => {
      const qs = [makeQuestion({ position: 2 }), makeQuestion({ id: 'q2', position: 1 })];
      mockQuizRepo.findOne.mockResolvedValue(makeQuiz());
      mockQuestionRepo.find.mockResolvedValue(qs);

      const result = await service.listQuestions(QUIZ_ID, OWNER_ID);

      expect(result).toEqual(qs);
      expect(mockQuestionRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ order: { position: 'ASC' } }),
      );
    });

    it('throws 403 for non-owner — AC11', async () => {
      mockQuizRepo.findOne.mockResolvedValue(makeQuiz());

      await expect(service.listQuestions(QUIZ_ID, OTHER_ID)).rejects.toThrow(ForbiddenException);
    });
  });

  // AC7 — updateQuestion
  describe('updateQuestion', () => {
    it('updates question fields', async () => {
      const question = makeQuestion();
      mockQuizRepo.findOne.mockResolvedValue(makeQuiz());
      mockQuestionRepo.findOne.mockResolvedValue(question);
      mockQuestionRepo.save.mockImplementation(async (q: Question) => q);

      const result = await service.updateQuestion(QUIZ_ID, QUESTION_ID, OWNER_ID, {
        points: 20,
      });

      expect(result.points).toBe(20);
    });

    it('throws 404 when question not found within quiz', async () => {
      mockQuizRepo.findOne.mockResolvedValue(makeQuiz());
      mockQuestionRepo.findOne.mockResolvedValue(null);

      await expect(
        service.updateQuestion(QUIZ_ID, QUESTION_ID, OWNER_ID, { points: 5 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // AC8 — deleteQuestion
  describe('deleteQuestion', () => {
    it('deletes question for owner', async () => {
      mockQuizRepo.findOne.mockResolvedValue(makeQuiz());
      mockQuestionRepo.findOne.mockResolvedValue(makeQuestion());
      mockQuestionRepo.delete.mockResolvedValue({ affected: 1 });

      await service.deleteQuestion(QUIZ_ID, QUESTION_ID, OWNER_ID);

      expect(mockQuestionRepo.delete).toHaveBeenCalledWith({ id: QUESTION_ID });
    });
  });

  // AC9 — createOption
  describe('createOption', () => {
    it('creates option for choice question', async () => {
      const option = {
        id: OPTION_ID,
        questionId: QUESTION_ID,
        body: { text: 'Yes' },
        position: 1,
      } as unknown as QuestionOption;
      mockQuizRepo.findOne.mockResolvedValue(makeQuiz());
      mockQuestionRepo.findOne.mockResolvedValue(makeQuestion({ type: QuestionType.SINGLE_CHOICE }));
      mockOptionRepo.create.mockReturnValue(option);
      mockOptionRepo.save.mockResolvedValue(option);

      const result = await service.createOption(QUIZ_ID, QUESTION_ID, OWNER_ID, {
        body: { text: 'Yes' },
        position: 1,
      });

      expect(result.body).toEqual({ text: 'Yes' });
    });

    it('throws 400 for short_text question type', async () => {
      mockQuizRepo.findOne.mockResolvedValue(makeQuiz());
      mockQuestionRepo.findOne.mockResolvedValue(
        makeQuestion({ type: QuestionType.SHORT_TEXT }),
      );

      await expect(
        service.createOption(QUIZ_ID, QUESTION_ID, OWNER_ID, {
          body: { text: 'Yes' },
          position: 1,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // AC10 — setAnswerKey
  describe('setAnswerKey', () => {
    it('sets answer key with optionIds for choice question', async () => {
      const savedAnswers = [{ questionId: QUESTION_ID, optionId: OPTION_ID }] as QuestionAnswer[];
      mockQuizRepo.findOne.mockResolvedValue(makeQuiz());
      mockQuestionRepo.findOne.mockResolvedValue(makeQuestion({ type: QuestionType.SINGLE_CHOICE }));
      mockAnswerRepo.delete.mockResolvedValue({ affected: 0 });
      mockAnswerRepo.create.mockImplementation((data: Partial<QuestionAnswer>) => data);
      mockAnswerRepo.save.mockResolvedValue(savedAnswers);

      const result = await service.setAnswerKey(QUIZ_ID, QUESTION_ID, OWNER_ID, {
        optionIds: [OPTION_ID],
      });

      expect(mockAnswerRepo.delete).toHaveBeenCalledWith({ questionId: QUESTION_ID });
      expect(result).toEqual(savedAnswers);
    });

    it('sets expected answer for short_text question', async () => {
      const savedEa = {
        id: 'ea-uuid',
        questionId: QUESTION_ID,
        body: { text: 'Paris' },
      } as unknown as ExpectedAnswer;
      mockQuizRepo.findOne.mockResolvedValue(makeQuiz());
      mockQuestionRepo.findOne.mockResolvedValue(makeQuestion({ type: QuestionType.SHORT_TEXT }));
      mockExpectedAnswerRepo.delete.mockResolvedValue({ affected: 0 });
      mockExpectedAnswerRepo.create.mockReturnValue(savedEa);
      mockExpectedAnswerRepo.save.mockResolvedValue(savedEa);

      const result = await service.setAnswerKey(QUIZ_ID, QUESTION_ID, OWNER_ID, {
        expectedAnswer: { text: 'Paris' },
      });

      expect(mockExpectedAnswerRepo.delete).toHaveBeenCalledWith({ questionId: QUESTION_ID });
      expect(result).toEqual(savedEa);
    });

    it('throws 400 for type mismatch: optionIds on short_text', async () => {
      mockQuizRepo.findOne.mockResolvedValue(makeQuiz());
      mockQuestionRepo.findOne.mockResolvedValue(makeQuestion({ type: QuestionType.SHORT_TEXT }));

      await expect(
        service.setAnswerKey(QUIZ_ID, QUESTION_ID, OWNER_ID, {
          optionIds: [OPTION_ID],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws 400 for type mismatch: expectedAnswer on choice question', async () => {
      mockQuizRepo.findOne.mockResolvedValue(makeQuiz());
      mockQuestionRepo.findOne.mockResolvedValue(makeQuestion({ type: QuestionType.SINGLE_CHOICE }));

      await expect(
        service.setAnswerKey(QUIZ_ID, QUESTION_ID, OWNER_ID, {
          expectedAnswer: { text: 'Paris' },
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
