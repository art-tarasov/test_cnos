import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';
import { ParticipationService } from './participation.service';
import type { AttemptResult, ParticipateView } from './participation.service';
import { SubmitAttemptDto } from './dto/submit-attempt.dto';

@Controller('quizzes')
@UseGuards(JwtAuthGuard)
export class ParticipationController {
  constructor(private readonly participationService: ParticipationService) {}

  @Get(':id/participate')
  participate(@Param('id') id: string): Promise<ParticipateView> {
    return this.participationService.getParticipateView(id);
  }

  @Post(':id/attempts')
  submitAttempt(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: SubmitAttemptDto,
  ): Promise<AttemptResult> {
    return this.participationService.submitAttempt(id, user.sub, dto);
  }

  @Get(':id/attempts/:attemptId')
  getAttempt(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Param('attemptId') attemptId: string,
  ): Promise<AttemptResult> {
    return this.participationService.getAttempt(id, attemptId, user.sub);
  }
}
