import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DatabaseHealthService } from './database-health.service';

describe('DatabaseHealthService', () => {
  let service: DatabaseHealthService;
  const mockQuery = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseHealthService,
        { provide: getDataSourceToken(), useValue: { query: mockQuery } },
      ],
    }).compile();

    service = module.get<DatabaseHealthService>(DatabaseHealthService);
    mockQuery.mockClear();
  });

  it('returns true when SELECT 1 succeeds', async () => {
    mockQuery.mockResolvedValue([]);
    expect(await service.isHealthy()).toBe(true);
  });

  it('returns false when query throws', async () => {
    mockQuery.mockRejectedValue(new Error('connection refused'));
    expect(await service.isHealthy()).toBe(false);
  });
});
