import { Component, computed, inject } from '@angular/core';
import {
  BannerComponent,
  Filter,
  Footer,
  Navbar,
  Toast,
  ScrollBtn,
  ProgressComponent,
} from '@component';
import { RouterOutlet } from '@angular/router';
import { ConfigurationService } from '@service';
import { CommonModule } from '@angular/common';
import { AppStore } from '@store';

@Component({
  selector: 'app-main-layout',
  imports: [
    BannerComponent,
    Filter,
    Footer,
    Navbar,
    RouterOutlet,
    ScrollBtn,
    ProgressComponent,
    Toast,
    CommonModule,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayoutComponent {
  store = inject(AppStore);
  config = inject(ConfigurationService);

  showFilter = computed(() => this.config.flags().SHOW_FILTER);
  showBanner = computed(() => this.config.flags().SHOW_DISCOUNT_BANNER);
}
