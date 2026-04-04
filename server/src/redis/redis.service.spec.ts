import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';

jest.mock('ioredis', () => {
  const mockRedis = {
    get: jest.fn(),
    set: jest.fn(),
    quit: jest.fn(),
  };
  return {
    __esModule: true,
    default: jest.fn(() => mockRedis),
  };
});

describe('RedisService', () => {
  let service: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RedisService],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
