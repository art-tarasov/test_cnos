import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ExpectedAnswerBodyDto {
  @IsString()
  @IsNotEmpty()
  text!: string;
}

export class SetAnswerKeyDto {
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  optionIds?: string[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ExpectedAnswerBodyDto)
  expectedAnswer?: { text: string };
}
