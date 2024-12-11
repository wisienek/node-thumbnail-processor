import { z } from 'zod';
import { Readers } from '../processors/readers';

export const ProcessorConfigSchema = z.object({
  DEFAULT_BATCH_SIZE: z.number().min(1, 'DEFAULT_BATCH_SIZE must be at least 1'),
  READER_TYPE: z.nativeEnum(Readers).default(Readers.CSV),
  FILE_PATH: z.string().min(3),
  THUMBNAIL_WIDTH: z.number().min(100).default(100),
  THUMBNAIL_HEIGHT: z.number().min(100).default(100),
});

export type ProcessorConfig = z.infer<typeof ProcessorConfigSchema>;

export const loadProcessorConfig = (): ProcessorConfig => {
  const processorConfig = {
    DEFAULT_BATCH_SIZE: parseInt(process.env.DEFAULT_BATCH_SIZE || '1', 10),
    READER_TYPE: process.env.READER_TYPE || Readers.CSV,
    FILE_PATH: process.env.FILE_PATH || './data/data.csv',
    THUMBNAIL_WIDTH: parseInt(process.env.THUMBNAIL_WIDTH || '100', 10),
    THUMBNAIL_HEIGHT: parseInt(process.env.THUMBNAIL_HEIGHT || '100', 10),
  };

  const validationResult = ProcessorConfigSchema.safeParse(processorConfig);
  if (!validationResult.success) {
    throw new Error(`Invalid processor configuration: ${validationResult.error.message}`);
  }

  return validationResult.data;
};
