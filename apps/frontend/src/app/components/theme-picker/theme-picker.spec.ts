import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemePicker } from './theme-picker';
import { ConfigurationService } from '../../services/configuration-service';
import { signal } from '@angular/core';
import { vi } from 'vitest';

describe('ThemePicker', () => {
  let component: ThemePicker;
  let mockConfigService: any;
  let fixture: ComponentFixture<ThemePicker>;

  beforeEach(async () => {
    mockConfigService = {
      theme: signal('light'),
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
});
