import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ImprovedProcessor } from './processors/improved.processor';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: new Logger() });
  const service = app.get(ImprovedProcessor);

  return await service.process('ForOf');
}

console.time(bootstrap.name);
bootstrap()
  .then(() => {
    console.log(`Finished processing!`);
    console.timeEnd(bootstrap.name);
    process.exit();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
