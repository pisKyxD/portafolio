import { Component, ElementRef, OnDestroy, afterNextRender, signal, viewChild } from '@angular/core';
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

// cada mensaje de la conversacion con la IA
interface Mensaje {
  rol: 'usuario' | 'guia';
  texto: string;
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

  // ---------- preguntas a la IA ----------
  // dialogo = va contando cosas por seccion, pregunta = la persona le escribe
  modo = signal<'dialogo' | 'pregunta'>('dialogo');
  pregunta = signal('');
  pensando = signal(false);
  private historial: Mensaje[] = [];
  private campo = viewChild<ElementRef<HTMLInputElement>>('campo');

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

  // el texto completo que se esta escribiendo, para poder saltarlo
  private textoCompleto = '';

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
    if (!hoja) return;

    clearInterval(this.intervaloSprite);
    this.animacion = nombre;
    this.cuadro = 0;
    this.archivoActual.set(SPRITE.animaciones[nombre].archivo);
    this.tamanoHoja.set(hoja.tamano);
    this.dibujarCuadro();

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
    if (this.animacion !== 'ataque') {
      this.iniciarAnimacion('ataque');
    }
  }

  // ================= TEXTO =================

  // escribe cualquier texto letra por letra, lo uso para dialogos y respuestas de la IA
  private escribir(linea: string) {
    this.textoCompleto = linea;
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
    }, 22);
  }

  // muestra el texto completo de una
  private completarTexto() {
    clearInterval(this.intervaloTexto);
    this.texto.set(this.textoCompleto);
    this.escribiendo.set(false);
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
            // si la persona esta preguntandole algo, no le cambio el texto
            if (this.modo() === 'dialogo') {
              this.mostrarLinea();
            }
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

  private mostrarLinea() {
    this.escribir(this.lineas()[this.indice()] ?? '');
  }

  // si esta escribiendo, completa la linea; si no, pasa a la siguiente
  siguiente() {
    if (this.escribiendo()) {
      this.completarTexto();
      return;
    }
    this.indice.set((this.indice() + 1) % this.lineas().length);
    this.mostrarLinea();
  }

  alternar() {
    this.abierto.update((abierto) => !abierto);
    if (this.abierto()) {
      if (this.modo() === 'dialogo') {
        this.mostrarLinea();
      } else {
        this.texto.set(this.textoCompleto);
        this.enfocarCampo();
      }
    } else {
      clearInterval(this.intervaloTexto);
      this.escribiendo.set(false);
    }
  }

  // clic en el caballero: ataca y avanza el dialogo, o aparece si estaba escondido
  clicPersonaje() {
    this.atacar();
    if (!this.abierto()) {
      this.alternar();
      return;
    }
    if (this.modo() === 'dialogo') {
      this.siguiente();
    }
  }

  // ================= PREGUNTAS A LA IA =================

  abrirPregunta() {
    this.modo.set('pregunta');
    this.escribir('Pregúntame lo que quieras sobre mi señor: sus proyectos, su stack o lo que estudia.');
    this.enfocarCampo();
  }

  volverDialogos() {
    this.modo.set('dialogo');
    this.mostrarLinea();
  }

  actualizarPregunta(evento: Event) {
    this.pregunta.set((evento.target as HTMLInputElement).value);
  }

  async enviarPregunta(evento: Event) {
    // el form recarga la pagina si no lo detengo
    evento.preventDefault();

    const pregunta = this.pregunta().trim();
    if (!pregunta || this.pensando()) return;

    this.pensando.set(true);
    this.escribir('Déjame consultar los pergaminos...');

    try {
      const respuesta = await fetch('/api/preguntar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pregunta, historial: this.historial.slice(-6) }),
      });

      if (respuesta.status === 429) {
        this.escribir(
          'Uf, hoy he respondido demasiadas preguntas y necesito descansar. Vuelve más tarde o escríbele a mi señor desde Contacto.',
        );
        return;
      }

      if (!respuesta.ok) {
        throw new Error(`El servidor respondió ${respuesta.status}`);
      }

      const datos: { respuesta: string } = await respuesta.json();

      // guardo la conversacion para que la IA tenga contexto en la siguiente pregunta
      this.historial.push({ rol: 'usuario', texto: pregunta }, { rol: 'guia', texto: datos.respuesta });
      this.pregunta.set('');
      this.atacar();
      this.escribir(datos.respuesta);
    } catch (error) {
      console.error('Error preguntando a la IA:', error);
      this.escribir('Los cuervos se perdieron en el camino y no pude responder. Intenta de nuevo en un momento.');
    } finally {
      this.pensando.set(false);
      this.enfocarCampo();
    }
  }

  // pone el cursor en el campo de texto apenas aparece
  private enfocarCampo() {
    setTimeout(() => this.campo()?.nativeElement.focus(), 0);
  }
}