import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemePicker } from './theme-picker';
import { ConfigurationService, ToastService } from '@service';
import { signal } from '@angular/core';
import { vi } from 'vitest';

describe('ThemePicker', () => {
  let component: ThemePicker;
  let mockConfigService: any;
  let mockToastService: any;
  let fixture: ComponentFixture<ThemePicker>;

  // Create a single shared signal reference
  const themeSignal = signal('light');

  beforeEach(async () => {
    themeSignal.set('light');

    mockConfigService = {
      theme: themeSignal,
      isDarkTheme: vi.fn(() => themeSignal() === 'dark'),
      setTheme: vi.fn((newTheme) => themeSignal.set(newTheme)),
      flags: vi.fn().mockReturnValue({
        INFINITE_COLOR_THEMES: false,
      }),
    };

    mockToastService = {
      info: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ThemePicker],
      providers: [
        { provide: ConfigurationService, useValue: mockConfigService },
        { provide: ToastService, useValue: mockToastService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemePicker);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not have dark class when currentTheme is "light"', async () => {
    themeSignal.set('light'); // Update the existing signal's value

    fixture.detectChanges();
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector(
      '.theme-picker-button',
    ) as HTMLButtonElement;
    expect(button.classList.contains('theme-picker-dark')).toBe(false);
  });

  it('should have dark class when currentTheme is "dark"', async () => {
    themeSignal.set('dark'); // Update the existing signal's value

    fixture.detectChanges();
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector(
      '.theme-picker-button',
    ) as HTMLButtonElement;
    expect(button.classList.contains('theme-picker-dark')).toBe(true);
  });

  it('should toggle the theme and notify on click', () => {
    themeSignal.set('light');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector(
      '.theme-picker-button',
    ) as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    expect(mockConfigService.setTheme).toHaveBeenCalledWith('dark');
    expect(mockToastService.info).toHaveBeenCalledWith(
      'Theme changed: Dark',
    );
  });
});