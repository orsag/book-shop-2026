import { Component, inject, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AppStore } from '../../store/app-store';
import { LucideCircleUserRound } from '@lucide/angular';
import { NoFocusJumpDirective } from '../../core/no-focus-jump.directive';
import { ToastComponent } from '../../components/common/toastComponent';

@Component({
  selector: 'app-login',
  imports: [
    ToastComponent,
    RouterLink,
    FormsModule,
    LucideCircleUserRound,
    NoFocusJumpDirective,
  ],
  templateUrl: './login.html',
})
export class LoginPage {
  store = inject(AppStore);
  router = inject(Router);

  errorMessage = signal(false);
  username = signal('');

  constructor() {
    // Automatically react when the store state changes
    effect(() => {
      if (this.store.isLoggedIn()) {
        this.onSuccess();
      }
    });
  }

  async onLogin() {
    if (!this.username().trim()) return;
    this.store.login({ username: this.username() });
  }

  onSuccess() {
    // We can use an effect in the store to redirect,
    // or just navigate here if the store updates
    this.router.navigate(['/']);
  }
}
