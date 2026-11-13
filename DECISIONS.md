# Decisiones

Lo aprobado, lo que he decidido yo al construir (para que lo revises) y lo que falta. Última actualización: 13-11-2026. Incluye las tres fases (contenido y CV, dirección visual Apple × Evolve, piezas visuales), el pulido estético (rama `claude/design-polish`), el hero definitivo con el chip de partículas (rama `claude/hero-asymmetric`), la nube de partículas con presencia y figuras (rama `claude/particle-figures`), la carga, la interacción y la pausa del chip (rama `claude/chip-interaction`), la ronda del 11-11 (rama `claude/nice-keller-emmje9`): partículas una a una, «Cómo trabajo», carruseles, vídeos de proyecto, Skills compacto y reserva con Google Calendar; y la segunda ronda del 11-11 (rama `claude/tender-faraday-k93q2e`): física real por partícula, «Cómo trabajo» más abajo y rediseñada, Skills como red en 3D y cinco ajustes; y las tarjetas de proyecto verticales con vídeo de fondo, con el de Shortlist hecho con código (rama `claude/cool-wozniak-1p9zt8`); y el vídeo del agente de refrigeración, con el mismo formato (rama `claude/trusting-fermi-r1j0o9`).

Lo último está en «Tarjetas de proyecto verticales con vídeo de fondo» y en «Vídeo del agente de refrigeración», al final de la sección 1; los apartados anteriores se han corregido donde ya no eran verdad.

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
  - Cifras de Grupo Lalala, Classy, Shortlist (antes job-hunt-copilot) y DANA.
  - Induforum: puesto y bullet.
  - Classy: Madrid y sus 2 bullets.
  - Formación: EvAU, Retamar y CS50 (HarvardX, oct 2026).
  - El nuevo proyecto «Proyectos de IA (CS50)».
  - Voluntariado (antes «Liderazgo»), idiomas y skills con su «usado en».
  - El agente lee lo mismo (cifras, asignaturas y fechas incluidas).
- **Cursor:** vuelve el del sistema. Se mantienen el brillo al hover estilo visionOS y el leve lift (2 px) hacia el puntero.
- **Barra del agente:**
  - «Pregúntale a mi agente» es una etiqueta pequeña encima de la barra.
  - Dentro solo aparece la pregunta de ejemplo, que se escribe y se borra letra a letra.
  - Solo se usan las preguntas que caben enteras: hay versiones cortas para el móvil.

### Fase 2: dirección visual Apple × Evolve
- **Tema:** claro por defecto (#FFFFFF y #F5F5F7, texto #1D1D1F). El oscuro es el de Apple (#000 y superficies #1C1C1E) y se activa con el botón de tema.
- **El color sale de:** los logos, acentos Apple por dominio en dosis pequeñas, y el degradado Apple Intelligence. Desde el hero definitivo, ese degradado solo queda en el borde de la barra del agente; en el chip, el color va en los paquetes de datos y los núcleos.
- **Tipografía:**
  - Plus Jakarta Sans en titulares; el nombre del hero mide hasta 96 px.
  - Inter en el texto.
  - Etiquetas grises seminegritas sobre cada título.
  - Geist Mono solo en el terminal.
- **Forma:** tarjetas de radio 24, botones en píldora (negro el principal, gris el secundario) y sombras suaves.
- **Navegación:** píldora flotante con CL, secciones, búsqueda, ES/EN, tema y un botón negro «CV». En el móvil, «CV» y «Menú» (pantalla completa).
- **Fuera:** auroras, nebulosa, retícula, números de lámina, cajetín, cotas y engranaje de progreso. En oscuro queda un estrellado muy sutil y quieto.
- **Estructura:**
  1. Hero: nombre centrado arriba; debajo, texto a la izquierda y chip a la derecha (centrado en el móvil).
  2. Ahora mismo.
  3. Experiencia y Formación como timeline con logos, con la línea dibujándose al hacer scroll.
  4. Cómo trabajo: 3 pasos (desde el 11-11; hasta la segunda ronda iba justo bajo el hero).
  5. Proyectos: una fila de tarjetas con desplazamiento horizontal; case study y demo debajo de la fila.
  6. Skills.
  7. Voluntariado: fila de tarjetas (de foto para las entradas con foto, tipográficas para el resto), más «Off the clock».
  8. Contacto: banda oscura #1D1D1F.
- **Motion:**
  - Reveals: los títulos de sección suben 24 px; tarjetas y resto aparecen solo con opacidad. Count-up en las cifras de las tarjetas.
  - Lift y brillo al hover.
  - Flotación lenta de los fragmentos.
  - Todo respeta el movimiento reducido.

### Fase 3: piezas visuales
- **Chip de IA en el hero** (rehecho el 05-11 como nube de partículas, ver «Hero definitivo»): vista explosionada con disipador y aletas, die con 8 núcleos, interposer con pistas, sustrato y bolas BGA.
- **Fragmentos de interfaz flotantes** (HTML/CSS) en cada proyecto, con flotación lenta y parallax al hover. (Retirados el 13-11: ver «Tarjetas de proyecto verticales con vídeo de fondo».)
  - Shortlist: oferta con barra de puntuación, lista ordenada y mini terminal con cifras reales (6.400+, 29, 116).
  - Correo en piloto automático: «Resumen de hoy» y nodos Gmail → Claude.
  - Agente de refrigeración: gráfica de generaciones con la etiqueta «Ilustrativo».
  - Proyectos de IA (CS50): clasificación de una señal y tablero de Nim.
- **Monte Carlo 2027 → 2028:** retirado el 11-11 (la fila final de Formación). El Erasmus sigue como línea de la tarjeta de la ETSII.
- **Grafo de skills** (red en 3D desde la segunda ronda del 11-11; ver ese apartado):
  - Nodos blancos con el logo real de la herramienta y anillo de su dominio.
  - Proyectos, trabajos y estudios como nodos mayores, con sus logos.
  - Líneas «usado en» siempre visibles, muy tenues, que se colorean al hover.
  - Recorrido automático cada 3,2 s, que se detiene al interactuar.
  - El inspector de debajo nunca está vacío.
  - En el móvil, lista por dominio con hoja inferior.

### Pulido estético (rama `claude/design-polish`, PR contra `main`)
Grupo (a) completo, del 1 al 16, y el reveal del grupo (b). Capturas antes/después de cada bloque en `docs/review/` (se borran al fusionar).

**Bloque 1: hero, animaciones, ⌘K y aterrizajes**
- **Hero:** más compacto y con alturas según la pantalla. En escritorio el chip asoma en la primera pantalla (38-80 % visible) y el hero mide 1,1-1,3 pantallas; en el móvil, 1,3 (el chip asoma en 375 × 812 y 390 × 844; en una pantalla baja, 375 × 667, el hero mide 1,6 y el chip no llega a verse).
- **Animaciones que siempre terminan:** las cifras llegan a su valor final en 0,9 s, también al saltar con el menú o ⌘K, con la pestaña en segundo plano o con movimiento reducido. Nada se queda oculto: si un reveal no se dispara, se muestra igual.
- **⌘K:** cada vez que se abre empieza con la búsqueda vacía (antes conservaba la anterior y la segunda búsqueda no encontraba nada).
- **Aterrizajes:** la etiqueta de cada sección queda justo bajo la píldora (antes caía hasta 180 px más abajo). También al abrir una URL con `#sección`, que en el móvil se quedaba ~6.000 px corta.
- **Móvil:** los chips y las skills con nombre largo pasan a dos líneas en vez de salirse. Las etiquetas del Monte Carlo son texto HTML legible.

**Bloque 2: maquetación y móvil**
- **Proyectos:** la ilustración va a sangre en la parte superior de la tarjeta (sin panel interior de radio 18 dentro del de 24). Los fragmentos se escalan con la tarjeta en vez de amontonarse en el móvil.
- **Formación:** el Erasmus es una fila bajo un separador, no una caja dentro de la tarjeta.
- **Voluntariado:** fuera el punto decorativo de las tarjetas tipográficas; abre la fecha.
- **Timeline en el móvil:** logos de 32 px y tarjetas con 20 px de margen interior (unos 20 px más de ancho para el texto).
- **Tipografía:** los títulos se parten en líneas equilibradas y los párrafos evitan una palabra sola en la última línea.
- **Pie:** la línea superior se alinea con el texto.

**Bloque 3: foco y color**
- **Teclado:** anillo de foco visible en la barra del agente. El grafo de skills tiene un anillo claro en el nodo con foco y es una sola parada de tabulador (antes 33): las flechas llevan al nodo más cercano en esa dirección; Inicio y Fin, al primero y al último.
- **Color del texto:** bullets, descripciones, intros de sección y el resumen del hero en #1D1D1F (#F5F5F7 en oscuro). El gris #6E6E73 queda solo para metadatos.
- **Grafo en oscuro:** discos oscuros para los nodos sin logo (los logos siguen sobre blanco). Los nodos apagados se atenúan a 0,65 (antes 0,5).

### Hero definitivo: mezcla de A y B (rama `claude/hero-asymmetric`, PR #2; pendiente de tu OK)
- **Escritorio (desde 1024 px):**
  - El nombre en una sola línea, centrado sobre todo el ancho y grande, como en A.
  - Debajo y centrada, la disponibilidad: punto verde que late + «Busco prácticas 2027» en #1D1D1F con peso 500 + «· Tiempo completo desde ene 2028» en gris.
  - Luego, dos columnas: a la izquierda (alineado a la izquierda) tagline, resumen, barra del agente y botones; a la derecha, el chip, centrado en vertical con esa columna.
  - El hero entero cabe en la primera pantalla (tamaños actuales en «Nube de partículas»).
- **Móvil:** todo centrado; el nombre en dos líneas equilibradas; el chip debajo de los botones, en una caja de como mucho el 40 % del alto de la pantalla.
- **Tagline** en negro sólido, con «automatizados» / «automated» en azul plano. Sin disco gris detrás del chip.
- **Imagen OG** con el mismo estilo: disponibilidad en línea, tagline en negro con la palabra en azul y el chip como nube de puntos.
- **Chip de partículas** (inspirado en la esfera de evolve.es): tamaño, tinta, cursor y scroll actuales en «Nube de partículas», más abajo. Se mantiene de esta fase:
  - Monocromo (#1D1D1F en claro, #F5F5F7 en oscuro); el color va solo en los núcleos y los paquetes de datos.
  - Al cargar, los puntos aparecen como una esfera y se condensan en el chip en ~1,5 s.
  - Cuando el agente responde, núcleos y paquetes se aceleran.
  - Las animaciones de la página se pueden pausar y reanudar (WCAG 2.2.2): activa el movimiento reducido durante la sesión. Dónde está el control ahora, en «Pausa de las animaciones» (sección 2).
- **Proyectos en el móvil (< 768 px):** cada proyecto muestra solo su fragmento principal, a 1,3×, con el texto entre 11,1 y 12,4 px; los demás se ocultan. En escritorio, igual que antes. (Desde el 13-11 el móvil ve el vídeo de fondo, como el escritorio.)
  - Fragmentos principales: el terminal de Shortlist (cifras reales), el «Resumen de hoy» del correo, la gráfica de generaciones con su etiqueta «Ilustrativo» y la clasificación de señales de CS50.

### Nube de partículas: chip con presencia y figuras (rama `claude/particle-figures`; pendiente de tu OK)
- **Chip más grande y con más tinta:**
  - En escritorio ocupa un cuadrado de 512 px a 1440 × 900 y de 496 px a 1280 × 800 (antes 374 y 366); el dibujo mide 486 × 480 y 470 × 465 px. Sigue centrado con la columna de texto y el hero cabe en la primera pantalla.
  - Puntos opacos y con jerarquía de tamaños, como en evolve.es: grano fino en las caras, aristas nítidas y puntos grandes en esquinas, núcleos y bolas (una por bola).
  - Núcleos y paquetes de datos más grandes; siguen siendo el único color.
- **Cursor y vida en reposo:** rehechos el 11-11 (partículas una a una, figura rígida) y otra vez en la segunda ronda (física real por partícula): ver esos apartados.
- **Scroll:** la figura empieza a formarse cuando se ve el 25 % de su hueco, sin esperar a que pare el scroll, y sigue montada hasta que queda menos del 15 %; depende de dónde están los huecos en pantalla, no de píxeles de scroll, y nunca se queda a medias.
- **La misma nube forma más figuras (solo desde 1024 px), en el hueco a la derecha del título:**
  - **Cómo trabajo:** embudo, flujo o barras, según el paso activo (desde la segunda ronda, en su propia columna).
  - **Experiencia:** tres engranajes engranados que giran con sus relaciones reales; se aceleran con el scroll y con el cursor, y al arrastrar giran con inercia.
  - **Formación:** un libro abierto cuyas hojas pasan solas.
  - **Contacto:** esfera de puntos claros (370 px) en la mitad derecha de la banda. Gira despacio, se puede girar y un clic la dispersa.
  - Proyectos, Skills y Voluntariado no llevan figura.
- **Transiciones:** entre embudo, flujo y barras la nube vuela directa; en el resto se deshace en bruma y se condensa en el siguiente hueco. Al subir, igual al revés.
- **Móvil y tablet (< 1024 px):** solo el chip, siempre montado mientras esté en pantalla, con la misma vida en reposo. La primera vez que entra en pantalla (con el 35 % a la vista) se forma solo desde la esfera, sin tocarlo. Tocarlo lanza la onda; no se arrastra, para no frenar el scroll.
- **Separación:** ninguna figura queda a menos de 39 px de un texto o un control a 1024, 1280, 1440 y 1920 px. Los huecos son decorativos (`aria-hidden`) y el lienzo no recibe clics.

### Ronda del 11-11 (rama `claude/nice-keller-emmje9`, fusionada en `main`)

**1. Partículas una a una (todas las figuras)**
- **La figura es rígida.** Gira entera (vaivén del chip, giro de la esfera, arrastre), pero nada en ella se estira ni se balancea: fuera las capas que flotaban, las ondas y el latido de la esfera, y las barras que subían bajo el cursor como un ecualizador.
- **Cada punto reacciona al cursor por separado:** se aparta (radio ~140 px) y vuelve con amortiguación crítica, a su propio ritmo, sin rebote ni oscilación. El shader recibe por dónde ha pasado el cursor en los últimos 0,7 s y cada punto lo pondera con la respuesta de un muelle críticamente amortiguado; como todos los pesos son positivos, no puede pasarse de largo. (Desde la segunda ronda esto solo queda para el móvil y para equipos sin texturas float: con ratón hay una simulación con estado.)
- **Deriva:** hasta la segunda ronda, cada punto se movía por su cuenta; ahora es un flujo que comparten los vecinos.
- **Lo que hace la figura entera, sin rebote:** al soltar un arrastre vuelve a su sitio con amortiguación crítica (antes oscilaba); las barras cambian de altura igual. La inclinación hacia el cursor queda en un gesto leve (unos 14° a los lados y 10° en vertical; antes ~34°).
- **Se mantiene:** el clic lanza una onda que dispersa los puntos y se recompone en ~1 s; al pasar por encima, el chip separa sus capas y enciende los núcleos; engranajes, hojas del libro y flujo se aceleran bajo el cursor.

**2. «Cómo trabajo» en lugar de «Cifras»**
- Fuera la sección de las 4 tarjetas. Las cifras siguen en las tarjetas de experiencia, proyectos y voluntariado.
- Tres pasos (stepper vertical en escritorio desde la segunda ronda; tarjetas en el móvil), con los textos que diste: **Detecto** (tareas manuales e ineficiencias en operaciones), **Automatizo** (con código, low-code e IA) y **Mido** (tiempo ahorrado, errores y volumen procesado). Sin cifras.
- **La figura cambia con el paso activo:** embudo con un enjambre de puntos sueltos encima y una fila ordenada saliendo por abajo → flujo de cuatro nodos unidos por cables por los que avanzan puntos equidistantes → barras con su línea de tendencia.
- **Paso activo:** hasta la segunda ronda lo decidía el scroll; ahora avanza solo (ver «Segunda ronda del 11-11»).

**3. Formación**
- **Libro de partículas** junto al título: abierto, con sus líneas de texto, y hojas que pasan solas de derecha a izquierda (una cada ~3,3 s; más rápido con el cursor encima). Misma gramática de cursor que el resto.
- **Fondo:** el vídeo o las fotos que subas directamente a `public/media/education/`, al 10 % de opacidad y en gris. Sin archivos, sin fondo (hoy no hay).
- Fuera el Monte Carlo 2027 → 2028.
- Fuera la especialidad de la web (tarjeta de Formación, «Ahora mismo» y la frase de introducción) y de lo que lee el agente. La imagen OG nunca la mostró.
- **Programa Mentor ETSII:** una línea dentro de la tarjeta de la ETSII, sobre el Erasmus.

**4. Voluntariado**
- La sección se llama «Voluntariado» / «Volunteering», también en la navegación, en ⌘K y para el agente (`#volunteering`).
- Solo voluntariado: DANA, Banco de Alimentos, eventos benéficos y orfanato.
- Carrusel horizontal con scroll-snap, flechas ← → y arrastre con el dedo en el móvil.
- **Fondo:** el vídeo que subas directamente a `public/media/volunteering/`, igual que en Formación. Sin archivos, sin fondo (hoy no hay).

**5. Proyectos**
- Una sola fila con desplazamiento horizontal: scroll-snap, flechas desde 768 px y arrastre con el dedo en el móvil. El panel de demo y case study se abre debajo de la fila.
- **Vídeo en bucle arriba de cada tarjeta, desde 768 px** (mudo, autoplay, playsInline, con póster; en el móvil, el fragmento principal en HTML): 7 s, grabado con Playwright de los fragmentos animados de la propia tarjeta, en webm y mp4, uno por idioma y por tema (16 vídeos y 16 pósters en `public/media/projects/<id>/`). Desde el 13-11 ya no hay clips grabados de los fragmentos: cada proyecto tiene un solo vídeo de fondo, y el de Shortlist es una escena hecha con código (más abajo).
- job-hunt-copilot se llama **Shortlist** en la web y para el agente; el `id` interno, la carpeta y el enlace al repositorio no cambian. La imagen OG no nombra proyectos.

**6. Skills**
- 12 skills (antes 22): las de peso 3 y 2.
- Grafo e inspector juntos no pasan del 60 % del alto de la pantalla.
- Cada skill lleva el logo real de su herramienta en su color (simple-icons) o un glifo propio; empresas y centros, sus logos de `public/logos`.

**7. Reunión**
- Botón «Reservar 15 min» / «Book 15 min» que abre `NEXT_PUBLIC_BOOKING_URL` en una pestaña nueva: en Contacto, en ⌘K (y el menú del móvil) y como `open_booking` del agente.
- Cal.com fuera: ni la ventana incrustada ni su dependencia.
- Sin la variable, no hay botón, ni entrada en ⌘K, ni herramienta para el agente.

**8. Contacto:** el retrato se lee de `public/photos/carlos.(jpg|webp|png)`. Mientras no exista, sigue la esfera.

**9. Separación del chip:** al pasar el ratón, arrastrar o hacer clic, ningún punto del chip queda a menos de 24 px del nombre ni de la línea de disponibilidad. Medido en «Resultados».

### Segunda ronda del 11-11 (rama `claude/tender-faraday-k93q2e`, fusionada en `main`)

**1. Partículas: física real por partícula (con ratón)**
- **Cada punto tiene estado propio:** cuánto se ha apartado de su sitio y a qué velocidad se mueve, en píxeles. Vive en una textura float (un texel por punto) y avanza en la GPU, con dos texturas que se alternan (WebGL2). Sin texturas float ni half-float, se queda el método anterior.
- **Las fuerzas actúan donde está el punto,** no en su sitio de reposo:
  - **Muelle** hacia su sitio, con amortiguación crítica y frecuencia propia (1 Hz ± 20 %): vuelve en 0,6–1 s, sin rebote.
  - **Repulsión del cursor:** alcance de 130 px, caída suave y hueco limpio de ~60 px de radio.
  - **Arrastre:** cerca del cursor los puntos heredan parte de su velocidad; es la estela.
  - **Clic:** un frente que sale a 1.000 px/s y empuja cada punto al pasar; se recompone en ~1 s.
- **Los puntos rodean el cursor, no lo cruzan:** el centro del hueco es un muro que se mueve con él y barre todo el tramo recorrido entre dos pasos; un movimiento rápido tampoco los atraviesa.
- **Paso de tiempo fijo:** subpasos de 1/120 s, 4 por frame como mucho. Velocidad acotada (4.000 px/s).
- **El estado no se reinicia** al cambiar de figura: los puntos conservan su inercia en los vuelos.
- **Un solo GLSL para el sitio de cada punto:** el paso de simulación usa el mismo código que el de dibujo (figura, vuelo, bruma y deriva).
- **Se mantienen:** la guarda bajo el nombre, el giro al arrastrar y la apertura del chip al pasar el ratón.
- **Deriva:** un flujo lento y coherente (el rotacional de un ruido suave sobre la posición) en lugar de que cada punto vaya por su cuenta. Los vecinos se mueven parecido, 2–5 px: respira, no tiembla.
- **Móvil:** sin simulación (no hay cursor). El método anterior, con la deriva nueva.
- **Panel de ajuste** (`?tune=1` en la URL): deslizadores para radio y fuerza de la repulsión, arrastre, frecuencia y amortiguación del muelle, y amplitud y velocidad de la deriva. Botones «Copiar valores» (JSON) y «Restablecer». Los valores por defecto están solo en `lib/particle-config.ts`.

**2. «Cómo trabajo»: más abajo y rediseñada**
- **Sitio:** después de Formación y antes de Proyectos. Tras el hero viene «Ahora mismo».
- **Escritorio, dos columnas que caben en una pantalla** (la sección mide 702 px a 1440 × 900):
  - Izquierda: el título y los tres pasos como stepper vertical (punto, número, título y su línea), con una línea de progreso.
  - Derecha: el hueco de la figura, de 460 × 400 px (400 × 350 entre 1024 y 1279 px).
- **No depende del scroll:**
  - Con la sección visible al 50 % avanza sola: 3,5 s por paso, en bucle, y la línea se va llenando.
  - El ratón o el foco del teclado sobre un paso lo selecciona y detiene el avance; al salir, sigue.
- **Las figuras nunca se quedan quietas:**
  - **Detecto:** puntos sueltos que giran sobre la boca del embudo y caen por él, más rápido según se estrecha. 28, de color, son las tareas detectadas; salen en fila por abajo.
  - **Automatizo:** los puntos recorren en orden los cables del flujo, con un paquete de color por cable.
  - **Mido:** las barras crecen desde la base, una tras otra, mientras llegan los puntos; después cambian de altura cada ~2 s, con su línea de tendencia.
  - De una a otra, los mismos puntos vuelan (0,6 s).
- **Movimiento reducido:** sin avance; el paso 1 con su póster, y los pasos se pueden seleccionar.
- **Móvil y tablet:** los pasos como tarjetas (en columna, o en fila en tablet), sin figura.

**3. Skills: red neuronal en 3D**
- **Tres capas en profundidad:** skills (delante), proyectos (en medio) y experiencia y formación (al fondo), en perspectiva y giradas 25°.
- **Profundidad:** los nodos de delante se dibujan entre un 14 y un 19 % más grandes; los del fondo, un 13 % más pequeños y más tenues. El más cercano se pinta encima.
- **Vida:**
  - vaivén de ±8°, un ciclo cada 21 s;
  - paralaje con el cursor (±3°);
  - arrastrar orbita la red, con inercia; al soltar vuelve sola a su vista.
- **Impulsos:** dos puntos de luz por conexión, sin parar, de cada skill hacia donde se usó, en el color de su dominio.
- **Hover o foco en un nodo:**
  - sus conexiones se encienden en su color y sus impulsos van 2,6 veces más rápido;
  - el nodo y los conectados se acercan a cámara (un 5 % más grandes) y el resto se atenúa;
  - el inspector, igual que antes.
- **Técnica:** los nodos son botones HTML colocados cada frame con la proyección; conexiones e impulsos van en un canvas 2D detrás. Sin WebGL. El bucle se para fuera de pantalla.
- **Accesibilidad:** una sola parada de tabulador, flechas, Inicio y Fin, y los mismos nombres accesibles. axe 4.14, sin incidencias.
- **Altura:** red e inspector ocupan 508 px a 1440 × 900 (el 56 %) y el 60 % a 1280 × 800.
- **Movimiento reducido:** la vista 3D quieta, sin vaivén, impulsos ni órbita.
- Mismos datos, mismo inspector y misma lista en el móvil.

**4. Ajustes**
- **Agente:** conoce todas las skills del CV. Las que no están en el grafo van en `alsoKnows` (`content/profile.ts`), con dónde se usaron: Cursor, C, MATLAB, LaTeX, TypeScript, pandas, NumPy, scikit-learn, TensorFlow/Keras, OpenCV, NLTK, Transformers, Playwright, pytest, Git/GitHub, REST APIs y CI.
- **Grafo:** SQL (usado en CS50) en lugar de Cursor. Siguen siendo 12. Cursor sigue como chip en PropHero, con su logo.
- **Proyectos en el móvil (< 768 px):** el fragmento principal en HTML, legible (12,5 px el texto más pequeño). El vídeo, solo desde 768 px; en el móvil ni se descarga. (Desde el 13-11, al revés: el vídeo también en el móvil y sin fragmentos.)
- **Contacto:** «, o reservar 15 minutos» solo aparece con `NEXT_PUBLIC_BOOKING_URL`. Sin ella, la frase termina en «Lo más rápido es el email.».
- **Escudo de Retamar:** se ve. Dos cambios para que no vuelva a salir en blanco: ver «Segunda ronda del 11-11 (revisar)».

### Tarjetas de proyecto verticales con vídeo de fondo (rama `claude/cool-wozniak-1p9zt8`, PR #8; pendiente de tu OK)

Sustituye a la primera versión de este mismo PR (un vídeo horizontal de 832 × 520 px arriba de la tarjeta de Shortlist, uno por tema), que no llegó a fusionarse.

**1. Tarjetas**
- **Verticales (2:3) y oscuras en los dos temas,** como las tarjetas de foto de Voluntariado: vídeo a sangre, degradado oscuro abajo y texto blanco encima.
- **Tamaño:**
  - Desde 1024 px caben las cuatro en la fila sin desplazar: 269 × 403,5 px a 1440 (225 × 337,5 a 1024).
  - Por debajo, carrusel como antes, con tarjetas de 260 a 300 px de ancho (281 × 421 a 390).
- **Arriba, píldoras:** el estado y, si el proyecto tiene cifras, la primera («6.400+ ofertas»). Hoy solo Shortlist tiene cifras.
- **Abajo, sobre el degradado:** el nombre y, debajo, su línea.
- **Toda la tarjeta es un botón** que abre el panel de debajo de la fila. Pulsarla otra vez, o «Cerrar» en el panel, lo cierra.
- **Al panel pasan** el problema, las cifras (las tres), las etiquetas de stack, la tira de fotos y la demo. «Qué construí», «Siguiente» y el repo ya estaban. Ningún texto ni cifra cambia.
- **El vídeo se ve en todos los tamaños,** también en el móvil. Con movimiento reducido o sin JavaScript, el póster.
- **Sin vídeo** (hoy, las otras tres tarjetas): fondo liso `#1D1D1F` con el tinte de su dominio.
- **Retirado:** los fragmentos de interfaz (`ProjectArt`) y su CSS, `?live-art`, el grabador `scripts/record-project-loops.mjs` y los clips grabados de los fragmentos.

**2. Un vídeo por proyecto**
- **Archivos:** `loop.mp4` (H.264), `loop.webm` (VP9) y `loop.poster.jpg` en la carpeta del proyecto. Ya no hay versión clara y oscura, ni por idioma.
- **Formato:** 600 × 900 px (2:3), 7 s, 24 fps, sin audio, bucle sin salto. Hasta 900 kB el mp4.
- **Composición, para ir detrás del texto:** fondo `#1D1D1F`, puntos claros y el color de acento del dominio; la acción en los dos tercios de arriba; el tercio de abajo, tranquilo y oscuro; nada importante bajo las píldoras.

**3. Vídeo de Shortlist, en vertical** (`scripts/loops/shortlist.html`)
- **Arriba** entra sin parar la nube desordenada: 1.302 puntos en todo el recorrido; a la vez se ven unos 800.
- **En medio,** siete líneas horizontales finas. Al cruzarlas, cada punto se desliza hasta su sitio en un solo movimiento continuo, sin pasos.
- **Abajo** salen en 15 filas ordenadas de mayor a menor, de izquierda a derecha. Las dos primeras (70 puntos, el 5 %) se encienden en azul.
- **Se desvanece antes del tercio de abajo:** en ningún fotograma hay nada dibujado ahí.
- **Jerarquía de puntos:** 60 % finos, 26 % pequeños, 9 % medianos y 5 % grandes. Toda la nube gira y deriva.
- **Ritmo:** 3 px por fotograma (72 px/s en el vídeo; unos 32 px/s en la tarjeta).
- **Peso:** mp4 de 484 kB, webm de 601 kB y póster de 42 kB.
- **Colores, del CSS de la web:** la escena enlaza `app/globals.css` y usa `--project-card` (nuevo: `#1D1D1F`), la tinta del tema oscuro al 85 % y el azul de `data-domain="automation"`.
- **Bucle sin salto:** todo depende de una fase de 0 a 1, con semilla fija; la fase 1 dibuja lo mismo que la 0, píxel a píxel.
- **Grabador:** `scripts/loops/record.mjs` graba ahora un solo clip (`loop.*`) y termina con error si el mp4 pasa de 900 kB. Mismos ajustes de codificación que antes.

**4. Accesibilidad**
- Una parada de tabulador por tarjeta, con anillo de foco de 2 px por fuera de la tarjeta.
- `aria-expanded` y `aria-controls` en el botón; cada panel es una región con el nombre de su proyecto.
- Al cerrar desde el panel, el foco vuelve a su tarjeta.
- Contraste del texto sobre el vídeo: 13,7:1 en el peor fotograma (AA pide 4,5:1).
- axe 4.14: sin incidencias.

### Vídeo del agente de refrigeración: aire entre racks (rama `claude/trusting-fermi-r1j0o9`, PR #9; pendiente de tu OK)

Sustituye a la primera versión de este mismo PR (un vídeo horizontal de 832 × 520 px, uno por tema), que no llegó a fusionarse. La rama lleva dentro la del PR #8 (tarjetas verticales y grabador): hay que fusionar antes el #8.

- **Formato, estilo y grabador, los del vídeo de Shortlist:** `loop.mp4`, `loop.webm` y `loop.poster.jpg` en `public/media/projects/cooling-agent/`; 600 × 900 px, 7 s, 24 fps, sin audio; fondo `--project-card`, puntos claros. Grabado con `scripts/loops/record.mjs`, sin tocarlo.
- **Es el único con dos colores:** ámbar que pasa a cian.
- **Escena, en vertical** (`scripts/loops/cooling-agent.html`):
  - **En la mitad de arriba,** una fila de tres racks en vista de tres cuartos desde arriba, hechos de puntos: aristas nítidas, caras en grano fino y puertas con sus servidores. Quedan entre el 13 % y el 52 % del alto.
  - **El aire baja por la tarjeta** en líneas de puntos, como humo en un túnel de viento: entra ámbar por detrás de la fila, se abre al llegar a cada rack, se cuela por los huecos y sale cian por delante.
  - **Testigos:** dos encendidos por rack, que laten despacio.
  - **Se desvanece antes del tercio de abajo:** en ningún fotograma hay nada dibujado por debajo de los 600 px.
  - Sin texto, sin ejes y sin cifras: es ilustrativo.
- **Peso:** mp4 de 632 kB, webm de 671 kB y póster de 117 kB.
- **Bucle sin salto:** todo depende de una fase de 0 a 1, con semilla fija; la fase 1 dibuja lo mismo que la 0, píxel a píxel.

## 2. Decidido por mí (revisar)

### Tarjetas de proyecto y vídeo de Shortlist (revisar)

**Lo que más conviene que mires**
- **Las «filas» ordenadas bajan en vertical.** Al girar la escena, el flujo baja, así que la lista ordenada queda de izquierda a derecha: las mejores, azules, a la izquierda. Si las querías horizontales, hay que replantear la escena.
- **En el tema claro, el gris de los enlaces de la cabecera pasa de `#6E6E73` a `#48484C`.** Es un cambio fuera de Proyectos. La píldora de la cabecera es translúcida: con una tarjeta oscura debajo, su blanco se vuelve gris y esos enlaces se quedaban en 2,78:1 (axe lo marca). Con el gris nuevo: 4,6:1 en el peor caso y 9:1 sobre blanco. La otra salida era una píldora casi opaca.
- **Borrados los 36 clips grabados de los fragmentos** de los otros tres proyectos, además de los de Shortlist. Ya no los leía nada; siguen en el historial de git.

**Tarjetas**
- **El tinte de dominio va solo en las tarjetas sin vídeo.** El vídeo de Shortlist va sobre `#1D1D1F` liso, como pediste, sin tinte encima.
- **Un chevrón abajo a la derecha** (no lo pedías): sin él, en el móvil nada indica que la tarjeta se abre. Con el panel abierto gira y se pone blanco, y la tarjeta lleva un borde blanco.
- **Un punto del color del dominio en la píldora de estado.**
- **«Ver demo», «Ver detalles» y «Cerrar» ya no se ven en la tarjeta,** porque toda ella es el botón. Siguen en su nombre accesible («Shortlist. Ver detalles»). «Cerrar» se ve en el panel.
- **El panel repite el nombre y la línea del proyecto** como cabecera, junto a «Cerrar»: en el móvil, al abrirlo, la tarjeta queda fuera de pantalla.
- **Los cuatro paneles están siempre en el HTML** y solo se ve el abierto. El problema, las cifras y el stack antes estaban a la vista en la tarjeta; así siguen en la página para los buscadores. Sin JavaScript se ven los cuatro paneles, sin la demo.
- **Entre 1024 y unos 1180 px, las dos píldoras de Shortlist parten en dos líneas:** la tarjeta mide 225 px.
- **Un borde muy tenue en la tarjeta:** en el tema oscuro, sin él, su pie se fundía con la página negra.
- **La luz del cursor enciende la tarjeta entera,** no solo el título, que es donde está el botón (`data-glow-card`, una línea en `HoverGlow`).

**Vídeo**
- **Convergencia continua.** Cada punto empieza y acaba su deslizamiento en un sitio distinto del tramo de las líneas, así que las filas se van llenando línea a línea. Los que vienen de lejos, y los mejores, usan todo el tramo.
- **En su fila, cada punto sigue moviéndose píxeles enteros** (3 por fotograma). Ya no es por peso: así se dibuja igual en todos los fotogramas y la fila no centellea.
- **Forma de embudo:** la nube es más ancha (unos 460 px) que la lista (389 px), y las líneas se estrechan de 504 a 424 px.
- **Más puntos que en la versión horizontal:** 1.302 frente a 1.071, en 15 filas en vez de 12. Con el límite nuevo había margen.
- **Tamaños de punto:** 3,4 · 5 · 7,4 · 10,8 · 14,5 px en el vídeo; en una tarjeta de 270 px, 1,5 · 2,2 · 3,3 · 4,8 · 6,5 px.
- **Bordes:** los puntos aparecen entre los 24 y los 128 px de arriba, bajo las píldoras, y se van entre los 514 y los 592. El tercio de abajo empieza en 600.
- **El webm pesa más que el mp4** (601 frente a 484 kB) con los ajustes de siempre, y la web sirve el webm primero. El límite que diste era para el mp4.
- **Si cambian `--project-card` o el azul en `globals.css`, hay que regrabar:** el vídeo lleva los colores dentro.

### Vídeo del agente de refrigeración (revisar)

**Lo que más conviene que mires**
- **Al cerrar el bucle, el mp4 gana nitidez de golpe.** No es un salto de movimiento: el primer fotograma del archivo sale más nítido que los demás y el cambio del último al primero es un 21 % mayor que entre dos seguidos (en el de Shortlist, un 2 %). No puedo ver el vídeo en movimiento, solo medirlo y mirar fotogramas: por tamaño, en una tarjeta de 270 px debería pasar desapercibido, y en una pantalla de 2× podría notarse cada 7 s en los puntos más finos. Míralo tú. Probé dos remedios y ninguno lo mejora: anclar el aire al píxel y usar puntos mayores y menos densos. Lo que debería quitarlo es bajar el CRF del grabador, que es común a todos los vídeos: ni lo he tocado ni lo he probado.
- **Son tres racks, no cuatro** como en la versión horizontal: en una tarjeta tan estrecha, con cuatro quedaban demasiado pequeños.
- **El aire pasa por debajo de la píldora de estado,** muy tenue. El peor contraste de la píldora es 7,6:1 (el de Shortlist, 14,7:1; AA pide 4,5:1).

**Escena**
- **El ámbar es `--orange`** del tema oscuro (`#FF9F0A`): en `globals.css` no hay un token «ámbar». El cian es el del dominio de la tarjeta.
- **Los racks no se mueven; solo el aire y los testigos.** La cámara está quieta, en perspectiva suave.
- **Una sola lámina de aire, a medio metro del suelo,** que llena la tarjeta de lado a lado: 54 líneas y unos 2.230 puntos de aire en cada fotograma, más 1.449 de los racks. Las dos líneas que rodean cada rack van más marcadas; el resto, en grano fino.
- **Las curvas son un flujo ideal** alrededor de los tres racks, resuelto al cargar la página. Sigue siendo ilustrativo: no sale de ningún simulador de refrigeración.
- **Los racks están separados** (80 cm de hueco). En una sala real van pegados, pero entonces no habría aire entre ellos.
- **El aire «respira»:** cada tanto los puntos vienen algo mayores y más llenos, en bandas que viajan con él.
- **Cada punto pasa de ámbar a cian en su propio sitio,** entre la entrada y la salida de la fila, y rápido. Un degradado común dejaba una franja gris en el centro.
- **Lo que queda detrás de un rack se ve al 10 %,** para que los racks parezcan sólidos sin cortar las líneas.
- **Testigos:** seis encendidos (cuatro cian y dos ámbar), a uno o dos latidos por bucle.
- **Movimiento libre, sin píxeles enteros:** unos 50 px/s en el vídeo (23 px/s en la tarjeta), más deprisa en los huecos.
- **Tamaños de punto:** 2,8 · 4 · 5,7 · 8,2 px en el vídeo; en una tarjeta de 270 px, 1,3 · 1,8 · 2,6 · 3,7 px. Más finos que los de Shortlist: aquí se ven a la vez unos 3.700 puntos, frente a unos 800.
- **Bordes:** el aire aparece entre los 30 y los 140 px de arriba, bajo las píldoras, y se va entre los 482 y los 592.
- **El webm pesa más que el mp4** (671 frente a 632 kB), y la web sirve el webm primero.
- **Si cambian `--project-card`, el cian o el naranja en `globals.css`, hay que regrabar.**

### Segunda ronda del 11-11 (revisar)

**Partículas**
- **La «fuerza» de la repulsión es el radio del hueco, en píxeles** (60). Es lo que se ve; la fuerza se calcula para que justo ahí se equilibre con el muelle.
- **El muro es el 75 % del hueco** (45 px). Entre el muro y el borde del hueco, los puntos se apartan por la fuerza, no por un tope duro: el borde no es un círculo perfecto.
- **Lo que queda delante del cursor resbala hacia los lados** (no estaba en tu lista). Sin esto, el muro empujaba los puntos por delante como una pala. Cruzando el chip a 800 px/s, 6 puntos de 6.000 se alejan más de 120 px de su sitio.
- **La estela tiene tope:** por rápido que vaya el cursor, los puntos lo toman por 2.500 px/s como mucho. Un salto del ratón no los lanza.
- **Con el cursor encima de la figura la repulsión ya no se suaviza** (antes sí): el hueco es el mismo dentro y fuera.
- **Los paquetes de datos del chip también tienen estado,** así que se apartan con los puntos de alrededor.
- **La guarda bajo el nombre se aplica al dibujar,** como antes, no dentro de la simulación.
- **El panel de ajuste** está siempre en español y solo se descarga con `?tune=1`.

**«Cómo trabajo»**
- **En el móvil el paso activo también avanza solo** (antes lo elegía el scroll): un único comportamiento en todos los tamaños.
- **Un clic o un toque selecciona el paso sin detener el avance.** Lo detienen el ratón encima o el foco del teclado.
- **Los números de los pasos pasan a gris de texto** (contraste AA). Antes iban en el gris decorativo, y axe los marcaba.
- **Fuera el vuelo directo del chip a esta sección** (ya no son vecinos) y la regla por la que el chip cedía pronto al bajar.

**Red de skills**
- **«Esta web» va en la capa de proyectos.**
- **Sin rótulos de dominio** (IA, Automatización…) sobre la red: el dominio se lee en el color del anillo y en el inspector.
- **El vaivén se detiene mientras el ratón o el foco están en la red,** para que un nodo no se escape de debajo del cursor.
- **Los nodos apagados no bajan de 0,65 de opacidad,** para que sus rótulos mantengan el contraste AA.
- **En los extremos del vaivén, los nodos de fuera sobresalen** hasta 43 px de la columna de contenido (nunca de la pantalla).
- **Intro o Espacio sobre un nodo con tarjeta lleva a su tarjeta,** igual que el clic.

**Ajustes**
- **Agente:** LaTeX y Playwright van sin «usado en», porque el CV no lo dice. TypeScript no está en el CV; lo añado porque lo pediste (esta web).
- **En la tarjeta de CS50 salen ahora dos chips:** Python y SQL.
- **Logos sin carga diferida.** Pesan 1–2 kB cada uno. Con carga diferida, un logo de una sección que el navegador aún no había pintado empezaba a descargarse cuando ya mirabas su casilla en blanco; es lo más probable que pasara con el escudo.
- **El escudo de Retamar se dibuja a sangre en su casilla** (`bleed` en `content/profile.ts`): el archivo trae mucho margen blanco y a 32 px el escudo medía 13 × 21 px. Ahora mide 18 × 28.
- **En el móvil solo se compila el código del chip** (el resto de figuras no se ven ahí). Sin esto, el shader nuevo sumaba 0,7 s de bloqueo en Lighthouse.

### Ronda del 11-11 (revisar)
- **«No toques el agente»:** no he tocado su interfaz, su ruta ni sus reglas. Sí lo que lee, porque sale de los mismos datos que la web y lo pedías en tres puntos: ya no conoce la especialidad, llama Shortlist al proyecto, la sección es `volunteering` y el Programa Mentor le llega como línea de la ETSII (lo puede resaltar igual). `open_booking` ya existía; ahora abre la pestaña.
- **Skills que salieron del grafo:** TensorFlow/Keras, pandas/NumPy, scikit-learn, SQL, MATLAB, TypeScript, Git, pytest, C y Negociación con patrocinadores. Desde la segunda ronda, SQL vuelve al grafo (por Cursor) y el agente conoce todas las del CV (`alsoKnows`).
- **«Off the clock»** (batería, DJ, golf, vela) sigue al final de Voluntariado, aunque no es voluntariado. Dime si lo muevo o lo quito.
- **«Ahora mismo»:** donde iba la especialidad ahora pone «ETSII · Universidad Politécnica de Madrid», para no dejar el hueco.
- **Fondos de sección:** cuenta lo que está directamente en la carpeta de la sección, no en las de las tarjetas, para que elijas tú qué se ve (en Voluntariado, vídeos sin caras). Si hay vídeo, las fotos se ignoran; varios vídeos se reproducen uno detrás de otro.
- **Vídeos de proyecto** (los grabados de los fragmentos; retirados el 13-11):
  - Como los fragmentos apenas se movían, el clip añade el paralaje del puntero dando una vuelta a la tarjeta; el bucle no tiene costura.
  - Pesan 3,0 MB en total entre los 16 (832 × 522 px, 24 fps; cada uno, entre 50 y 140 KB). Solo se descarga el del idioma y el tema que se ven, y solo cuando la tarjeta se acerca a la pantalla.
  - En el móvil no se usa el clip: desde la segunda ronda vuelve el fragmento principal en HTML.
  - Con las animaciones en pausa, sin JavaScript o hasta que carga, se ve el póster.
  - Para poner un vídeo real de un proyecto: `loop.mp4` en su carpeta (ver `public/media/README.md`). Para regrabar los actuales: `node scripts/record-project-loops.mjs` (retirado también el 13-11).
- **Reserva desde el agente:** un navegador solo deja abrir una pestaña justo después de un clic o una tecla, y la respuesta del agente puede llegar más tarde. Si la bloquea, la página baja a Contacto y resalta el botón.
- **«Cómo trabajo» en el móvil:** no hay figura (las figuras siguen siendo solo de escritorio, salvo el chip).
- **Límite del chip:** no es un tope fijo de ángulo. En cada fotograma el chip toma toda la inclinación y la apertura que caben sin acercarse a menos de 35 px de los textos; los puntos que empuja el cursor se comprimen en los 5 px siguientes y ninguno cruza los 30 px (24 más el radio del punto más grande). La apertura al pasar el ratón baja además de 0,20 a 0,16.
- **Tarjetas de la fila de proyectos:** 520 px de ancho en escritorio (se ven dos y el borde de la tercera), 460 px en tablet y el 86 % del ancho en el móvil; todas con la misma altura. (Desde el 13-11 son verticales y caben las cuatro: ver «Tarjetas de proyecto verticales con vídeo de fondo».)

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
- **Fondos alternos:**
  - Gris #F5F5F7: Ahora mismo, Formación y Skills, con tarjetas blancas.
  - Blancas: el resto, con tarjetas grises.
- **Fechas del timeline:** no son «sticky», para que el scroll sea más tranquilo.
- **Voluntariado:**
  - Las entradas con foto van primero.
  - Si hay más de una foto, la tarjeta lleva un botón «Fotos y vídeos · n» que abre el visor.
- **Herramienta `focus_part` del agente:** eliminada, porque solo servía para la reductora. Ahora el chip reacciona solo cuando el agente responde.
- **Página `/lab`:** eliminada, junto con sus componentes. Era el laboratorio de motion del principio y no encajaba en la nueva dirección. Sigue en el historial de git.
- **Imagen para compartir (OG):** usa las fuentes del sitio (Plus Jakarta Sans e Inter). Están en `assets/og` en TrueType (licencia OFL), porque el generador no lee los WOFF2 de la página.

### Pulido estético (aprobadas el 05-11)
- **Fragmentos de proyecto** (retirados el 13-11): en escritorio se dibujan en un lienzo del tamaño de la tarjeta (540 px) y se escalan con ella. En el móvil (< 768 px) se ve solo el fragmento principal de cada proyecto, legible (ver «Hero definitivo»).
- **Fondo de la ilustración:** solo el tinte del dominio sobre el gris de la tarjeta; antes era un panel blanco.
- **Erasmus en el móvil:** las fechas van en su propia línea bajo «Erasmus», para que no se partan.
- **Qué sigue en gris:** fechas, lugares, el «· contexto» tras la empresa, las etiquetas bajo las cifras, pies de foto y notas.
- **Grafo:** se anuncia como barra de herramientas (`toolbar`), que es lo que hace que los lectores de pantalla indiquen que se navega con flechas. No añade texto nuevo.
- **Arreglo que no estaba en la lista:** la línea del timeline iba 20-32 px a la izquierda del centro de los logos en todos los tamaños. Ahora pasa por el centro.

### Hero definitivo (revisar)
- **Carga de la escena:** no espera a que el navegador quede ocioso (la barra del agente escribe sin parar y podía no llegar nunca), ni a que el chip esté cerca, ni a un primer toque. En escritorio empieza a cargarse en cuanto se monta el hero; en el móvil, al terminar el load (antes, 4 s después). Hasta entonces se ve la esfera (el póster) y nada reacciona al cursor. El montaje va en pasos cortos, para no retrasar una tecla en el agente. Tiempos medidos en «Resultados».
- **Vaivén en vez de giro completo:** el chip se balancea sobre su vista de ¾ (ahora ±9°, porque se suma la inclinación hacia el cursor). Al girar entero pasaba por ángulos en que las aletas quedaban de frente y dejaba de leerse como chip.
- **Pausa de las animaciones:** ya no hay botón sobre el chip. El control está oculto y aparece al recibir el foco del teclado, como el enlace «Saltar al contenido» (es la segunda parada de la página). La misma acción está en ⌘K y en el menú del móvil: «Pausar animaciones» / «Reanudar animaciones». Pausa también el punto que late y el resto de animaciones (es la preferencia de movimiento reducido de la web). Con la pausa, o con `prefers-reduced-motion`, cada hueco muestra su figura quieta.
- **Disponibilidad en el móvil:** no cabe en una línea, así que «Tiempo completo desde ene 2028» baja a la segunda línea sin el «·».
- **Tablets (768–1023 px):** hero centrado con el chip debajo, como en el móvil. Los fragmentos de proyecto mantienen la composición escalada de escritorio, porque pediste el cambio por debajo de 768 px; ahí su texto queda pequeño (5–6 px).
- **Escenario de los fragmentos en el móvil:** 4:3, y cuadrado por debajo de 400 px para que el «Resumen de hoy» quepa a 320 px.

### Nube de partículas (revisar)
- **El hero crece un poco:** para que el chip quede centrado con el texto y a más de 32 px del nombre, la fila mide el alto del chip menos 72 px. El texto baja unos 30 px y el hero termina a 721 px en 1440 × 900 (el chip, a 757) y a 679 px en 1280 × 800 (el chip, a 715).
- **6.000 puntos en escritorio (antes 8.000):** con el chip nítido sobraban; así el póster pesa menos.
- **En el móvil el lienzo va dentro del chip, no a pantalla completa:** así se mueve con la página sin retraso al hacer scroll con el dedo. En escritorio sí es un único lienzo fijo a pantalla completa. En los dos casos hay un solo contexto WebGL.
- **Cuándo cambia de figura:** gana el hueco más visible (25 % para entrar, 15 % para mantenerse) y, si hay empate, el más centrado. La franja de la navegación no cuenta como visible.
- **Las transiciones duran un tiempo fijo** (bruma 0,3 s, condensar 0,5 s, vuelo 0,6 s) en vez de seguir al scroll: así nunca se quedan a medias. Si el equipo va lento, el tiempo perdido se recupera por tramos (la figura tarda lo mismo con pocos fotogramas) y, si sigue lento en una pantalla de alta densidad, el lienzo baja a densidad 1.
- **Huecos:** el de los engranajes y el libro mide 380 × 240 px (320 × 210 entre 1024 y 1279). El de «Cómo trabajo» es una columna propia de 460 × 400 (400 × 350).
- **Experiencia entre 1024 y 1279 px:** la frase de introducción pasa de dos líneas a tres para dejar sitio a los engranajes. El texto no cambia.
- **La esfera solo sale si no hay retrato en Contacto.** Cuando subas `public/photos/carlos`, el retrato ocupa ese hueco y habrá que decidir dónde va la esfera.
- **Con el cursor encima de la figura, la repulsión se suaviza:** solo en el método sin estado (móvil). Con la simulación, el hueco es siempre el mismo.
- **Formación entre 1024 y 1279 px:** como en Experiencia, la introducción deja sitio al libro.

### Técnicas
- **Secciones fuera de pantalla con `content-visibility`,** que acelera el primer render en el móvil.
  - Como sus alturas son estimadas hasta que se pintan, el scroll a una sección hace una segunda pasada de corrección.
  - Comprobado: todas las navegaciones aterrizan bajo la píldora.
- **Cada sección es un límite `Suspense`:** React hidrata por partes y el móvil gana margen.
- **Sin JavaScript:** React envía esas secciones después del pie, ocultas, para que un script las coloque; sin script solo se veían el hero y el pie (no era el reveal, que ya solo oculta bajo `html.js`). Ahora el CSS las muestra y las ordena con flex (hero, secciones, pie), y Skills enseña la lista por dominio en vez del grafo, que lo construye un script.
- **La caché de build de Turbopack está desactivada.** Una vez sirvió un `globals.css` antiguo, y Vercel restaura esa caché entre despliegues. El build tarda segundos, así que no compensa el riesgo.
- **En móvil no se construye el grafo SVG.** three.js sí se carga para el chip, pero tarde (ver «Hero definitivo»).
- **Pósters del chip:** `lib/chip-cloud.ts` genera la nube de forma determinista. El mismo código prerenderiza en el build unos SVG del primer frame (`app/chip/[file]`), que la página pinta como máscaras CSS: no mueven el layout ni cuentan como LCP. El primer frame de WebGL coincide con el póster, así que el cambio no se nota. Sin JavaScript, sin WebGL o con movimiento reducido se ve un póster del chip montado.
- **Nube de partículas** (`components/figures`, `lib/figure-cloud.ts`):
  - Dónde va cada punto (su figura, el vuelo, la bruma, la deriva, la apertura, el giro) se calcula en el vertex shader a partir de unos pocos valores.
  - Con ratón, cuánto lo aparta el cursor sale de una simulación por partícula en la GPU: el estado está en una textura float de 128 × 48 y cada paso dibuja los mismos puntos, con el mismo shader, cada uno en su texel. Sin ratón o sin texturas float, sale del recorrido reciente del cursor (12 muestras), sin estado.
  - Los números de esa física están en `lib/particle-config.ts`.
  - Un hueco puede turnarse entre varias figuras (`data-figure-set`); `data-figure` dice cuál toca y la nube vuela de una a otra.
  - Las posiciones de los huecos se guardan y solo se vuelven a medir cuando cambia el tamaño de la página; por frame no se lee layout.
  - El bucle se para cuando no hay figura en pantalla o la pestaña está oculta. El lienzo usa como mucho DPR 2 y ~4 megapíxeles.
  - Las interacciones se capturan en zonas invisibles sobre cada hueco; el lienzo no recibe clics y queda bajo la navegación y los diálogos.
  - Embudo, flujo, barras, engranajes, libro y esfera tienen también su póster SVG (movimiento reducido, sin JavaScript o sin WebGL).
- **Filas con desplazamiento horizontal** (`components/ui/Carousel.tsx`): scroll nativo con scroll-snap. Un gesto horizontal sobre la fila no lo intercepta el scroll suave de la página. Si el agente, ⌘K o un enlace señalan una tarjeta que no se ve, la fila la trae.
- **Vídeos de proyecto y fondos de sección:** el servidor mira las carpetas al construir; el navegador no monta ningún `<video>` hasta que su tarjeta o su sección se acercan a la pantalla, y solo reproduce mientras se ven.
- **Reveals:** pueden marcar un elemento antes de que React hidrate su sección (con el hero más corto, la sección siguiente ya está en la primera pantalla). Cada `.reveal` lleva `suppressHydrationWarning`, así que React lo espera y no avisa.
- **Red de skills** (`lib/graph.ts`, `components/sections/skillsNet.ts`):
  - El servidor coloca los nodos en 3D; el navegador los proyecta en cada frame y mueve cada botón con `transform`. Tamaño, opacidad y orden de pintado salen de la profundidad.
  - El nombre accesible de cada nodo es su `aria-label`, y tiene que contener el texto que se ve en él (WCAG 2.5.3). El monograma «IF» es contenido generado por CSS: es una imagen del nodo, no parte de su texto (si no, se leería «IF Induforum 2027»).
  - Las flechas del teclado van al nodo más cercano en esa dirección según la vista en reposo.
- **El tamaño de los logos** (`LogoMark`) se puede fijar desde CSS con `--logo`. El timeline lo usa para tener 32 px en el móvil.
- **Desarrollo local:** a veces `next dev` deja de recoger los cambios de `globals.css`. Se arregla parando el servidor y borrando `.next/dev`.

## 3. Resultados (build de producción, local)

| Lighthouse | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
| --- | --- | --- | --- | --- |
| Móvil, `/` (11-11, 1 pasada, segunda ronda; máquina más lenta: `main` da 75 en ella) | 75 | 100 | 100 | 66* |
| Móvil, `/` (10-11, 1 pasada, rama de la nube de partículas) | 90 | 100 | 100 | 66* |
| Móvil, `/` (04-11, 6 pasadas, rama del pulido) | 86–92 (mediana 87,5) | 100 | 100 | 66* |
| Móvil, `/` (04-11, 6 pasadas, `main`, alternando con la rama) | 84–90 (mediana 87,5) | 100 | 100 | 66* |
| Escritorio, `/es` (04-11, rama y `main`, 2 pasadas cada una) | 100 | 100 | 100 | 66* |

\* El único fallo de SEO es «la página no es rastreable», que es el noindex intencionado. Pasará a 100 al lanzar.

- **El pulido no empeora el rendimiento:** con `main` medido en la misma sesión, la mediana de rendimiento es igual (87,5) y el LCP mejora (2,64 s frente a 2,89 s de mediana). El TBT sube 40 ms de mediana (386 frente a 346 ms), dentro de la variación de ambas versiones (253–427 y 287–423 ms). CLS 0 en las dos.
- **Sobre el móvil:** desde el 03-11 la máquina de pruebas es más lenta. La versión de la fase 2 da 86–87 en esta misma máquina (en la anterior daba 92–94), así que la fase 3 no empeora el rendimiento.
- **Nube de partículas (10-11, una pasada):** LCP 2,8 s, TBT 290 ms, CLS 0.
- **Carga e interacción del chip (10-11, build local, Chromium):** la escena sustituye al póster 0,3–0,4 s después del load en escritorio (dos pasadas: 298 y 372 ms) y 0,3 s en el móvil (255 y 329 ms; antes 4,2 s), sin tocar la pantalla. Bajando con la rueda sin parar, el gráfico de Cifras (la sección de entonces; hoy ahí está «Cómo trabajo») queda formado 0,7 s después de verse entero su hueco (antes 1,2 s) y los engranajes 0,5 s después de verse el 25 % del suyo (antes 0,8 s). En local no hay red: en producción hay que sumar la descarga de three.js. No he vuelto a pasar Lighthouse: en el móvil three.js se carga ahora dentro de la ventana que mide, así que el rendimiento móvil puede bajar.
- **Ronda del 11-11 (build local de producción, Chromium):**
  - `npm run lint` y `npm run build`, sin errores. `/` y `/es` cargan sin errores de consola ni peticiones fallidas, recorriendo todas las secciones.
  - **Separación del chip** (1440 × 900; distancia del punto más cercano al nombre o a la línea de disponibilidad, medida sobre la imagen): sin cursor, 49 px; con el ratón encima, 29–36 px; arrastrando, 31–44 px; justo tras un clic junto al borde superior, 26 px; barriendo ese borde con el ratón, 28–30 px. Mínimo medido: 26 px (antes rozaba la línea).
  - **Skills:** grafo de 1136 × 385 px; con el inspector, 501 px (56 % de 900).
  - **Proyectos:** los cuatro vídeos se reproducen mudos y en bucle, con póster, y cambian con el tema; la flecha avanza una tarjeta (540 px) y encaja; `open_project` trae la tarjeta y abre el panel. En 390 × 844 la fila encaja al deslizar y la página no se desborda a lo ancho.
  - **Fondos y reserva:** probados con un vídeo temporal en cada carpeta (opacidad 0,1, en gris, reproduciéndose solo en pantalla) y con una URL de prueba (botón en Contacto, entrada en ⌘K, `open_booking` abre la pestaña y, si el navegador la bloquea, resalta el botón). Retirados después: en `main` no hay fondos ni botón hasta que subas los archivos y pongas la variable.
  - **Sin repetir en esta ronda** (presupuesto de comprobaciones): Lighthouse y axe. Las capturas de verificación han sido 8. Conviene pasar axe y Lighthouse antes del lanzamiento: hay secciones nuevas y vídeo en las tarjetas.
- **Segunda ronda del 11-11 (build local de producción, Chromium sin GPU):**
  - `npm run lint` y `npm run build`, sin errores. `/` y `/es`, recorridas enteras en escritorio y en móvil, sin errores de consola ni peticiones fallidas.
  - **Simulación, con ratón real (Playwright) sobre el chip:**
    - En reposo, ningún punto está desplazado. Con el cursor parado en el centro, 1.600 puntos se apartan.
    - Al irse el cursor, el punto más apartado vuelve sin pasarse: 8,5 px a los 0,23 s, 3,5 a los 0,43, 1,3 a los 0,63 y 0,2 al segundo. En toda la nube, a los 0,83 s quedan 3 puntos a más de 5 px y al segundo, ninguno.
    - Clic: hasta 198 px a los 0,22 s; al segundo y medio solo quedan apartados los que rodean el cursor.
    - Cruzando el chip a 300, 800 y 2.000 px/s: 0,5 s después de salir, ningún punto a más de 26 px de su sitio; al segundo, ninguno a más de 2.
  - **Lighthouse móvil (una pasada final):** 75 / 100 / 100 / 66. LCP 0,9 s, TBT 1.400 ms, CLS 0. En esta máquina `main` da 75 (TBT 1.310 ms) y accesibilidad 96; la rama, antes de aligerar el shader del móvil, daba 71–72.
  - **axe 4.14:** 0 incidencias en `/` y `/es`, claro y oscuro, escritorio (1440 × 900) y móvil (390 × 844). En `main` marcaba los números de los pasos de «Cómo trabajo» (contraste).
  - **«Cómo trabajo»:** 702 px de alto a 1440 × 900 y a 1280 × 800; 692 a 1024 × 768. Cambia de figura cada 3,5 s; con el ratón sobre un paso, se queda en él.
  - **Skills:** red de 1136 × 392 px; con el inspector, 508 px (56,4 % de 900). Ningún rótulo pisa a otro nodo en todo el vaivén. Arrastrando 200 px, un nodo de delante se mueve 282 px y vuelve a su sitio en 2,5 s.
  - **Proyectos en 390 × 844:** fragmento de 305 × 122 px, texto de 12,5 px o más, y ninguna petición a los vídeos ni a sus pósters. A 800 px de ancho, el vídeo.
  - **Sin desbordes a lo ancho** en 390, 1024, 1280 y 1440 px.
  - Capturas de verificación: 9.
- **Tarjetas de proyecto y vídeo de Shortlist (13-11, build local de producción, Chromium):**
  - `npm run lint` y `npm run build`, sin errores.
  - **Fila:** a 1440 × 900, cuatro tarjetas de 269 × 403,5 px, sin desplazamiento; a 1024 × 768, de 225 × 337,5; a 390 × 844, de 281 × 421 en carrusel. La página no se desborda a lo ancho en ninguno.
  - **Archivos:** H.264 y VP9, 600 × 900 px, 24 fps, 168 fotogramas, 7 s, una sola pista (sin audio). mp4 de 484 kB.
  - **Bucle:** en la escena, la fase 1 y la fase 0 dan la misma imagen (ningún byte distinto). En el mp4, del último fotograma al primero cambia lo mismo que entre dos seguidos cualesquiera (un 2 % más, por el fotograma clave) y el fondo no salta.
  - **Tercio de abajo:** ningún píxel dibujado por debajo de los 600 px en los 168 fotogramas.
  - **Fotogramas del mp4 dentro de la tarjeta real,** a 1440 y a 390 px, en claro y en oscuro: siete por caso, mirados a ojo. La tarjeta es la misma en los dos temas.
  - **Contraste del texto sobre el vídeo** (56 fotogramas por caso, píxel a píxel detrás de cada texto): 13,7:1 como mínimo; en las píldoras, 14,7:1.
  - **Teclado:** cuatro paradas de tabulador, una por tarjeta. Intro abre el panel, `aria-expanded` pasa a `true` y solo se ve ese panel. «Cerrar» devuelve el foco a la tarjeta.
  - **Movimiento reducido:** ningún `<video>`; se ve el póster. **Sin JavaScript:** el póster y los cuatro paneles.
  - **axe 4.14:** 0 incidencias en `/` y `/es`, en claro y en oscuro, a 1440 × 900 y a 390 × 844, con los paneles cerrados, con uno abierto y con la cabecera sobre una tarjeta (24 pasadas). El contraste del texto sobre el vídeo lo deja «por revisar», porque no lo sabe medir: es el medido arriba.
- **Vídeo del agente de refrigeración (13-11, build local de producción, Chromium), con las tarjetas del PR #8:**
  - `npm run lint` y `npm run build`, sin errores.
  - **Archivos:** H.264 y VP9, 600 × 900 px, 24 fps, 168 fotogramas, 7 s, una sola pista (sin audio). mp4 de 632 kB. Grabar dos veces da el mismo mp4 y el mismo póster, byte a byte.
  - **Bucle:** en la escena, la fase 1 y la fase 0 dan la misma imagen. En el mp4, del último fotograma al primero cambia un 21 % más que entre dos seguidos de media (el mayor de los demás pasos, un 9 % más): es el fotograma clave, más nítido. El fondo no salta: es el mismo valor en los 168 fotogramas.
  - **Tercio de abajo:** ningún píxel dibujado por debajo de los 600 px en los 168 fotogramas (el más bajo, en la fila 591). En el mp4, ahí el fondo se aparta 1 nivel de 255 del color de la tarjeta, como mucho.
  - **Fotogramas del mp4 dentro de la tarjeta real,** a 1440 px (269 × 403,5) y a 390 px (281 × 421), en claro y en oscuro: siete por caso, mirados a ojo. La tarjeta es la misma en los dos temas.
  - **Contraste del texto sobre el vídeo** (56 fotogramas por caso, píxel a píxel detrás de cada texto): 18,4:1 como mínimo en el nombre, 13,8:1 en su línea y 7,6:1 en la píldora.
  - **Lo que se pide:** el póster y un solo vídeo; sin errores de consola ni peticiones fallidas. **Movimiento reducido:** ningún `<video>`; se ve el póster.
  - **axe 4.14:** 0 incidencias en Proyectos, en `/` y `/es`, en claro y en oscuro, a 1440 × 900 y a 390 × 844 (8 pasadas, con los paneles cerrados).
  - **Sin comprobar:** Safari y Firefox (solo Chromium) y una pantalla de 2× real.
- **axe:** 0 incidencias en claro y oscuro, escritorio y móvil (04-11).
- **axe 4.14 (10-11):** 0 incidencias en `/` y `/es`, en claro y oscuro, en escritorio (1440 × 900, tras recorrer toda la página) y en móvil (390 × 844).
  - Esta versión pasa por defecto una regla más, `label-content-name-mismatch`, que marcaba 7 nodos del grafo de skills en `/es` y 4 en `/`: leía pegadas las dos líneas de una etiqueta («pilotoautomático») y el monograma «IF» junto al nombre. Arreglado: ver «Grafo de skills» en «Técnicas».
  - En esa regla queda un aviso «por revisar», que no es una incidencia: el nodo «C». axe no sabe valorar una etiqueta de una sola letra; su nombre accesible, «C · Software», la contiene.

## 4. Pendiente

**Datos (`npm run todos`)**
- Destino del Erasmus.
- Resultados reales del simulador del agente de refrigeración.
- Fechas (AAAA-MM) del Banco de Alimentos, los eventos benéficos y el orfanato.

**Archivos**
- `public/logos/induforum`: hasta que lo subas se ve el monograma «IF».
- `public/photos/carlos` (`.jpg`, `.webp` o `.png`): el retrato de Contacto; hasta entonces sigue la esfera. Y `public/photos/n8n-flow` (flujo real del correo).
- `content/demos/job-hunt-copilot.txt` (el archivo conserva ese nombre), la grabación del terminal de Shortlist. Hasta que exista, la tarjeta dice «Ver detalles» y no hay ventana de terminal.
- Fotos y vídeos en `public/media/…`. Las de voluntariado convierten la tarjeta en tarjeta de foto.
- **Fondos de sección:** un vídeo o fotos en `public/media/education/` y un vídeo sin caras en `public/media/volunteering/` (en la carpeta de la sección, no en la de una tarjeta). Sin ellos no hay fondo.
- **Vídeos de fondo de los otros dos proyectos** (correo y CS50): hasta que tengan el suyo (`loop.mp4`, `loop.webm` y `loop.poster.jpg`, 600 × 900 px; ver `public/media/README.md`), su tarjeta lleva fondo liso con el tinte de su dominio.

**Avisos**
- **Tu CV en PDF incluye tu teléfono.** Al servirlo, queda público en la web, y antes acordamos no publicar el teléfono. Si no lo quieres publicar, sube una versión sin él con el mismo nombre.
- **La rama por defecto del repo en GitHub es `claude/affectionate-euler-bieu8r`, no `main`.** Por eso tus subidas desde la web de GitHub fueron a esa rama. Si Vercel despliega `main`, conviene poner `main` como rama por defecto: Settings → General → Default branch. Así lo que subas irá directo a producción.

**Variables de entorno en Vercel**
- `ANTHROPIC_API_KEY`.
- `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` (o las `KV_*`).
- `NEXT_PUBLIC_BOOKING_URL`: la URL pública de tu página de citas de Google Calendar (`https://…`). Sustituye a `NEXT_PUBLIC_CALCOM_LINK`, que ya no se usa y se puede borrar. Sin ella no hay botón de reserva.
- `NEXT_PUBLIC_SITE_URL`.

**Partículas:** si ajustas el movimiento con `?tune=1`, pega el JSON de «Copiar valores» en `PARTICLE_DEFAULTS` (`lib/particle-config.ts`), o pásamelo.

**Propuestas de diseño:** no queda ninguna abierta. El patrón de secciones se queda como está (Contacto ya lo rompe con su banda oscura).

**Lanzamiento:** cuando digas «lanzamiento», poner `LAUNCHED = true` en `lib/site.ts`.
