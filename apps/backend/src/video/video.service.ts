import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

  async getVideoChunk(id: string, start: number, end: number) {
    const video = await this.prisma.client.video.findUnique({
      where: { id },
      select: { data: true },
    });

    if (!video) throw new NotFoundException('Video not found');

    const raw: any = video.data;
    if (raw && typeof raw.slice === 'function') {
      return raw.slice(start, end + 1);
    }
    // return Buffer.from(raw).slice(start, end + 1);
    return Buffer.from(raw).subarray(start, end + 1);
  }
}
