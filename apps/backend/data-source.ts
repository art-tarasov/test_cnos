import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './src/entities/user.entity';
import { Quiz } from './src/entities/quiz.entity';
import { Question } from './src/entities/question.entity';
import { QuestionOption } from './src/entities/question-option.entity';
import { QuestionAnswer } from './src/entities/question-answer.entity';
import { ExpectedAnswer } from './src/entities/expected-answer.entity';
import { InitSchema1776384000000 } from './src/migrations/1776384000000-InitSchema';

// Used by the TypeORM CLI only (npm run migration:*).
// Set DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME before running.
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env['DB_HOST'] ?? 'localhost',
  port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
  username: process.env['DB_USER'] ?? '',
  password: process.env['DB_PASSWORD'] ?? '',
  database: process.env['DB_NAME'] ?? '',
  entities: [User, Quiz, Question, QuestionOption, QuestionAnswer, ExpectedAnswer],
  migrations: [InitSchema1776384000000],
  synchronize: false,
});
