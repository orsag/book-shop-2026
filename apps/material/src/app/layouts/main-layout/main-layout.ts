import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent,
} from '@angular/material/sidenav';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { ProgressBarComponent } from '../../components/progress-bar/progress-bar';
import { Filter } from '../../components/filter/filter';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    MatSidenavContainer,
    MatSidenav,
    MatSidenavContent,
    Navbar,
    Footer,
    ProgressBarComponent,
    Filter,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayoutComponent {}