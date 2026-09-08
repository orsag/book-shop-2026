import { Component, computed, inject } from '@angular/core';
import { ConfigurationService, ToastService } from '@service';
import { LucideMoon, LucideSun } from '@lucide/angular';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-theme-picker',
  imports: [LucideSun, LucideMoon, MatIconButton, MatTooltip],
  templateUrl: './theme-picker.html',
  styleUrl: './theme-picker.css',
})
export class ThemePicker {
  config = inject(ConfigurationService);
  toast = inject(ToastService);

  isChecked = computed(() => this.config.isDarkTheme());

  toggleTheme() {
    const newTheme = this.config.isDarkTheme() ? 'light' : 'dark';
    const capitalized = newTheme.charAt(0).toUpperCase() + newTheme.slice(1);

    // 1. Update the state (or Signal)
    this.config.setTheme(newTheme);
    this.toast.info('Theme changed: ' + capitalized);
  }
}