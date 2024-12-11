// @ts-nocheck
import { join } from 'path';
import { default as axios } from 'axios';
import { chunk } from 'lodash';
import sharp from 'sharp';
import mongoose from 'mongoose';
import { readFileSync } from 'node:fs';
require('dotenv').config();

// { useNewUrlParser: true, useUnifiedTopology: true }
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

const ImageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  index: { type: Number, required: true },
  thumbnail: { type: Buffer, required: true },
});

const ImageModel = mongoose.model('Image', ImageSchema);

class ImageProcessor {
  private logger: Console;

  constructor() {
    this.logger = console;
  }

  async start() {
    const batchSize = parseInt(process.env.DEFAULT_BATCH_SIZE, 10);
    const filePath = join(__dirname, '../../', `data/data.csv`);
    const data = readFileSync(filePath, 'utf-8');
    const rows = this.parseCSV(data);

    this.logger.info(`Batch size: ${batchSize}`);
    this.logger.info(`Items: ${rows.length}`);

    const rawList = rows.map((row) => ({
      index: row.index,
      id: row.id,
      url: row.url,
      thumbnail: null,
    }));

    const chunks = chunk(rawList, batchSize);

    this.logger.info('Starting batch...');

    for (const chunk of chunks) {
      try {
        const images = await this.processChunk(chunk, batchSize);

        await ImageModel.insertMany(images, { ordered: false });

        this.logger.info(`Processed batch size: ${images.length}`);
        this.logger.info(
          `Last processed index: ${chunk[chunk.length - 1]['index']}, Last processed ID: ${chunk[chunk.length - 1]['id']}`
        );

        if (global.gc) global.gc();
      } catch (error) {
        this.logger.error(`Error processing batch: ${error.message}`);
      }
    }
  }

  async processChunk(rawEntities, batchSize) {
    const tasks = rawEntities.map((rawEntity) => this.createThumbnail(rawEntity));

    return Promise.all(tasks);
  }

  async createThumbnail(rawEntity) {
    try {
      const response = await axios.get(rawEntity.url, { responseType: 'arraybuffer' });
      const buffer = await sharp(response.data).resize(100, 100).toBuffer();

      rawEntity.thumbnail = buffer;
      delete rawEntity.url;
      return rawEntity;
    } catch (error) {
      this.logger.error(`Error creating thumbnail for ID ${rawEntity.id}: ${error.message}`);
      return null;
    }
  }

  parseCSV(data) {
    const rows = data.split('\n');
    const headers = rows.shift().split(',');
    return rows.map((row) => {
      const values = row.split(',');
      return headers.reduce((obj, header, index) => {
        obj[header.trim()] = values[index]?.trim();
        return obj;
      }, {});
    });
  }
}
console.time(ImageProcessor.name);
new ImageProcessor().start().then(() => console.timeEnd(ImageProcessor.name));

export { ImageProcessor };
