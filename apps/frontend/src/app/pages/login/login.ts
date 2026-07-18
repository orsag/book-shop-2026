import { Component, inject, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AppStore } from '../../store/app-store';
import { LucideCircleUserRound, LucideMail, LucidePenTool } from '@lucide/angular';
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
    LucidePenTool,
    LucideMail,
  ],
  templateUrl: './login.html',
})
export class LoginPage {
  store = inject(AppStore);
  router = inject(Router);

  registerMode = signal(false);
  username = signal('');
  password = signal('');
  email = signal('');

  constructor() {
    // Automatically react when the store state changes
    effect(() => {
      if (this.store.isLoggedIn()) {
        this.router.navigate(['/']);
      }
    });
  }

  async onLogin() {
    if (!this.username().trim() || !this.password().trim()) return;
    this.store.login({
      username: this.username(),
      password: this.password(),
    });
  }

  async onRegister() {
    if (
      !this.username().trim() ||
      !this.password().trim() ||
      !this.email().trim()
    )
      return;
    this.store.register({
      email: this.email(),
      username: this.username(),
      password: this.password(),
    });
  }
}
