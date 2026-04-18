import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from '../entities/quiz.entity';
import { Question } from '../entities/question.entity';
import { QuestionOption } from '../entities/question-option.entity';
import { QuestionAnswer } from '../entities/question-answer.entity';
import { ExpectedAnswer } from '../entities/expected-answer.entity';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, Question, QuestionOption, QuestionAnswer, ExpectedAnswer])],
  providers: [QuizService],
  controllers: [QuizController],
})
export class QuizModule {}
