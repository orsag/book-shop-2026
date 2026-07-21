import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DAISY_THEMES } from '@store/shared-models';
import { ConfigurationService } from '../../services/configuration-service';
import { LucideMoon, LucideSun } from '@lucide/angular';
import { TooltipDirective } from '@core';

@Component({
  selector: 'app-theme-picker',
  imports: [CommonModule, LucideSun, LucideMoon, TooltipDirective],
  templateUrl: './theme-picker.html',
  styleUrl: './theme-picker.css',
})
export class ThemePicker {
  config = inject(ConfigurationService);

  isChecked = computed(() => this.config.theme() === 'dark');

  availableThemes = computed(() => {
    return this.config.flags().INFINITE_COLOR_THEMES
      ? DAISY_THEMES
      : DAISY_THEMES.filter((t) => ['light', 'dark'].includes(t.name));
  });

  isTwoColumns = computed(() => {
    return this.availableThemes().length <= 2;
  });

  changeTheme(theme: string) {
    // One call, the Service's 'effect' does the rest
    this.config.setTheme(theme);
  }

  toggleTheme() {
    const newTheme = this.config.theme() === 'dark' ? 'light' : 'dark';

    // 1. Update the state (or Signal)
    this.config.setTheme(newTheme);
  }
}
