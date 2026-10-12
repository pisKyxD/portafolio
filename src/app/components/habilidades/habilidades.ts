import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { GithubLenguajes, Lenguaje } from '../../services/github-lenguajes';
import { PERFIL } from '../../data/perfil';

// colores parecidos a los que usa github para cada lenguaje
const COLORES: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#e0c341',
  HTML: '#e34c26',
  CSS: '#7a5cc4',
  SCSS: '#c6538c',
  Python: '#3572a5',
  Java: '#b07219',
  Shell: '#89e051',
  Dockerfile: '#4a8bbf',
  'C#': '#178600',
  PHP: '#4f5d95',
};

@Component({
  selector: 'app-habilidades',
  templateUrl: './habilidades.html',
  styleUrl: './habilidades.css',
})
export class Habilidades implements OnInit, AfterViewInit, OnDestroy {
  github = inject(GithubLenguajes);
  perfil = PERFIL;
  private elemento = inject(ElementRef);
  private observador?: IntersectionObserver;

  // se pone en true cuando la persona llega a la seccion, ahi se llenan las barras
  visible = signal(false);

  // el lenguaje mas usado llena la barra completa y los demas se comparan con ese
  maximo = computed(() => this.github.lenguajes()[0]?.porcentaje ?? 100);

  ngOnInit() {
    this.github.cargar();
  }

  ngAfterViewInit() {
    // espero a que se vea al menos un 20% de la seccion para animar
    this.observador = new IntersectionObserver(
      (entradas) => {
        if (entradas[0].isIntersecting) {
          this.visible.set(true);
          this.observador?.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    this.observador.observe(this.elemento.nativeElement);
  }

  ngOnDestroy() {
    this.observador?.disconnect();
  }

  ancho(lenguaje: Lenguaje) {
    return this.visible() ? (lenguaje.porcentaje / this.maximo()) * 100 : 0;
  }

  // rango segun que tanto lo uso del total
  rango(porcentaje: number) {
    if (porcentaje >= 30) return 'Maestro de armas';
    if (porcentaje >= 15) return 'Caballero';
    if (porcentaje >= 5) return 'Escudero';
    return 'Aprendiz';
  }

  color(nombre: string) {
    return COLORES[nombre] ?? 'var(--dorado)';
  }
}