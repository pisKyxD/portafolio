import { Component, afterNextRender } from '@angular/core';
import { Navbar } from './components/navbar/navbar';
import { Hero } from './components/hero/hero';
import { SobreMi } from './components/sobre-mi/sobre-mi';
import { Gestas } from './components/gestas/gestas';
import { Habilidades } from './components/habilidades/habilidades';
import { Contacto } from './components/contacto/contacto';
import { Guia } from './components/guia/guia';

// tiempo minimo que se ve la pantalla de carga (contado desde que se abre la pagina)
// si la pagina carga muy rapido igual se alcanza a ver, en vez de un parpadeo
const MINIMO_CARGA_MS = 900;
// lo mismo que dura el desvanecido en el css de index.html
const DURACION_DESVANECER_MS = 600;

@Component({
  selector: 'app-root',
  imports: [Navbar, Hero, SobreMi, Gestas, Habilidades, Contacto, Guia],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor() {
    // cuando angular termino de dibujar todo, desvanezco la pantalla de carga y la saco de la pagina
    afterNextRender(() => {
      const pantalla = document.getElementById('cargando');
      if (!pantalla) return;
      const falta = Math.max(0, MINIMO_CARGA_MS - performance.now());
      setTimeout(() => {
        pantalla.classList.add('listo');
        setTimeout(() => pantalla.remove(), DURACION_DESVANECER_MS);
      }, falta);
    });
  }
}