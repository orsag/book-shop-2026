import {
  Component,
  ElementRef,
  ViewChild,
  signal,
  computed,
  input,
  effect,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { from } from 'rxjs';

@Component({
  selector: 'app-video-player',
  imports: [],
  templateUrl: './video-player.html',
  styleUrl: './video-player.css',
})
export class VideoPlayer {
  @ViewChild('videoElement', { static: true })
  videoElement!: ElementRef<HTMLVideoElement>;

  // Input Signal: Video ID passed from parent
  readonly videoId = input.required<string>();

  // Telemetry signals for stats UI
  readonly totalBytes = signal<number>(0);
  readonly chunksCount = signal<number>(0);
  readonly duration = signal<number>(0);

  readonly formattedBytes = computed(() => {
    const bytes = this.totalBytes();
    if (bytes === 0) return '0 KB';
    const kb = bytes / 1024;
    return kb > 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb.toFixed(1)} KB`;
  });

  // readonly videoResource = resource({
  //   request: () => ({ id: this.videoId() }),
  //   loader: async ({ request }) => {
  //     const res = await fetch(`/api/videos/${request.id}/stream`, { method: 'HEAD' });
  //     if (!res.ok) throw new Error('Video unreachable');
  //     return {
  //       size: Number(res.headers.get('Content-Length') || 0),
  //       mimeType: res.headers.get('Content-Type') || 'video/mp4',
  //     };
  //   },
  // });

  /**
   * rxResource fetches metadata/readiness info cleanly
   * without messing up low-level TCP sockets or seeking.
   */
  readonly videoResource = rxResource({
    params: () => ({ id: this.videoId() }),
    stream: ({ params }) =>
      from(
        fetch(`/api/videos/${params.id}/metadata`).then((res) => {
          if (!res.ok) throw new Error('Video unreachable');
          return res.json();
        }),
      ),
  });

  constructor() {
    effect(() => {
      const meta = this.videoResource.value();
      const id = this.videoId();

      if (meta && id && this.videoElement) {
        const video = this.videoElement.nativeElement;

        video.pause();
        video.removeAttribute('src');

        video.src = `/api/videos/${id}/stream`;
        video.load();
      }
    });
  }

  onLoadedMetadata() {
    const video = this.videoElement.nativeElement;
    this.duration.set(video.duration);

    video.play().catch(() => {
      console.error('Error loading video');
    });
  }

  onProgress() {
    const video = this.videoElement.nativeElement;

    if (video.buffered.length > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const duration = video.duration || 1;
      const totalSize = this.videoResource.value()?.size || 0;

      this.totalBytes.set(Math.round((bufferedEnd / duration) * totalSize));
      this.chunksCount.set(video.buffered.length);
    }
  }

  onSeeking() {
    // Optional: telemetry or debug logs
  }

  onError(event: any) {
    console.error('Video error:', event);
  }
}
