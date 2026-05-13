import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AppStore } from '../../store/app-store';
import { LucideCircleUserRound } from '@lucide/angular';
import { NoFocusJumpDirective } from '../../core/no-focus-jump.directive';

@Component({
  selector: 'app-login',
  imports: [
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

  username = signal('');
  isLoading = signal(false);

  async onLogin() {
    if (!this.username()) return;

    this.isLoading.set(true);

    // Using your existing AppStore login method
    // I assume it takes an object { username: string }
    this.store.login({
      username: this.username(),
      onSuccess: this.onSuccess.bind(this),
    });
  }

  onSuccess() {
    // We can use an effect in the store to redirect,
    // or just navigate here if the store updates
    this.router.navigate(['/']);
    this.isLoading.set(false);
  }
}
