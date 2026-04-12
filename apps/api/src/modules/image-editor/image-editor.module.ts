import { Module } from '@nestjs/common';
import { ImageEditorController } from './image-editor.controller';
import { ImageEditorService } from './image-editor.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ImageEditorController],
  providers: [ImageEditorService],
  exports: [ImageEditorService],
})
export class ImageEditorModule {}
