import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ScrollService {
  /**
   * Resets the scroll position of the main layout container.
   * @param behavior 'auto' | 'smooth' | 'instant'
   */
  scrollToTop(behavior: ScrollBehavior = 'instant') {
    const scrollArea = document.getElementById('main-scroll-area');

    if (scrollArea) {
      scrollArea.scrollTo({
        top: 0,
        behavior,
      });
    } else {
      // Fallback to window if the custom container isn't found
      window.scrollTo({ top: 0, behavior });
    }
  }
}
