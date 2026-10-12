import { Component } from '@angular/core';
import { GESTAS } from '../../data/gestas';

@Component({
  selector: 'app-gestas',
  templateUrl: './gestas.html',
  styleUrl: './gestas.css',
})
export class Gestas {
  gestas = GESTAS;

  // para no mostrar links que todavia no tengo
  linkValido(url?: string) {
    return !!url && url !== 'TODO';
  }
}