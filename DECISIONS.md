# Decisiones

Lo aprobado, lo que he decidido yo al construir (para que lo revises) y lo que falta. Última actualización: 29-10-2026 (cambio de rumbo: «al grano y con color»).

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

### Cursor
- **Nunca desaparece.** El punto propio está siempre por encima de todo (z-index máximo): sobre el canvas 3D, durante el scroll, dentro del resaltado y en el panel del agente.
- **Cursor nativo** donde el propio no sirve: antes de hidratar, fuera de la ventana, en campos de texto, en iframes (Cal.com) y con un diálogo modal abierto.
- **Regla:** `cursor: none` solo se aplica mientras el punto propio está pintado. Verificado con Playwright en los 8 casos.

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
- **Badge de PropHero: hoy dice «Empieza el 3 nov».** Pediste «Actual» con pulso, pero hoy, 29 de octubre, todavía no has empezado. La página se regenera cada día y el 3 de noviembre pasa sola a «Actual» con pulso.
- **«4º curso» se calcula** desde septiembre de 2023, así que cambia cada septiembre y desaparece al terminar el grado.
- **Bullets de cada puesto,** redactados solo con lo que ya había en `profile.ts`, sin cifras:
  - Grupo Lalala e Induforum tienen 3, no 4: no había material para un cuarto sin inventar.
  - Classy Night Society no tiene bullets; queda pendiente como `TODO:`.
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
- **Fotos:** las tarjetas de experiencia no llevan foto (no estaba en la especificación), así que `events-1` queda reservada sin usarse.
- **Menú y ⌘K:** se cierran antes de ejecutar la acción. Con el scroll bloqueado, la navegación no funcionaba; ya corregido.

## 3. Resultados (build de producción, `next start` local)

| Lighthouse (home) | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
| --- | --- | --- | --- | --- |
| Móvil (4 pasadas) | 94–97 | 100 | 100 | 66* |
| Escritorio | 100 | 100 | 100 | 66* |

\* El único fallo de SEO es «la página no es rastreable»: es el noindex intencionado y debería pasar a 100 al lanzar. En un navegador real con la CPU 4× más lenta, el LCP coincide con el FCP (unos 270 ms).

## 4. Pendiente

**Datos:** lista completa en la respuesta del chat y con `npm run todos`.

**Archivos**
- `public/logos/`: `prophero`, `grupo-lalala`, `induforum`, `classy-night-society`, `upm`, `retamar`, `cs50`. También fijan el color de cada tarjeta.
- `public/photos/`: `carlos`, `dana`, `mentor`, `volunteering-1`, `volunteering-2`, `n8n-flow`.
- `content/demos/job-hunt-copilot.txt`: hasta que exista, la tarjeta dice «Ver detalles» y no muestra demo.

**Variables de entorno en Vercel**
- `ANTHROPIC_API_KEY`.
- `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` (o las `KV_*`).
- `NEXT_PUBLIC_CALCOM_LINK`.
- `NEXT_PUBLIC_SITE_URL`.

**Lanzamiento:** cuando digas «lanzamiento», poner `LAUNCHED = true` en `lib/site.ts`.
