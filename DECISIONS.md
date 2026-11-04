# Decisiones

Lo aprobado, lo que he decidido yo al construir (para que lo revises) y lo que falta. Última actualización: 04-11-2026. Incluye las tres fases: contenido y CV, dirección visual Apple × Evolve, y piezas visuales.

## 1. Aprobado (hecho)

### Fase 1: contenido, logos, CV y arreglos
- **Logos** de PropHero, Grupo Lalala, Classy Night Society, UPM, Retamar y CS50 (escudo de Harvard). Induforum sigue con monograma.
  - Las casillas son redondeadas y con borde fino #E8E8ED.
  - Llenan la casilla: PropHero, UPM y Classy.
  - Van sobre blanco: Lalala, Retamar y CS50.
- **Color de marca:** se sigue leyendo del logo, salvo el de Grupo Lalala, que es fijo: naranja Apple #FF9F0A.
- **CV:**
  - Todos los botones descargan `public/cv/CV_Carlos_Lopez_Parga.pdf`: hero, barra de navegación, contacto, menú móvil, ⌘K y la herramienta `download_cv` del agente.
  - `/api/cv`, el generador y `@react-pdf/renderer` ya no existen.
- **Contenido según el CV:**
  - PropHero: título, bullets y chips.
  - Cifras de Grupo Lalala, Classy, job-hunt-copilot y DANA.
  - Induforum: puesto y bullet.
  - Classy: Madrid y sus 2 bullets.
  - Formación: EvAU, Retamar y CS50 (HarvardX, oct 2026).
  - El nuevo proyecto «Proyectos de IA (CS50)».
  - Liderazgo, idiomas y skills nuevas con su «usado en».
  - El agente lee lo mismo (cifras, asignaturas y fechas incluidas).
- **Cursor:** vuelve el del sistema. Se mantienen el brillo al hover estilo visionOS y el leve lift (2 px) hacia el puntero.
- **Barra del agente:**
  - «Pregúntale a mi agente» es una etiqueta pequeña encima de la barra.
  - Dentro solo aparece la pregunta de ejemplo, que se escribe y se borra letra a letra.
  - Solo se usan las preguntas que caben enteras: hay versiones cortas para el móvil.

### Fase 2: dirección visual Apple × Evolve
- **Tema:** claro por defecto (#FFFFFF y #F5F5F7, texto #1D1D1F). El oscuro es el de Apple (#000 y superficies #1C1C1E) y se activa con el botón de tema.
- **El color sale de:** los logos, acentos Apple por dominio en dosis pequeñas, y el degradado Apple Intelligence. Ese degradado está en el borde de la barra del agente, la tagline y el resplandor detrás del chip.
- **Tipografía:**
  - Plus Jakarta Sans en titulares; el nombre del hero mide hasta 96 px.
  - Inter en el texto.
  - Etiquetas grises seminegritas sobre cada título.
  - Geist Mono solo en el terminal.
- **Forma:** tarjetas de radio 24, botones en píldora (negro el principal, gris el secundario) y sombras suaves.
- **Navegación:** píldora flotante con CL, secciones, búsqueda, ES/EN, tema y un botón negro «CV». En el móvil, «CV» y «Menú» (pantalla completa).
- **Fuera:** auroras, nebulosa, retícula, números de lámina, cajetín, cotas y engranaje de progreso. En oscuro queda un estrellado muy sutil y quieto.
- **Estructura:**
  1. Hero centrado.
  2. Cifras (4 tarjetas con count-up que llevan a su entrada).
  3. Ahora mismo.
  4. Experiencia y Formación como timeline con logos, con la línea dibujándose al hacer scroll.
  5. Proyectos: 4 tarjetas grandes con case study y demo debajo.
  6. Skills.
  7. Liderazgo: tarjetas de foto para las entradas con foto y tipográficas para el resto, más «Off the clock».
  8. Contacto: banda oscura #1D1D1F.
- **Motion:**
  - Reveals de opacidad con subida de 24 px en 700 ms, y count-up en las cifras.
  - Lift y brillo al hover.
  - Flotación lenta de los fragmentos.
  - Todo respeta el movimiento reducido.

### Fase 3: piezas visuales
- **Chip de IA en el hero:**
  - Vista explosionada con disipador, die con 8 núcleos, interposer con pistas, sustrato y bolas BGA. Line-art fino sobre blanco (claro sobre negro en modo oscuro), con el resplandor Apple Intelligence detrás.
  - En escritorio es 3D (three.js):
    - se ensambla al cargar;
    - los paquetes de datos recorren las pistas sin parar y los núcleos se encienden en secuencia;
    - gira y hace parallax con el cursor;
    - al pasar el ratón las capas se separan;
    - cuando el agente responde va todo más rápido.
  - En el móvil es la versión 2D con los mismos pulsos y núcleos. Con movimiento reducido, estático.
- **Fragmentos de interfaz flotantes** (HTML/CSS) en cada proyecto, con flotación lenta y parallax al hover:
  - job-hunt-copilot: oferta con barra de puntuación, lista ordenada y mini terminal con cifras reales (6.400+, 29, 116).
  - Correo en piloto automático: «Resumen de hoy» y nodos Gmail → Claude.
  - Agente de refrigeración: gráfica de generaciones con la etiqueta «Ilustrativo».
  - Proyectos de IA (CS50): clasificación de una señal y tablero de Nim.
- **Monte Carlo continuo:**
  - Cada ~4 s se dibuja un lote nuevo de trayectorias de «Ahora» al destino y las anteriores se desvanecen; un punto siempre recorre una.
  - Se pausa fuera de pantalla.
  - Sin JavaScript o con movimiento reducido: un fotograma quieto con trayectorias.
- **Grafo de skills:**
  - Nodos blancos con icono y anillo de su dominio, agrupados por dominio.
  - Proyectos, trabajos y estudios como nodos mayores en el centro.
  - Líneas «usado en» siempre visibles, muy tenues, que se colorean al hover.
  - Recorrido automático cada 3,2 s, que se detiene al interactuar.
  - El inspector de debajo nunca está vacío.
  - En el móvil, lista por dominio con hoja inferior.

## 2. Decidido por mí (revisar)

### Contenido
- **PropHero termina en «Actualidad»** porque así lo dice el CV. Antes ponía feb 2027.
- **Portugués «básico»,** como pediste, aunque el CV dice «fluent». Conviene igualar uno de los dos.
- **Bullets de Grupo Lalala:** uso tu texto, que añade «privados, diurnos, nocturnos», aunque el CV es algo más corto.
- **Chips de PropHero** en el orden que diste. Para eso «Operaciones» ya no apunta a PropHero.
- **«Proyectos de IA (CS50)»:**
  - El texto del problema lo redacté yo, sin cifras.
  - Los fragmentos muestran barras sin porcentajes, para no inventar números.
- **Proyectos y skills:** REST APIs, CI, OpenCV, NLTK y Transformers aparecen como chips del proyecto, pero no como nodos del grafo (no los pediste como skills).
- **Idiomas:** van como una línea de chips bajo el grafo. Así el agente puede resaltarlos.
- **Asignaturas del CV:** solo las conoce el agente; no se muestran en la web.

### Diseño
- **Cifras:** la sección tiene su propio título, «Cifras reales, de trabajo real.».
- **Fondos alternos:**
  - Gris #F5F5F7: Ahora mismo, Formación y Skills, con tarjetas blancas.
  - Blancas: el resto, con tarjetas grises.
- **Fechas del timeline:** no son «sticky», para que el scroll sea más tranquilo.
- **Liderazgo:**
  - Las entradas con foto van primero y ocupan los huecos anchos.
  - Si hay más de una foto, la tarjeta lleva un botón «Fotos y vídeos · n» que abre el visor.
- **El chip 3D** usa exactamente la misma vista isométrica que el SVG, así que el cambio de 2D a 3D no se nota.
- **Herramienta `focus_part` del agente:** eliminada, porque solo servía para la reductora. Ahora el chip reacciona solo cuando el agente responde.
- **Página `/lab`:** eliminada, junto con sus componentes. Era el laboratorio de motion del principio y no encajaba en la nueva dirección. Sigue en el historial de git.
- **Imagen para compartir (OG):** en claro, con nombre, tagline en degradado, resumen y el chip.

### Técnicas
- **Secciones fuera de pantalla con `content-visibility`,** que acelera el primer render en el móvil.
  - Como sus alturas son estimadas hasta que se pintan, el scroll a una sección hace una segunda pasada de corrección.
  - Comprobado: todas las navegaciones aterrizan bajo la píldora.
- **Cada sección es un límite `Suspense`:** React hidrata por partes y el móvil gana margen.
- **La caché de build de Turbopack está desactivada.** Una vez sirvió un `globals.css` antiguo, y Vercel restaura esa caché entre despliegues. El build tarda segundos, así que no compensa el riesgo.
- **En móvil no se carga three.js** ni se construye el grafo SVG.
- **El chip 2D empieza a animarse** cuando la página está ociosa.

## 3. Resultados (build de producción, local)

| Lighthouse (04-11) | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
| --- | --- | --- | --- | --- |
| Móvil, `/` (3 pasadas) | 85–89 | 100 | 100 | 66* |
| Escritorio, `/` y `/es` | 100 | 100 | 100 | 66* |

\* El único fallo de SEO es «la página no es rastreable», que es el noindex intencionado. Pasará a 100 al lanzar.

- **Sobre el móvil:** desde el 03-11 la máquina de pruebas es más lenta. La versión de la fase 2 da 86–87 en esta misma máquina (en la anterior daba 92–94), así que la fase 3 no empeora el rendimiento.
- **axe:** 0 incidencias en claro y oscuro, escritorio y móvil.

## 4. Pendiente

**Datos (`npm run todos`)**
- Destino del Erasmus.
- Resultados reales del simulador del agente de refrigeración.
- Fechas (AAAA-MM) del Banco de Alimentos, los eventos benéficos y el orfanato.

**Archivos**
- `public/logos/induforum`: hasta que lo subas se ve el monograma «IF».
- `public/photos/carlos` (retrato de Contacto) y `public/photos/n8n-flow` (flujo real del correo).
- `content/demos/job-hunt-copilot.txt`, la grabación del terminal. Hasta que exista, la tarjeta dice «Ver detalles» y no hay ventana de terminal.
- Fotos y vídeos en `public/media/…`. Las de liderazgo convierten la tarjeta en tarjeta de foto.

**Avisos**
- **Tu CV en PDF incluye tu teléfono.** Al servirlo, queda público en la web, y antes acordamos no publicar el teléfono. Si no lo quieres publicar, sube una versión sin él con el mismo nombre.
- **La rama por defecto del repo en GitHub es `claude/affectionate-euler-bieu8r`, no `main`.** Por eso tus subidas desde la web de GitHub fueron a esa rama. Si Vercel despliega `main`, conviene poner `main` como rama por defecto: Settings → General → Default branch. Así lo que subas irá directo a producción.

**Variables de entorno en Vercel**
- `ANTHROPIC_API_KEY`.
- `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` (o las `KV_*`).
- `NEXT_PUBLIC_CALCOM_LINK`.
- `NEXT_PUBLIC_SITE_URL`.

**Lanzamiento:** cuando digas «lanzamiento», poner `LAUNCHED = true` en `lib/site.ts`.
