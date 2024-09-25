import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { jwtConstants } from './constants';
import { NotificationModule } from 'src/notification/notification.module';
import { PassportModule } from '@nestjs/passport';
import { CartModule } from 'src/cart/cart.module';
import { TagModule } from 'src/tag/tag.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      // imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (consfigService: ConfigService) => {
        return {
          secret: consfigService.get<string>('JWT_SECRET'),
          signOptions: { expiresIn: jwtConstants.expiresIn },
        };
      },
      global: true,
    }),
    UserModule,
    NotificationModule,
    PassportModule,
    CartModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
