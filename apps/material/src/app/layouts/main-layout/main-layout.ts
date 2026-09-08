import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent,
} from '@angular/material/sidenav';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    MatSidenavContainer,
    MatSidenav,
    MatSidenavContent,
    Navbar,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayoutComponent {}