// cada gesta es un proyecto, si hago uno nuevo solo lo agrego a esta lista
export interface Gesta {
  id: string;
  titulo: string;
  subtitulo: string;
  estado: 'En curso' | 'Completada';
  desafio: string;
  hazanas: string[];
  stack: string[];
  demo?: string;
  repos: { nombre: string; url: string }[];
}

export const GESTAS: Gesta[] = [
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
    // TODO: poner el link del repo de trabajoaqui
    repos: [{ nombre: 'Repositorio', url: 'TODO' }],
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
    // TODO: revisar que estos repos esten publicos
    repos: [
      { nombre: 'Catálogo', url: 'https://github.com/pisKyxD/vidalstore-catalogo' },
      { nombre: 'Biblioteca', url: 'https://github.com/pisKyxD/vidalstore-biblioteca' },
      { nombre: 'Gateway', url: 'https://github.com/pisKyxD/vidalstore-backend' },
    ],
  },
];