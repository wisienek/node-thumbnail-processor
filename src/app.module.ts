import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { type ProcessorConfig, type DatabaseConfig, loadAppConfig, loadDatabaseConfig } from './configs';
import { ImprovedProcessor } from './processors/improved.processor';
import { Readers, ReaderService } from './processors/readers';
import CsvReader from './processors/readers/csv.reader';
import { ImageSchema, Image } from './entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [loadAppConfig, loadDatabaseConfig],
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService<DatabaseConfig>) => {
        return { uri: configService.get<string>('MONGO_URI') };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: Image.name, schema: ImageSchema }]),
    HttpModule,
  ],
  providers: [
    ImprovedProcessor,
    {
      provide: ReaderService,
      useFactory: (configService: ConfigService<ProcessorConfig>) => {
        switch (configService.get<Readers>('READER_TYPE')) {
          case Readers.CSV:
            return new CsvReader();
        }
      },
      inject: [ConfigService],
    },
  ],
})
class AppModule {}

export { AppModule };
