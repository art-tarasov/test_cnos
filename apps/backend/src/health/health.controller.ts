import { Controller, Get } from '@nestjs/common';
import { DatabaseHealthService } from '../database/database-health.service';

type ServiceStatus = 'ok' | 'degraded';
type DbStatus = 'ok' | 'error';

interface HealthResponse {
  status: ServiceStatus;
  db: DbStatus;
}

@Controller('health')
export class HealthController {
  constructor(private readonly dbHealth: DatabaseHealthService) {}

  @Get()
  async check(): Promise<HealthResponse> {
    const dbHealthy = await this.dbHealth.isHealthy();
    return {
      status: dbHealthy ? 'ok' : 'degraded',
      db: dbHealthy ? 'ok' : 'error',
    };
  }
}
