import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { Toast } from '../../components/toast/toast';

@Component({
  selector: 'app-simple-layout',
  imports: [RouterOutlet, Navbar, Footer, Toast],
  templateUrl: './simple-layout.html',
  styleUrl: './simple-layout.css',
})
export class SimpleLayoutComponent {}