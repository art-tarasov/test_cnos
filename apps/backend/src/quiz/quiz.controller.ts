import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';
import { QuizService } from './quiz.service';
import type { Quiz } from '../entities/quiz.entity';
import type { Question } from '../entities/question.entity';
import type { QuestionOption } from '../entities/question-option.entity';
import type { QuestionAnswer } from '../entities/question-answer.entity';
import type { ExpectedAnswer } from '../entities/expected-answer.entity';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { CreateOptionDto } from './dto/create-option.dto';
import { SetAnswerKeyDto } from './dto/set-answer-key.dto';

@Controller('quizzes')
@UseGuards(JwtAuthGuard)
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  createQuiz(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateQuizDto,
  ): Promise<Quiz> {
    return this.quizService.createQuiz(user.sub, dto);
  }

  @Get(':id')
  getQuiz(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<Quiz> {
    return this.quizService.getQuiz(id, user.sub);
  }

  @Patch(':id')
  updateQuiz(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateQuizDto,
  ): Promise<Quiz> {
    return this.quizService.updateQuiz(id, user.sub, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteQuiz(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<void> {
    return this.quizService.deleteQuiz(id, user.sub);
  }

  @Post(':quizId/questions')
  createQuestion(
    @CurrentUser() user: JwtPayload,
    @Param('quizId') quizId: string,
    @Body() dto: CreateQuestionDto,
  ): Promise<Question> {
    return this.quizService.createQuestion(quizId, user.sub, dto);
  }

  @Get(':quizId/questions')
  listQuestions(
    @CurrentUser() user: JwtPayload,
    @Param('quizId') quizId: string,
  ): Promise<Question[]> {
    return this.quizService.listQuestions(quizId, user.sub);
  }

  @Patch(':quizId/questions/:questionId')
  updateQuestion(
    @CurrentUser() user: JwtPayload,
    @Param('quizId') quizId: string,
    @Param('questionId') questionId: string,
    @Body() dto: UpdateQuestionDto,
  ): Promise<Question> {
    return this.quizService.updateQuestion(quizId, questionId, user.sub, dto);
  }

  @Delete(':quizId/questions/:questionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteQuestion(
    @CurrentUser() user: JwtPayload,
    @Param('quizId') quizId: string,
    @Param('questionId') questionId: string,
  ): Promise<void> {
    return this.quizService.deleteQuestion(quizId, questionId, user.sub);
  }

  @Post(':quizId/questions/:questionId/options')
  createOption(
    @CurrentUser() user: JwtPayload,
    @Param('quizId') quizId: string,
    @Param('questionId') questionId: string,
    @Body() dto: CreateOptionDto,
  ): Promise<QuestionOption> {
    return this.quizService.createOption(quizId, questionId, user.sub, dto);
  }

  @Post(':quizId/questions/:questionId/answer-key')
  setAnswerKey(
    @CurrentUser() user: JwtPayload,
    @Param('quizId') quizId: string,
    @Param('questionId') questionId: string,
    @Body() dto: SetAnswerKeyDto,
  ): Promise<QuestionAnswer[] | ExpectedAnswer> {
    return this.quizService.setAnswerKey(quizId, questionId, user.sub, dto);
  }
}
