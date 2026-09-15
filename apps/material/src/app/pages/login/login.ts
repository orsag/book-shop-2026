import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { Store } from '@ngrx/store';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import {
  LucideCircleUserRound,
  LucideMail,
  LucidePenTool,
} from '@lucide/angular';
import { LoadingService } from '@core';
import { ConfigurationService } from '@service';
import {
  CartActions,
  CartStateRoot,
  selectIsLoggedIn,
  UserActions,
  UserStateRoot,
} from '@ngrx';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    RouterLink,
    MatCard,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatPrefix,
    MatInput,
    MatButton,
    MatProgressSpinner,
    LucideCircleUserRound,
    LucideMail,
    LucidePenTool,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements AfterViewInit {
  @ViewChild('firstInput') firstInput?: ElementRef<HTMLInputElement>;
  @ViewChild('emailInput') emailInput?: ElementRef<HTMLInputElement>;

  config = inject(ConfigurationService);
  loading = inject(LoadingService);
  router = inject(Router);
  private readonly store = inject(Store<UserStateRoot & CartStateRoot>);

  registerMode = signal(false);
  username = signal('');
  password = signal('');
  email = signal('');

  isLoggedIn = this.store.selectSignal(selectIsLoggedIn);

  constructor() {
    // Arriving on the login page while a session is active: log out (mirrors
    // the legacy behavior) and wipe the cart before showing the login form.
    if (this.isLoggedIn()) {
      this.store.dispatch(UserActions.logout());
      this.store.dispatch(CartActions.clearCart());
    }

    // Navigate home once a login/register flow succeeds. The logout dispatch
    // above already ran, so the initial emission stays filtered out.
    this.store
      .select(selectIsLoggedIn)
      .pipe(
        filter((isLoggedIn) => isLoggedIn),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.router.navigate(['/']));
  }

  ngAfterViewInit() {
    // Small timeout ensures the element is rendered, especially when toggled
    // via signals.
    setTimeout(() => {
      this.firstInput?.nativeElement.focus();
    }, 50);
  }

  onLogin() {
    if (!this.username().trim() || !this.password().trim()) return;

    this.store.dispatch(
      UserActions.login({
        credentials: {
          username: this.username(),
          password: this.password(),
        },
      }),
    );
  }

  onRegister() {
    if (
      !this.username().trim() ||
      !this.password().trim() ||
      !this.email().trim()
    )
      return;

    this.store.dispatch(
      UserActions.register({
        credentials: {
          email: this.email(),
          username: this.username(),
          password: this.password(),
        },
      }),
    );
  }

  handleRegisterMode() {
    this.registerMode.update((value) => !value);
    setTimeout(() => {
      this.emailInput?.nativeElement.focus();
    }, 50);
  }
}