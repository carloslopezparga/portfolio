# Decisiones

Lo aprobado, lo que he decidido yo al construir (para que lo revises) y lo que falta. Última actualización: 10-11-2026. Incluye las tres fases (contenido y CV, dirección visual Apple × Evolve, piezas visuales), el pulido estético (rama `claude/design-polish`), el hero definitivo con el chip de partículas (rama `claude/hero-asymmetric`), la nube de partículas con presencia y figuras (rama `claude/particle-figures`) y la carga, la interacción y la pausa del chip (rama `claude/chip-interaction`).

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
  2. Cifras (4 tarjetas con count-up que llevan a su entrada).
  3. Ahora mismo.
  4. Experiencia y Formación como timeline con logos, con la línea dibujándose al hacer scroll.
  5. Proyectos: 4 tarjetas grandes con case study y demo debajo.
  6. Skills.
  7. Liderazgo: tarjetas de foto para las entradas con foto y tipográficas para el resto, más «Off the clock».
  8. Contacto: banda oscura #1D1D1F.
- **Motion:**
  - Reveals: los títulos de sección suben 24 px; tarjetas y resto aparecen solo con opacidad. Count-up en las cifras.
  - Lift y brillo al hover.
  - Flotación lenta de los fragmentos.
  - Todo respeta el movimiento reducido.

### Fase 3: piezas visuales
- **Chip de IA en el hero** (rehecho el 05-11 como nube de partículas, ver «Hero definitivo»): vista explosionada con disipador y aletas, die con 8 núcleos, interposer con pistas, sustrato y bolas BGA.
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
- **Liderazgo:** fuera el punto decorativo de las tarjetas tipográficas; abre la fecha.
- **Timeline en el móvil:** logos de 32 px y tarjetas con 20 px de margen interior (unos 20 px más de ancho para el texto).
- **Tipografía:** los títulos se parten en líneas equilibradas y los párrafos evitan una palabra sola en la última línea.
- **Cifras:** icono de línea sin círculo blanco y tarjetas más compactas.
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
- **Proyectos en el móvil (< 768 px):** cada proyecto muestra solo su fragmento principal, a 1,3×, con el texto entre 11,1 y 12,4 px; los demás se ocultan. En escritorio, igual que antes.
  - Fragmentos principales: el terminal de job-hunt-copilot (cifras reales), el «Resumen de hoy» del correo, la gráfica de generaciones con su etiqueta «Ilustrativo» y la clasificación de señales de CS50.

### Nube de partículas: chip con presencia y figuras (rama `claude/particle-figures`; pendiente de tu OK)
- **Chip más grande y con más tinta:**
  - En escritorio ocupa un cuadrado de 512 px a 1440 × 900 y de 496 px a 1280 × 800 (antes 374 y 366); el dibujo mide 486 × 480 y 470 × 465 px. Sigue centrado con la columna de texto y el hero cabe en la primera pantalla.
  - Puntos opacos y con jerarquía de tamaños, como en evolve.es: grano fino en las caras, aristas nítidas y puntos grandes en esquinas, núcleos y bolas (una por bola).
  - Núcleos y paquetes de datos más grandes; siguen siendo el único color.
- **Cursor (escritorio; igual en todas las figuras):**
  - La figura se inclina hacia el cursor, esté donde esté (hasta ~34° hacia los lados, el doble que antes; hacia arriba menos, para que no se vea de canto).
  - Los puntos a menos de ~140 px se apartan (el doble que antes) y vuelven con retardo.
  - Al pasar por encima se abre: en el chip se separan las capas (algo más del doble que antes) y se encienden todos los núcleos. El cursor es una mano abierta, y cerrada mientras se pulsa.
  - Arrastrar la gira con inercia y vuelve a su sitio; un clic lanza una onda que la dispersa y se recompone en ~1 s.
- **Vida en reposo:** las capas flotan cada una a su ritmo, cada 4 s una onda de luz cruza el die y sigue por las pistas, el polvo orbita despacio y los paquetes se ven más.
- **Scroll:** la figura empieza a formarse cuando se ve el 25 % de su hueco, sin esperar a que pare el scroll, y sigue montada hasta que queda menos del 15 %; depende de dónde están los huecos en pantalla, no de píxeles de scroll, y nunca se queda a medias.
- **La misma nube forma más figuras (solo desde 1024 px), en el hueco a la derecha del título:**
  - **Cifras:** gráfica de 6 barras en la vista isométrica del chip. Cambian de altura como datos en vivo, llevan una línea de tendencia con puntos de color y las cercanas al cursor suben como un ecualizador.
  - **Experiencia:** tres engranajes engranados que giran con sus relaciones reales; se aceleran con el scroll y con el cursor, y al arrastrar giran con inercia.
  - **Contacto:** esfera de puntos claros (370 px) en la mitad derecha de la banda. Gira despacio, el cursor levanta ondas, se puede girar y un clic la hace estallar.
  - Formación, Proyectos, Skills y Liderazgo no llevan figura.
- **Transiciones:** del chip a las barras la nube vuela directa (los dos huecos se ven a la vez); en el resto se deshace en bruma y se condensa en el siguiente hueco. Al subir, igual al revés.
- **Móvil y tablet (< 1024 px):** solo el chip, siempre montado mientras esté en pantalla, con la misma vida en reposo. La primera vez que entra en pantalla (con el 35 % a la vista) se forma solo desde la esfera, sin tocarlo. Tocarlo lanza la onda; no se arrastra, para no frenar el scroll.
- **Separación:** ninguna figura queda a menos de 39 px de un texto o un control a 1024, 1280, 1440 y 1920 px. Los huecos son decorativos (`aria-hidden`) y el lienzo no recibe clics.

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
- **Herramienta `focus_part` del agente:** eliminada, porque solo servía para la reductora. Ahora el chip reacciona solo cuando el agente responde.
- **Página `/lab`:** eliminada, junto con sus componentes. Era el laboratorio de motion del principio y no encajaba en la nueva dirección. Sigue en el historial de git.
- **Imagen para compartir (OG):** usa las fuentes del sitio (Plus Jakarta Sans e Inter). Están en `assets/og` en TrueType (licencia OFL), porque el generador no lee los WOFF2 de la página.

### Pulido estético (aprobadas el 05-11)
- **Fragmentos de proyecto:** en escritorio se dibujan en un lienzo del tamaño de la tarjeta (540 px) y se escalan con ella. En el móvil (< 768 px) se ve solo el fragmento principal de cada proyecto, legible (ver «Hero definitivo»).
- **Fondo de la ilustración:** solo el tinte del dominio sobre el gris de la tarjeta; antes era un panel blanco.
- **Erasmus en el móvil:** las fechas van en su propia línea bajo «Erasmus», para que no se partan.
- **Cifras:** la flecha que aparece al pasar el ratón sube junto al icono; así la fila que ocupaba abajo desaparece.
- **Qué sigue en gris:** fechas, lugares, el «· contexto» tras la empresa, las etiquetas bajo las cifras, «Especialidad:», pies de foto y notas.
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
- **Cuándo cambia de figura:** gana el hueco más visible (25 % para entrar, 15 % para mantenerse) y, si hay empate, el más centrado. El chip cede pronto al bajar: el gráfico de Cifras se forma en cuanto su hueco se ve entero. La franja de la navegación no cuenta como visible.
- **Las transiciones duran un tiempo fijo** (bruma 0,3 s, condensar 0,5 s, vuelo 0,6 s) en vez de seguir al scroll: así nunca se quedan a medias. Si el equipo va lento, el tiempo perdido se recupera por tramos (la figura tarda lo mismo con pocos fotogramas) y, si sigue lento en una pantalla de alta densidad, el lienzo baja a densidad 1.
- **Hueco de las barras más grande** (440 × 264 px; 400 × 250 entre 1024 y 1279) que el de los engranajes (380 × 240; 320 × 210), porque el título de Cifras es corto y deja más sitio.
- **Experiencia entre 1024 y 1279 px:** la frase de introducción pasa de dos líneas a tres para dejar sitio a los engranajes. El texto no cambia.
- **La esfera solo sale si no hay retrato en Contacto.** Cuando subas `public/photos/carlos`, el retrato ocupa ese hueco y habrá que decidir dónde va la esfera.
- **Con el cursor encima de la figura, la repulsión se suaviza:** los puntos se apartan menos, para que se vea cómo se abre.

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
  - Todo lo que hace un punto (cambiar de figura, apartarse del cursor, la onda del clic, abrirse, girar) se calcula en el vertex shader a partir de unos pocos valores; no hay simulación por partícula.
  - Las posiciones de los huecos se guardan y solo se vuelven a medir cuando cambia el tamaño de la página; por frame no se lee layout.
  - El bucle se para cuando no hay figura en pantalla o la pestaña está oculta. El lienzo usa como mucho DPR 2 y ~4 megapíxeles.
  - Las interacciones se capturan en zonas invisibles sobre cada hueco; el lienzo no recibe clics y queda bajo la navegación y los diálogos.
  - Barras, engranajes y esfera tienen también su póster SVG (movimiento reducido, sin JavaScript o sin WebGL).
- **Reveals:** pueden marcar un elemento antes de que React hidrate su sección (con el hero más corto, «Cifras» ya está en la primera pantalla). Cada `.reveal` lleva `suppressHydrationWarning`, así que React lo espera y no avisa.
- **Grafo de skills:** el nombre accesible de cada nodo es su `aria-label`, y tiene que contener el texto que se ve en el nodo (WCAG 2.5.3).
  - Las etiquetas de dos líneas llevan en el DOM el espacio que separa una línea de la otra. SVG no lo pinta, pero así el nodo se lee «piloto automático» y no «pilotoautomático».
  - El monograma «IF» se dibuja con `<use>`, como un logo: es una imagen del nodo, no parte de su texto (se leía «IF Induforum 2027»).
  - Los textos visibles siguen siendo `aria-hidden`, pero eso ya no basta: desde la versión 4.12, axe no lo tiene en cuenta en esta regla, y la 4.14 la pasa por defecto.
  - Comprobado en Chromium que no cambia nada a la vista: las capturas del grafo de antes y de después son idénticas píxel a píxel (en reposo y con cada nodo con foco y con el ratón encima; en claro y oscuro; en `/` y `/es`; a 1× y a 2×). El teclado y el árbol de accesibilidad (lo que recibe un lector de pantalla) tampoco cambian.
- **El tamaño de los logos** (`LogoMark`) se puede fijar desde CSS con `--logo`. El timeline lo usa para tener 32 px en el móvil.
- **Desarrollo local:** a veces `next dev` deja de recoger los cambios de `globals.css`. Se arregla parando el servidor y borrando `.next/dev`.

## 3. Resultados (build de producción, local)

| Lighthouse | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
| --- | --- | --- | --- | --- |
| Móvil, `/` (10-11, 1 pasada, rama de la nube de partículas) | 90 | 100 | 100 | 66* |
| Móvil, `/` (04-11, 6 pasadas, rama del pulido) | 86–92 (mediana 87,5) | 100 | 100 | 66* |
| Móvil, `/` (04-11, 6 pasadas, `main`, alternando con la rama) | 84–90 (mediana 87,5) | 100 | 100 | 66* |
| Escritorio, `/es` (04-11, rama y `main`, 2 pasadas cada una) | 100 | 100 | 100 | 66* |

\* El único fallo de SEO es «la página no es rastreable», que es el noindex intencionado. Pasará a 100 al lanzar.

- **El pulido no empeora el rendimiento:** con `main` medido en la misma sesión, la mediana de rendimiento es igual (87,5) y el LCP mejora (2,64 s frente a 2,89 s de mediana). El TBT sube 40 ms de mediana (386 frente a 346 ms), dentro de la variación de ambas versiones (253–427 y 287–423 ms). CLS 0 en las dos.
- **Sobre el móvil:** desde el 03-11 la máquina de pruebas es más lenta. La versión de la fase 2 da 86–87 en esta misma máquina (en la anterior daba 92–94), así que la fase 3 no empeora el rendimiento.
- **Nube de partículas (10-11, una pasada):** LCP 2,8 s, TBT 290 ms, CLS 0.
- **Carga e interacción del chip (10-11, build local, Chromium):** la escena sustituye al póster 0,3–0,4 s después del load en escritorio (dos pasadas: 298 y 372 ms) y 0,3 s en el móvil (255 y 329 ms; antes 4,2 s), sin tocar la pantalla. Bajando con la rueda sin parar, el gráfico de Cifras queda formado 0,7 s después de verse entero su hueco (antes 1,2 s) y los engranajes 0,5 s después de verse el 25 % del suyo (antes 0,8 s). En local no hay red: en producción hay que sumar la descarga de three.js. No he vuelto a pasar Lighthouse: en el móvil three.js se carga ahora dentro de la ventana que mide, así que el rendimiento móvil puede bajar.
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

**Propuestas de diseño:** no queda ninguna abierta. El patrón de secciones se queda como está (Contacto ya lo rompe con su banda oscura).

**Lanzamiento:** cuando digas «lanzamiento», poner `LAUNCHED = true` en `lib/site.ts`.
