import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { faker } from '@faker-js/faker';
import { BlueFocusDirective } from '@core';

@Component({
  selector: 'app-license',
  imports: [BlueFocusDirective],
  templateUrl: './license.html',
  styleUrl: './license.css',
})
export class License {
  matchCount = signal<number>(0);
  private scrollTimer: ReturnType<typeof setTimeout> | undefined;

  paragraphs = Array.from({ length: 50 }, () =>
    faker.lorem.paragraph({ min: 3, max: 9 }),
  );

  // Grab the section element reference from template
  private contentSection = viewChild<ElementRef<HTMLElement>>('contentSection');

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    const query = input.value.trim().toLowerCase();

    // 1. Check if CSS Custom Highlight API is supported by the browser
    if (!('highlights' in CSS)) return;

    // 2. Clear old highlight matches
    CSS.highlights.clear();

    if (!query) return;

    const sectionEl = this.contentSection()?.nativeElement;
    if (!sectionEl) return;

    // 3. Walk through all text nodes inside the section container safely
    const treeWalker = document.createTreeWalker(
      sectionEl,
      NodeFilter.SHOW_TEXT,
    );
    const allTextNodes: Text[] = [];
    let currentNode = treeWalker.nextNode();

    while (currentNode) {
      allTextNodes.push(currentNode as Text);
      currentNode = treeWalker.nextNode();
    }

    // 4. Find matches and build native Range objects
    const ranges: Range[] = [];
    let firstMatchParagraph: HTMLElement | null = null;

    for (const el of allTextNodes) {
      const text = el.textContent?.toLowerCase() ?? '';
      let startPos = 0;

      while (startPos < text.length) {
        const index = text.indexOf(query, startPos);
        if (index === -1) break;

        const range = new Range();
        range.setStart(el, index);
        range.setEnd(el, index + query.length);
        ranges.push(range);

        // Remember the paragraph holding the very first match
        if (!firstMatchParagraph) {
          firstMatchParagraph = el.parentElement?.closest('p') ?? null;
        }

        startPos = index + query.length;
      }
    }

    // 5. Apply the highlights registration natively using the Range array
    if (ranges.length > 0) {
      const searchHighlight = new Highlight(...ranges);
      CSS.highlights.set('search-match', searchHighlight);
      this.matchCount.set(ranges.length);

      // 6. Scroll the first matched paragraph into view, debounced so a
      //    single scroll happens once the user pauses typing.
      if (firstMatchParagraph) {
        clearTimeout(this.scrollTimer);
        this.scrollTimer = setTimeout(() => {
          firstMatchParagraph?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }, 400);
      }
    } else {
      this.matchCount.set(0);
    }
  }
}
