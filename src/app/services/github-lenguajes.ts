import { Injectable, signal } from '@angular/core';

// un lenguaje ya calculado, listo para mostrar en las barras
export interface Lenguaje {
  nombre: string;
  bytes: number;
  porcentaje: number;
  repos: number;
}

interface RespuestaLenguajes {
  lenguajes: Lenguaje[];
  totalRepos: number;
}

// guardo el resultado una hora en el navegador para que cargue al tiro si vuelven a entrar
// le cambio el nombre a la clave cada vez que cambia el calculo, asi nadie ve los datos viejos
const CLAVE_CACHE = 'portafolio-lenguajes-v3';
const DURACION_CACHE = 60 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class GithubLenguajes {
  lenguajes = signal<Lenguaje[]>([]);
  totalRepos = signal(0);
  cargando = signal(true);
  error = signal(false);

  async cargar() {
    // si ya lo tengo guardado y no ha pasado una hora, uso eso
    const guardado = this.leerCache();
    if (guardado) {
      this.lenguajes.set(guardado.lenguajes);
      this.totalRepos.set(guardado.totalRepos);
      this.cargando.set(false);
      return;
    }

    try {
      // el calculo lo hace mi funcion en vercel, que puede ver tambien los repos privados
      const respuesta = await fetch('/api/lenguajes');
      if (!respuesta.ok) {
        throw new Error(`El servidor respondió ${respuesta.status}`);
      }

      const datos: RespuestaLenguajes = await respuesta.json();
      this.lenguajes.set(datos.lenguajes);
      this.totalRepos.set(datos.totalRepos);

      // solo guardo si vino algo, asi no se queda pegado un resultado vacio
      if (datos.lenguajes.length > 0) {
        this.guardarCache(datos);
      }
    } catch (e) {
      console.error('Error cargando lenguajes:', e);
      this.error.set(true);
    } finally {
      this.cargando.set(false);
    }
  }

  // el localStorage puede fallar en modo incognito, por eso va con try/catch
  private leerCache(): RespuestaLenguajes | null {
    try {
      const texto = localStorage.getItem(CLAVE_CACHE);
      if (!texto) return null;
      const datos = JSON.parse(texto);
      if (Date.now() - datos.fecha > DURACION_CACHE) return null;
      return datos;
    } catch {
      return null;
    }
  }

  private guardarCache(datos: RespuestaLenguajes) {
    try {
      localStorage.setItem(CLAVE_CACHE, JSON.stringify({ fecha: Date.now(), ...datos }));
    } catch {
      // si no se puede guardar no pasa nada, la proxima vez vuelve a consultar
    }
  }
}