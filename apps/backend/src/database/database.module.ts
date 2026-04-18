import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { loadDatabaseConfig } from '../config/database.config';
import { User } from '../entities/user.entity';
import { Quiz } from '../entities/quiz.entity';
import { Question } from '../entities/question.entity';
import { QuestionOption } from '../entities/question-option.entity';
import { QuestionAnswer } from '../entities/question-answer.entity';
import { ExpectedAnswer } from '../entities/expected-answer.entity';
import { QuizAttempt } from '../entities/quiz-attempt.entity';
import { AttemptAnswer } from '../entities/attempt-answer.entity';
import { DatabaseHealthService } from './database-health.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const config = loadDatabaseConfig();
        return {
          type: 'postgres',
          ...config,
          entities: [User, Quiz, Question, QuestionOption, QuestionAnswer, ExpectedAnswer, QuizAttempt, AttemptAnswer],
          synchronize: false,
          retryAttempts: 3,
          retryDelay: 3000,
        };
      },
    }),
  ],
  providers: [DatabaseHealthService],
  exports: [DatabaseHealthService],
})
export class DatabaseModule {}
