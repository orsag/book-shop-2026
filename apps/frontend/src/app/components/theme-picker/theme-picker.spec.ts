import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemePicker } from './theme-picker';
import { ConfigurationService } from '@service';
import { signal } from '@angular/core';
import { vi } from 'vitest';

describe('ThemePicker', () => {
  let component: ThemePicker;
  let mockConfigService: any;
  let fixture: ComponentFixture<ThemePicker>;

  // Create a single shared signal reference
  let themeSignal = signal('light');

  beforeEach(async () => {
    themeSignal.set('light');

    mockConfigService = {
      theme: themeSignal,
      setTheme: vi.fn((newTheme) => themeSignal.set(newTheme)),
      flags: vi.fn().mockReturnValue({
        INFINITE_COLOR_THEMES: false,
      }),
    };

    await TestBed.configureTestingModule({
      imports: [ThemePicker],
      providers: [
        { provide: ConfigurationService, useValue: mockConfigService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemePicker);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be unchecked when currentTheme is "light"', async () => {
    themeSignal.set('light'); // Update the existing signal's value

    fixture.detectChanges();
    await fixture.whenStable();

    const checkbox = fixture.nativeElement.querySelector(
      '.theme-controller',
    ) as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  it('should be checked when currentTheme is "dark"', async () => {
    themeSignal.set('dark'); // Update the existing signal's value

    fixture.detectChanges();
    await fixture.whenStable();

    const checkbox = fixture.nativeElement.querySelector(
      '.theme-controller',
    ) as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });
});
