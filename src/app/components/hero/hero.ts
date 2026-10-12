import { Component } from '@angular/core';
import { PERFIL } from '../../data/perfil';

// una brasa que sube por la portada
interface Brasa {
  izquierda: number;
  tamano: number;
  duracion: number;
  retraso: number;
  desvio: number;
}

@Component({
  selector: 'app-hero',
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {
  perfil = PERFIL;

  // armo 18 brasas con valores distintos para que no suban todas iguales
  // uso una formula con el indice en vez de random, asi siempre quedan repartidas parejo
  brasas: Brasa[] = Array.from({ length: 18 }, (_, i) => ({
    izquierda: (i * 37 + 7) % 100,
    tamano: 2 + (i % 3),
    duracion: 7 + ((i * 13) % 8),
    retraso: (i * 1.7) % 9,
    desvio: ((i % 5) - 2) * 18,
  }));
}