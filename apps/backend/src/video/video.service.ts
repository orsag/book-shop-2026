import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Readable } from 'stream';

@Injectable()
export class VideoService {
  constructor(private readonly prisma: PrismaService) {}

  async getVideoMetadata(id: string) {
    const video = await this.prisma.client.video.findUnique({
      where: { id },
      select: { id: true, title: true, mimeType: true, size: true },
    });

    if (!video) throw new NotFoundException('Video not found');
    return video;
  }

  async getVideoStream(id: string, start: number, end: number) {
    const video = await this.prisma.client.video.findUnique({
      where: { id },
      select: { data: true, mimeType: true, size: true },
    });

    if (!video) throw new NotFoundException('Video not found');

    // Slice the byte array buffer directly for HTTP Range requests
    const chunk = video.data.subarray(start, end + 1);
    const stream = Readable.from(chunk);

    return {
      stream,
      mimeType: video.mimeType,
      size: video.size,
    };
  }
}
