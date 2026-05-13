import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideChessQueen } from '@lucide/angular';

@Component({
  selector: 'app-premium-card',
  imports: [RouterLink, TranslocoDirective, LucideChessQueen],
  template: `
    <div
      *transloco="let t"
      class="card bg-linear-to-br from-[#D4AF37] via-[#FFD700] to-[#B8860B] text-black shadow-xl overflow-hidden border border-yellow-600/20"
    >
      <div class="card-body p-6 relative">
        <svg size="48" lucideChessQueen class="absolute top-4 right-4 opacity-20"></svg>

        <h3 class="font-bold text-lg tracking-tight uppercase opacity-80">
          {{ t('premium.title') }}
        </h3>

        <div class="flex items-baseline gap-1 mt-2">
          <span class="text-5xl font-black tracking-tighter">{{
            daysLeft()
          }}</span>
          <span class="text-sm font-bold uppercase tracking-widest">
            {{ t('premium.days') }}</span
          >
        </div>

        <p class="text-xs mt-1 font-medium opacity-70 italic">
          {{ t('premium.active') }}
        </p>

        <div class="card-actions mt-6">
          <button
            routerLink="wip"
            class="btn btn-sm btn-ghost bg-black/10 hover:bg-black/20 border-black/10 text-black w-full font-bold"
          >
            {{ t('premium.prolong') }}
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrl: './premium-card.css',
})
export class PremiumCard {
  daysLeft = input.required<number>();
}
