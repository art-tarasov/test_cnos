import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { DatabaseHealthService } from '../database/database-health.service';

const mockDbHealth = { isHealthy: jest.fn() };

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: DatabaseHealthService, useValue: mockDbHealth }],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    jest.clearAllMocks();
  });

  it('returns ok/ok when DB is healthy', async () => {
    mockDbHealth.isHealthy.mockResolvedValue(true);
    expect(await controller.check()).toEqual({ status: 'ok', db: 'ok' });
  });

  it('returns degraded/error when DB is unhealthy', async () => {
    mockDbHealth.isHealthy.mockResolvedValue(false);
    expect(await controller.check()).toEqual({ status: 'degraded', db: 'error' });
  });
});
