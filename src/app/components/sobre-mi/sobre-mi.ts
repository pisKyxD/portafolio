import { Component } from '@angular/core';
import { PERFIL } from '../../data/perfil';
import { GESTAS } from '../../data/gestas';

@Component({
  selector: 'app-sobre-mi',
  templateUrl: './sobre-mi.html',
  styleUrl: './sobre-mi.css',
})
export class SobreMi {
  perfil = PERFIL;

  // cuento las gestas para que el numero se actualice solo cuando agrego proyectos
  totalGestas = GESTAS.length;
}