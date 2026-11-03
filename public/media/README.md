# Fotos y vídeos

Para añadir contenido basta con subir archivos a estas carpetas. En el siguiente despliegue la web los detecta y muestra una tira de miniaturas en la tarjeta correspondiente. Si una carpeta está vacía, la tarjeta se queda como está.

Los logos no van aquí, sino en [`public/logos/`](../logos/README.md).

## Carpetas

Cada carpeta corresponde a una tarjeta:

| Carpeta | Tarjeta |
| --- | --- |
| `experience/prophero/` | PropHero |
| `experience/grupo-lalala/` | Grupo Lalala |
| `experience/induforum/` | Induforum 2027 |
| `experience/classy-night-society/` | Classy Night Society |
| `education/etsii/` | ETSII-UPM |
| `education/retamar/` | Colegio Retamar |
| `education/cs50/` | CS50 |
| `projects/job-hunt-copilot/` | job-hunt-copilot |
| `projects/mail-autopilot/` | Correo en piloto automático |
| `projects/cooling-agent/` | Agente de IA para refrigeración de centros de datos |
| `leadership/dana/` | DANA de Valencia |
| `leadership/mentor/` | Programa Mentor ETSII |
| `leadership/food-bank/` | Banco de Alimentos |
| `leadership/charity-events/` | Eventos benéficos |
| `leadership/orphanage/` | Orfanato en Sudáfrica |

El nombre de cada carpeta es el `id` de la entrada en `content/profile.ts`. Si añades un puesto, proyecto o actividad nueva, crea su carpeta con ese mismo `id`.

## Nombres de archivo

- **Orden:** por nombre de archivo, así que numéralos: `01-equipo.jpg`, `02-oficina.jpg`, `03-demo.mp4`… El primero es la primera miniatura.
- **Fotos:** `.jpg`, `.png`, `.webp` o `.avif`.
- **Vídeos:** `.mp4` o `.webm`. La miniatura se reproduce en silencio y en bucle al pasar el ratón (en el móvil, al aparecer en pantalla). En el visor se ve con sonido y controles.
- **Portada de un vídeo (opcional):** una imagen con el mismo nombre que el vídeo terminada en `.poster.jpg`. Por ejemplo, `03-demo.mp4` lleva `03-demo.poster.jpg`. Sin portada, la miniatura muestra un fondo de color con el icono ▶ hasta que se reproduce.
- **Sin espacios ni tildes** en los nombres. Mejor `02-dia-final.jpg` que `02 Día final.JPG`.

## Pies de foto (opcional)

Se añaden en `content/profile.ts`, dentro de `media`, por nombre de archivo y en los dos idiomas:

```ts
media: {
  "experience/prophero": {
    captions: {
      "01-equipo.jpg": { en: "The Operations team", es: "El equipo de Operaciones" },
    },
  },
},
```

Una foto sin pie se abre igual, sin texto debajo.

## Cómo subir archivos desde la web de GitHub

1. Abre el repositorio en github.com y entra en `public/media/` y luego en la carpeta de la tarjeta (por ejemplo `experience/prophero`).
2. Pulsa **Add file → Upload files**.
3. Arrastra los archivos. La web de GitHub admite hasta 25 MB por archivo.
4. Abajo, en **Commit changes**, deja marcada la opción de hacer commit directamente en `main` y pulsa **Commit changes**.
5. Vercel vuelve a desplegar solo. En uno o dos minutos las miniaturas aparecen en la web.

Para crear una carpeta nueva, pulsa **Add file → Create new file**, escribe la ruta con una barra al final del nombre de la carpeta (por ejemplo `leadership/nueva-actividad/.gitkeep`) y haz commit. Después sube los archivos dentro.

Para borrar o renombrar un archivo, ábrelo en GitHub y usa el menú **⋯** (borrar) o el lápiz (renombrar).

## Formatos recomendados

| Tipo | Recomendación |
| --- | --- |
| Fotos | JPG de unos 2000 px en el lado largo y calidad del 80–85 %, es decir, entre 300 KB y 1 MB. La web genera sola versiones AVIF y WebP más ligeras. |
| Vídeos | MP4 en H.264, 1080p, de 30 segundos como máximo y unos 10 MB como mucho. Si el sonido no aporta, quítalo. |
| Portadas de vídeo | JPG del mismo tamaño que el vídeo. |

**Antes de subir una foto del móvil, quítale la ubicación.** Las fotos guardan las coordenadas GPS en sus metadatos. La web sirve versiones optimizadas sin metadatos, pero el archivo original también es público en su URL. En el iPhone: al compartir la foto, toca **Opciones** y desactiva **Ubicación**. En Android: en la cámara, desactiva **Guardar ubicación**.

## Si un vídeo pesa más

1. **Comprímelo.** Con [HandBrake](https://handbrake.fr), que es gratis, usa el preset **Fast 1080p30**, ajusta la calidad a RF 26–28 y quita la pista de audio si no hace falta. Con ffmpeg:

   ```bash
   ffmpeg -i original.mov -vf "scale=-2:1080" -c:v libx264 -crf 26 -preset slow -an -movflags +faststart 03-demo.mp4
   ```

   Y para sacar la portada:

   ```bash
   ffmpeg -i 03-demo.mp4 -frames:v 1 -q:v 3 03-demo.poster.jpg
   ```

2. **Si sigue pesando más de unos 10 MB o dura más de 30 segundos, súbelo fuera del repositorio** y enlázalo en `content/profile.ts`, dentro de `media`, en `external`. Aparece después de los archivos de la carpeta y se abre en el mismo visor.

   - **YouTube** (como vídeo oculto): el id es lo que va después de `v=` en la URL.

     ```ts
     "projects/job-hunt-copilot": {
       external: [{ kind: "youtube", id: "dQw4w9WgXcQ", caption: { en: "Full demo", es: "Demo completa" } }],
     },
     ```

   - **Vimeo** (oculto): en un enlace como `vimeo.com/123456789/abcdef1234`, el id es `123456789` y el `hash` es `abcdef1234`. Vimeo no da la portada sin su API, así que puedes añadir una tuya (`poster`).

     ```ts
     external: [{ kind: "vimeo", id: "123456789", hash: "abcdef1234" }],
     ```

   - **Vercel Blob**: en Vercel, abre **Storage → Blob**, crea un almacén si no hay ninguno, sube el vídeo y copia su URL.

     ```ts
     external: [{ kind: "video", src: "https://xxxx.public.blob.vercel-storage.com/demo.mp4", poster: "https://xxxx.public.blob.vercel-storage.com/demo.jpg" }],
     ```

   Los vídeos de YouTube y Vimeo se reproducen en el visor con su propio reproductor, el de YouTube sin cookies (`youtube-nocookie.com`). Las miniaturas de estos vídeos no se reproducen al pasar el ratón.
