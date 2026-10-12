import { Component } from '@angular/core';
import { Navbar } from './components/navbar/navbar';
import { Hero } from './components/hero/hero';
import { SobreMi } from './components/sobre-mi/sobre-mi';
import { Gestas } from './components/gestas/gestas';
import { Habilidades } from './components/habilidades/habilidades';
import { Guia } from './components/guia/guia';

@Component({
  selector: 'app-root',
  imports: [Navbar, Hero, SobreMi, Gestas, Habilidades, Guia],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}