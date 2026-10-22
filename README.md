# BasketZone

> **El templo del baloncesto** — un sitio editorial sobre las leyendas, los entrenamientos y la técnica del sport.

![Estado](https://img.shields.io/badge/HTML5-E34F26?style=flat-square) ![Estado](https://img.shields.io/badge/CSS3-1572B6?style=flat-square) ![Estado](https://img.shields.io/badge/Deploy-GitHub%20Pages-2ea44f?style=flat-square)

**Sitio en vivo:** https://alfonso-acuna.github.io/basketzone/
**Repositorio:** https://github.com/Alfonso-Acuna/basketzone

---

## 1. Descripción del proyecto

BasketZone es una página web estática sobre baloncesto, publicada de forma gratuita con **GitHub Pages**. El sitio está organizado como un *hub* editorial: el lector entra por un hero con métricas, recorre las **leyendas** del deporte, salta a la **sala de entrenamiento** para ver clips en vivo dentro de la misma página, consulta la tabla de **posiciones**, repasa la **historia** y el **equipamiento**, y termina en el **contacto**.

El diseño evita deliberadamente los colores planos: el fondo es un *mesh gradient* con textura de ruido, los paneles usan *glassmorphism* (`backdrop-filter: blur`) y todos los acentos son degradados (`linear-gradient`) animados.

---

## 2. Estructura HTML5

La página usa etiquetas semánticas de HTML5:

| Etiqueta | Uso en el sitio |
|---|---|
| `<html lang="es">` | Documento raíz con idioma declarado |
| `<head>` | Metadatos, `viewport`, `theme-color`, `preconnect` y hoja de estilos |
| `<body>` | Contenido visible + capa decorativa + `<script>` |
| `<header>` | Hero con marca, navegación, titular y métricas |
| `<nav>` | Menú principal (sticky) y navegación del pie de página |
| `<section>` | 6 secciones temáticas con `id` navegables |
| `<article>` | 7 tarjetas de leyendas, tarjetas de video, paneles y tarjetas de reglas |
| `<footer>` | Pie con marca, enlaces de secciones, recursos y créditos |

### Secciones

| # | `id` | Contenido |
|---|---|---|
| 01 | `#leyendas` | Tarjetas de 7 leyendas con foto, apodo, estadísticas y botón de video |
| 02 | `#entrenamiento` | Reproductor destacado + 4 videos nativos + 4 embeds de YouTube |
| 03 | `#posiciones` | Tabla de las 5 posiciones + reglas de oro y datos de la pista |
| 04 | `#historia` | Introducción al origen + línea de tiempo de 6 hitos |
| 05 | `#equipamiento` | 4 tarjetas de material necesario |
| 06 | `#contacto` | Formulario de contacto + panel con mapa embebido |

---

## 3. Contenido

- **Texto:** `<p>`, `<h1>`, `<h2>`, `<h3>`, `<h4>`, listas `<ul>` y `<ol>`, definiciones `<dl>/<dt>/<dd>`, `<blockquote>`-style `<figcaption>`.
- **Imágenes (`<img>`):** 7 retratos de leyendas (Wikimedia Commons) + 6 fotografías de entrenamiento (Unsplash). Todas llevan `alt`, `loading="lazy"`, `width`/`height` y un `onerror` de respaldo a una foto de Unsplash para que nunca se vea un hueco roto.
- **Enlaces (`<a>`):** anclas internas a cada sección, enlaces externos con `target="_blank" rel="noopener"` (FIBA, NBA, EuroLeague, Wikipedia, Commons) y `mailto:` para el contacto.

---

## 4. Estilos básicos con CSS3

```css
body {
    font-family: var(--font);              /* 'Segoe UI', Helvetica, Arial, system-ui */
    color: var(--text);                     /* #eef3ff */
    background-color: var(--bg-900);        /* #070b16 */
    line-height: 1.65;
}
```

Se aplican de forma explícita: `font-family`, `color`, `background-color`, `margin`, `padding`, además de `line-height`, `width`, `max-width`, `border`, `border-radius` y `opacity`.

---

## 5. Botones y tablas

### Botones (`<button>`)

- `btn-primary` — acción principal con degradado ámbar→naranja→rojo y sombra difusa.
- `btn-ghost` — botón de vidrio (blur) con borde translúcido.
- `btn-outline` — acción secundaria dentro de las tarjetas.
- Botón funcional **"Copiar tabla"** que copia la tabla de posiciones al portapapeles con `navigator.clipboard`.
- Botón **"Ver entrenamiento"** en cada leyenda: cambia el `src` del reproductor destacado y hace scroll suave hasta `#entrenamiento`.

### Tabla (`<table>`, `<tr>`, `<td>`, `<th>`)

`#positionsTable` documenta las 5 posiciones con 6 columnas: número, posición en español, nombre en inglés, rol principal, habilidades clave y rango típico de altura. Lleva `<thead>` con `position: sticky`, cabecera en degradado, filas alternas con `:nth-child(even)` y resalte en `:hover`.

---

## 6. Multimedia

**Todos los videos se reproducen dentro de la página — sin redirecciones ni enlaces que sacan al usuario.**

### Elemento `<video>` nativo (reproductor HTML5, control `controls`)

| Video | Formato | Fuente |
|---|---|---|
| Tipos básicos de regate | WebM | Wikimedia Commons |
| Entrenamiento del Team USA 2012 | Ogg | Wikimedia Commons |
| Saludo a Kobe Bryant | WebM | Wikimedia Commons |
| Mate en Serie A | Ogg | Wikimedia Commons |

Cada `<video>` incluye `<source type="...">`, `poster` y texto alternativo con `<code>video</code>`.

### Elemento `<iframe>` (contenido externo embebido)

- **Reproductor destacado** (`#featuredPlayer`) con `youtube-nocookie.com/embed/...`, `allowfullscreen`, `rel=0` y `modestbranding=1`. Cambia dinámicamente según la leyenda seleccionada.
- **4 embeds de clip** (LeBron, Curry, Durant, Kobe) con `loading="lazy"`.
- **1 iframe de Google Maps** con la ubicación del club.

### Leyendas y sus sesiones de entrenamiento

| Leyenda | Apodo | Video |
|---|---|---|
| LeBron James | King James | *1 hour workout (uncut)* — NBA Highlights |
| Michael Jordan | Su Majestad | *Jordan Workout with Chicago Bulls* |
| Kobe Bryant | Black Mamba | *Kobe Bryant on Practice* |
| Stephen Curry | Chef Curry | *Curry FULL Shooting Workout — 500+ Shots* |
| Kevin Durant | El Segador | *Preparación olímpica con Anthony Edwards* |
| Giannis Antetokounmpo | Greek Freak | *Motivational Workout* |
| Kareem Abdul-Jabbar | Skyhook | *How Kareem Learned the Skyhook* |

> Todos los identificadores de video fueron verificados contra la API oEmbed de YouTube y los archivos de Wikimedia Commons fueron comprobados con respuestas HTTP 200.

---

## 7. Estilos avanzados con CSS3

| Técnica | Dónde se aplica |
|---|---|
| `border-radius` | `10px` a `32px` en tarjetas, botones, paneles y píldoras |
| `box-shadow` | 4 niveles: `--shadow-sm/md/lg` + `--glow` para los botones primarios |
| `transition` | Hover en botones, tarjetas, filas de tabla, enlaces del pie y campos de formulario |
| `transform` | `translateY` en hover, `scale` en la foto del hero, `rotate` en la pelota y los iconos |
| `backdrop-filter: blur()` | Nav, botones fantasma y paneles de vidrio |
| `linear-gradient` / `radial-gradient` | Fondo mesh, botones, cabeceras de tabla, textos `.grad`, iconos |
| `grid` / `flexbox` | Rejillas de leyendas, videos, reglas, timeline y pie de página |
| `aspect-ratio` | Marcos de video 16:9 y tarjetas de imagen 4:3 |
| `position: sticky` | Nav principal y cabecera de la tabla |
| `@keyframes` | Flotación de la pelota, pulso del punto del eyebrow |
| `clip-path` | Recorte con `-webkit-text-stroke` en los números de regla |
| `scroll-behavior: smooth` | Navegación por anclas con `scroll-padding-top` |
| `:focus-visible` | Anillo de foco accesible ámbar |
| `prefers-reduced-motion` | Desactiva animaciones para usuarios que lo prefieren |

---

## 8. JavaScript (vanilla, sin dependencias)

1. **Barra de progreso** de lectura en la parte superior.
2. **Navegación activa** mediante `IntersectionObserver`.
3. **Reproductor destacado** que cambia de video al pulsar "Ver entrenamiento".
4. **Contadores animados** en las métricas del hero (`requestAnimationFrame` + easing cúbico).
5. **Copiar tabla** al portapapeles con feedback visual.
6. **Formulario de contacto** con validación y mensaje de estado (`aria-live`).
7. **Botón "volver arriba"** que aparece al hacer scroll.

---

## 9. Créditos y licencias de medios

- **Fotografías de leyendas:** Wikimedia Commons (dominio público / CC).
- **Fotografías de entrenamiento:** [Unsplash](https://unsplash.com) (Unsplash License).
- **Videos técnicos y sesiones:** Wikimedia Commons y embeds de YouTube.

---

## 10. Publicación

```bash
git add -A
git commit -m "descripcion del cambio"
git push origin main
gh api repos/Alfonso-Acuna/basketzone/pages/builds --method POST
```

- Hosting gratuito: **GitHub Pages** (plan gratuito, sin coste).
- Rama: `main` —_origen: `/` — entrada: `index.html` en la raíz del repositorio.

---

## 11. Estructura del repositorio

```
basketzone/
├── index.html      # Estructura semantica + multimedia + JS vanilla
├── styles.css      # Sistema de diseno "Courtside" (22 bloques)
├── README.md       # Este documento (contexto completo del proyecto)
└── AGENTS.md       # Regla de deploy automatico en cada cambio
```

---

**Proyecto educativo de desarrollo web — 2026.**
