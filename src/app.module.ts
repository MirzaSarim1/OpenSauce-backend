import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.local',
    }),
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
    console.log('📝 [AppModule] JWT_SECRET loaded:', secret ? `${secret.substring(0, 10)}...` : 'EMPTY/UNDEFINED');
  }
}
