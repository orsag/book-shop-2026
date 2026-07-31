import {
  Component,
  inject,
  signal,
  effect,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideCircleUserRound, LucideMail, LucidePenTool } from '@lucide/angular';
import { NoFocusJumpDirective } from '@core';
import { Toast } from '@component';
import { UserStore } from '@store';
import { RedFocusDirective } from '../../core/red-focus.directive';

@Component({
  selector: 'app-login',
  imports: [
    Toast,
    RouterLink,
    FormsModule,
    LucideCircleUserRound,
    NoFocusJumpDirective,
    LucidePenTool,
    LucideMail,
    RedFocusDirective,
  ],
  templateUrl: './login.html',
})
export class LoginPage {
  @ViewChild('firstInput') firstInput?: ElementRef<HTMLInputElement>;
  @ViewChild('emailInput') emailInput?: ElementRef<HTMLInputElement>;

  userStore = inject(UserStore);
  router = inject(Router);

  registerMode = signal(false);
  username = signal('');
  password = signal('');
  email = signal('');

  ngAfterViewInit() {
    // Small timeout ensures element is fully rendered, especially if toggled via @if / signals
    setTimeout(() => {
      this.firstInput?.nativeElement.focus();
    }, 50);
  }

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

  handleRegisterMode() {
    this.registerMode.update((value) => !value);
    setTimeout(() => {
      this.emailInput?.nativeElement.focus();
    }, 50);
  }
}
