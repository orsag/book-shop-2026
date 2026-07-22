import { Component } from '@angular/core';
import { Footer, Navbar, Toast, ScrollBtn } from '@component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-simple-layout',
  imports: [
    Footer,
    Navbar,
    RouterOutlet,
    ScrollBtn,
    Toast,
  ],
  templateUrl: './simple-layout.html',
  styleUrl: './simple-layout.css',
})
export class SimpleLayoutComponent {}
