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
  // captura o video corto del proyecto, va en la carpeta public/gestas/
  // puede ser imagen (.webp, .png, .jpg, .gif) o video (.mp4, .webm). si el archivo no existe no se muestra nada
  imagen?: string;
  // lo que lee un lector de pantalla en vez de la imagen
  imagenAlt?: string;
  demo?: string;
  // texto del boton de la demo, si no viene dice "Visitar el reino →"
  textoDemo?: string;
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
    // portada del juego. cuando grabe un video de una batalla lo cambio por 'gestas/estandarte-roto.mp4'
    imagen: 'gestas/estandarte-roto.webp',
    imagenAlt: 'Portada de Estandarte Roto: un caballero con armadura y alabarda montado en un caballo acorazado',
    // ya esta publicado en itch.io, se puede jugar en el navegador
    demo: 'https://pisky96.itch.io/estandarte-roto',
    textoDemo: 'Jugar en itch.io →',
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
      'Sección aparte para ofertas de trabajo remoto',
      'Filtros por sueldo, turnos y jornada full o part-time',
      'Seguimiento de postulaciones, agenda de entrevistas y alertas por correo',
      'Rutas en transporte público hasta cada empresa',
      'Importación automática de ofertas desde otros portales',
      'Seguridad: importador protegido contra SSRF, revisión del contenido real de los archivos subidos, conexión cifrada y verificada a la base de datos y cierre de sesión por inactividad',
    ],
    stack: [
      'NestJS',
      'Angular',
      'TypeScript',
      'TypeORM',
      'PostgreSQL',
      'PostGIS',
      'Neon',
      'Google Maps API',
      'Gmail API',
      'Jooble API',
      'Vercel',
      'Render',
    ],
    imagen: 'gestas/trabajoaqui.webp',
    imagenAlt: 'Página de inicio de TrabajoAquí con las ofertas abiertas, empresas y comunas con ofertas en este momento',
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
    // si saco una captura de la tienda la pongo aca (mientras no exista el archivo no se muestra nada)
    imagen: 'gestas/vidalstore.webp',
    imagenAlt: 'Catálogo de juegos de VidalStore',
    // estos repos estan privados, si los hago publicos cambio publico a true y aparecen los botones
    repos: [
      { nombre: 'Catálogo', url: 'https://github.com/pisKyxD/vidalstore-catalogo', publico: false },
      { nombre: 'Biblioteca', url: 'https://github.com/pisKyxD/vidalstore-biblioteca', publico: false },
      { nombre: 'Gateway', url: 'https://github.com/pisKyxD/vidalstore-backend', publico: false },
    ],
  },
];