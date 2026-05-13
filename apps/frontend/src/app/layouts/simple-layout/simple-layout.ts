import { Component } from '@angular/core';
import { Footer } from '../../components/footer/footer';
import { Navbar } from '../../components/navbar/navbar';
import { RouterOutlet } from '@angular/router';
import { ScrollBtnComponent } from '../../components/common/scrollToTop';
import { ToastComponent } from '../../components/common/toastComponent';

@Component({
  selector: 'app-simple-layout',
  imports: [
    Footer,
    Navbar,
    RouterOutlet,
    ScrollBtnComponent,
    ToastComponent,
  ],
  templateUrl: './simple-layout.html',
  styleUrl: './simple-layout.css',
})
export class SimpleLayoutComponent {}
