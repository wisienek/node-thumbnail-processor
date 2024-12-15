type ReaderType = {
  read: <T>(filePath: string, validateDataFunction?: (item: unknown) => item is T) => Promise<T[] | undefined>;
};

enum Readers {
  CSV = 'CSV',
}

const ReaderService = Symbol.for('ReaderService');

export { type ReaderType, Readers, ReaderService };
