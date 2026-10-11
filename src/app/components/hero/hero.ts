import { Component } from '@angular/core';
import { PERFIL } from '../../data/perfil';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {
  perfil = PERFIL;
}