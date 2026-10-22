# BasketZone

> **El templo del baloncesto** — un sitio editorial sobre las leyendas, los entrenamientos y la técnica del deporte.

![Estado](https://img.shields.io/badge/HTML5-E34F26?style=flat-square) ![Estado](https://img.shields.io/badge/CSS3-1572B6?style=flat-square) ![Estado](https://img.shields.io/badge/Deploy-GitHub%20Pages-2ea44f?style=flat-square)

**Sitio en vivo:** https://alfonso-acuna.github.io/basketzone/
**Repositorio:** https://github.com/Alfonso-Acuna/basketzone

---

## 1. Descripción del proyecto

BasketZone es una página web estática sobre baloncesto, publicada de forma gratuita con **GitHub Pages**. El sitio está organizado como un *hub* editorial: el lector entra por un hero con métricas, recorre las **leyendas** del deporte, salta a la **sala de entrenamiento** para ver clips en vivo dentro de la misma página, consulta la tabla de **posiciones**, repasa la **historia** y el **equipamiento**, compra en la **tienda** con stock real por talla y termina en el **contacto**.

La tienda es la única parte dinámica: el catálogo, el stock y los pedidos viven en **Supabase** (PostgreSQL + Auth + RLS). GitHub Pages solo sirve HTML, CSS y JS, así que toda la lógica sensible (precios, stock, pedidos) se ejecuta en funciones SQL del servidor.

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
| `<section>` | 7 secciones temáticas con `id` navegables |
| `<article>` | 7 tarjetas de leyendas, tarjetas de producto, paneles y tarjetas de reglas |
| `<footer>` | Pie con marca, enlaces de secciones, recursos y créditos |

### Secciones

| # | `id` | Contenido |
|---|---|---|
| 01 | `#leyendas` | Tarjetas de 7 leyendas con foto, apodo, estadísticas y botón de video |
| 02 | `#entrenamiento` | Reproductor destacado + 4 videos nativos + 4 embeds de YouTube |
| 03 | `#posiciones` | Tabla de las 5 posiciones + reglas de oro y datos de la pista |
| 04 | `#historia` | Introducción al origen + línea de tiempo de 6 hitos |
| 05 | `#equipamiento` | 4 tarjetas de material necesario |
| 06 | `#tienda` | Catálogo con filtros, stock por talla, carrito y checkout |
| 07 | `#contacto` | Formulario de contacto + panel con mapa embebido |

---

## 3. Contenido

- **Texto:** `<p>`, `<h1>`, `<h2>`, `<h3>`, `<h4>`, listas `<ul>` y `<ol>`, definiciones `<dl>/<dt>/<dd>`, `<blockquote>`-style `<figcaption>`.
- **Imágenes (`<img>`):** 7 retratos de leyendas (Wikimedia Commons) + 6 fotografías de entrenamiento (Unsplash) + las fotos de cada producto del catálogo. Todas llevan `alt`, `loading="lazy"`, `width`/`height` y un `onerror` de respaldo a una foto de Unsplash para que nunca se vea un hueco roto.
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
| Tipos básicos de regate | WebM VP9 | Wikimedia Commons |
| Entrenamiento del Team USA 2012 | WebM VP9 | Wikimedia Commons |
| Saludo a Kobe Bryant | WebM VP9 | Wikimedia Commons |
| Mate en Serie A | WebM VP9 | Wikimedia Commons |

Cada `<video>` incluye `<source type="...">`, `poster` y texto alternativo con `<code>video</code>`.

> **Por qué WebM VP9 y no Ogg.** Wikimedia Commons distribuye estos clips como Ogg Theora (`.ogv` / `.ogg`),
> un códec que **Chrome y Edge ya no decodifican** (desde Chrome 123): el `<video>` cargaba pero se quedaba
> en negro con `videoWidth = 0`. Por eso cada clip usa el *derivado* WebM VP9 de 480p
> (`/wikipedia/commons/transcoded/…480p.vp9.webm`), que sí reproduce en Chrome, Edge, Firefox y Safari,
> y conserva el original Theora como `<source>` de respaldo.

### Elemento `<iframe>` (contenido externo embebido)

- **Reproductor destacado** (`#featuredPlayer`) con `youtube-nocookie.com/embed/...`, `allowfullscreen`, `rel=0` y `modestbranding=1`. Cambia dinámicamente según la leyenda seleccionada.
- **4 embeds de clip** (LeBron, Curry, Durant, Kobe) con `loading="lazy"`.
- **1 iframe de Google Maps** con la ubicación del club.

### Reproductor con recuperación automática

El reproductor destacado se controla con la **API oficial de IFrame de YouTube** (`youtube.com/iframe_api`).
Cuando el player emite `onError` —por ejemplo, código `150`, que indica que el propietario del video
deshabilitó la incrustación— el sitio oculta el `<iframe>` y activa automáticamente un **`<video>` nativo**
(WebM VP9 de Wikimedia) para que el usuario nunca se quede sin reproducción. Un botón
*"Ver en archivo nativo / Ver en YouTube"* permite cambiar de modo a mano.

Si la API no cargara, la página sigue funcionando con el `<iframe>` simple.

### Leyendas y sus sesiones de entrenamiento

| Leyenda | Apodo | Video |
|---|---|---|
| LeBron James | King James | *Workout compilation* — Basketball Pros Workouts |
| Michael Jordan | Su Majestad | *Jordan Workout with Chicago Bulls* |
| Kobe Bryant | Black Mamba | *Kobe Bryant on Practice* |
| Stephen Curry | Chef Curry | *Curry FULL Shooting Workout — 500+ Shots* |
| Kevin Durant | El Segador | *Preparación olímpica con Anthony Edwards* |
| Giannis Antetokounmpo | Greek Freak | *Motivational Workout* |
| Kareem Abdul-Jabbar | Skyhook | *How Kareem Learned the Skyhook* |

> **Verificación de los medios.** Cada identificador se comprobó **dentro de un `<iframe>` real**
> con Chrome headless (Chrome DevTools Protocol), no solo contra oEmbed: oEmbed responde `200` incluso
> para videos que luego muestran *"Este video no está disponible"*. Ese método detectó que
> `wQWmRIHavC8` (*LeBron James - 1 hour workout (uncut)*) tiene la incrustación deshabilitada
> y se sustituyó por `WUqrS50rtMY`. Los 11 identificadores actuales reproducen sin error,
> y los 4 archivos nativos decodifican con `videoWidth = 854` y `readyState = 4`.


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
3. **Reproductor destacado** que cambia de video al pulsar "Ver entrenamiento", conmutando entre el `<iframe>` de YouTube y el `<video>` nativo de respaldo si el player emite `onError`.
4. **Contadores animados** en las métricas del hero (`requestAnimationFrame` + easing cúbico).
5. **Copiar tabla** al portapapeles con feedback visual.
6. **Formulario de contacto** con validación y mensaje de estado (`aria-live`).
7. **Botón "volver arriba"** que aparece al hacer scroll.

El módulo `js/store.js` (ES module) añade la tienda: carga el catálogo desde Supabase o desde los datos demo,
filtra por categoría/marca/texto, gestiona el carrito en `localStorage`, administra la sesión con Supabase Auth
y envía el pedido a la RPC `create_order`. Si el CDN de Supabase no responde, degrada a modo demo sin romper la página.

---

## 9. Créditos y licencias de medios

- **Fotografías de leyendas:** Wikimedia Commons (dominio público / CC).
- **Fotografías de entrenamiento:** [Unsplash](https://unsplash.com) (Unsplash License).
- **Videos técnicos y sesiones:** Wikimedia Commons y embeds de YouTube.

---

## 10. Base de datos (Supabase)

La tienda funciona con **Supabase** (PostgreSQL gestionado). El esquema completo está en
[`supabase/schema.sql`](supabase/schema.sql) y se ejecuta una sola vez desde el **SQL Editor** del proyecto.

### Modelo de datos

| Tabla | Contenido |
|---|---|
| `categories` | Categorías del catálogo (zapatillas, camisetas, accesorios) |
| `brands` | Marcas (Jordan, Nike, Adidas, Under Armour) |
| `products` | Producto con `price_cents`, imagen, categoría y marca |
| `product_variants` | Talla + stock por producto (`unique(product_id, size)`, `stock >= 0`) |
| `profiles` | Perfil ligado a `auth.users`, con rol `customer` o `admin` |
| `orders` | Cabecera del pedido: cliente, dirección, subtotal, envío, total y estado |
| `order_items` | Líneas del pedido con nombre, talla, cantidad y precio congelado |

La vista `catalog_products` (con `security_invoker = on`) entrega cada producto con su `jsonb`
de variantes y el `total_stock`, que es lo que consume el frontend.

### Seguridad (RLS)

- Catálogo (`categories`, `brands`, `products`, `product_variants`): lectura pública, escritura solo para administradores (`public.is_admin()`).
- `orders` y `order_items`: cada usuario solo ve sus propios pedidos.
- `profiles`: cada usuario ve y edita su perfil.
- **Ningún precio ni stock se confía al cliente.** La clave `anon` es pública por diseño; la protección real es RLS más la función del servidor.

### Pedido atómico

`public.create_order(p_customer jsonb, p_items jsonb)` se ejecuta con `SECURITY DEFINER`:

1. Exige sesión (`auth.uid()`).
2. Bloquea las variantes con `select ... for update`, evitando sobreventa.
3. Valida stock y recalcula los precios en el servidor.
4. Descuenta existencias e inserta `orders` + `order_items` en una sola transacción.
5. Envío fijo de **4,99 €** salvo subtotal ≥ **80 €** (gratis).
6. Devuelve `order_id`, `subtotal_cents`, `shipping_cents`, `total_cents` y `status`.

### Configuración

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Pega `supabase/schema.sql` en el **SQL Editor** y ejecútalo.
3. Copia `SUPABASE_URL` y `SUPABASE_ANON_KEY` (Settings → API) en `js/config.js`.
4. (Opcional) Desactiva la confirmación por correo en Authentication → Providers → Email para probar el registro al instante.

Sin credenciales, la tienda arranca en **modo demo** con un catálogo local (`js/demo-data.js`):
todo se puede filtrar y probar, pero los pedidos se simulan y no se guardan.

---

## 11. Publicación

```bash
git add -A
git commit -m "descripcion del cambio"
git push origin main
gh api repos/Alfonso-Acuna/basketzone/pages/builds --method POST
```

- Hosting gratuito: **GitHub Pages** (plan gratuito, sin coste).
- Rama: `main` —_origen: `/` — entrada: `index.html` en la raíz del repositorio.

---

## 12. Estructura del repositorio

```
basketzone/
├── index.html          # Estructura semántica + multimedia + JS vanilla
├── styles.css          # Sistema de diseño "Courtside" (23 bloques)
├── favicon.svg         # Icono del sitio
├── js/
│   ├── config.js       # SUPABASE_URL + SUPABASE_ANON_KEY
│   ├── supabase.js     # Cliente y capa de datos
│   ├── demo-data.js    # Catálogo de respaldo sin conexión
│   └── store.js        # Catálogo, filtros, carrito, auth y checkout
├── supabase/
│   └── schema.sql      # Tablas, RLS, vista, RPC y seed
├── .env.example        # Variables de referencia para Supabase CLI
├── README.md           # Este documento (contexto completo del proyecto)
└── AGENTS.md           # Regla de deploy automático en cada cambio
```

### Codificación

Todos los archivos se guardan en **UTF-8 sin BOM**. El texto visible del sitio usa
entidades HTML (`&aacute;`, `&oacute;`, `&ntilde;`, `&iacute;`, `&uuml;`) para que los
acentos y la eñe se representen correctamente en cualquier navegador y servidor.

---

**Proyecto educativo de desarrollo web — 2026.**
