import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { QuizModule } from './quiz/quiz.module';
import { ParticipationModule } from './participation/participation.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [DatabaseModule, AuthModule, QuizModule, ParticipationModule],
  controllers: [HealthController],
})
export class AppModule {}
