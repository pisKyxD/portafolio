import { Component } from '@angular/core';
import { Navbar } from './components/navbar/navbar';
import { Hero } from './components/hero/hero';
import { SobreMi } from './components/sobre-mi/sobre-mi';
import { Gestas } from './components/gestas/gestas';

@Component({
  selector: 'app-root',
  imports: [Navbar, Hero, SobreMi, Gestas],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}