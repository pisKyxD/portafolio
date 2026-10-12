import { Component, OnDestroy, afterNextRender, signal } from '@angular/core';
import { DIALOGOS, NOMBRE_GUIA } from '../../data/dialogos';

// datos del sprite, cada animacion viene en su propio png
// la cantidad de cuadros se calcula sola segun el tamaño de la imagen
const SPRITE = {
  anchoCuadro: 112,
  altoCuadro: 96,
  animaciones: {
    idle: { archivo: '/guia/idle.png', velocidad: 140, repetir: true },
    ataque: { archivo: '/guia/ataque.png', velocidad: 60, repetir: false },
  },
};

type NombreAnimacion = keyof typeof SPRITE.animaciones;

// lo que calculo de cada imagen cuando carga
interface HojaCargada {
  columnas: number;
  cuadros: number;
  tamano: string;
}

@Component({
  selector: 'app-guia',
  templateUrl: './guia.html',
  styleUrl: './guia.css',
})
export class Guia implements OnDestroy {
  nombre = NOMBRE_GUIA;

  // ---------- dialogos ----------
  seccionActual = signal('inicio');
  indice = signal(0);
  texto = signal('');
  escribiendo = signal(false);
  abierto = signal(true);

  // ---------- sprite ----------
  anchoCuadro = SPRITE.anchoCuadro;
  altoCuadro = SPRITE.altoCuadro;
  archivoActual = signal(SPRITE.animaciones.idle.archivo);
  posicionFondo = signal('0px 0px');
  tamanoHoja = signal('auto');
  spriteListo = signal(false);

  private hojas: Partial<Record<NombreAnimacion, HojaCargada>> = {};
  private cuadro = 0;
  private animacion: NombreAnimacion = 'idle';

  private intervaloTexto?: ReturnType<typeof setInterval>;
  private intervaloSprite?: ReturnType<typeof setInterval>;
  private observador?: IntersectionObserver;
  private sinAnimacion = false;

  constructor() {
    // espero a que toda la pagina este dibujada para encontrar las secciones
    afterNextRender(() => {
      // si la persona tiene desactivadas las animaciones en su sistema, las respeto
      this.sinAnimacion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.cargarSprites();
      this.observarSecciones();
      this.mostrarLinea();
    });
  }

  ngOnDestroy() {
    clearInterval(this.intervaloTexto);
    clearInterval(this.intervaloSprite);
    this.observador?.disconnect();
  }

  // ================= SPRITE =================

  // cargo cada png para saber cuantos cuadros tiene
  private cargarSprites() {
    const nombres = Object.keys(SPRITE.animaciones) as NombreAnimacion[];

    for (const nombre of nombres) {
      const archivo = SPRITE.animaciones[nombre].archivo;
      const imagen = new Image();

      imagen.onload = () => {
        const columnas = Math.max(1, Math.floor(imagen.naturalWidth / SPRITE.anchoCuadro));
        const filas = Math.max(1, Math.floor(imagen.naturalHeight / SPRITE.altoCuadro));
        this.hojas[nombre] = {
          columnas,
          cuadros: columnas * filas,
          tamano: `${imagen.naturalWidth}px ${imagen.naturalHeight}px`,
        };

        // apenas carga el idle, el caballero aparece
        if (nombre === 'idle') {
          this.spriteListo.set(true);
          this.iniciarAnimacion('idle');
        }
      };

      imagen.onerror = () => {
        console.error('No se encontró el sprite en', archivo);
      };

      imagen.src = archivo;
    }
  }

  private iniciarAnimacion(nombre: NombreAnimacion) {
    const hoja = this.hojas[nombre];
    // si esa imagen todavia no carga, no hago nada
    if (!hoja) return;

    clearInterval(this.intervaloSprite);
    this.animacion = nombre;
    this.cuadro = 0;
    this.archivoActual.set(SPRITE.animaciones[nombre].archivo);
    this.tamanoHoja.set(hoja.tamano);
    this.dibujarCuadro();

    // sin animaciones se queda quieto en el primer cuadro
    if (this.sinAnimacion) return;

    const datos = SPRITE.animaciones[nombre];
    this.intervaloSprite = setInterval(() => {
      this.cuadro++;
      if (this.cuadro >= hoja.cuadros) {
        // el ataque se hace una vez y vuelve a respirar, el idle se repite siempre
        if (!datos.repetir) {
          this.iniciarAnimacion('idle');
          return;
        }
        this.cuadro = 0;
      }
      this.dibujarCuadro();
    }, datos.velocidad);
  }

  // mueve el fondo para mostrar el cuadro que toca
  private dibujarCuadro() {
    const hoja = this.hojas[this.animacion];
    if (!hoja) return;
    const columna = this.cuadro % hoja.columnas;
    const fila = Math.floor(this.cuadro / hoja.columnas);
    this.posicionFondo.set(`-${columna * SPRITE.anchoCuadro}px -${fila * SPRITE.altoCuadro}px`);
  }

  private atacar() {
    // si ya esta atacando no lo interrumpo
    if (this.animacion !== 'ataque') {
      this.iniciarAnimacion('ataque');
    }
  }

  // ================= DIALOGOS =================

  // detecta que seccion esta en el medio de la pantalla
  private observarSecciones() {
    const secciones = document.querySelectorAll('section[id]');

    this.observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          const id = entrada.target.id;
          if (entrada.isIntersecting && id !== this.seccionActual() && DIALOGOS[id]) {
            this.seccionActual.set(id);
            this.indice.set(0);
            this.mostrarLinea();
          }
        }
      },
      // solo cuenta la seccion que cruza la franja del medio de la pantalla
      { rootMargin: '-45% 0px -45% 0px' },
    );

    secciones.forEach((seccion) => this.observador!.observe(seccion));
  }

  private lineas() {
    return DIALOGOS[this.seccionActual()] ?? [];
  }

  // escribe la linea actual letra por letra
  private mostrarLinea() {
    const linea = this.lineas()[this.indice()] ?? '';
    clearInterval(this.intervaloTexto);

    if (!this.abierto() || this.sinAnimacion) {
      this.texto.set(linea);
      this.escribiendo.set(false);
      return;
    }

    let letra = 0;
    this.texto.set('');
    this.escribiendo.set(true);

    this.intervaloTexto = setInterval(() => {
      letra++;
      this.texto.set(linea.slice(0, letra));
      if (letra >= linea.length) {
        clearInterval(this.intervaloTexto);
        this.escribiendo.set(false);
      }
    }, 25);
  }

  // si esta escribiendo, completa la linea; si no, pasa a la siguiente
  siguiente() {
    if (this.escribiendo()) {
      clearInterval(this.intervaloTexto);
      this.texto.set(this.lineas()[this.indice()]);
      this.escribiendo.set(false);
      return;
    }
    this.indice.set((this.indice() + 1) % this.lineas().length);
    this.mostrarLinea();
  }

  alternar() {
    this.abierto.update((abierto) => !abierto);
    if (this.abierto()) {
      this.mostrarLinea();
    } else {
      clearInterval(this.intervaloTexto);
      this.escribiendo.set(false);
    }
  }

  // clic en el caballero: ataca y avanza el dialogo, o aparece si estaba escondido
  clicPersonaje() {
    this.atacar();
    if (this.abierto()) {
      this.siguiente();
    } else {
      this.alternar();
    }
  }
}