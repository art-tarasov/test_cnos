export class CreateQuestionDto {
  type!: string;
  body!: { text: string };
  position!: number;
  points!: number;
}
