import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1776384000000 implements MigrationInterface {
  name = 'InitSchema1776384000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(
      `CREATE TYPE "user_role_enum" AS ENUM ('admin', 'author', 'participant')`,
    );
    await queryRunner.query(
      `CREATE TYPE "quiz_status_enum" AS ENUM ('draft', 'published')`,
    );
    await queryRunner.query(
      `CREATE TYPE "question_type_enum" AS ENUM ('single_choice', 'multiple_choice', 'true_false', 'short_text')`,
    );

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id"            uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "email"         varchar     NOT NULL,
        "password_hash" varchar     NOT NULL,
        "role"          "user_role_enum" NOT NULL DEFAULT 'participant',
        "created_at"    TIMESTAMP   NOT NULL DEFAULT now(),
        "updated_at"    TIMESTAMP   NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "quizzes" (
        "id"          uuid            NOT NULL DEFAULT uuid_generate_v4(),
        "title"       varchar         NOT NULL,
        "description" varchar,
        "status"      "quiz_status_enum" NOT NULL DEFAULT 'draft',
        "author_id"   uuid            NOT NULL,
        "created_at"  TIMESTAMP       NOT NULL DEFAULT now(),
        "updated_at"  TIMESTAMP       NOT NULL DEFAULT now(),
        CONSTRAINT "PK_quizzes" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "questions" (
        "id"         uuid                 NOT NULL DEFAULT uuid_generate_v4(),
        "quiz_id"    uuid                 NOT NULL,
        "type"       "question_type_enum" NOT NULL,
        "body"       jsonb                NOT NULL,
        "position"   integer              NOT NULL,
        "points"     integer              NOT NULL,
        "created_at" TIMESTAMP            NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP            NOT NULL DEFAULT now(),
        CONSTRAINT "PK_questions" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "question_options" (
        "id"          uuid    NOT NULL DEFAULT uuid_generate_v4(),
        "question_id" uuid    NOT NULL,
        "body"        jsonb   NOT NULL,
        "position"    integer NOT NULL,
        CONSTRAINT "PK_question_options" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "question_answers" (
        "question_id" uuid NOT NULL,
        "option_id"   uuid NOT NULL,
        CONSTRAINT "PK_question_answers" PRIMARY KEY ("question_id", "option_id"),
        CONSTRAINT "FK_question_answers_question"
          FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_question_answers_option"
          FOREIGN KEY ("option_id") REFERENCES "question_options"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "expected_answers" (
        "id"          uuid  NOT NULL DEFAULT uuid_generate_v4(),
        "question_id" uuid  NOT NULL,
        "body"        jsonb NOT NULL,
        CONSTRAINT "PK_expected_answers" PRIMARY KEY ("id")
      )
    `);

    // FK constraints added after all tables exist
    await queryRunner.query(
      `ALTER TABLE "quizzes" ADD CONSTRAINT "FK_quizzes_author"
        FOREIGN KEY ("author_id") REFERENCES "users"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "questions" ADD CONSTRAINT "FK_questions_quiz"
        FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_options" ADD CONSTRAINT "FK_question_options_question"
        FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "expected_answers" ADD CONSTRAINT "FK_expected_answers_question"
        FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "expected_answers" DROP CONSTRAINT "FK_expected_answers_question"`);
    await queryRunner.query(`ALTER TABLE "question_options" DROP CONSTRAINT "FK_question_options_question"`);
    await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "FK_questions_quiz"`);
    await queryRunner.query(`ALTER TABLE "quizzes" DROP CONSTRAINT "FK_quizzes_author"`);

    await queryRunner.query(`DROP TABLE "expected_answers"`);
    await queryRunner.query(`DROP TABLE "question_answers"`);
    await queryRunner.query(`DROP TABLE "question_options"`);
    await queryRunner.query(`DROP TABLE "questions"`);
    await queryRunner.query(`DROP TABLE "quizzes"`);
    await queryRunner.query(`DROP TABLE "users"`);

    await queryRunner.query(`DROP TYPE "question_type_enum"`);
    await queryRunner.query(`DROP TYPE "quiz_status_enum"`);
    await queryRunner.query(`DROP TYPE "user_role_enum"`);
  }
}
