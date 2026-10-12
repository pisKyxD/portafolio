// nombre del personaje, si lo quiero cambiar lo hago aca
export const NOMBRE_GUIA = 'Sir Bit, caballero de la corte';

// lo que dice el guia en cada seccion, la clave tiene que ser igual al id de la section
export const DIALOGOS: Record<string, string[]> = {
  inicio: [
    '¡Salve, viajero! Soy Sir Bit, caballero al servicio de pisKy.',
    'Si tienes alguna duda sobre mi señor, presiona "Pregúntame" y te respondo lo que quieras.',
    'O simplemente recorre el reino, que yo te voy contando lo importante en cada sección.',
  ],
  'sobre-mi': [
    'Aquí conocerás a mi señor. Estudia en Duoc UC y se especializa en backend y nube.',
    'Le gusta construir lo que no se ve: APIs, microservicios y bases de datos.',
  ],
  gestas: [
    'Estas son sus gestas. TrabajoAquí es la más grande: ¡un mapa de empleos con rutas en micro!',
    'VidalStore es una tienda de videojuegos con microservicios y login con AWS.',
    '¿Quieres saber más de algún proyecto? Presiona "Pregúntame" y te lo explico.',
  ],
  habilidades: [
    'Estas barras no son inventadas: salen directo de sus repositorios en GitHub.',
    'Cada vez que sube un proyecto, ganan experiencia solas.',
  ],
  contacto: [
    '¿Buscas a alguien que se una a tu causa? Mi señor siempre está dispuesto a escuchar.',
    'Envíale un mensaje por aquí abajo y te responderá a la brevedad.',
  ],
};