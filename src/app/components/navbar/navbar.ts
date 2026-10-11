import { Component, HostListener, signal } from '@angular/core';
import { PERFIL } from '../../data/perfil';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  perfil = PERFIL;

  // si el menu del celular esta abierto o cerrado
  menuAbierto = signal(false);

  // cuando la persona baja un poco, la barra se pone con fondo
  conScroll = signal(false);

  // las secciones del menu, el id tiene que ser igual al id de cada section
  secciones = [
    { id: 'inicio', nombre: 'Inicio' },
    { id: 'sobre-mi', nombre: 'Sobre mí' },
    { id: 'gestas', nombre: 'Gestas' },
    { id: 'habilidades', nombre: 'Habilidades' },
    { id: 'contacto', nombre: 'Contacto' },
  ];

  @HostListener('window:scroll')
  alHacerScroll() {
    this.conScroll.set(window.scrollY > 40);
  }

  alternarMenu() {
    this.menuAbierto.update((abierto) => !abierto);
  }

  cerrarMenu() {
    this.menuAbierto.set(false);
  }
}