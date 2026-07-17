import { prisma } from '@prismalib'; // Direct import from your library

export class UploadsService {
  async saveImageData(filename: string) {
    const publicUrl = `/assets/${filename}`;
    return prisma.imageRecord.create({
      data: {
        url: publicUrl,
    filename: filename,
  },
  });
  }
}