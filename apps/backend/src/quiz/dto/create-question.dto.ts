import { IsIn, IsInt, IsNotEmpty, IsObject, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType } from '../../entities/question.entity';

class QuestionBodyDto {
  @IsString()
  @IsNotEmpty()
  text!: string;
}

export class CreateQuestionDto {
  @IsIn(Object.values(QuestionType))
  type!: string;

  @IsObject()
  @ValidateNested()
  @Type(() => QuestionBodyDto)
  body!: { text: string };

  @IsInt()
  @Min(0)
  position!: number;

  @IsInt()
  @Min(0)
  points!: number;
}
