import { Controller, Get, Param, Headers, Res, Req } from '@nestjs/common';
import { Response } from 'express';
import { VideoService } from './video.service';

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
    const metadata = await this.videoService.getVideoMetadata(id);
    const videoSize = metadata.size;

    // 1 HEAD request → return metadata only
    if (req.method === 'HEAD') {
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Type', metadata.mimeType);
      res.setHeader('Content-Length', metadata.size);
      res.status(200).end();
      return;
    }

    // 2 GET request MUST have Range
    if (!range) {
      res
        .status(416)
        .set({
          'Content-Range': `bytes */${videoSize}`,
        })
        .end();
      return;
    }

    // Parse Range header
    const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
    const start = parseInt(startStr, 10);
    let end = endStr
      ? parseInt(endStr, 10)
      : Math.min(start + 1024 * 1024 - 1, videoSize - 1);

    // Validate range
    if (isNaN(start) || start < 0 || start >= videoSize) {
      res
        .status(416)
        .set({
          'Content-Range': `bytes */${videoSize}`,
        })
        .end();
      return;
    }

    if (isNaN(end) || end < start) {
      res
        .status(416)
        .set({
          'Content-Range': `bytes */${videoSize}`,
        })
        .end();
      return;
    }

    if (end >= videoSize) {
      end = videoSize - 1;
    }

    const chunkSize = end - start + 1;

    // Get chunk from DB or filesystem
    const { stream } = await this.videoService.getVideoStream(id, start, end);

    // Write headers BEFORE piping
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${videoSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': metadata.mimeType,
    });

    // Handle stream errors gracefully
    stream.on('error', (err) => {
      console.error('Video stream error:', err);
      res.end();
    });

    // Pipe raw stream directly to Express
    stream.pipe(res);
  }
}
