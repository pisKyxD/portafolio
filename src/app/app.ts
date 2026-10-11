import { Component } from '@angular/core';
import { Navbar } from './components/navbar/navbar';
import { Hero } from './components/hero/hero';

@Component({
  selector: 'app-root',
  imports: [Navbar, Hero],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}