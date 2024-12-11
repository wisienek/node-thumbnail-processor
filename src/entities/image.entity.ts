import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type HydratedDocument } from 'mongoose';

@Schema()
class Image {
  @Prop({ unique: true })
  id!: string;

  @Prop({ unique: true })
  index!: number;

  @Prop({ type: Buffer })
  thumbnail!: Buffer;
}

type ImageDocument = HydratedDocument<Image>;
const ImageSchema = SchemaFactory.createForClass(Image);

export { type ImageDocument, ImageSchema, Image };
