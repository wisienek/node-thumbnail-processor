import { bufferCount, catchError, concatMap, firstValueFrom, from, lastValueFrom, mergeMap, of } from 'rxjs';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { type Model } from 'mongoose';
import { chunk, omit } from 'lodash';
import { Jimp } from 'jimp';
import { z } from 'zod';
import { ReaderService, type ReaderType } from './readers';
import { Image, type ImageDocument } from '../entities';
import { type ProcessorConfig } from '../configs';

const InputDataZodType = z
  .object({
    index: z.preprocess((value) => (typeof value === 'string' ? Number(value) : value), z.number()),
    id: z.string().uuid(),
    url: z.string().url(),
  })
  .required();

type InputType = z.infer<typeof InputDataZodType>;

type ProcessingMethod = 'ForOf' | 'Observable';

@Injectable()
class ImprovedProcessor {
  private readonly logger = new Logger(ImprovedProcessor.name);

  private readonly thumbnail_height: number;
  private readonly thumbnail_width: number;

  constructor(
    @InjectModel(Image.name) private readonly imageModel: Model<ImageDocument>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<ProcessorConfig, true>,
    @Inject(ReaderService) private readonly reader: ReaderType
  ) {
    this.thumbnail_height = parseInt(this.configService.get<string>('THUMBNAIL_HEIGHT'));
    this.thumbnail_width = parseInt(this.configService.get<string>('THUMBNAIL_WIDTH'));
  }

  public async process(processingMethod: ProcessingMethod): Promise<void> {
    const batchSize = this.configService.get<number>('DEFAULT_BATCH_SIZE');
    const filePath = this.configService.get<string>('FILE_PATH');

    this.logger.log(
      `Will start processing with input data: ${JSON.stringify({
        batchSize,
        filePath,
        thumbnailDimensions: {
          width: this.thumbnail_width,
          height: this.thumbnail_height,
        },
      })}...`
    );

    const dataFromFile = await this.reader.read<InputType>(filePath, this.itemValidationFunction);
    if (!dataFromFile || dataFromFile?.length === 0) {
      this.logger.log(`No data to process, quiting`);
      return;
    }

    this.logger.log(`Read ${dataFromFile.length} rows from file to process`);

    const batched = chunk(dataFromFile, batchSize);

    switch (processingMethod) {
      case 'ForOf':
        return this.processUsingForOf(batched);
      case 'Observable':
        return this.processUsingObservables(dataFromFile, batchSize);
    }
  }

  private async processUsingObservables(dataFromFile: InputType[], batchSize: number): Promise<void> {
    await lastValueFrom(
      from(dataFromFile).pipe(
        mergeMap((item) => this.processItem(item), batchSize),
        bufferCount(batchSize),
        concatMap((processedItems) => {
          const validItems = processedItems.filter((item) => item !== null);
          return from(this.saveToDb(validItems)).pipe(
            catchError((error) => {
              this.logger.error(`Error saving to database: ${error.message}`);
              return of(null);
            })
          );
        }),
        catchError((error) => {
          this.logger.error(`Error in the observable pipeline: ${error.message}`);
          return of(null);
        })
      )
    );
  }

  private async processUsingForOf(batches: InputType[][]): Promise<void> {
    const numberOfButches = batches.length;
    try {
      for (let i = 0; i < numberOfButches; i++) {
        const batch = batches[i];
        this.logger.log(`Will process batch ${i + 1} / ${numberOfButches}`);

        const preparedImages = await Promise.all(batch.map(async (i) => await this.processItem(i)));
        await this.saveToDb(preparedImages);

        this.logger.log(`Finished batch ${i + 1} / ${numberOfButches}`);
      }
    } catch (error) {
      this.logger.error(`Error while processing file: ${error}`);
    }
  }

  private async saveToDb(preparedItems: Image[]): Promise<void> {
    this.logger.debug(`Saving to db ${preparedItems.length} rows`);
    await this.imageModel.insertMany(preparedItems, { ordered: false, throwOnValidationError: true });
  }

  private async processItem(item: InputType): Promise<Image> {
    const thumbnail = await this.createThumbnail(item.url);
    return { ...omit(item, 'url'), thumbnail };
  }

  private async createThumbnail(originalImageUrl: string): Promise<Buffer> {
    const originalItemImage = await firstValueFrom(
      this.httpService.get<ArrayBuffer>(originalImageUrl, { responseType: 'arraybuffer' })
    );
    const image = (await Jimp.fromBuffer(originalItemImage.data)).resize({
      w: this.thumbnail_width,
      h: this.thumbnail_height,
    });

    return image.getBuffer('image/jpeg');
  }

  private itemValidationFunction(item: unknown): item is InputType {
    return InputDataZodType.safeParse(item).success;
  }
}

export { ImprovedProcessor };
