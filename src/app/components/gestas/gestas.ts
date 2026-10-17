import { Component, signal } from '@angular/core';
import { GESTAS, Repo } from '../../data/gestas';

@Component({
  selector: 'app-gestas',
  templateUrl: './gestas.html',
  styleUrl: './gestas.css',
})
export class Gestas {
  gestas = GESTAS;

  // ids de las gestas cuya imagen no cargo (archivo que todavia no subo), esas no muestran el marco
  imagenesFallidas = signal<Set<string>>(new Set());

  // si la persona pidio menos animaciones en su sistema, el video no parte solo
  movimientoReducido = this.consulta('(prefers-reduced-motion: reduce)');

  // en computador (con mouse) la captura aparece al pasar el cursor por la tarjeta
  // en celular no existe "pasar el cursor", asi que ahi se ve siempre y el video parte solo
  conMouse = this.consulta('(hover: hover)');

  private consulta(media: string) {
    return typeof window !== 'undefined' && !!window.matchMedia?.(media).matches;
  }

  // para no mostrar links que todavia no tengo
  linkValido(url?: string) {
    return !!url && url !== 'TODO';
  }

  // solo muestro los repos publicos y con link, los privados darian 404
  reposVisibles(repos: Repo[]) {
    return repos.filter((repo) => repo.publico && this.linkValido(repo.url));
  }

  esVideo(ruta: string) {
    return /\.(mp4|webm)$/i.test(ruta);
  }

  mostrarImagen(id: string, ruta?: string) {
    return !!ruta && !this.imagenesFallidas().has(id);
  }

  // si el archivo no existe lo escondo, asi no queda el icono de imagen rota
  imagenFallo(id: string) {
    this.imagenesFallidas.update((fallidas) => new Set(fallidas).add(id));
  }

  // el cursor entro a la tarjeta (o se llego con tab): el video parte desde el inicio
  reproducir(evento: Event) {
    if (!this.conMouse || this.movimientoReducido) return;
    const video = (evento.currentTarget as HTMLElement).querySelector('video');
    if (!video) return;
    video.currentTime = 0;
    // play() puede fallar si el navegador lo bloquea, en ese caso no pasa nada
    video.play().catch(() => {});
  }

  // el cursor salio de la tarjeta: pauso para no gastar bateria con un video que no se ve
  pausar(evento: Event) {
    if (!this.conMouse) return;
    (evento.currentTarget as HTMLElement).querySelector('video')?.pause();
  }
}