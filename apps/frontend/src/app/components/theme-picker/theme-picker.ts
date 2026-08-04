import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigurationService, ToastService } from '@service';
import { LucideMoon, LucideSun } from '@lucide/angular';
import {
  NoBtnHoverDirective,
  TooltipDirective,
  RedFocusDirective,
} from '@core';

@Component({
  selector: 'app-theme-picker',
  imports: [
    CommonModule,
    LucideSun,
    LucideMoon,
    TooltipDirective,
    NoBtnHoverDirective,
    RedFocusDirective,
  ],
  templateUrl: './theme-picker.html',
  styleUrl: './theme-picker.css',
})
export class ThemePicker {
  config = inject(ConfigurationService);
  toast = inject(ToastService);

  isChecked = computed(() => this.config.isDarkTheme());

  toggleTheme() {
    const newTheme = this.config.isDarkTheme() ? 'light' : 'dark';
    const capitalized = newTheme.charAt(0).toUpperCase() + newTheme.slice(1)

    // 1. Update the state (or Signal)
    this.config.setTheme(newTheme);
    this.toast.info('Theme changed: ' + capitalized);
  }
}
