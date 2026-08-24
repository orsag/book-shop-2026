import {
  Component,
  inject,
  signal,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  LucideCircleUserRound,
  LucideMail,
  LucidePenTool,
} from '@lucide/angular';
import {
  BlueFocusDirective,
  NoFocusJumpDirective,
  RedFocusDirective,
} from '@core';
import { Toast } from '@component';
import { CartStore, UserStore } from '@store';
import { LoadingService } from '../../core/loading.service';

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
    BlueFocusDirective,
  ],
  templateUrl: './login.html',
})
export class LoginPage implements OnInit, AfterViewInit {
  @ViewChild('firstInput') firstInput?: ElementRef<HTMLInputElement>;
  @ViewChild('emailInput') emailInput?: ElementRef<HTMLInputElement>;

  userStore = inject(UserStore);
  cartStore = inject(CartStore);
  loading = inject(LoadingService);
  router = inject(Router);

  registerMode = signal(false);
  username = signal('');
  password = signal('');
  email = signal('');

  ngOnInit() {
    // Check if logged in on navigation here, and if true, logout
    if (this.userStore.isLoggedIn()) {
      this.userStore.logout();
      this.cartStore.clearCart();
    }
  }

  ngAfterViewInit() {
    // Small timeout ensures element is fully rendered, especially if toggled via @if / signals
    setTimeout(() => {
      this.firstInput?.nativeElement.focus();
    }, 50);
  }

  async onLogin() {
    if (!this.username().trim() || !this.password().trim()) return;

    this.userStore
      .login({
        username: this.username(),
        password: this.password(),
      })
      .subscribe((result) => {
        if (result?.success) {
          this.router.navigate(['/']);
        }
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
