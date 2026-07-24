import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { VideoPlayer } from '@component';
import {
  LucidePlay,
  LucideFilm,
  LucideCircleUserRound,
  LucideShoppingBasket,
  LucideVideo,
  LucideFrown,
} from '@lucide/angular';

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
  imports: [
    RouterLink,
    VideoPlayer,
    LucideVideo,
    LucidePlay,
    LucideFilm,
    LucideShoppingBasket,
    LucideCircleUserRound,
    LucideFrown,
    LucideShoppingBasket,
    LucideCircleUserRound,
  ],
  template: `
    <div class="min-h-screen py-12 px-4">
      <div class="max-w-4xl mx-auto">
        @if (isLoading()) {
          <div class="flex justify-center">
            <span class="loading loading-dots loading-lg"></span>
          </div>
        } @else if (selectedVideo(); as video) {
          <!-- Header -->
          <div class="text-center mb-8">
            <div
              class="inline-flex items-center justify-center w-20 h-20 bg-primary text-primary-content rounded-full mb-4"
            >
              <svg lucideVideo [size]="48"></svg>
            </div>
            <h1 class="text-4xl font-bold">Video knižnica</h1>
            <p class="text-base-content/70 mt-2">
              Práve prehrávate: <strong>{{ video.title }}</strong>
            </p>
          </div>

          <!-- Main Layout -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Primary Content: Video Player -->
            <div class="lg:col-span-2 space-y-4">
              <app-video-player [videoId]="video.id" />

              <div class="card bg-base-100 shadow-xl">
                <div class="card-body">
                  <div class="flex items-center justify-between">
                    <h2 class="card-title">{{ video.title }}</h2>
                    <div class="badge badge-primary font-bold">
                      {{ video.badge }}
                    </div>
                  </div>
                  <p class="text-base-content/70 mt-2">
                    {{ video.description }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Sidebar: Playlist & Actions -->
            <div class="space-y-6">
              <!-- Playlist Card -->
              <div class="card bg-base-100 shadow-xl">
                <div class="card-body p-4">
                  <h3
                    class="card-title text-sm uppercase tracking-widest opacity-80 mb-2 flex items-center gap-2"
                  >
                    <svg lucideFilm [size]="18"></svg>
                    Dostupné videá
                  </h3>

                  <div class="space-y-2">
                    @for (item of playlist(); track item.id) {
                      <button
                        (click)="selectVideo(item)"
                        class="w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all"
                        [class.bg-primary]="item.id === video.id"
                        [class.text-primary-content]="item.id === video.id"
                        [class.bg-base-200]="item.id !== video.id"
                        [class.hover:bg-base-300]="item.id !== video.id"
                      >
                        <svg lucidePlay [size]="18"></svg>
                        <div class="flex-1 overflow-hidden">
                          <p class="font-bold truncate text-sm">
                            {{ item.title }}
                          </p>
                          <p class="text-xs opacity-70">{{ item.duration }}</p>
                        </div>
                      </button>
                    }
                  </div>
                </div>
              </div>

              <!-- Navigation Actions -->
              <div class="space-y-3">
                <button routerLink="/home" class="btn btn-primary btn-block">
                  <svg lucideShoppingBasket [size]="20"></svg>
                  Späť do obchodu
                </button>
                <button
                  routerLink="/profile"
                  class="btn btn-outline btn-primary btn-block"
                >
                  <svg lucideCircleUserRound [size]="20"></svg>
                  Späť do profilu
                </button>
              </div>
            </div>
          </div>
        } @else {
          <!-- Error / Fallback State -->
          <div class="flex flex-col items-center">
            <div
              class="inline-flex items-center justify-center w-20 h-20 bg-error text-error-content rounded-full mb-4"
            >
              <svg lucideFrown [size]="48"></svg>
            </div>
            <h1 class="text-4xl font-bold">Žiadne video sa nenašlo.</h1>
            <p class="text-base-content/70 mt-2">
              Požadovaný video stream nie je momentálne k dispozícii.
            </p>
          </div>
        }
      </div>
    </div>
  `,
})
export class VideosComponent {
  readonly isLoading = signal<boolean>(false);

  // Available videos (including the seed UUID added to Postgres)
  readonly playlist = signal<VideoItem[]>([
    {
      id: 'c9b1f2e0-2804-4b52-9df7-08d1e2e12810',
      title: 'Salutations',
      description:
        'Streamed bytea payload directly from PostgreSQL via NestJS and Angular 22 rxResource.',
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
