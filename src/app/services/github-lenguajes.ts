import { Injectable, signal } from '@angular/core';
import { PERFIL } from '../data/perfil';

// un lenguaje ya calculado, listo para mostrar en las barras
export interface Lenguaje {
  nombre: string;
  bytes: number;
  porcentaje: number;
  repos: number;
}

// lo minimo que necesito de cada repo que devuelve github
interface RepoGithub {
  fork: boolean;
  languages_url: string;
}

// guardo el resultado una hora en el navegador para no gastar el limite de la api
const CLAVE_CACHE = 'portafolio-lenguajes';
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
      // 1. traigo mis repos publicos
      const respuesta = await fetch(
        `https://api.github.com/users/${PERFIL.usuarioGithub}/repos?per_page=100&type=owner`,
      );
      if (!respuesta.ok) {
        throw new Error('No se pudieron leer los repos de GitHub');
      }
      const repos: RepoGithub[] = await respuesta.json();

      // los forks no los cuento porque no son codigo mio
      const propios = repos.filter((repo) => !repo.fork);

      // 2. pido los lenguajes de cada repo, todos al mismo tiempo
      const lenguajesPorRepo = await Promise.all(
        propios.map((repo) =>
          fetch(repo.languages_url)
            .then((res) => (res.ok ? res.json() : {}))
            .catch(() => ({})),
        ),
      );

      // 3. sumo los bytes de cada lenguaje y en cuantos repos aparece
      const totales = new Map<string, { bytes: number; repos: number }>();
      for (const lenguajesRepo of lenguajesPorRepo) {
        for (const [nombre, bytes] of Object.entries(lenguajesRepo as Record<string, number>)) {
          const actual = totales.get(nombre) ?? { bytes: 0, repos: 0 };
          actual.bytes += bytes;
          actual.repos += 1;
          totales.set(nombre, actual);
        }
      }

      // 4. saco el porcentaje de cada uno y me quedo con los 8 mas usados
      const sumaTotal = [...totales.values()].reduce((suma, l) => suma + l.bytes, 0);
      const lista: Lenguaje[] = [...totales.entries()]
        .map(([nombre, datos]) => ({
          nombre,
          bytes: datos.bytes,
          repos: datos.repos,
          porcentaje: sumaTotal ? (datos.bytes / sumaTotal) * 100 : 0,
        }))
        .sort((a, b) => b.bytes - a.bytes)
        .slice(0, 8);

      this.lenguajes.set(lista);
      this.totalRepos.set(propios.length);
      this.guardarCache(lista, propios.length);
    } catch (e) {
      console.error('Error cargando lenguajes:', e);
      this.error.set(true);
    } finally {
      this.cargando.set(false);
    }
  }

  // el localStorage puede fallar en modo incognito, por eso va con try/catch
  private leerCache(): { lenguajes: Lenguaje[]; totalRepos: number } | null {
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

  private guardarCache(lenguajes: Lenguaje[], totalRepos: number) {
    try {
      localStorage.setItem(CLAVE_CACHE, JSON.stringify({ fecha: Date.now(), lenguajes, totalRepos }));
    } catch {
      // si no se puede guardar no pasa nada, la proxima vez vuelve a consultar
    }
  }
}