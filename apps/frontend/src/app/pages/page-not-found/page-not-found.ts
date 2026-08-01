import { Component} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { RedFocusDirective } from '@core';

@Component({
  selector: 'app-page-not-found',
  imports: [RouterLink, TranslocoDirective, RedFocusDirective],
  templateUrl: './page-not-found.html',
  styleUrl: './page-not-found.css',
})
export class PageNotFound {}
