import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConflictUploads } from '../entities/conflict.media.entity';
import { Repository } from 'typeorm';
import {
  DeleteObjectsCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  MediaUpload,
  RequestMediaUploadDto,
} from '../dto/request.media.upload.dto';
import { SaveMediaUploadDto } from '../dto/save.media.upload.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { DeleteMediaEvent } from 'src/events/delete.media.event';

@Injectable()
export class MediaUploadService {
  private s3Bucket: S3Client;
  constructor(
    @InjectRepository(ConflictUploads)
    private uploadsRepository: Repository<ConflictUploads>,
  ) {
    this.s3Bucket = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SECRET_KEY!,
      },
    });
  }

  async generatePreSignedUploadUrl(mediaUploadDto: MediaUpload) {
    const { name, type } = mediaUploadDto;
    const key = `${crypto.randomUUID()}-${Date.now()}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      ContentType: type,
    });

    const uploadUrl = await getSignedUrl(this.s3Bucket, command, {
      expiresIn: 60,
    });

    return { uploadUrl, fileUrl: key, fileName: name };
  }

  async saveUpload(saveMediaUploadDto: SaveMediaUploadDto) {
    const { fileUrl, conflictId } = saveMediaUploadDto;
    const upload = this.uploadsRepository.create({
      conflict_id: conflictId,
      url: fileUrl,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return this.uploadsRepository.save(upload);
  }

  async getUploadsForConflict(conflictId: number) {
    return this.uploadsRepository.find({
      where: { conflict_id: conflictId },
      order: { created_at: 'DESC' },
    });
  }

  @OnEvent('delete.uploaded-media')
  async deleteUploadedMedia(deleteMediaEvent: DeleteMediaEvent) {
    const { media } = deleteMediaEvent;

    if (!media || media.length === 0) return;

    try {
      const deleteParams = {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Delete: {
          Objects: media.map((fileUrl) => ({ Key: fileUrl })),
        },
      };

      await this.s3Bucket.send(new DeleteObjectsCommand(deleteParams));
    } catch (error) {
      console.error('Failed to delete uploaded media:', error);
    }
  }
}
