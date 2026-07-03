import { Component, ElementRef, signal, ViewChild } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { FOOTER_ITEMS } from '@store/libs';

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
  footerItems = FOOTER_ITEMS;

  openWipModal(item: FooterItem) {
    this.selectedItem.set(item);
    this.wipModal.nativeElement.showModal();
  }
}
