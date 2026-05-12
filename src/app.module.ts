import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RecipesModule } from './recipes/recipes.module';
import { ReviewsModule } from './reviews/reviews.module';
import { FavoritesModule } from './favorites/favorites.module';
import { FollowsModule } from './follows/follows.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.local',
    }),
    AuthModule,
    UsersModule,
    RecipesModule,
    ReviewsModule,
    FavoritesModule,
    FollowsModule,
  ],
})
export class AppModule {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
  }
}
