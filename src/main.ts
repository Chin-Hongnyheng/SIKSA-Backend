import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initializeApp, cert } from 'firebase-admin/app';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount = require('/app/src/firebase-service-account.json');

initializeApp({
  credential: cert(serviceAccount),
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
