import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiResponse } from 'src/common/api.response';
import { MediaUploadService } from '../services/media.upload.service';
import { RequestMediaUploadDto } from '../dto/request.media.upload.dto';
import { SaveMediaUploadDto } from '../dto/save.media.upload.dto';
import { Public } from 'src/domains/admin/auth.guard';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DeleteMediaEvent } from 'src/events/delete.media.event';

@Controller('uploads')
export class MediaUploadController extends ApiResponse {
  constructor(
    private readonly mediaUploadService: MediaUploadService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }

  @Public()
  @Post('upload-url')
  async getUploadUrl(@Body() mediaUploadDto: RequestMediaUploadDto) {
    const preSignedUrls = await Promise.all(
      mediaUploadDto?.files?.map(
        async (file) =>
          await this.mediaUploadService.generatePreSignedUploadUrl(file),
      ),
    );

    return this.response({
      data: preSignedUrls,
    });
  }

  @Public()
  @Post('save')
  async saveFile(@Body() saveMediaUploadDto: SaveMediaUploadDto) {
    return this.response({
      data: this.mediaUploadService.saveUpload(saveMediaUploadDto),
    });
  }

  @Public()
  @Get(':conflictId')
  async getConflictUploads(@Param('conflictId') conflictId: number) {
    return this.response({
      data: this.mediaUploadService.getUploadsForConflict(conflictId),
    });
  }

  @Public()
  @Post('delete')
  async deleteMediaUpload(@Body() { media }: { media: string[] }) {
    const deleteMediaEvent = new DeleteMediaEvent();
    deleteMediaEvent.media = media;

    this.eventEmitter.emit('delete.uploaded-media', deleteMediaEvent);

    return this.response({ data: null });
  }
}
