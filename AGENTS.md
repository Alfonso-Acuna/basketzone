# BasketZone - Guía de Desarrollo

## Regla principal

**Cada cambio o corrección solicitada debe subirse automáticamente a GitHub en el mismo paso, junto con la actualización del archivo `README.md` (el contexto).**

Flujo obligatorio tras cada cambio:

1. Editar los archivos (`index.html`, `styles.css`, `README.md`)
2. `git add -A`
3. `git commit -m "descripción del cambio"`
4. `git push origin main`
5. Verificar el build de GitHub Pages con `gh api repos/Alfonso-Acuna/basketzone/pages/builds --method POST`

## Requisitos del sitio

El proyecto debe cumplir siempre con:

- **HTML5 semántico**: `<html>`, `<head>`, `<body>`, `<header>`, `<nav>`, `<section>`, `<article>`, `<footer>`
- **Contenido**: `<p>`, `<h1>`-`<h3>`, `<ul>`, `<ol>`, `<img>`, `<a>`
- **CSS3 básicos**: `font-family`, `color`, `background-color`, `margin`, `padding`
- **Botones y tablas**: `<button>`, `<table>`, `<tr>`, `<td>`
- **Multimedia**: `<video>`, `<iframe>`
- **CSS3 avanzado**: `border-radius`, `box-shadow`, `transition`

## Deploy

- Repositorio: https://github.com/Alfonso-Acuna/basketzone
- GitHub Pages: https://alfonso-acuna.github.io/basketzone/
- Branch: `main`, raíz `/`

El archivo de entrada debe llamarse `index.html` en la raíz del repositorio (GitHub Pages sirve `index.html` automáticamente).
