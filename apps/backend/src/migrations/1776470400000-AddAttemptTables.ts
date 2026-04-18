import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAttemptTables1776470400000 implements MigrationInterface {
  name = 'AddAttemptTables1776470400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "quiz_attempts" (
        "id"             uuid      NOT NULL DEFAULT uuid_generate_v4(),
        "quiz_id"        uuid      NOT NULL,
        "participant_id" uuid      NOT NULL,
        "score"          integer   NOT NULL,
        "max_score"      integer   NOT NULL,
        "submitted_at"   TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_quiz_attempts" PRIMARY KEY ("id"),
        CONSTRAINT "FK_quiz_attempts_quiz"
          FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "attempt_answers" (
        "id"             uuid    NOT NULL DEFAULT uuid_generate_v4(),
        "attempt_id"     uuid    NOT NULL,
        "question_id"    uuid    NOT NULL,
        "option_ids"     jsonb,
        "text_answer"    varchar,
        "correct"        boolean NOT NULL,
        "points_awarded" integer NOT NULL,
        CONSTRAINT "PK_attempt_answers" PRIMARY KEY ("id"),
        CONSTRAINT "FK_attempt_answers_attempt"
          FOREIGN KEY ("attempt_id") REFERENCES "quiz_attempts"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "attempt_answers" DROP CONSTRAINT "FK_attempt_answers_attempt"`);
    await queryRunner.query(`DROP TABLE "attempt_answers"`);
    await queryRunner.query(`ALTER TABLE "quiz_attempts" DROP CONSTRAINT "FK_quiz_attempts_quiz"`);
    await queryRunner.query(`DROP TABLE "quiz_attempts"`);
  }
}
