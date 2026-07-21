import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPage } from './login';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { UserStore } from '../../store/user-store';

describe('Login', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let mockUserStore: any;

  beforeEach(async () => {
    mockUserStore = {
      isLoggedIn: signal(false),
      isLoading: signal(false),
      login: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideRouter([]),
        { provide: UserStore, useValue: mockUserStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be disabled if no user name is entered', () => {
    component.username.set('');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const submitBtn = compiled.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;

    expect(submitBtn.disabled).toBe(true);
  });

  it('should be enabled if user name is filled', () => {
    component.username.set('testuser');
    component.password.set('password');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const submitBtn = compiled.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;

    expect(submitBtn.disabled).toBe(false);
  });

  it('should be disabled if store.isLoading() is active', () => {
    component.username.set('testuser');
    component.password.set('password');
    mockUserStore.isLoading.set(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const submitBtn = compiled.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;
    const spinner = compiled.querySelector('.loading-spinner');

    expect(submitBtn.disabled).toBe(true);
    expect(spinner).toBeTruthy();
  });

  it('should be called login when name is filled', async () => {
    component.username.set('knihomol123');
    component.password.set('password');
    fixture.detectChanges();

    // Vyvolanie odoslania formulára
    await component.onLogin();

    expect(mockUserStore.login).toHaveBeenCalledWith({
      username: 'knihomol123',
      password: 'password',
    });
  });

  it('should not call store.login(), if name is empty string with spaces', async () => {
    component.username.set('   ');
    fixture.detectChanges();

    await component.onLogin();

    expect(mockUserStore.login).not.toHaveBeenCalled();
  });

  it('should call login after submit btn clicked', () => {
    component.username.set('martin_orsag');
    component.password.set('password');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const submitBtn = compiled.querySelector(
      'button[title="submit-login-btn"]',
    ) as HTMLButtonElement;

    if (submitBtn) {
      submitBtn.click();
      expect(mockUserStore.login).toHaveBeenCalledWith({
        username: 'martin_orsag',
        password: 'password',
      });
    }
  });
});
