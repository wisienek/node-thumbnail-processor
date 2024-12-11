import { z } from 'zod';

export const DatabaseConfigSchema = z.object({
  MONGO_URI: z.string().url('MONGO_URI must be a valid URL').min(1, 'MONGO_URI cannot be empty'),
});

export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;

export const loadDatabaseConfig = (): DatabaseConfig => {
  const databaseConfig = {
    MONGO_URI: process.env.MONGO_URI || '',
  };

  const validationResult = DatabaseConfigSchema.safeParse(databaseConfig);
  if (!validationResult.success) {
    throw new Error(`Invalid database configuration: ${validationResult.error.message}`);
  }

  return validationResult.data;
};
