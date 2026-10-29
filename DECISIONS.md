# Decisiones

Lo aprobado, lo que he decidido yo al construir (para que lo revises) y lo que falta. Fecha: 29-10-2026.

## 1. Aprobado

**Concepto: «Carlos como sistema».** Plano técnico sobre espacio profundo. Tres motivos:
- Ingeniería: la reductora planetaria (protagonista del hero).
- IA: núcleo neuronal y respuestas token a token.
- Quant: trayectorias de Monte Carlo.

**Color por dominio**, solo en acentos, líneas, glows y estados:

| Dominio | Color | Pieza de la reductora |
| --- | --- | --- |
| IA | cian `#22D3EE` | sol (núcleo neuronal) |
| Automatización | azul `#4C8DFF` | satélite |
| Datos y quant | índigo `#8B7CFF` | satélite |
| Operaciones | hielo/plata `#C7D7FE` | satélite |
| Ingeniería | blanco | corona |

Contraste AA en los dos temas. Oscuro por defecto; el modo claro se activa con revelado circular.

**Tipografía y movimiento**
- Geist para todo y Geist Mono para etiquetas.
- Clip-path solo «hacia arriba».
- Un protagonista por pantalla.
- Decode solo en el tagline.

**Eliminado:** marquee de stack, proyectos horizontales con pin, galería con parallax, decode en etiquetas, rejilla iluminada por el cursor (ahora estática y más tenue) y botones magnéticos (queda solo el de enviar del prompt). El tilt con spotlight solo está en el panel de proyectos.

**Cursor estilo iPadOS:** punto sin retraso que se transforma en el fondo del elemento interactivo (forma y radio, unos 150 ms). Etiquetas «Ver», «Arrastrar» y «Copiar» solo en demos, imágenes y el email. Sin anillo perseguidor.

**Estructura en 6 láminas**
1. Hero: reductora explotada, se ensambla con el scroll, cajetín con el nombre y prompt al agente.
2. Sistemas: lista y panel en una pantalla; pestañas en móvil.
3. Trayectoria: Gantt 2023 → 2028 en una pantalla con cono de Monte Carlo; lista plegable en móvil.
4. Toolkit: constelación de skills.
5. Más allá: bento de liderazgo + «Off the clock».
6. Contacto: email grande (clic = copiar), reservar, LinkedIn, GitHub y CV.

**Agente «Pregúntale a mi agente» / «Ask my agent»** (nunca «Talk to my AI»)
- Modelo `claude-haiku-5-5`, `max_tokens` 400, streaming.
- Máximo 12 mensajes por conversación, contando las acciones; entrada de 500 caracteres como máximo.
- Rate limit con Upstash si existen las variables. Sin `ANTHROPIC_API_KEY` funciona en modo offline (remite al email).
- Herramientas solo de interfaz, en lista blanca con IDs del registro de `profile.ts`: `scroll_to`, `highlight`, `open_project`, `download_cv`, `open_booking` y `focus_part`.
- Máximo 3 acciones por respuesta, cada una visible como línea mono «→ …». Nunca sale de la web.

**Reserva:** Cal.com embebido en un modal con el tema de la web. Sin `NEXT_PUBLIC_CALCOM_LINK` los botones desaparecen. La web no guarda nada de la reserva.

**Se mantiene del plan:** CV en PDF, SEO, i18n (inglés por defecto en `/`, español en `/es`), noindex hasta el lanzamiento, paleta ⌘K, intro de menos de 1 s, movimiento reducido y rendimiento. `/lab` sigue accesible, fuera de la navegación y con noindex.

**Contenido**
- No se inventan cifras: los `TODO:` nunca se muestran.
- Las cifras de impacto quedan ocultas hasta que haya números reales.
- No se publican teléfono ni dirección.
- PropHero empieza el 3-11-2026. Portugués: básico.

## 2. Decidido por mí al construir (revisar)

**Hero**
- **Portaplanetas de tres lóbulos** en vez de disco: al ensamblarse, el sol y su núcleo cian siguen viéndose. La cámara se acerca un poco al ensamblar para que la reductora siga siendo la protagonista.
- **Clic en una pieza del hero:** la corona lleva a Trayectoria; el resto filtra la constelación por su dominio y lleva a Toolkit.
- **Hero en móvil:** reductora 2D que gira sola, limitada al 38 % de la altura para que el cajetín asome antes.

**Navegación**
- **Navegación en móvil:** el botón «Menú» abre la paleta ⌘K (secciones, agente, CV, email, idioma y tema); no hay menú aparte.
- **Indicador de progreso:** un engranaje en un mini-cajetín fijo (abajo a la izquierda en escritorio, en la cabecera en móvil) con el número de lámina. Se quitó la barra de progreso superior para no duplicar.

**Trayectoria**
- Las etiquetas que no caben dentro de su barra van fuera y ocupan sitio en la fila (así nada se solapa).
- El cono son 26 puentes brownianos suavizados, con semilla fija (el mismo dibujo en servidor y cliente).
- Solo aparecen en el Gantt los liderazgos con fechas; los demás solo en «Más allá».

**Toolkit:** los nodos grandes (proyectos y trabajos) se reparten uniformes en una elipse, agrupados por dominio.

**CV en PDF (`/api/cv?lang=en|es`)**
- Una página, Helvetica y una sola columna, sin guiones automáticos ni espaciado entre letras (para que un ATS lo lea como texto).
- Incluye formación, experiencia, proyectos, liderazgo, skills, idiomas, cursos e intereses.
- Se genera una vez al día por idioma y lleva `X-Robots-Tag: noindex`.

**Agente**
- Responde con 503 en modo offline.
- La conversación vive en `sessionStorage` (se borra al cerrar la pestaña). No hay registro en servidor.

**Fecha y caché:** la fecha del cajetín y los estados «actual / próximamente» salen de una función cacheada un día. La página es estática y se regenera cada día.

**SEO**
- JSON-LD de tipo `Person` (sin teléfono ni dirección; solo Madrid, ES).
- Imagen OG generada con la reductora y el cajetín.
- `/sitemap.xml` da 404 hasta el lanzamiento.

**Rendimiento:** Motion, cmdk, Lenis, three.js, GSAP, la consola del agente y Cal.com se cargan solo cuando hacen falta. El panel de proyectos ya no usa Motion (era 137 KB del primer JS).

## 3. Resultados (build de producción, `next start` local)

| Lighthouse (home) | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
| --- | --- | --- | --- | --- |
| Móvil (4 pasadas) | 94–95 | 100 | 100 | 66* |
| Escritorio | 100 | 100 | 100 | 66* |

\* El único fallo de SEO es «la página no es rastreable»: es el noindex intencionado. Al lanzar debería subir a 100.

En un navegador real con la CPU 4× más lenta, el LCP coincide con el FCP (unos 320 ms).

## 4. Pendiente

**Datos:** lista completa en la respuesta del chat y con `npm run todos`.

**Archivos que faltan** (hasta entonces se muestra un monograma o nada)
- `public/logos/`: `prophero`, `grupo-lalala`, `classy-night-society`, `induforum`, `upm`, `retamar`.
- `public/photos/`: `carlos`, `events-1`, `dana`, `mentor`, `volunteering-1`, `volunteering-2`, `n8n-flow`.
- `content/demos/job-hunt-copilot.txt`: una ejecución real de la CLI. Sin ella, el proyecto no muestra demo.

**Variables de entorno en Vercel**
- `ANTHROPIC_API_KEY`.
- `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` (o las `KV_*` de Vercel).
- `NEXT_PUBLIC_CALCOM_LINK`.
- `NEXT_PUBLIC_SITE_URL`.

**Ajustes que quedan en tu mano**
- `weight` de cada skill (tamaño de la estrella) y `w` de cada `usedIn` (grosor de la línea). Ahora todo vale 1.
- Repo de job-hunt-copilot: `public: false` muestra «Repo próximamente».

**Lanzamiento:** cuando digas «lanzamiento», poner `LAUNCHED = true` en `lib/site.ts`. Eso quita el noindex (robots, meta y cabecera) y publica el sitemap.
