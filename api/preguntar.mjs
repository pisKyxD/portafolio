// funcion serverless de vercel: recibe la pregunta desde el portafolio y se la pasa a la IA
// la api key vive solo aca en el servidor, nunca llega al navegador
import { CONTEXTO } from './_contexto.mjs';

// limites para que nadie me mande textos gigantes
const MAX_PREGUNTA = 300;
const MAX_HISTORIAL = 6;

// el router gratis elige un modelo al azar, si sale uno malo pruebo de nuevo
const MAX_INTENTOS = 3;

// limite por visitante para que nadie me gaste la cuota del dia
const LIMITE_MINUTO = 5;
const LIMITE_HORA = 20;
const UN_MINUTO = 60 * 1000;
const UNA_HORA = 60 * 60 * 1000;

// tope de preguntas al dia para toda la funcion (sumando todos los visitantes)
// si alguien cambia de ip para saltarse el limite de arriba, igual choca con este
const LIMITE_DIA = 300;
const UN_DIA = 24 * UNA_HORA;
let preguntasHoy = { desde: Date.now(), total: 0 };

// solo mi portafolio puede usar a sir bit. si alguien lo llama desde otra pagina el navegador manda
// otro "Origin" y lo rechazo. en ORIGENES_PERMITIDOS (vercel) puedo agregar mas separados por coma
const ORIGENES = [
  'https://portafolio-tau-ten-62.vercel.app',
  'http://localhost:4200',
  'http://localhost:3000',
  ...(process.env.ORIGENES_PERMITIDOS ?? '').split(',').map((o) => o.trim()).filter(Boolean),
];

// guardo cuando pregunto cada ip, vive en la memoria de la funcion
// no es perfecto porque vercel puede levantar varias copias, pero frena a la mayoria
const preguntasPorIp = new Map();

function superaLimite(ip) {
  const ahora = Date.now();

  // me quedo solo con las preguntas de la ultima hora
  const recientes = (preguntasPorIp.get(ip) ?? []).filter((t) => ahora - t < UNA_HORA);
  const ultimoMinuto = recientes.filter((t) => ahora - t < UN_MINUTO).length;

  if (ultimoMinuto >= LIMITE_MINUTO || recientes.length >= LIMITE_HORA) {
    preguntasPorIp.set(ip, recientes);
    return true;
  }

  recientes.push(ahora);
  preguntasPorIp.set(ip, recientes);

  // limpio ips viejas de vez en cuando para que el mapa no crezca infinito
  if (preguntasPorIp.size > 500) {
    for (const [clave, tiempos] of preguntasPorIp) {
      if (!tiempos.some((t) => ahora - t < UNA_HORA)) preguntasPorIp.delete(clave);
    }
  }

  return false;
}

// cuenta la pregunta en el tope del dia. devuelve true si ya se paso
function superaLimiteDia() {
  const ahora = Date.now();
  if (ahora - preguntasHoy.desde > UN_DIA) preguntasHoy = { desde: ahora, total: 0 };
  if (preguntasHoy.total >= LIMITE_DIA) return true;
  preguntasHoy.total++;
  return false;
}

// el navegador manda solo el "Origin" en los POST: dice desde que pagina viene la pregunta
// un script podria inventarlo, pero asi nadie puede poner a sir bit en su propia pagina
function origenPermitido(req) {
  const origen = req.headers.origin;
  return typeof origen === 'string' && ORIGENES.includes(origen);
}

// ip del visitante. x-real-ip la pone vercel y el visitante no la puede cambiar
// (x-forwarded-for queda de respaldo por si pruebo fuera de vercel)
function obtenerIp(req) {
  const real = req.headers['x-real-ip'];
  if (typeof real === 'string' && real) return real.trim();
  const reenviada = req.headers['x-forwarded-for'];
  if (typeof reenviada === 'string' && reenviada) {
    return reenviada.split(',')[0].trim();
  }
  return req.socket?.remoteAddress ?? 'desconocida';
}

// revisa que la respuesta sea una conversacion de verdad
// a veces el router elige un modelo clasificador que solo responde "safe" o "unsafe"
function respuestaValida(texto) {
  if (!texto || texto.length < 15) return false;
  if (/^\s*(user safety|safety|safe|unsafe)\b/i.test(texto)) return false;
  return true;
}

// le pregunta una vez a openrouter y devuelve el texto o un error
async function consultarIA(clave, mensajes) {
  const respuesta = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${clave}`,
      'Content-Type': 'application/json',
      'X-Title': 'Portafolio pisKy',
    },
    body: JSON.stringify({
      // router de modelos gratis, elige solo uno de los que esten disponibles
      model: 'openrouter/free',
      max_tokens: 400,
      temperature: 0.6,
      // a los modelos que razonan les pido que piensen poco y no me manden el razonamiento
      reasoning: { effort: 'low', exclude: true },
      messages: mensajes,
    }),
  });

  if (respuesta.status === 429) {
    return { limite: true };
  }

  if (!respuesta.ok) {
    console.error('OpenRouter respondió', respuesta.status, await respuesta.text());
    return { texto: '' };
  }

  const datos = await respuesta.json();
  let texto = datos.choices?.[0]?.message?.content ?? '';

  // algunos modelos igual piensan en voz alta entre <think>, eso no lo muestro
  texto = texto.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

  // dejo registro de que modelo respondio, sirve para ver los logs en vercel
  console.log('Modelo usado:', datos.model);

  return { texto };
}

export default async function handler(req, res) {
  // solo acepto POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Solo se permite POST' });
  }

  if (!origenPermitido(req)) {
    return res.status(403).json({ error: 'Solo se puede preguntar desde el portafolio' });
  }

  const clave = process.env.OPENROUTER_API_KEY;
  if (!clave) {
    return res.status(500).json({ error: 'Falta configurar la API key en el servidor' });
  }

  const { pregunta, historial } = req.body ?? {};

  if (typeof pregunta !== 'string' || !pregunta.trim()) {
    return res.status(400).json({ error: 'La pregunta viene vacía' });
  }
  if (pregunta.length > MAX_PREGUNTA) {
    return res.status(400).json({ error: 'La pregunta es muy larga' });
  }

  // si el visitante pregunta demasiado (o se lleno el tope del dia), sir bit responde en personaje sin llamar a la IA
  if (superaLimite(obtenerIp(req)) || superaLimiteDia()) {
    return res.status(200).json({
      respuesta:
        'Tantas preguntas me han dejado sin aliento, viajero. Dame un momento para recuperar fuerzas, o escríbele directo a mi señor desde la sección Contacto.',
    });
  }

  // limpio el historial para quedarme solo con mensajes validos y los ultimos 6
  const historialLimpio = Array.isArray(historial)
    ? historial
        .filter((m) => m && (m.rol === 'usuario' || m.rol === 'guia') && typeof m.texto === 'string')
        .slice(-MAX_HISTORIAL)
        .map((m) => ({
          role: m.rol === 'usuario' ? 'user' : 'assistant',
          content: m.texto.slice(0, 1000),
        }))
    : [];

  const mensajes = [
    { role: 'system', content: CONTEXTO },
    ...historialLimpio,
    { role: 'user', content: pregunta.trim() },
  ];

  try {
    // pruebo hasta 3 veces hasta que salga una respuesta que sirva
    for (let intento = 1; intento <= MAX_INTENTOS; intento++) {
      const resultado = await consultarIA(clave, mensajes);

      // si se acabo la cuota no tiene sentido seguir intentando
      if (resultado.limite) {
        return res.status(429).json({ error: 'Límite de preguntas alcanzado' });
      }

      if (respuestaValida(resultado.texto)) {
        return res.status(200).json({ respuesta: resultado.texto });
      }

      console.warn(`Intento ${intento}: respuesta no válida, pruebo de nuevo`);
    }

    return res.status(502).json({ error: 'La IA no dio una respuesta válida' });
  } catch (error) {
    console.error('Error consultando la IA:', error);
    return res.status(500).json({ error: 'Error al consultar la IA' });
  }
}