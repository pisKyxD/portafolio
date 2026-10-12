import { Component } from '@angular/core';
import { Navbar } from './components/navbar/navbar';
import { Hero } from './components/hero/hero';
import { SobreMi } from './components/sobre-mi/sobre-mi';
import { Gestas } from './components/gestas/gestas';
import { Habilidades } from './components/habilidades/habilidades';

@Component({
  selector: 'app-root',
  imports: [Navbar, Hero, SobreMi, Gestas, Habilidades],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}