import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as session from 'express-session';
import * as passport from 'passport';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('PORT') ?? 3001;

  app.setGlobalPrefix('api');
  app.use(
    session({
      secret: 'vadsgdsfashjdhgjasdghjasgasfhjasdfgh',
      saveUninitialized: false,
      resave: false,
      cookie: {
        maxAge: 6000000,
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  await app.listen(PORT);
}
bootstrap();
