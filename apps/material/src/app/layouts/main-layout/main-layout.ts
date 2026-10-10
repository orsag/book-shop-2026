import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent,
} from '@angular/material/sidenav';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { ProgressBarComponent } from '../../components/progress-bar/progress-bar';
import { Filter } from '../../components/filter/filter';
import { Toast } from '../../components/toast/toast';
import { AppStore } from '@store';
import { ConfigurationService } from '@service';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    MatSidenavContainer,
    MatSidenav,
    MatSidenavContent,
    Navbar,
    Footer,
    ProgressBarComponent,
    Filter,
    Toast,
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