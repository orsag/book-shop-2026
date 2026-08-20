import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { License } from './license';

describe('License', () => {
  let component: License;
  let fixture: ComponentFixture<License>;
  let scrollIntoView: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView =
      scrollIntoView as unknown as Element['scrollIntoView'];

    await TestBed.configureTestingModule({
      imports: [License],
    }).compileComponents();

    fixture = TestBed.createComponent(License);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('scrolls to the paragraph with the first query match', () => {
    vi.useFakeTimers();

    // Stub the CSS Custom Highlight API, which jsdom does not implement
    (globalThis as unknown as {
      CSS: { highlights: Map<string, unknown> };
    }).CSS = { highlights: new Map() };
    (globalThis as unknown as { Highlight: unknown }).Highlight = class {};
    fixture.detectChanges();

    const section = component['contentSection']()?.nativeElement as HTMLElement;
    const firstParagraph = section.querySelector('p') as HTMLParagraphElement;
    const query = firstParagraph.textContent.trim().split(/\s+/)[0];

    const input = document.createElement('input');
    input.value = query;
    component.onSearch({ target: input } as unknown as Event);

    vi.advanceTimersByTime(400);

    expect(component.matchCount()).toBeGreaterThan(0);
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
    // The scroll target must be the <p> holding the first match
    expect(scrollIntoView.mock.instances[0]).toBe(firstParagraph);

    vi.useRealTimers();
  });
});
