// cada gesta es un proyecto, si hago uno nuevo solo lo agrego a esta lista
export interface Repo {
  nombre: string;
  url: string;
  // solo muestro el boton si el repo es publico, si no la persona llega a un 404
  publico: boolean;
}

export interface Gesta {
  id: string;
  titulo: string;
  subtitulo: string;
  estado: 'En curso' | 'Completada';
  desafio: string;
  hazanas: string[];
  stack: string[];
  demo?: string;
  repos: Repo[];
}

export const GESTAS: Gesta[] = [
  {
    id: 'estandarte-roto',
    titulo: 'Estandarte Roto',
    subtitulo: 'Juego táctico medieval por turnos',
    estado: 'En curso',
    desafio:
      'Hacer mi propio juego desde cero en Godot, mezclando lo crudo de Battle Brothers (mercenarios, plata justa y muerte permanente) con el combate por turnos y los ascensos de clase de Fire Emblem.',
    hazanas: [
      'Combate en grilla con triángulo de armas, cargas de caballería, armadura por zonas, heridas y moral',
      'Compañía de mercenarios con muerte permanente, trasfondos, rasgos y ascensos de clase',
      'Mapas de batalla generados al azar: aldeas, campamentos con empalizada, caravanas y ruinas',
      'Mapa del mundo con viajes, comida, contratos con plazo y emboscadas',
      'Terreno y animaciones dibujados por código, sonido, guardado automático y versión web',
    ],
    stack: ['Godot 4', 'GDScript', 'Git'],
    // cuando lo publique en itch.io le saco el comentario, si no el boton lleva a una pagina que no existe
    // demo: 'https://pisky96.itch.io/estandarte-roto',
    repos: [{ nombre: 'Repositorio', url: 'https://github.com/pisKyxD/juego-tactico', publico: false }],
  },
  {
    id: 'trabajoaqui',
    titulo: 'TrabajoAquí',
    subtitulo: 'Plataforma de búsqueda de empleo',
    estado: 'En curso',
    desafio:
      'Encontrar pega cerca de casa en Santiago y en comunas como Peñaflor, Talagante o Melipilla es difícil: las ofertas están dispersas y nadie te dice cómo llegar.',
    hazanas: [
      'Mapa con las empresas que están contratando y un panel con sus ofertas',
      'Filtros por sueldo, turnos y jornada full o part-time',
      'Seguimiento de postulaciones y alertas por correo',
      'Rutas en transporte público hasta cada empresa',
      'Importación automática de ofertas desde otras fuentes',
    ],
    // TODO: agregar los frameworks que use en el frontend y el backend
    stack: ['PostgreSQL', 'Neon', 'Google Maps API', 'Gmail API', 'Jooble API', 'Vercel', 'Render'],
    demo: 'https://trabajoaqui.vercel.app',
    // TODO: poner el link del repo y cambiar publico a true si lo dejo publico
    repos: [{ nombre: 'Repositorio', url: 'TODO', publico: false }],
  },
  {
    id: 'vidalstore',
    titulo: 'VidalStore',
    subtitulo: 'Tienda de videojuegos con microservicios',
    estado: 'En curso',
    desafio:
      'Construir en dupla una tienda de videojuegos con arquitectura por capas y microservicios, con inicio de sesión seguro y distintos roles de usuario.',
    hazanas: [
      'Configuré AWS Cognito con grupos de usuarios (jugadores, editores y administradores), scopes personalizados y clientes de la app',
      'Desarrollé el microservicio de catálogo en NestJS con rutas protegidas que validan tokens JWT',
      'Cargué un catálogo de 1.000 juegos desde la API de RAWG',
      'Arquitectura en capas: Angular, API Gateway, BFF y microservicios',
    ],
    stack: ['NestJS', 'Angular', 'TypeScript', 'AWS Cognito', 'JWT', 'RAWG API'],
    // estos repos estan privados, si los hago publicos cambio publico a true y aparecen los botones
    repos: [
      { nombre: 'Catálogo', url: 'https://github.com/pisKyxD/vidalstore-catalogo', publico: false },
      { nombre: 'Biblioteca', url: 'https://github.com/pisKyxD/vidalstore-biblioteca', publico: false },
      { nombre: 'Gateway', url: 'https://github.com/pisKyxD/vidalstore-backend', publico: false },
    ],
  },
];