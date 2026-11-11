# Decisiones

Lo aprobado, lo que he decidido yo al construir (para que lo revises) y lo que falta. Última actualización: 11-11-2026. Incluye las tres fases (contenido y CV, dirección visual Apple × Evolve, piezas visuales), el pulido estético (rama `claude/design-polish`), el hero definitivo con el chip de partículas (rama `claude/hero-asymmetric`), la nube de partículas con presencia y figuras (rama `claude/particle-figures`), la carga, la interacción y la pausa del chip (rama `claude/chip-interaction`) y la ronda del 11-11 (rama `claude/nice-keller-emmje9`): partículas una a una, «Cómo trabajo», carruseles, vídeos de proyecto, Skills compacto y reserva con Google Calendar.

Lo que esa última ronda cambia está en «Ronda del 11-11», al final de la sección 1; los apartados anteriores se han corregido donde ya no eran verdad.

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
  2. Cómo trabajo: 3 pasos (desde el 11-11; antes, «Cifras»).
  3. Ahora mismo.
  4. Experiencia y Formación como timeline con logos, con la línea dibujándose al hacer scroll.
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
- **Fragmentos de interfaz flotantes** (HTML/CSS) en cada proyecto, con flotación lenta y parallax al hover:
  - Shortlist: oferta con barra de puntuación, lista ordenada y mini terminal con cifras reales (6.400+, 29, 116).
  - Correo en piloto automático: «Resumen de hoy» y nodos Gmail → Claude.
  - Agente de refrigeración: gráfica de generaciones con la etiqueta «Ilustrativo».
  - Proyectos de IA (CS50): clasificación de una señal y tablero de Nim.
- **Monte Carlo 2027 → 2028:** retirado el 11-11 (la fila final de Formación). El Erasmus sigue como línea de la tarjeta de la ETSII.
- **Grafo de skills** (compactado el 11-11; ver «Ronda del 11-11»):
  - Nodos blancos con el logo real de la herramienta y anillo de su dominio, agrupados por dominio.
  - Proyectos, trabajos y estudios como nodos mayores en el centro, con sus logos.
  - Líneas «usado en» siempre visibles, muy tenues, que se colorean al hover.
  - Recorrido automático cada 3,2 s, que se detiene al interactuar; además, cada nodo flota.
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
- **Proyectos en el móvil (< 768 px):** cada proyecto muestra solo su fragmento principal, a 1,3×, con el texto entre 11,1 y 12,4 px; los demás se ocultan. En escritorio, igual que antes.
  - Fragmentos principales: el terminal de Shortlist (cifras reales), el «Resumen de hoy» del correo, la gráfica de generaciones con su etiqueta «Ilustrativo» y la clasificación de señales de CS50.

### Nube de partículas: chip con presencia y figuras (rama `claude/particle-figures`; pendiente de tu OK)
- **Chip más grande y con más tinta:**
  - En escritorio ocupa un cuadrado de 512 px a 1440 × 900 y de 496 px a 1280 × 800 (antes 374 y 366); el dibujo mide 486 × 480 y 470 × 465 px. Sigue centrado con la columna de texto y el hero cabe en la primera pantalla.
  - Puntos opacos y con jerarquía de tamaños, como en evolve.es: grano fino en las caras, aristas nítidas y puntos grandes en esquinas, núcleos y bolas (una por bola).
  - Núcleos y paquetes de datos más grandes; siguen siendo el único color.
- **Cursor y vida en reposo:** rehechos el 11-11 (partículas una a una, figura rígida): ver «Ronda del 11-11».
- **Scroll:** la figura empieza a formarse cuando se ve el 25 % de su hueco, sin esperar a que pare el scroll, y sigue montada hasta que queda menos del 15 %; depende de dónde están los huecos en pantalla, no de píxeles de scroll, y nunca se queda a medias.
- **La misma nube forma más figuras (solo desde 1024 px), en el hueco a la derecha del título:**
  - **Cómo trabajo:** embudo, flujo o barras, según el paso activo.
  - **Experiencia:** tres engranajes engranados que giran con sus relaciones reales; se aceleran con el scroll y con el cursor, y al arrastrar giran con inercia.
  - **Formación:** un libro abierto cuyas hojas pasan solas.
  - **Contacto:** esfera de puntos claros (370 px) en la mitad derecha de la banda. Gira despacio, se puede girar y un clic la dispersa.
  - Proyectos, Skills y Voluntariado no llevan figura.
- **Transiciones:** del chip a la figura de «Cómo trabajo» la nube vuela directa (los dos huecos se ven a la vez), y también entre embudo, flujo y barras; en el resto se deshace en bruma y se condensa en el siguiente hueco. Al subir, igual al revés.
- **Móvil y tablet (< 1024 px):** solo el chip, siempre montado mientras esté en pantalla, con la misma vida en reposo. La primera vez que entra en pantalla (con el 35 % a la vista) se forma solo desde la esfera, sin tocarlo. Tocarlo lanza la onda; no se arrastra, para no frenar el scroll.
- **Separación:** ninguna figura queda a menos de 39 px de un texto o un control a 1024, 1280, 1440 y 1920 px. Los huecos son decorativos (`aria-hidden`) y el lienzo no recibe clics.

### Ronda del 11-11 (rama `claude/nice-keller-emmje9`, fusionada en `main`)

**1. Partículas una a una (todas las figuras)**
- **La figura es rígida.** Gira entera (vaivén del chip, giro de la esfera, arrastre), pero nada en ella se estira ni se balancea: fuera las capas que flotaban, las ondas y el latido de la esfera, y las barras que subían bajo el cursor como un ecualizador.
- **Cada punto reacciona al cursor por separado:** se aparta (radio ~140 px) y vuelve con amortiguación crítica, a su propio ritmo, sin rebote ni oscilación. El shader recibe por dónde ha pasado el cursor en los últimos 0,7 s y cada punto lo pondera con la respuesta de un muelle críticamente amortiguado; como todos los pesos son positivos, no puede pasarse de largo.
- **Deriva por partícula:** cada punto se mueve ~1,5–2,5 px alrededor de su sitio, con fases y ritmo propios.
- **Lo que hace la figura entera, sin rebote:** al soltar un arrastre vuelve a su sitio con amortiguación crítica (antes oscilaba); las barras cambian de altura igual. La inclinación hacia el cursor queda en un gesto leve (unos 14° a los lados y 10° en vertical; antes ~34°).
- **Se mantiene:** el clic lanza una onda que dispersa los puntos y se recompone en ~1 s; al pasar por encima, el chip separa sus capas y enciende los núcleos; engranajes, hojas del libro y flujo se aceleran bajo el cursor.

**2. «Cómo trabajo» en lugar de «Cifras»**
- Fuera la sección de las 4 tarjetas. Las cifras siguen en las tarjetas de experiencia, proyectos y voluntariado.
- Tres pasos en fila (columna en el móvil), con los textos que diste: **Detecto** (tareas manuales e ineficiencias en operaciones), **Automatizo** (con código, low-code e IA) y **Mido** (tiempo ahorrado, errores y volumen procesado). Sin cifras.
- **La figura cambia con el paso activo:** embudo con un enjambre de puntos sueltos encima y una fila ordenada saliendo por abajo → flujo de cuatro nodos unidos por cables por los que avanzan puntos equidistantes → barras con su línea de tendencia.
- **Paso activo:** el que está bajo el ratón. Sin ratón encima, lo decide el scroll: en columna, el más centrado; en fila (escritorio), el primero al entrar la fila y el segundo y el tercero según sube.

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
- **Vídeo en bucle arriba de cada tarjeta** (mudo, autoplay, playsInline, con póster): 7 s, grabado con Playwright de los fragmentos animados de la propia tarjeta, en webm y mp4, uno por idioma y por tema (16 vídeos y 16 pósters en `public/media/projects/<id>/`).
- job-hunt-copilot se llama **Shortlist** en la web y para el agente; el `id` interno, la carpeta y el enlace al repositorio no cambian. La imagen OG no nombra proyectos.

**6. Skills**
- 12 skills (antes 22): las de peso 3 y 2.
- Grafo e inspector juntos ocupan 501 px a 1440 × 900 (el 56 % del alto); en pantallas más bajas el grafo se encoge para no pasar del 60 %.
- Cada skill lleva el logo real de su herramienta en su color (simple-icons) o un glifo propio; empresas y centros, sus logos de `public/logos`.
- Los nodos flotan despacio, cada uno a su ritmo, además del recorrido automático.

**7. Reunión**
- Botón «Reservar 15 min» / «Book 15 min» que abre `NEXT_PUBLIC_BOOKING_URL` en una pestaña nueva: en Contacto, en ⌘K (y el menú del móvil) y como `open_booking` del agente.
- Cal.com fuera: ni la ventana incrustada ni su dependencia.
- Sin la variable, no hay botón, ni entrada en ⌘K, ni herramienta para el agente.

**8. Contacto:** el retrato se lee de `public/photos/carlos.(jpg|webp|png)`. Mientras no exista, sigue la esfera.

**9. Separación del chip:** al pasar el ratón, arrastrar o hacer clic, ningún punto del chip queda a menos de 24 px del nombre ni de la línea de disponibilidad. Medido en «Resultados».

## 2. Decidido por mí (revisar)

### Ronda del 11-11 (revisar)
- **«No toques el agente»:** no he tocado su interfaz, su ruta ni sus reglas. Sí lo que lee, porque sale de los mismos datos que la web y lo pedías en tres puntos: ya no conoce la especialidad, llama Shortlist al proyecto, la sección es `volunteering` y el Programa Mentor le llega como línea de la ETSII (lo puede resaltar igual). `open_booking` ya existía; ahora abre la pestaña.
- **Skills que salen:** TensorFlow/Keras, pandas/NumPy, scikit-learn, SQL, MATLAB, TypeScript, Git, pytest, C y Negociación con patrocinadores. TensorFlow, scikit-learn, pytest y Git siguen como etiquetas en sus proyectos; **SQL, MATLAB, C, TypeScript y pandas ya no aparecen en la web ni las conoce el agente.** Si alguna debe volver, se añade en `stack` de `content/profile.ts`.
- **«Off the clock»** (batería, DJ, golf, vela) sigue al final de Voluntariado, aunque no es voluntariado. Dime si lo muevo o lo quito.
- **«Ahora mismo»:** donde iba la especialidad ahora pone «ETSII · Universidad Politécnica de Madrid», para no dejar el hueco.
- **Fondos de sección:** cuenta lo que está directamente en la carpeta de la sección, no en las de las tarjetas, para que elijas tú qué se ve (en Voluntariado, vídeos sin caras). Si hay vídeo, las fotos se ignoran; varios vídeos se reproducen uno detrás de otro.
- **Vídeos de proyecto:**
  - Como los fragmentos apenas se movían, el clip añade el paralaje del puntero dando una vuelta a la tarjeta; el bucle no tiene costura.
  - Pesan 3,0 MB en total entre los 16 (832 × 522 px, 24 fps; cada uno, entre 50 y 140 KB). Solo se descarga el del idioma y el tema que se ven, y solo cuando la tarjeta se acerca a la pantalla.
  - En el móvil se ve el mismo clip, así que el texto de los fragmentos queda pequeño (antes ahí se veía un solo fragmento ampliado). Si lo prefieres, grabo una versión para móvil.
  - Con las animaciones en pausa, sin JavaScript o hasta que carga, se ve el póster.
  - Para poner un vídeo real de un proyecto: `loop.mp4` en su carpeta (ver `public/media/README.md`). Para regrabar los actuales: `node scripts/record-project-loops.mjs`.
- **Reserva desde el agente:** un navegador solo deja abrir una pestaña justo después de un clic o una tecla, y la respuesta del agente puede llegar más tarde. Si la bloquea, la página baja a Contacto y resalta el botón.
- **Paso activo de «Cómo trabajo» en el móvil:** se resalta el paso más centrado, pero no hay figura (las figuras siguen siendo solo de escritorio, salvo el chip).
- **Límite del chip:** no es un tope fijo de ángulo. En cada fotograma el chip toma toda la inclinación y la apertura que caben sin acercarse a menos de 35 px de los textos; los puntos que empuja el cursor se comprimen en los 5 px siguientes y ninguno cruza los 30 px (24 más el radio del punto más grande). La apertura al pasar el ratón baja además de 0,20 a 0,16.
- **Tarjetas de la fila de proyectos:** 520 px de ancho en escritorio (se ven dos y el borde de la tercera), 460 px en tablet y el 86 % del ancho en el móvil; todas con la misma altura.

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
- **Fragmentos de proyecto:** en escritorio se dibujan en un lienzo del tamaño de la tarjeta (540 px) y se escalan con ella. En el móvil (< 768 px) se ve solo el fragmento principal de cada proyecto, legible (ver «Hero definitivo»).
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
- **Cuándo cambia de figura:** gana el hueco más visible (25 % para entrar, 15 % para mantenerse) y, si hay empate, el más centrado. El chip cede pronto al bajar: la figura de «Cómo trabajo» se forma en cuanto su hueco se ve entero. La franja de la navegación no cuenta como visible.
- **Las transiciones duran un tiempo fijo** (bruma 0,3 s, condensar 0,5 s, vuelo 0,6 s) en vez de seguir al scroll: así nunca se quedan a medias. Si el equipo va lento, el tiempo perdido se recupera por tramos (la figura tarda lo mismo con pocos fotogramas) y, si sigue lento en una pantalla de alta densidad, el lienzo baja a densidad 1.
- **Hueco de «Cómo trabajo» más grande** (440 × 264 px; 400 × 250 entre 1024 y 1279) que el de los engranajes y el libro (380 × 240; 320 × 210), porque su título es corto y deja más sitio.
- **Experiencia entre 1024 y 1279 px:** la frase de introducción pasa de dos líneas a tres para dejar sitio a los engranajes. El texto no cambia.
- **La esfera solo sale si no hay retrato en Contacto.** Cuando subas `public/photos/carlos`, el retrato ocupa ese hueco y habrá que decidir dónde va la esfera.
- **Con el cursor encima de la figura, la repulsión se suaviza:** los puntos se apartan menos, para que se vea cómo se abre.
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
  - Todo lo que hace un punto (cambiar de figura, derivar, apartarse del cursor y volver, la onda del clic, abrirse, girar) se calcula en el vertex shader a partir de unos pocos valores, entre ellos el recorrido reciente del cursor (12 muestras); no hay simulación por partícula.
  - Un hueco puede turnarse entre varias figuras (`data-figure-set`); `data-figure` dice cuál toca y la nube vuela de una a otra.
  - Las posiciones de los huecos se guardan y solo se vuelven a medir cuando cambia el tamaño de la página; por frame no se lee layout.
  - El bucle se para cuando no hay figura en pantalla o la pestaña está oculta. El lienzo usa como mucho DPR 2 y ~4 megapíxeles.
  - Las interacciones se capturan en zonas invisibles sobre cada hueco; el lienzo no recibe clics y queda bajo la navegación y los diálogos.
  - Embudo, flujo, barras, engranajes, libro y esfera tienen también su póster SVG (movimiento reducido, sin JavaScript o sin WebGL).
- **Filas con desplazamiento horizontal** (`components/ui/Carousel.tsx`): scroll nativo con scroll-snap. Un gesto horizontal sobre la fila no lo intercepta el scroll suave de la página. Si el agente, ⌘K o un enlace señalan una tarjeta que no se ve, la fila la trae.
- **Vídeos de proyecto y fondos de sección:** el servidor mira las carpetas al construir; el navegador no monta ningún `<video>` hasta que su tarjeta o su sección se acercan a la pantalla, y solo reproduce mientras se ven.
- **Reveals:** pueden marcar un elemento antes de que React hidrate su sección (con el hero más corto, la sección siguiente ya está en la primera pantalla). Cada `.reveal` lleva `suppressHydrationWarning`, así que React lo espera y no avisa.
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
- **Carga e interacción del chip (10-11, build local, Chromium):** la escena sustituye al póster 0,3–0,4 s después del load en escritorio (dos pasadas: 298 y 372 ms) y 0,3 s en el móvil (255 y 329 ms; antes 4,2 s), sin tocar la pantalla. Bajando con la rueda sin parar, el gráfico de Cifras (la sección de entonces; hoy ahí está «Cómo trabajo») queda formado 0,7 s después de verse entero su hueco (antes 1,2 s) y los engranajes 0,5 s después de verse el 25 % del suyo (antes 0,8 s). En local no hay red: en producción hay que sumar la descarga de three.js. No he vuelto a pasar Lighthouse: en el móvil three.js se carga ahora dentro de la ventana que mide, así que el rendimiento móvil puede bajar.
- **Ronda del 11-11 (build local de producción, Chromium):**
  - `npm run lint` y `npm run build`, sin errores. `/` y `/es` cargan sin errores de consola ni peticiones fallidas, recorriendo todas las secciones.
  - **Separación del chip** (1440 × 900; distancia del punto más cercano al nombre o a la línea de disponibilidad, medida sobre la imagen): sin cursor, 49 px; con el ratón encima, 29–36 px; arrastrando, 31–44 px; justo tras un clic junto al borde superior, 26 px; barriendo ese borde con el ratón, 28–30 px. Mínimo medido: 26 px (antes rozaba la línea).
  - **Skills:** grafo de 1136 × 385 px; con el inspector, 501 px (56 % de 900).
  - **Proyectos:** los cuatro vídeos se reproducen mudos y en bucle, con póster, y cambian con el tema; la flecha avanza una tarjeta (540 px) y encaja; `open_project` trae la tarjeta y abre el panel. En 390 × 844 la fila encaja al deslizar y la página no se desborda a lo ancho.
  - **Fondos y reserva:** probados con un vídeo temporal en cada carpeta (opacidad 0,1, en gris, reproduciéndose solo en pantalla) y con una URL de prueba (botón en Contacto, entrada en ⌘K, `open_booking` abre la pestaña y, si el navegador la bloquea, resalta el botón). Retirados después: en `main` no hay fondos ni botón hasta que subas los archivos y pongas la variable.
  - **Sin repetir en esta ronda** (presupuesto de comprobaciones): Lighthouse y axe. Las capturas de verificación han sido 8. Conviene pasar axe y Lighthouse antes del lanzamiento: hay secciones nuevas y vídeo en las tarjetas.
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
- **Vídeos reales de los proyectos:** `loop.mp4` en la carpeta de cada uno sustituye al grabado de la ilustración (ver `public/media/README.md`).

**Avisos**
- **Tu CV en PDF incluye tu teléfono.** Al servirlo, queda público en la web, y antes acordamos no publicar el teléfono. Si no lo quieres publicar, sube una versión sin él con el mismo nombre.
- **La rama por defecto del repo en GitHub es `claude/affectionate-euler-bieu8r`, no `main`.** Por eso tus subidas desde la web de GitHub fueron a esa rama. Si Vercel despliega `main`, conviene poner `main` como rama por defecto: Settings → General → Default branch. Así lo que subas irá directo a producción.

**Variables de entorno en Vercel**
- `ANTHROPIC_API_KEY`.
- `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` (o las `KV_*`).
- `NEXT_PUBLIC_BOOKING_URL`: la URL pública de tu página de citas de Google Calendar (`https://…`). Sustituye a `NEXT_PUBLIC_CALCOM_LINK`, que ya no se usa y se puede borrar. Sin ella no hay botón de reserva.
- `NEXT_PUBLIC_SITE_URL`.

**Propuestas de diseño:** no queda ninguna abierta. El patrón de secciones se queda como está (Contacto ya lo rompe con su banda oscura).

**Lanzamiento:** cuando digas «lanzamiento», poner `LAUNCHED = true` en `lib/site.ts`.
