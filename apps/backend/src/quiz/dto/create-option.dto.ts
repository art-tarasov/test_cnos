import { IsInt, IsNotEmpty, IsObject, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OptionBodyDto {
  @IsString()
  @IsNotEmpty()
  text!: string;
}

export class CreateOptionDto {
  @IsObject()
  @ValidateNested()
  @Type(() => OptionBodyDto)
  body!: { text: string };

  @IsInt()
  @Min(0)
  position!: number;
}
