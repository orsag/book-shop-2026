import { Controller, Get, Param, Headers, Res, Req } from '@nestjs/common';
import { Request, Response } from 'express';
import { VideoService } from './video.service';
import { Readable } from 'stream';

@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Get(':id/metadata')
  async getVideoMetadata(@Param('id') id: string) {
    const metadata = await this.videoService.getVideoMetadata(id);

    return {
      size: metadata.size,
      mimeType: metadata.mimeType,
    };
  }

  @Get(':id/stream')
  async streamVideo(
    @Param('id') id: string,
    @Headers('range') range: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const metadata = await this.videoService.getVideoMetadata(id);
      const videoSize = metadata.size;

      if (req.method === 'HEAD') {
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Content-Type', metadata.mimeType);
        res.setHeader('Content-Length', metadata.size);
        res.status(200).end();
        return;
      }

      if (!range) {
        res.status(416).set({ 'Content-Range': `bytes */${videoSize}` }).end();
        return;
      }

      const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
      const start = parseInt(startStr, 10);
      let end = endStr
        ? parseInt(endStr, 10)
        : Math.min(start + 1024 * 1024 - 1, videoSize - 1);

      if (isNaN(start) || start < 0 || start >= videoSize) {
        res.status(416).set({ 'Content-Range': `bytes */${videoSize}` }).end();
        return;
      }

      if (isNaN(end) || end < start) {
        res.status(416).set({ 'Content-Range': `bytes */${videoSize}` }).end();
        return;
      }

      if (end >= videoSize) {
        end = videoSize - 1;
      }

      const chunkSize = end - start + 1;

      const chunk = await this.videoService.getVideoChunk(id, start, end);

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${videoSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': metadata.mimeType,
      });

      const stream = Readable.from(Buffer.from(chunk));
      stream.pipe(res);

      req.socket.on('close', () => {
        if (!stream.destroyed) {
          stream.destroy();
        }
      });
    } catch (err) {
      console.error('[VideoStream] Error:', err);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Failed to stream video' });
      } else {
        res.end();
      }
    }
  }
}
