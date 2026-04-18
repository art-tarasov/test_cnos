import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from '../entities/quiz.entity';
import { Question } from '../entities/question.entity';
import { QuizAttempt } from '../entities/quiz-attempt.entity';
import { AttemptAnswer } from '../entities/attempt-answer.entity';
import { ParticipationService } from './participation.service';
import { ParticipationController } from './participation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, Question, QuizAttempt, AttemptAnswer])],
  providers: [ParticipationService],
  controllers: [ParticipationController],
})
export class ParticipationModule {}
