# Decisiones

Lo aprobado, lo que he decidido yo al construir (para que lo revises) y lo que falta. Última actualización: 03-11-2026, con los «últimos ajustes» del 29-10: cursor nuevo, brillo al hover, textos de experiencia y sistema de medios.

## 1. Aprobado

### Dirección
- **Al grano.** Lo principal es la experiencia (sobre todo PropHero) y los estudios (sobre todo la ETSII-UPM), cada uno en su propia sección y con protagonismo.
- **Mucho más color, estilo Apple × Windows 11.**
- **Menos elementos y efectos.** Las estructuras animadas (reductora, núcleo, cono de Monte Carlo) son un extra estético, no el contenido.
- **Eliminado:** el Gantt de trayectoria, el cajetín y las cotas como estructura, la reductora con etiquetas de dominio y el hover complejo, el bloque fijo de lámina y la barra de progreso.
- **Del plano solo quedan detalles finos:** el número de sección en las cabeceras («03 / 08») y el engranaje de progreso de la barra superior.

### Color
- **Colores de sistema de Apple.** Modo oscuro: azul `#0A84FF`, índigo `#5E5CE6`, morado `#BF5AF2`, rosa `#FF375F`, naranja `#FF9F0A`, verde `#30D158`, cian `#64D2FF`. Modo claro: sus variantes de modo claro. Para texto se usan las variantes accesibles de Apple (AA): por ejemplo, el índigo oscuro pasa a `#7D7AFF` y en claro el naranja a `#C93400` y el verde a `#1E7A35`.
- **Dominios de skills:** IA morado, Automatización azul, Datos y quant cian, Operaciones naranja, Software verde.
- **Fondo «Bloom»:** tres auroras difuminadas en azul, morado y rosa que se mueven muy despacio sobre la base oscura. Sustituyen a la nebulosa. Las estrellas siguen, más discretas (55 % de opacidad).
- **Materiales Mica/Acrylic/vibrancy:** tarjetas translúcidas con borde fino y brillo superior. La barra superior, la consola del agente, el menú y los paneles flotantes llevan además un blur sutil.
- **Barra del agente:** borde multicolor animado estilo Apple Intelligence (azul → morado → rosa → naranja), con halo.
- **Color de marca por organización:** cada empresa y centro usa el suyo como acento de su tarjeta.
- **Contraste AA en ambos temas,** verificado con axe (0 incidencias en claro y oscuro, escritorio y móvil) y con Lighthouse (accesibilidad 100).

### Estructura (8 secciones)
1. **Hero.** Nombre, titular y resumen de 2 líneas. Barra «Pregúntale a mi agente», botones «Experiencia ↓», «CV ↓» y LinkedIn. La reductora queda a la derecha (debajo en móvil), más pequeña, como decoración.
2. **Ahora mismo.** Dos tarjetas grandes: PropHero y ETSII-UPM, con logo, color de marca y badge. El clic lleva a su entrada.
3. **Experiencia.** Timeline vertical en dos columnas en desktop. La línea se dibuja con el scroll y cada hito se enciende en su color. Orden: PropHero (destacada), Grupo Lalala, Induforum 2027, Classy Night Society.
4. **Formación.** Mismo lenguaje visual: ETSII-UPM destacada (chips MH ×2 y Programa Mentor, que enlaza a Liderazgo; Erasmus), después Retamar y CS50. Al final, el cono «Graduación jun 2028 → full-time».
5. **Proyectos.** 3 tarjetas compactas. Al abrir una se despliega su demo: debajo de la fila en desktop, justo debajo de la tarjeta en móvil.
6. **Skills.** La constelación, compacta (máximo 64 % de la altura de pantalla en desktop), con el inspector.
7. **Liderazgo e impacto.** Bento compacto con «Off the clock».
8. **Contacto.** Como antes.

### Cursor (estilo iPadOS)
- **En reposo:** círculo de 18 px gris translúcido con vibrancy (desenfoque y saturación del fondo) y un borde finísimo, con tonos distintos en tema claro y oscuro. Sigue al ratón exactamente, sin retardo.
- **Clic:** solo se encoge (0,85) desde su centro en 100 ms. Ya no se desplaza: el fallo venía de escalar el mismo elemento que se movía.
- **Sobre botones, enlaces, chips, opciones de menú y nodos de la constelación:** se funde con el elemento y pasa a ser su resaltado, con la misma forma y radio. El elemento se inclina hasta 2 px hacia el puntero y un punto central sigue visible.
- **Sobre texto y campos de texto:** barra vertical fina (I-beam), con la altura de la línea que tiene debajo.
- **Sobre imágenes, vídeos y demos:** etiqueta contextual («Ver», «Reproducir», «Copiar» en el email).
- **Nunca desaparece.** Va siempre por encima de todo (z-index máximo). Se usa el cursor nativo antes de hidratar, fuera de la ventana, sobre iframes y con un diálogo modal abierto (visor de fotos, Cal.com). `cursor: none` solo se aplica mientras el propio está pintado. Verificado con Playwright en 11 casos.
- **En móvil y con movimiento reducido** se queda el cursor del sistema.

### Brillo al hover (estilo visionOS)
- **Luz radial suave** que sigue al puntero por dentro de botones, enlaces, chips, logos, tarjetas, miniaturas, nodos de la constelación y opciones de menú.
- **Color:** el acento del elemento (marca de la empresa o del centro, o color del dominio) y blanco en los elementos neutros. El elemento gana un poco de brillo.
- **Halo exterior muy sutil** del mismo color en botones, tarjetas de «Ahora mismo», ETSII y PropHero destacadas, y proyectos.
- **Mismos tokens en todo:** duración `--dur-hover` (250 ms) y curva `--ease-out`.
- **En móvil:** la luz aparece donde cae el dedo y se apaga al levantarlo.

### Textos de experiencia
- **PropHero:** «Presencial · Madrid» y los 4 bullets nuevos en ES y EN. Se ven en Experiencia, el CV y el agente.
- **Grupo Lalala:** ciudad Madrid y los 3 bullets nuevos en ES y EN.

### Sistema de medios
- **Subir archivos y nada más.** Cada tarjeta tiene su carpeta en `public/media/<sección>/<id>/` (por ejemplo `experience/prophero` o `leadership/dana`) y los logos siguen en `public/logos/`.
- **Se detecta en el build:** fotos jpg, png, webp y avif; vídeos mp4 y webm, con portada opcional `<nombre>.poster.jpg`. Se ordenan por nombre de archivo (01-, 02-…). Los pies de foto, opcionales, van en `profile.ts` por nombre de archivo.
- **Vídeos externos:** YouTube (oculto), Vimeo (oculto, con su hash) o una URL de Vercel Blob, en `media` de `profile.ts`.
- **En cada tarjeta** de experiencia, formación, proyecto y liderazgo aparece una tira de miniaturas si tiene medios; si no, nada. Las miniaturas pasan de gris a color con el brillo al hover. Los vídeos se reproducen en silencio y en bucle al pasar el ratón, o al entrar en pantalla en el móvil.
- **Visor (lightbox):** fotos y vídeos, teclado (← → Esc), swipe en el móvil, pie de foto y contador.
- **Rendimiento:** next/image con lazy-load, vídeos con `preload="none"`, `muted`, `playsInline` y portada. El visor solo se descarga al primer clic. Probado con fotos y vídeos de ejemplo: el LCP no cambia.
- **Guía completa en [`public/media/README.md`](public/media/README.md):** carpetas, nombres, cómo subir desde la web de GitHub, formatos recomendados y qué hacer con un vídeo que pesa más.

### Ajustes aplicados
- **Nuevo «Problema» del correo en piloto automático.**
- **Stack:**
  - Claude Code también se usa en job-hunt-copilot.
  - Next.js y TypeScript pasan a «Software».
  - Nueva skill «Estadística y regresión» (Datos y quant), usada en el Grado GITI.
  - Pesos según tu tabla.
- **Móvil:** «Menú» abre un menú a pantalla completa (buscador arriba, secciones, agente, CV, email, idioma y tema). ⌘K sigue en desktop.

### Se mantiene
- Agente con tool use (IDs ajustados a la nueva estructura), Cal.com, CV en PDF, i18n, noindex hasta el lanzamiento, ⌘K, tema con revelado circular y movimiento reducido.
- No se inventan cifras, los `TODO:` nunca se muestran y no se publican teléfono ni dirección.

## 2. Decidido por mí (revisar)

### Contenido
- **Badge de PropHero según la fecha.** Hasta el 2 de noviembre decía «Empieza el 3 nov». Desde hoy, 3 de noviembre, dice «Actual» con pulso. La página se regenera cada día, así que el cambio es automático.
- **«4º curso» se calcula** desde septiembre de 2023, así que cambia cada septiembre y desaparece al terminar el grado.
- **Bullets de cada puesto:** los de PropHero y Grupo Lalala son los tuyos. Los demás los redacté solo con lo que ya había en `profile.ts`, sin cifras:
  - Induforum tiene 3, no 4: no había material para un cuarto sin inventar.
  - Classy Night Society no tiene bullets; queda pendiente como `TODO:`.
- **«Presencial · Madrid» solo en Experiencia, el CV y el agente.** La tarjeta de PropHero en «Ahora mismo» sigue mostrando «nov 2026 – feb 2027 · Madrid», para que sea corta.
- **Chips de skills de cada puesto:** salen del «Usado en» del stack, que es la única fuente. PropHero muestra «Automatización de procesos» y «Operaciones». Si quieres más chips, añade el puesto al `usedIn` de esas skills.
- **Induforum 2027 está en Experiencia, como pediste,** y en el CV también ha pasado a Experiencia. El CV ahora va en este orden: Experiencia, Formación (con CS50), Proyectos, Liderazgo y Skills. Sigue cabiendo en una página.

### Colores de marca
- **Se leen del propio logo.** En cuanto subas `public/logos/<nombre>.svg` (o PNG/JPG), el color sale del archivo: el relleno saturado más frecuente del SVG, o el color dominante de la imagen.
- **Mientras no hay logo,** se usa el color de respaldo:
  - de sus webs: PropHero `#2050F6`, ETSII `#003262` y Retamar `#001E60`;
  - CS50: carmesí de Harvard `#A51C30`;
  - provisionales, sin fuente fiable: Grupo Lalala `#FF375F`, Induforum `#5E5CE6` y Classy Night Society `#BF5AF2`.
- **Dos tonos por marca:** uno para cada tema, ambos AA sobre las tarjetas. Por eso el azul marino de la ETSII se ve como un azul más claro en modo oscuro.

### Diseño
- **La reductora se ensambla sola** al cargar (2,8 s) en lugar de con el scroll; sin scroll no hay sección alta fija.
- **Escritorio:** se ve primero la reductora 2D y la 3D aparece encima cuando la página está ociosa.
- **Móvil:** solo la 2D, girando con capas compuestas (sin repintar cada frame).
- **`focus_part` del agente** solo enciende un momento una pieza y acelera el núcleo; no hace scroll.
- **El halo de la barra del agente es estático en móvil;** el borde sí se anima. El halo animado obligaría a recalcular el desenfoque en cada frame.
- **Constelación en columnas:**
  - Escritorio: dominios a ambos lados, proyectos y trabajos en una elipse central e idiomas debajo.
  - Móvil: lista por dominio y los nodos debajo.
  - Así ninguna etiqueta se solapa ni se sale de la pantalla.
  - Se dibuja una sola versión en cliente, cuando la página está ociosa (menos HTML e hidratación).
- **Clic en un nodo de la constelación:** lleva a la tarjeta de esa empresa o centro en Experiencia o Formación. Grado GITI → ETSII-UPM.
- **Menú y ⌘K:** se cierran antes de ejecutar la acción. Con el scroll bloqueado, la navegación no funcionaba; ya corregido.

### Cursor y brillo
- **Sobre miniaturas y demos, la etiqueta manda sobre el resaltado.** Pediste etiqueta sobre imágenes y demos, así que las miniaturas, aunque son botones, muestran «Ver» o «Reproducir» en lugar de fundirse.
- **La etiqueta es el propio cursor:** una píldora con vibrancy centrada en el puntero.
- **Al hacer clic sobre un resaltado se encoge a 0,96, no a 0,85.** Un botón entero a 0,85 parecía un salto; el círculo en reposo sí se encoge a 0,85.
- **Elementos de más de 720 × 180 px** (las tarjetas enteras) mantienen el círculo: un resaltado tan grande parece un destello. Su respuesta al hover es el brillo.
- **La inclinación de 2 px** no se aplica a elementos que ya se mueven solos, a elementos fijos ni a los SVG. En la constelación el resaltado es un círculo alrededor del nodo.
- **En los campos de texto, el I-beam ahora es el propio.** Antes se usaba el nativo. El nativo se sigue usando en iframes y diálogos.
- **El brillo se dibuja en dos capas por encima del elemento** (una para la tarjeta y otra para el control que hay debajo), sin tocar el elemento. Así funciona igual en todas partes y no rompe los materiales con blur.
- **Se suma luz en oscuro y se tiñe en claro:** en oscuro la luz se suma; en claro sumar luz no se ve, así que tiñe con el color del acento.
- **Nunca pinta encima de la barra superior** cuando una tarjeta pasa por debajo.
- **No hay brillo dentro de los diálogos.**

### Medios
- **Carpetas de formación:** `education/etsii` (como la llamaste), `education/retamar` y `education/cs50`. Las demás usan el `id` de `profile.ts`. La lista completa está en el README.
- **Miniaturas en 4:3,** de 104 × 78 px en escritorio y 88 × 66 px en móvil. Se ven hasta 8; si hay más, la última muestra «+N» y el visor tiene todas. En el móvil la tira se desliza en horizontal.
- **El visor es un `<dialog>` nativo:** el foco queda dentro, Esc lo cierra y al cerrarlo el foco vuelve a la miniatura. Por la regla del cursor, dentro se usa el cursor nativo.
- **Una tarjeta de Liderazgo con medios ocupa el hueco ancho** del bento.
- **Adiós al campo `photo`** en experiencia y liderazgo: ahora mandan las carpetas. `public/photos/` queda solo para el retrato y la captura de n8n.
- **Medidas y orientación:** se leen del archivo en el build (con sharp), incluida la rotación EXIF de las fotos del móvil.
- **Vimeo no da la portada sin su API:** si quieres miniatura, añade `poster`. YouTube sí la da y se carga desde `i.ytimg.com`. El reproductor de YouTube es el de `youtube-nocookie.com`.
- **Ubicación en las fotos:** el README explica cómo quitar la ubicación GPS antes de subirlas. La web sirve versiones optimizadas sin metadatos, pero el original también es público en su URL.
- **Logos en PNG o JPG:** el color de marca ahora se lee dentro de una caché, así que la página sigue siendo estática al subirlos. Probado con un PNG de ejemplo.

## 3. Resultados (build de producción, `next start` local)

| Lighthouse (29-10, tras los ajustes) | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
| --- | --- | --- | --- | --- |
| Móvil, `/` (3 pasadas) | 93–97 | 100 | 100 | 66* |
| Escritorio, `/` y `/es` | 100 | 100 | 100 | 66* |
| Móvil con fotos y vídeos de ejemplo (en caliente) | 97 | 100 | 100 | 69* |

\* El único fallo de SEO es «la página no es rastreable»: es el noindex intencionado y debería pasar a 100 al lanzar. En un navegador real con la CPU 4× más lenta, el LCP coincide con el FCP (unos 270 ms).

- **axe:** 0 incidencias en claro y oscuro, escritorio y móvil.
- **CV:** sigue cabiendo en una página en los dos idiomas.
- **Cursor:** los 11 casos de «nunca desaparece» pasan, y el clic deja el centro exactamente donde estaba (comprobado al píxel).

## 4. Pendiente

**Datos:** lista completa en la respuesta del chat y con `npm run todos`.

**Archivos**
- `public/logos/`: `prophero`, `grupo-lalala`, `induforum`, `classy-night-society`, `upm`, `retamar`, `cs50`. También fijan el color de cada tarjeta.
- `public/media/<sección>/<id>/`: las fotos y vídeos de cada tarjeta. Las carpetas ya existen y están vacías. Las fotos que antes iban en `public/photos/` (DANA, Mentor y voluntariado) van ahora en `leadership/dana`, `leadership/mentor`, `leadership/food-bank` y `leadership/orphanage`.
- `public/photos/`: `carlos` y `n8n-flow`.
- `content/demos/job-hunt-copilot.txt`: hasta que exista, la tarjeta dice «Ver detalles» y no muestra demo.
- Pies de foto y vídeos externos, cuando los tengas, en `media` de `content/profile.ts`.

**Variables de entorno en Vercel**
- `ANTHROPIC_API_KEY`.
- `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` (o las `KV_*`).
- `NEXT_PUBLIC_CALCOM_LINK`.
- `NEXT_PUBLIC_SITE_URL`.

**Lanzamiento:** cuando digas «lanzamiento», poner `LAUNCHED = true` en `lib/site.ts`.
