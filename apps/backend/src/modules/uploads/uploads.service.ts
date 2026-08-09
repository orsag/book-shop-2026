import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UploadsService {
  constructor(private prisma: PrismaService) {}

  async saveImageData(filename: string) {
    const publicUrl = `/assets/${filename}`;
    return this.prisma.imageRecord.create({
      data: {
        url: publicUrl,
        filename: filename,
      },
    });
  }
}
