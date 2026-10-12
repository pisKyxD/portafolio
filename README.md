<p align="center">
  <img src="public/escudo.svg" alt="Escudo de una torre con una nube" width="90">
</p>

<h1 align="center">Portafolio de pisKy</h1>

<p align="center">
  Mi portafolio personal con temática medieval, hecho en Angular.<br>
  <a href="https://portafolio-tau-ten-62.vercel.app"><strong>Ver el portafolio en vivo »</strong></a>
</p>

---

## Sobre el proyecto

Soy Fabián Sánchez, estudiante de Duoc UC, y me especializo en desarrollo backend y cloud. Quería un portafolio que no fuera la típica página con tarjetas, así que lo armé como un reino medieval: mis proyectos son **gestas**, mis lenguajes son **habilidades de combate** y un caballero llamado **Sir Bit** acompaña a quien lo visita.

## Lo que tiene

- **Gestas:** mis proyectos en pergaminos, con el desafío, lo que hice y el stack.
- **Habilidades con datos reales:** las barras de lenguajes no están inventadas. Una función en el servidor suma los lenguajes de todos mis repositorios de GitHub, así que se actualizan solas cada vez que subo un proyecto.
- **Sir Bit, el guía:** un caballero en pixel art que va comentando cada sección mientras bajas, y que responde preguntas sobre mí y mis proyectos usando IA.
- **Diseño responsive** y respeto a la opción de reducir animaciones del sistema.
- **Vista previa al compartir** el link en LinkedIn, WhatsApp, etc.

## Tecnologías

| Parte | Tecnología |
|---|---|
| Frontend | Angular (componentes standalone y signals), TypeScript, CSS |
| Funciones del servidor | Vercel Serverless Functions (Node.js) |
| IA | OpenRouter con modelos gratuitos |
| Datos de lenguajes | API de GitHub |
| Despliegue | Vercel, con deploy automático en cada push a `main` |
| Métricas | Vercel Analytics |

## Cómo funciona por dentro

```
Navegador (Angular)
   ├── /api/lenguajes  →  API de GitHub   (suma los lenguajes de mis repos)
   └── /api/preguntar  →  OpenRouter      (Sir Bit responde preguntas)
```

Las claves de GitHub y OpenRouter viven solo en las variables de entorno de Vercel y nunca llegan al navegador. Las respuestas de lenguajes quedan en la caché de Vercel una hora para no consultar GitHub en cada visita, y las preguntas a Sir Bit tienen un límite por visitante para cuidar la cuota gratuita.

## Estructura

```
portafolio/
├── api/
│   ├── _contexto.mjs      # lo que Sir Bit sabe de mí
│   ├── lenguajes.mjs      # calcula los lenguajes desde GitHub
│   └── preguntar.mjs      # recibe las preguntas y consulta la IA
├── public/
│   ├── escudo.svg         # logo y favicon
│   ├── og-imagen.png      # imagen de la vista previa al compartir
│   └── guia/              # sprites de Sir Bit
└── src/app/
    ├── components/        # navbar, hero, sobre-mi, gestas, habilidades, contacto, guia
    ├── data/              # perfil, gestas y diálogos (aquí se cambia el contenido)
    └── services/          # servicio que pide los lenguajes
```

Para agregar un proyecto o cambiar textos no hay que tocar los componentes: todo el contenido está en `src/app/data/`.

## Correrlo en local

Necesitas Node.js y la CLI de Vercel. Con `ng serve` solo no funcionan las funciones de la carpeta `api`, por eso se usa `vercel dev`.

```bash
npm install
npm install -g vercel
vercel link
vercel dev
```

Se abre en `http://localhost:3000`.

### Variables de entorno

Crea un archivo `.env.local` en la raíz (está en el `.gitignore`, no se sube):

```
OPENROUTER_API_KEY=tu_key_de_openrouter
GITHUB_TOKEN=tu_token_de_github
```

- **OPENROUTER_API_KEY:** se crea en [openrouter.ai](https://openrouter.ai) → Keys.
- **GITHUB_TOKEN:** un fine-grained token de GitHub con acceso de solo lectura (Metadata: Read-only). Sin él, las barras solo cuentan los repos públicos.

## Créditos

- Sprite del caballero: [Pixel Art Crusader](https://jobanni.itch.io/pixel-art-crusader) por **jobanni**. Se usa bajo su licencia, que no permite redistribuir los archivos fuera de este proyecto.
- Fuentes: [Cinzel](https://fonts.google.com/specimen/Cinzel) e [Inter](https://fonts.google.com/specimen/Inter), de Google Fonts.

## Contacto

- GitHub: [@pisKyxD](https://github.com/pisKyxD)
- LinkedIn: [Fabián Sánchez](https://www.linkedin.com/in/fabián-andrés-sánchez-vargas-4b6aba442)

---

<p align="center"><em>Forjando código, una gesta a la vez.</em></p>