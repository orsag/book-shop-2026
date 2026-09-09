import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Toast } from './toast';
import { ToastService } from '@service';
import { signal } from '@angular/core';
import { vi } from 'vitest';

const TOASTS = [
  { id: '1', text: 'Cart cleared', type: 'danger', duration: 5000, expiresAt: 5000 },
  { id: '2', text: 'Order created', type: 'success', duration: 5000, expiresAt: 5000 },
];

describe('Toast', () => {
  let component: Toast;
  let mockToastService: any;
  let fixture: ComponentFixture<Toast>;

  beforeEach(async () => {
    mockToastService = {
      toasts: signal([]),
      dismiss: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Toast],
      providers: [{ provide: ToastService, useValue: mockToastService }],
    }).compileComponents();

    fixture = TestBed.createComponent(Toast);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render the container when there are no toasts', () => {
    fixture.detectChanges();
    const container = fixture.nativeElement.querySelector(
      '[data-testid="toast"]',
    );
    expect(container).toBeNull();
  });

  it('should render toast items', () => {
    mockToastService.toasts.set(TOASTS);
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll(
      '[data-testid="toast-item"]',
    );
    expect(items.length).toBe(2);
    expect(
      fixture.nativeElement.textContent,
    ).toContain('Cart cleared');
    expect(fixture.nativeElement.textContent).toContain('Order created');
  });

  it('should apply the type class for the toast', () => {
    mockToastService.toasts.set(TOASTS);
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('.toast-type-danger');
    expect(icon).toBeTruthy();
  });

  it('should dismiss a toast when the close button is clicked', () => {
    mockToastService.toasts.set(TOASTS);
    fixture.detectChanges();

    const closeBtn = fixture.nativeElement.querySelector(
      '[aria-label="Close notification"]',
    ) as HTMLButtonElement;
    closeBtn.click();
    fixture.detectChanges();

    expect(mockToastService.dismiss).toHaveBeenCalledWith('1');
  });

  it('should compute the remaining progress percentage', () => {
    const value = component.remaining({
      duration: 5000,
      expiresAt: Date.now() + 1000,
    });
    expect(value).toBeGreaterThanOrEqual(15);
    expect(value).toBeLessThanOrEqual(25);
  });
});