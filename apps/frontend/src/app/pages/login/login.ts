import { Component, inject, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideCircleUserRound, LucideMail, LucidePenTool } from '@lucide/angular';
import { NoFocusJumpDirective } from '@core';
import { ToastComponent } from '../../components/common/toastComponent';
import { UserStore } from '../../store/user-store';

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
  userStore = inject(UserStore);
  router = inject(Router);

  registerMode = signal(false);
  username = signal('');
  password = signal('');
  email = signal('');

  constructor() {
    // Automatically react when the store state changes
    effect(() => {
      if (this.userStore.isLoggedIn()) {
        this.router.navigate(['/']);
      }
    });
  }

  async onLogin() {
    if (!this.username().trim() || !this.password().trim()) return;
    this.userStore.login({
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
    this.userStore.register({
      email: this.email(),
      username: this.username(),
      password: this.password(),
    });
  }
}
