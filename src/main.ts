import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  // Polyfill `globalThis.crypto` for drivers (mongodb v7+) that expect
  // the Web Crypto API to be available globally (Node >=20). This allows
  // running under Node 18 by providing Node's `crypto.webcrypto`.
  if (typeof (globalThis as any).crypto === 'undefined') {
    try {
      const cryptoModule = await import('crypto');
      (globalThis as any).crypto =
        (cryptoModule as any).webcrypto ?? cryptoModule;
    } catch (err) {
      // If polyfill fails, connection may still error; swallow to allow
      // clearer error messages later.
    }
  }

  // Use the explicit .js extension so TypeScript's "nodenext" resolution
  // maps it correctly to `app.module.ts` during build and emits an import
  // that works at runtime.
  const { AppModule } = await import('./app.module.js');
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

bootstrap();
