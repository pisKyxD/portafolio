import { Component, signal } from '@angular/core';
import { PERFIL } from '../../data/perfil';

// una forma de contacto, la muestro como tarjeta
interface Canal {
  icono: string;
  titulo: string;
  detalle: string;
  url: string;
  accion: string;
}

@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.html',
  styleUrl: './contacto.css',
})
export class Contacto {
  perfil = PERFIL;

  // el año sale solo, asi no tengo que cambiarlo cada enero
  anio = new Date().getFullYear();

  // para mostrar "copiado" un ratito despues de copiar el correo
  copiado = signal(false);

  // armo las tarjetas y saco las que todavia tienen TODO
  canales: Canal[] = [
    {
      icono: '✉',
      titulo: 'Enviar un cuervo',
      detalle: PERFIL.correo,
      url: `mailto:${PERFIL.correo}`,
      accion: 'Escribir correo',
    },
    {
      icono: '⚜',
      titulo: 'El gremio',
      detalle: 'Mi perfil profesional en LinkedIn',
      url: PERFIL.linkedin,
      accion: 'Ver LinkedIn',
    },
    {
      icono: '⚒',
      titulo: 'La armería',
      detalle: `github.com/${PERFIL.usuarioGithub}`,
      url: PERFIL.github,
      accion: 'Ver GitHub',
    },
  ].filter((canal) => !canal.url.includes('TODO'));

  correoValido() {
    return !PERFIL.correo.includes('TODO');
  }

  async copiarCorreo() {
    // el portapapeles puede fallar en algunos navegadores, por eso va con try/catch
    try {
      await navigator.clipboard.writeText(PERFIL.correo);
      this.copiado.set(true);
      setTimeout(() => this.copiado.set(false), 2000);
    } catch {
      // si no se puede copiar, igual queda el boton de escribir correo
    }
  }
}