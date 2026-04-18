import { IsInt, IsNotEmpty, IsObject, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class QuestionBodyDto {
  @IsString()
  @IsNotEmpty()
  text!: string;
}

export class UpdateQuestionDto {
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => QuestionBodyDto)
  body?: { text: string };

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;
}
