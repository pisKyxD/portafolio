import { Component } from '@angular/core';
import { GESTAS, Repo } from '../../data/gestas';

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

  // solo muestro los repos publicos y con link, los privados darian 404
  reposVisibles(repos: Repo[]) {
    return repos.filter((repo) => repo.publico && this.linkValido(repo.url));
  }
}