import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Footer } from './footer';
import { getTranslocoModule } from '@core';
import { provideRouter } from '@angular/router';
import { ConfigurationService } from '@service';
import { signal } from '@angular/core';
import { vi } from 'vitest';

describe('Footer', () => {
  let component: Footer;
  let fixture: ComponentFixture<Footer>;

  beforeEach(async () => {
    const mockConfigService = {
      theme: signal('light'),
      isDarkTheme: vi.fn().mockReturnValue(false),
    };

    await TestBed.configureTestingModule({
      imports: [Footer, getTranslocoModule()],
      providers: [
        provideRouter([]),
        { provide: ConfigurationService, useValue: mockConfigService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Footer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the footer item buttons', () => {
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.footer-item');
    expect(items.length).toBe(component.footerItems.length);
  });
});