import { ThrottlerModuleOptions } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';

export const ThrottlerConfigService = async (
  configService: ConfigService,
): Promise<ThrottlerModuleOptions> => {
  return {
    ttl: configService.get<number>('THROTTLER_TTL'),
    limit: configService.get<number>('THROTTLER_LIMIT'),
  };
};
