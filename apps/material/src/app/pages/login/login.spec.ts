import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Login } from './login';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { CartActions, selectIsLoggedIn, UserActions } from '@ngrx';
import { LoadingService } from '@core';
import { ConfigurationService } from '@service';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let mockStore: MockStore;
  let mockConfigService: any;
  let loadingService: LoadingService;

  beforeEach(async () => {
    mockConfigService = {
      theme: signal('light'),
      isDarkTheme: vi.fn().mockReturnValue(false),
    };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        provideMockStore({
          selectors: [{ selector: selectIsLoggedIn, value: false }],
        }),
        { provide: ConfigurationService, useValue: mockConfigService },
      ],
    }).compileComponents();

    mockStore = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    loadingService = TestBed.inject(LoadingService);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be disabled if no username is entered', () => {
    component.username.set('');
    fixture.detectChanges();

    const submitBtn = fixture.nativeElement.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;

    expect(submitBtn.disabled).toBe(true);
  });

  it('should be enabled if username and password are filled', () => {
    component.username.set('testuser');
    component.password.set('password');
    fixture.detectChanges();

    const submitBtn = fixture.nativeElement.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;

    expect(submitBtn.disabled).toBe(false);
  });

  it('should be disabled with a spinner while the login request is in flight', () => {
    component.username.set('testuser');
    component.password.set('password');

    loadingService.track('login');
    fixture.detectChanges();

    const submitBtn = fixture.nativeElement.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;
    const spinner = fixture.nativeElement.querySelector('mat-spinner');

    expect(submitBtn.disabled).toBe(true);
    expect(spinner).toBeTruthy();
  });

  it('should dispatch login with the typed credentials', () => {
    const dispatchSpy = vi.spyOn(mockStore, 'dispatch');
    component.username.set('knihomol123');
    component.password.set('password');

    component.onLogin();

    expect(dispatchSpy).toHaveBeenCalledWith(
      UserActions.login({
        credentials: { username: 'knihomol123', password: 'password' },
      }),
    );
  });

  it('should not dispatch login when the username is only spaces', () => {
    const dispatchSpy = vi.spyOn(mockStore, 'dispatch');
    component.username.set('   ');

    component.onLogin();

    expect(dispatchSpy).not.toHaveBeenCalledWith(
      UserActions.login({
        credentials: { username: '   ', password: '' },
      }),
    );
  });

  it('should dispatch login after the submit button is clicked', () => {
    const dispatchSpy = vi.spyOn(mockStore, 'dispatch');
    component.username.set('martin_orsag');
    component.password.set('password');
    fixture.detectChanges();

    const submitBtn = fixture.nativeElement.querySelector(
      'button[title="submit-login-btn"]',
    ) as HTMLButtonElement;
    submitBtn.click();

    expect(dispatchSpy).toHaveBeenCalledWith(
      UserActions.login({
        credentials: { username: 'martin_orsag', password: 'password' },
      }),
    );
  });

  it('should dispatch register with email when register mode is active', () => {
    const dispatchSpy = vi.spyOn(mockStore, 'dispatch');
    component.registerMode.set(true);
    component.username.set('knihomol123');
    component.password.set('password');
    component.email.set('knihomol@example.com');
    fixture.detectChanges();

    const registerBtn = fixture.nativeElement.querySelector(
      'button[title="submit-register-btn"]',
    ) as HTMLButtonElement;
    registerBtn.click();

    expect(dispatchSpy).toHaveBeenCalledWith(
      UserActions.register({
        credentials: {
          email: 'knihomol@example.com',
          username: 'knihomol123',
          password: 'password',
        },
      }),
    );
  });

  it('should not dispatch a logout when no session is active', () => {
    const dispatchSpy = vi.spyOn(mockStore, 'dispatch');
    expect(dispatchSpy).not.toHaveBeenCalledWith(UserActions.logout());
    expect(dispatchSpy).not.toHaveBeenCalledWith(CartActions.clearCart());
  });
});