import { IsIn, IsOptional, IsString } from 'class-validator';
import { QuizStatus } from '../../entities/quiz.entity';

export class UpdateQuizDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsIn(Object.values(QuizStatus))
  status?: string;
}
