import { existsSync, readFileSync, statSync } from 'node:fs';
import Papa, { type ParseResult } from 'papaparse';
import { resolve } from 'node:path';
import assert from 'node:assert';
import type { ReaderType } from './reader.type';

class CsvReader implements ReaderType {
  async read<T>(filePath: string, validateDataFunction?: (item: unknown) => item is T): Promise<T[] | undefined> {
    assert(filePath.endsWith('.csv'), `Filepath "${filePath}" isn't in csv format!`);

    const pathFromRoot = resolve(__dirname, '../../..', filePath);
    assert(existsSync(pathFromRoot), `File for path ${filePath} does not exist!`);
    assert(statSync(pathFromRoot).size / (1024 * 1024) <= 120, `File is too large to import! Maximum size is 120Mb`);

    const fileContent = readFileSync(pathFromRoot, { encoding: 'utf-8' });
    const parsed: T[] = [];

    return new Promise((resolve, reject) => {
      Papa.parse<T>(fileContent, {
        header: true,
        skipEmptyLines: true,
        chunk: (results: ParseResult<T>) => {
          if (!validateDataFunction) {
            return;
          }

          try {
            for (const item of results.data) {
              if (!validateDataFunction(item)) {
                throw new Error(`Invalid data encountered: ${JSON.stringify({ item })}`);
              }
            }

            parsed.push(...results.data);
          } catch (error) {
            reject(
              new Error(
                `Data validation failed: ${!!error && typeof error === 'object' && 'message' in error ? error['message'] : error}`
              )
            );
          }
        },
        complete: () => {
          resolve(parsed);
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  }
}

export default CsvReader;
