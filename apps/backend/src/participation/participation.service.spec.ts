import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ParticipationService } from './participation.service';
import { Quiz, QuizStatus } from '../entities/quiz.entity';
import { Question, QuestionType } from '../entities/question.entity';
import { QuestionOption } from '../entities/question-option.entity';
import { QuestionAnswer } from '../entities/question-answer.entity';
import { ExpectedAnswer } from '../entities/expected-answer.entity';
import { QuizAttempt } from '../entities/quiz-attempt.entity';
import { AttemptAnswer } from '../entities/attempt-answer.entity';

const QUIZ_ID = 'quiz-uuid';
const Q1_ID = 'q1-uuid';
const Q2_ID = 'q2-uuid';
const Q3_ID = 'q3-uuid';
const OPT_A = 'opt-a-uuid';
const OPT_B = 'opt-b-uuid';
const USER_ID = 'user-uuid';
const OTHER_ID = 'other-uuid';
const ATTEMPT_ID = 'attempt-uuid';

const makeQuiz = (status: QuizStatus = QuizStatus.PUBLISHED): Quiz =>
  ({
    id: QUIZ_ID,
    title: 'Test Quiz',
    description: null,
    status,
    authorId: 'author-uuid',
    createdAt: new Date(),
    updatedAt: new Date(),
    author: {} as never,
    questions: [],
  } as Quiz);

const makeSingleChoiceQuestion = (): Question =>
  ({
    id: Q1_ID,
    quizId: QUIZ_ID,
    type: QuestionType.SINGLE_CHOICE,
    body: { text: 'What is 2+2?' },
    position: 1,
    points: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
    options: [
      { id: OPT_A, questionId: Q1_ID, body: { text: '3' }, position: 1, answers: [], question: {} as never } as QuestionOption,
      { id: OPT_B, questionId: Q1_ID, body: { text: '4' }, position: 2, answers: [], question: {} as never } as QuestionOption,
    ],
    answers: [{ questionId: Q1_ID, optionId: OPT_B } as QuestionAnswer],
    expectedAnswers: [],
    quiz: {} as never,
  } as Question);

const makeShortTextQuestion = (): Question =>
  ({
    id: Q2_ID,
    quizId: QUIZ_ID,
    type: QuestionType.SHORT_TEXT,
    body: { text: 'Name a primary colour' },
    position: 2,
    points: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    options: [],
    answers: [],
    expectedAnswers: [
      { id: 'ea-uuid', questionId: Q2_ID, body: { text: 'Red' }, question: {} as never } as ExpectedAnswer,
    ],
    quiz: {} as never,
  } as Question);

const makeMultiChoiceQuestion = (): Question =>
  ({
    id: Q3_ID,
    quizId: QUIZ_ID,
    type: QuestionType.MULTIPLE_CHOICE,
    body: { text: 'Which are primary colours?' },
    position: 3,
    points: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
    options: [
      { id: OPT_A, questionId: Q3_ID, body: { text: 'Red' }, position: 1, answers: [], question: {} as never } as QuestionOption,
      { id: OPT_B, questionId: Q3_ID, body: { text: 'Green' }, position: 2, answers: [], question: {} as never } as QuestionOption,
    ],
    answers: [
      { questionId: Q3_ID, optionId: OPT_A } as QuestionAnswer,
      { questionId: Q3_ID, optionId: OPT_B } as QuestionAnswer,
    ],
    expectedAnswers: [],
    quiz: {} as never,
  } as Question);

const mockQuizRepo = { findOne: jest.fn() };
const mockQuestionRepo = { find: jest.fn() };
const mockAttemptRepo = { create: jest.fn(), save: jest.fn(), findOne: jest.fn() };
const mockAttemptAnswerRepo = { create: jest.fn(), save: jest.fn() };

describe('ParticipationService', () => {
  let service: ParticipationService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParticipationService,
        { provide: getRepositoryToken(Quiz), useValue: mockQuizRepo },
        { provide: getRepositoryToken(Question), useValue: mockQuestionRepo },
        { provide: getRepositoryToken(QuizAttempt), useValue: mockAttemptRepo },
        { provide: getRepositoryToken(AttemptAnswer), useValue: mockAttemptAnswerRepo },
      ],
    }).compile();
    service = module.get<ParticipationService>(ParticipationService);
  });

  // --- getParticipateView ---

  describe('getParticipateView', () => {
    it('returns published quiz with questions and options, no answer keys', async () => {
      const q1 = makeSingleChoiceQuestion();
      const q2 = makeShortTextQuestion();
      mockQuizRepo.findOne.mockResolvedValue(makeQuiz(QuizStatus.PUBLISHED));
      mockQuestionRepo.find.mockResolvedValue([q1, q2]);

      const result = await service.getParticipateView(QUIZ_ID);

      expect(result.id).toBe(QUIZ_ID);
      expect(result.questions).toHaveLength(2);

      const resultQ1 = result.questions.find((q) => q.id === Q1_ID)!;
      expect(resultQ1.options).toHaveLength(2);
      // AC6: no answer key fields
      expect(Object.keys(resultQ1)).not.toContain('answers');
      expect(Object.keys(resultQ1)).not.toContain('expectedAnswers');

      const resultQ2 = result.questions.find((q) => q.id === Q2_ID)!;
      expect(resultQ2.options).toHaveLength(0);
    });

    it('throws NotFoundException when quiz does not exist', async () => {
      mockQuizRepo.findOne.mockResolvedValue(null);
      await expect(service.getParticipateView(QUIZ_ID)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when quiz is draft', async () => {
      mockQuizRepo.findOne.mockResolvedValue(makeQuiz(QuizStatus.DRAFT));
      await expect(service.getParticipateView(QUIZ_ID)).rejects.toThrow(ForbiddenException);
    });

    it('orders questions by position', async () => {
      const q1 = makeSingleChoiceQuestion();
      const q2 = makeShortTextQuestion();
      mockQuizRepo.findOne.mockResolvedValue(makeQuiz());
      mockQuestionRepo.find.mockResolvedValue([q2, q1]);

      const result = await service.getParticipateView(QUIZ_ID);
      expect(result.questions[0].id).toBe(Q1_ID);
      expect(result.questions[1].id).toBe(Q2_ID);
    });
  });

  // --- submitAttempt ---

  describe('submitAttempt', () => {
    it('scores a correct single-choice answer', async () => {
      mockQuizRepo.findOne.mockResolvedValue(makeQuiz());
      mockQuestionRepo.find.mockResolvedValue([makeSingleChoiceQuestion()]);
      mockAttemptRepo.create.mockImplementation((v: Partial<QuizAttempt>) => v);
      mockAttemptRepo.save.mockImplementation(async (v: QuizAttempt) => ({ ...v, id: ATTEMPT_ID, submittedAt: new Date() }));
      mockAttemptAnswerRepo.create.mockImplementation((v: Partial<AttemptAnswer>) => v);
      mockAttemptAnswerRepo.save.mockImplementation(async (v: AttemptAnswer[]) => v);

      const result = await service.submitAttempt(QUIZ_ID, USER_ID, {
        answers: [{ questionId: Q1_ID, optionIds: [OPT_B] }],
      });

      expect(result.attemptId).toBe(ATTEMPT_ID);
      expect(result.score).toBe(10);
      expect(result.maxScore).toBe(10);
      expect(result.answers[0]).toMatchObject({ questionId: Q1_ID, correct: true, pointsAwarded: 10 });
    });

    it('scores an incorrect single-choice answer', async () => {
      mockQuizRepo.findOne.mockResolvedValue(makeQuiz());
      mockQuestionRepo.find.mockResolvedValue([makeSingleChoiceQuestion()]);
      mockAttemptRepo.create.mockImplementation((v: Partial<QuizAttempt>) => v);
      mockAttemptRepo.save.mockImplementation(async (v: QuizAttempt) => ({ ...v, id: ATTEMPT_ID, submittedAt: new Date() }));
      mockAttemptAnswerRepo.create.mockImplementation((v: Partial<AttemptAnswer>) => v);
      mockAttemptAnswerRepo.save.mockImplementation(async (v: AttemptAnswer[]) => v);

      const result = await service.submitAttempt(QUIZ_ID, USER_ID, {
        answers: [{ questionId: Q1_ID, optionIds: [OPT_A] }],
      });

      expect(result.score).toBe(0);
      expect(result.answers[0]).toMatchObject({ correct: false, pointsAwarded: 0 });
    });

    it('scores a correct short-text answer (case-insensitive)', async () => {
      mockQuizRepo.findOne.mockResolvedValue(makeQuiz());
      mockQuestionRepo.find.mockResolvedValue([makeShortTextQuestion()]);
      mockAttemptRepo.create.mockImplementation((v: Partial<QuizAttempt>) => v);
      mockAttemptRepo.save.mockImplementation(async (v: QuizAttempt) => ({ ...v, id: ATTEMPT_ID, submittedAt: new Date() }));
      mockAttemptAnswerRepo.create.mockImplementation((v: Partial<AttemptAnswer>) => v);
      mockAttemptAnswerRepo.save.mockImplementation(async (v: AttemptAnswer[]) => v);

      const result = await service.submitAttempt(QUIZ_ID, USER_ID, {
        answers: [{ questionId: Q2_ID, textAnswer: 'red' }],
      });

      expect(result.score).toBe(5);
      expect(result.answers[0]).toMatchObject({ correct: true, pointsAwarded: 5 });
    });

    it('scores an incorrect short-text answer', async () => {
      mockQuizRepo.findOne.mockResolvedValue(makeQuiz());
      mockQuestionRepo.find.mockResolvedValue([makeShortTextQuestion()]);
      mockAttemptRepo.create.mockImplementation((v: Partial<QuizAttempt>) => v);
      mockAttemptRepo.save.mockImplementation(async (v: QuizAttempt) => ({ ...v, id: ATTEMPT_ID, submittedAt: new Date() }));
      mockAttemptAnswerRepo.create.mockImplementation((v: Partial<AttemptAnswer>) => v);
      mockAttemptAnswerRepo.save.mockImplementation(async (v: AttemptAnswer[]) => v);

      const result = await service.submitAttempt(QUIZ_ID, USER_ID, {
        answers: [{ questionId: Q2_ID, textAnswer: 'blue' }],
      });

      expect(result.score).toBe(0);
      expect(result.answers[0]).toMatchObject({ correct: false, pointsAwarded: 0 });
    });

    it('scores a correct multiple-choice answer (all options matched)', async () => {
      mockQuizRepo.findOne.mockResolvedValue(makeQuiz());
      mockQuestionRepo.find.mockResolvedValue([makeMultiChoiceQuestion()]);
      mockAttemptRepo.create.mockImplementation((v: Partial<QuizAttempt>) => v);
      mockAttemptRepo.save.mockImplementation(async (v: QuizAttempt) => ({ ...v, id: ATTEMPT_ID, submittedAt: new Date() }));
      mockAttemptAnswerRepo.create.mockImplementation((v: Partial<AttemptAnswer>) => v);
      mockAttemptAnswerRepo.save.mockImplementation(async (v: AttemptAnswer[]) => v);

      const result = await service.submitAttempt(QUIZ_ID, USER_ID, {
        answers: [{ questionId: Q3_ID, optionIds: [OPT_B, OPT_A] }],
      });

      expect(result.score).toBe(10);
      expect(result.answers[0]).toMatchObject({ correct: true, pointsAwarded: 10 });
    });

    it('scores a wrong multiple-choice answer (partial match)', async () => {
      mockQuizRepo.findOne.mockResolvedValue(makeQuiz());
      mockQuestionRepo.find.mockResolvedValue([makeMultiChoiceQuestion()]);
      mockAttemptRepo.create.mockImplementation((v: Partial<QuizAttempt>) => v);
      mockAttemptRepo.save.mockImplementation(async (v: QuizAttempt) => ({ ...v, id: ATTEMPT_ID, submittedAt: new Date() }));
      mockAttemptAnswerRepo.create.mockImplementation((v: Partial<AttemptAnswer>) => v);
      mockAttemptAnswerRepo.save.mockImplementation(async (v: AttemptAnswer[]) => v);

      const result = await service.submitAttempt(QUIZ_ID, USER_ID, {
        answers: [{ questionId: Q3_ID, optionIds: [OPT_A] }],
      });

      expect(result.score).toBe(0);
      expect(result.answers[0]).toMatchObject({ correct: false, pointsAwarded: 0 });
    });

    it('throws BadRequestException when a question is missing an answer entry', async () => {
      mockQuizRepo.findOne.mockResolvedValue(makeQuiz());
      mockQuestionRepo.find.mockResolvedValue([makeSingleChoiceQuestion(), makeShortTextQuestion()]);

      await expect(
        service.submitAttempt(QUIZ_ID, USER_ID, {
          answers: [{ questionId: Q1_ID, optionIds: [OPT_B] }],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when a duplicate questionId is submitted', async () => {
      mockQuizRepo.findOne.mockResolvedValue(makeQuiz());
      mockQuestionRepo.find.mockResolvedValue([makeSingleChoiceQuestion()]);

      await expect(
        service.submitAttempt(QUIZ_ID, USER_ID, {
          answers: [
            { questionId: Q1_ID, optionIds: [OPT_B] },
            { questionId: Q1_ID, optionIds: [OPT_A] },
          ],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when quiz does not exist', async () => {
      mockQuizRepo.findOne.mockResolvedValue(null);
      await expect(
        service.submitAttempt(QUIZ_ID, USER_ID, { answers: [] }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when quiz is draft', async () => {
      mockQuizRepo.findOne.mockResolvedValue(makeQuiz(QuizStatus.DRAFT));
      await expect(
        service.submitAttempt(QUIZ_ID, USER_ID, { answers: [] }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // --- getAttempt ---

  describe('getAttempt', () => {
    const makeAttempt = (): QuizAttempt =>
      ({
        id: ATTEMPT_ID,
        quizId: QUIZ_ID,
        participantId: USER_ID,
        score: 10,
        maxScore: 10,
        submittedAt: new Date(),
        answers: [
          {
            id: 'aa-uuid',
            attemptId: ATTEMPT_ID,
            questionId: Q1_ID,
            optionIds: [OPT_B],
            textAnswer: null,
            correct: true,
            pointsAwarded: 10,
          } as AttemptAnswer,
        ],
      } as QuizAttempt);

    it('returns an attempt for the owning participant', async () => {
      mockAttemptRepo.findOne.mockResolvedValue(makeAttempt());

      const result = await service.getAttempt(QUIZ_ID, ATTEMPT_ID, USER_ID);
      expect(result.attemptId).toBe(ATTEMPT_ID);
      expect(result.score).toBe(10);
      expect(result.answers).toHaveLength(1);
    });

    it('throws NotFoundException when attempt does not exist', async () => {
      mockAttemptRepo.findOne.mockResolvedValue(null);
      await expect(service.getAttempt(QUIZ_ID, ATTEMPT_ID, USER_ID)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when requester did not make the attempt', async () => {
      mockAttemptRepo.findOne.mockResolvedValue(makeAttempt());
      await expect(service.getAttempt(QUIZ_ID, ATTEMPT_ID, OTHER_ID)).rejects.toThrow(ForbiddenException);
    });
  });
});
