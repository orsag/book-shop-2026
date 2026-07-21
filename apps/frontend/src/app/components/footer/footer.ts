import { Component, ElementRef, signal, ViewChild } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { FOOTER_ITEMS } from '@store/libs';
import { loremIpsum } from 'lorem-ipsum';

interface FooterItem {
  translationKey: string;
  image: string;
  alt: string;
  isSplit?: boolean;
}

@Component({
  selector: 'app-footer',
  imports: [RouterLink, TranslocoDirective, NgOptimizedImage],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  @ViewChild('wipModal') wipModal!: ElementRef<HTMLDialogElement>;
  selectedItem = signal<FooterItem | null>(null);
  currentYear: number = new Date().getFullYear();
  footerItems = FOOTER_ITEMS;
  dummyText: string = "";

  generateDummyText() {
    return loremIpsum({
      count: 1, // Number of words, sentences, or paragraphs.
      format: 'plain', // "plain" or "html".
      paragraphLowerBound: 4, // Minimum sentences per paragraph.
      paragraphUpperBound: 8, // Maximum sentences per paragraph.
      random: Math.random, // PRNG function.
      sentenceLowerBound: 6, // Minimum words per sentence.
      sentenceUpperBound: 20, // Maximum words per sentence.
      suffix: '\n', // Line ending for paragraphs.
      units: 'paragraphs', // "words", "sentences", or "paragraphs".
    });
  }

  openWipModal(item: FooterItem) {
    this.selectedItem.set(item);
    this.dummyText = this.generateDummyText();
    this.wipModal.nativeElement.showModal();
  }
}
