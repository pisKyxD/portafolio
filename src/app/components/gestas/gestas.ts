import { Component, signal } from '@angular/core';
import { GESTAS, Gesta, Repo } from '../../data/gestas';

// cuantas hazañas se ven de entrada en cada gesta, el resto aparece con "Ver todas las hazañas"
const HAZANAS_VISIBLES = 5;

@Component({
  selector: 'app-gestas',
  templateUrl: './gestas.html',
  styleUrl: './gestas.css',
})
export class Gestas {
  gestas = GESTAS;

  // ids de las gestas cuya imagen no cargo (archivo que todavia no subo), esas no muestran el marco
  imagenesFallidas = signal<Set<string>>(new Set());

  // ids de las gestas que tienen todas sus hazañas desplegadas
  expandidas = signal<Set<string>>(new Set());

  // si la persona pidio menos animaciones en su sistema, el video no parte solo
  movimientoReducido = this.consulta('(prefers-reduced-motion: reduce)');

  // la captura se ve siempre. si es video: en computador (con mouse) parte al pasar el cursor por la tarjeta,
  // en celular no existe "pasar el cursor", asi que ahi parte solo
  conMouse = this.consulta('(hover: hover)');

  private consulta(media: string) {
    return typeof window !== 'undefined' && !!window.matchMedia?.(media).matches;
  }

  // las hazañas que se muestran: las primeras 5, o todas si la persona apreto "Ver todas"
  hazanasVisibles(gesta: Gesta) {
    return this.expandidas().has(gesta.id) ? gesta.hazanas : gesta.hazanas.slice(0, HAZANAS_VISIBLES);
  }

  // cuantas quedan escondidas (0 = no hace falta el boton)
  hazanasOcultas(gesta: Gesta) {
    return Math.max(0, gesta.hazanas.length - HAZANAS_VISIBLES);
  }

  alternarHazanas(id: string) {
    this.expandidas.update((ids) => {
      const nuevo = new Set(ids);
      if (nuevo.has(id)) nuevo.delete(id);
      else nuevo.add(id);
      return nuevo;
    });
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