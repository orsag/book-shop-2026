import { Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, TranslocoDirective, NgOptimizedImage],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {}
