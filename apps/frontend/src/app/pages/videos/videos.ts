import { Component, signal } from '@angular/core';
import { VideoPlayer } from '@component';
import { LucidePlay, LucideFilm, LucideFrown } from '@lucide/angular';

interface VideoItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  badge: string;
}

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [VideoPlayer, LucidePlay, LucideFilm, LucideFrown],
  templateUrl: './videos.html',
})
export class VideosComponent {
  readonly isLoading = signal<boolean>(false);

  // Available videos (including the seed UUID added to Postgres)
  readonly playlist = signal<VideoItem[]>([
    {
      id: 'c9b1f2e0-2804-4b52-9df7-08d1e2e12810',
      title: 'Sun salutations',
      description: 'Yoga class, sun salutations for a morning quick workout without props.',
      duration: '0:30',
      badge: 'HD Stream',
    },
  ]);

  // Selected video signal
  readonly selectedVideo = signal<VideoItem | null>(this.playlist()[0] ?? null);

  selectVideo(video: VideoItem) {
    this.selectedVideo.set(video);
  }
}
