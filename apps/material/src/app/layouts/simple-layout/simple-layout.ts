import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-simple-layout',
  imports: [RouterOutlet, Navbar],
  templateUrl: './simple-layout.html',
  styleUrl: './simple-layout.css',
})
export class SimpleLayoutComponent {}