import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent,
} from '@angular/material/sidenav';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, MatSidenavContainer, MatSidenav, MatSidenavContent],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayoutComponent {}