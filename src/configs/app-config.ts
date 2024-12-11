import { loadProcessorConfig } from './processor.config';
import { loadDatabaseConfig } from './database-config';

export const loadAppConfig = () => {
  return {
    processor: loadProcessorConfig(),
    database: loadDatabaseConfig(),
  };
};

export type AppConfig = ReturnType<typeof loadAppConfig>;
