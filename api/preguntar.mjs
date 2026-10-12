// funcion serverless de vercel: recibe la pregunta desde el portafolio y se la pasa a la IA
// la api key vive solo aca en el servidor, nunca llega al navegador
import { CONTEXTO } from './_contexto.mjs';

// limites para que nadie me mande textos gigantes
const MAX_PREGUNTA = 300;
const MAX_HISTORIAL = 6;

// el router gratis elige un modelo al azar, si sale uno malo pruebo de nuevo
const MAX_INTENTOS = 3;

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