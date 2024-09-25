import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeORMConfigService = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => {
  console.log(configService.get<string>('DATABASE_PASSWORD'));
  return {
    type: 'postgres',
    host: configService.get<string>('DATABASE_HOST'),
    port: configService.get<number>('DATABASE_PORT'),
    username: configService.get<string>('DATABASE_USERNAME'),
    password: configService.get<string>('DATABASE_PASSWORD'),
    database: configService.get<string>('DATABASE_NAME'),
    entities: ['dist/**/*.entity{.ts,.js}'],
    synchronize: true,
    logging: false,
  };
};
