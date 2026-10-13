// funcion serverless de vercel: calcula cuanto uso cada lenguaje sumando todos mis repos
// el token de github vive solo aca, asi puedo contar tambien los repos privados
const USUARIO = 'pisKyxD';

// repos que no quiero que cuenten aunque sean mios (por ejemplo pruebas), en minusculas
const IGNORAR = [];

// trae todas las paginas, github devuelve maximo 100 repos por pagina
async function traerTodos(url, cabeceras) {
  const todos = [];
  for (let pagina = 1; pagina <= 10; pagina++) {
    const respuesta = await fetch(`${url}&page=${pagina}`, { headers: cabeceras });
    if (!respuesta.ok) {
      throw new Error(`GitHub respondió ${respuesta.status}: ${await respuesta.text()}`);
    }
    const repos = await respuesta.json();
    todos.push(...repos);
    if (repos.length < 100) break;
  }
  return todos;
}

// un fork solo cuenta si yo le hice push despues de copiarlo (asi no cuento forks que nunca toque)
function trabajeEnElFork(repo) {
  return new Date(repo.pushed_at).getTime() - new Date(repo.created_at).getTime() > 60 * 1000;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Solo se permite GET' });
  }

  const token = process.env.GITHUB_TOKEN;

  const cabeceras = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'portafolio-pisky',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) {
    cabeceras.Authorization = `Bearer ${token}`;
  } else {
    // si sale esto en los logs de vercel es porque falta la variable GITHUB_TOKEN
    console.warn('No hay GITHUB_TOKEN, solo se van a contar los repos publicos');
  }

  // con token traigo mis repos publicos y privados, y en los que soy colaborador
  // sin token solo los publicos
  const urlRepos = token
    ? 'https://api.github.com/user/repos?per_page=100&affiliation=owner,collaborator&visibility=all'
    : `https://api.github.com/users/${USUARIO}/repos?per_page=100&type=owner`;

  try {
    const repos = await traerTodos(urlRepos, cabeceras);

    // los forks que nunca toque no cuentan, los que si trabaje si
    const contados = repos.filter((repo) => {
      if (IGNORAR.includes(repo.name.toLowerCase())) return false;
      if (repo.fork) return trabajeEnElFork(repo);
      return true;
    });

    // pido los lenguajes de cada repo, todos al mismo tiempo
    const lenguajesPorRepo = await Promise.all(
      contados.map((repo) =>
        fetch(repo.languages_url, { headers: cabeceras })
          .then((r) => (r.ok ? r.json() : {}))
          .catch(() => ({})),
      ),
    );

    // sumo los bytes de cada lenguaje y en cuantos repos aparece
    const totales = new Map();
    for (const lenguajesRepo of lenguajesPorRepo) {
      for (const [nombre, bytes] of Object.entries(lenguajesRepo)) {
        const actual = totales.get(nombre) ?? { bytes: 0, repos: 0 };
        actual.bytes += bytes;
        actual.repos += 1;
        totales.set(nombre, actual);
      }
    }

    // saco el porcentaje de cada uno y me quedo con los 8 mas usados
    const sumaTotal = [...totales.values()].reduce((suma, l) => suma + l.bytes, 0);
    const lenguajes = [...totales.entries()]
      .map(([nombre, datos]) => ({
        nombre,
        bytes: datos.bytes,
        repos: datos.repos,
        porcentaje: sumaTotal ? (datos.bytes / sumaTotal) * 100 : 0,
      }))
      .sort((a, b) => b.bytes - a.bytes)
      .slice(0, 8);

    // vercel guarda esta respuesta 1 hora en su cache, asi github casi no recibe consultas
    // y si pasa la hora sigue mostrando la anterior mientras calcula la nueva
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

    return res.status(200).json({ lenguajes, totalRepos: contados.length });
  } catch (error) {
    console.error('Error calculando lenguajes:', error);
    return res.status(502).json({ error: 'No se pudieron leer los repos' });
  }
}