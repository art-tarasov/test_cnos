import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { loadDatabaseConfig } from './src/config/database.config';
import { User } from './src/entities/user.entity';
import { Quiz } from './src/entities/quiz.entity';
import { Question } from './src/entities/question.entity';
import { QuestionOption } from './src/entities/question-option.entity';
import { QuestionAnswer } from './src/entities/question-answer.entity';
import { ExpectedAnswer } from './src/entities/expected-answer.entity';
import { InitSchema1776384000000 } from './src/migrations/1776384000000-InitSchema';

// Used by the TypeORM CLI only (npm run migration:*).
// Set DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME before running.
const dbConfig = loadDatabaseConfig();

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...dbConfig,
  entities: [User, Quiz, Question, QuestionOption, QuestionAnswer, ExpectedAnswer],
  migrations: [InitSchema1776384000000],
  synchronize: false,
});
