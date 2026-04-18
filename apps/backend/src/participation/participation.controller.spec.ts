import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ParticipationController } from './participation.controller';
import { ParticipationService } from './participation.service';
import type { JwtPayload } from '../auth/jwt.strategy';
import { UserRole } from '../entities/user.entity';
import type { ParticipateView, AttemptResult } from './participation.service';
import { QuestionType } from '../entities/question.entity';

const QUIZ_ID = 'quiz-uuid';
const ATTEMPT_ID = 'attempt-uuid';
const USER_ID = 'user-uuid';

const mockUser: JwtPayload = { sub: USER_ID, email: 'test@example.com', role: UserRole.PARTICIPANT };

const mockView: ParticipateView = {
  id: QUIZ_ID,
  title: 'Test Quiz',
  description: null,
  questions: [
    {
      id: 'q-uuid',
      type: QuestionType.SINGLE_CHOICE,
      body: { text: 'Q?' },
      position: 1,
      points: 10,
      options: [{ id: 'o-uuid', body: { text: 'A' }, position: 1 }],
    },
  ],
};

const mockResult: AttemptResult = {
  attemptId: ATTEMPT_ID,
  score: 10,
  maxScore: 10,
  answers: [{ questionId: 'q-uuid', correct: true, pointsAwarded: 10 }],
};

const mockService = {
  getParticipateView: jest.fn(),
  submitAttempt: jest.fn(),
  getAttempt: jest.fn(),
};

describe('ParticipationController', () => {
  let controller: ParticipationController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParticipationController],
      providers: [{ provide: ParticipationService, useValue: mockService }],
    }).compile();
    controller = module.get<ParticipationController>(ParticipationController);
  });

  describe('GET /quizzes/:id/participate', () => {
    it('delegates to service.getParticipateView', async () => {
      mockService.getParticipateView.mockResolvedValue(mockView);
      const result = await controller.participate(QUIZ_ID);
      expect(mockService.getParticipateView).toHaveBeenCalledWith(QUIZ_ID);
      expect(result).toEqual(mockView);
    });

    it('propagates NotFoundException from service', async () => {
      mockService.getParticipateView.mockRejectedValue(new NotFoundException());
      await expect(controller.participate(QUIZ_ID)).rejects.toThrow(NotFoundException);
    });

    it('propagates ForbiddenException for draft quiz', async () => {
      mockService.getParticipateView.mockRejectedValue(new ForbiddenException());
      await expect(controller.participate(QUIZ_ID)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('POST /quizzes/:id/attempts', () => {
    const dto = { answers: [{ questionId: 'q-uuid', optionIds: ['o-uuid'] }] };

    it('delegates to service.submitAttempt with user id', async () => {
      mockService.submitAttempt.mockResolvedValue(mockResult);
      const result = await controller.submitAttempt(mockUser, QUIZ_ID, dto);
      expect(mockService.submitAttempt).toHaveBeenCalledWith(QUIZ_ID, USER_ID, dto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('GET /quizzes/:id/attempts/:attemptId', () => {
    it('delegates to service.getAttempt with user id', async () => {
      mockService.getAttempt.mockResolvedValue(mockResult);
      const result = await controller.getAttempt(mockUser, QUIZ_ID, ATTEMPT_ID);
      expect(mockService.getAttempt).toHaveBeenCalledWith(QUIZ_ID, ATTEMPT_ID, USER_ID);
      expect(result).toEqual(mockResult);
    });

    it('propagates ForbiddenException when requester is not owner', async () => {
      mockService.getAttempt.mockRejectedValue(new ForbiddenException());
      await expect(controller.getAttempt(mockUser, QUIZ_ID, ATTEMPT_ID)).rejects.toThrow(ForbiddenException);
    });
  });
});
