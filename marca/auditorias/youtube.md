# YouTube: que los Shorts salgan solos

Revisado el 25/11/2026 en las páginas oficiales de Google (enlaces al final).

## Lo importante: ya no hace falta la auditoría

- **Desde el 2 de noviembre de 2026, Google ya no deja privados los videos que sube un proyecto sin auditar.** Lo dice el historial de cambios de la YouTube Data API: el cambio «revierte la política anunciada el 28 de julio de 2020». Hoy los videos salen **públicos** aunque el proyecto «enseriotv» nunca haya pasado la auditoría.
- La cuota normal alcanza de sobra: **100 subidas al día** (en un cupo aparte, «Video Uploads»). Nosotros subimos 3.
- La auditoría («YouTube API Services Audit and Quota Extension») ahora **solo sirve para pedir más cuota**. No la necesitamos. Igual dejo abajo las respuestas listas, por si algún día hace falta.

## ¿Y la verificación de la app en Google?

Tampoco hace falta, porque el único usuario es JIS:

- Google no obliga a verificar una app que usan **menos de 100 personas**. La diferencia: al conectar, Google muestra una vez la pantalla **«Google no verificó esta app»**. Se toca **Configuración avanzada → Ir a Panel enserio (no seguro)** y listo. Pasa una sola vez.
- **Ojo con un detalle:** la app tiene que quedar **«En producción»**, no «En prueba». En «En prueba», Google anula la conexión **a los 7 días** y habría que volver a conectar cada semana.
- El permiso que se pide es uno solo: `youtube.upload` (subir videos). Ese permiso es «sensible», no «restringido»: no lleva evaluación de seguridad.

**Si algún día se quisiera verificar la app** (para quitar ese aviso o para que la usen otras personas), Google pide que la portada y la política de privacidad estén en un **dominio verificado** en Search Console. Las páginas de Google **no dicen** si una dirección `*.vercel.app` sirve como dominio autorizado. La salida más barata y segura sería un dominio propio (desde unos 10 USD al año) agregado al mismo proyecto de Vercel. Ahora no hace falta.

## Lo que ya quedó hecho en el panel (todo apagado)

- **Cuentas → YouTube → «Conectar YouTube para subir»**: conexión con el permiso `youtube.upload`. Se ve solo cuando las dos variables de Google están puestas en Vercel.
- **«Desconectar»**: anula la conexión en Google al momento. Lo pide la política de YouTube.
- **Subida sola** (subida reanudable de `videos.insert`, por trozos desde el almacén):
  - El título es la primera línea del texto (máximo 100 caracteres) y la descripción es el texto completo.
  - Va **público** por defecto. En la cola de /programar se puede cambiar a «No listado» o «Privado». Ese selector aparece solo con la subida sola prendida.
  - Va marcado como «no es para niños». No se marca como «contenido sintético», porque son títeres de papel y no imitan a nadie de forma realista.
  - El interruptor es **`YT_SUBIR_SOLO=1`** en Vercel. Hoy está **apagado**, así que a la hora sigue apareciendo la tarjeta «Subir» como siempre. Con el interruptor prendido pero sin la cuenta conectada, también sigue la tarjeta.
  - Si la subida falla, la función queda «con error» y se puede reintentar desde la cola.
- **Privacidad y términos** actualizados con lo que pide YouTube:
  - Enlaces a las Condiciones de YouTube y a la Política de Privacidad de Google.
  - El enlace para quitar el acceso desde Google.
  - Que el panel usa YouTube API Services.

## Lo que tiene que hacer JIS, en orden

1. **Google Cloud** (console.cloud.google.com), con la cuenta dueña del canal y el proyecto **«enseriotv»** elegido arriba:
   1. **Google Auth Platform → Branding (Marca):**
      - Nombre de la app: `Panel enserio`. No puede llevar la palabra «YouTube».
      - Correo de asistencia: el tuyo.
      - Página principal: `https://funciones-panel.vercel.app`
      - Política de privacidad: `https://funciones-panel.vercel.app/privacidad`
      - Términos: `https://funciones-panel.vercel.app/terminos`
      - Guardar.
   2. **Audience (Público):**
      - Tipo de usuario: **Externo**.
      - Toca **«Publicar app» → «En producción»**. Importante: si queda en prueba, se desconecta a los 7 días.
   3. **Data Access (Acceso a datos) → Agregar permisos:**
      - Busca y marca `.../auth/youtube.upload`.
      - Guardar. Si Google pide «enviar a verificación», no hace falta: cierra.
   4. **Clients (Clientes) → Crear cliente:**
      - Tipo: **Aplicación web**. Nombre: `Panel`.
      - En **URI de redireccionamiento autorizados** pega exactamente: `https://funciones-panel.vercel.app/api/conectar/youtube/vuelta`
      - Crear. Copia el **ID de cliente** y el **Secreto del cliente**.
2. **Vercel** (proyecto **funciones-panel** → Settings → Environment Variables → Production):
   - `YT_CLIENT_ID` = el ID de cliente.
   - `YT_CLIENT_SECRET` = el secreto. Es una llave: va **solo** en Vercel. No me la pases por chat.
   - Avísame y yo vuelvo a publicar el panel.
3. **En el panel → Cuentas → YouTube → «Conectar YouTube para subir»**:
   - Elige el canal **¿En serio? (@es_enseriotv)**. Si te pregunta entre tu cuenta personal y el canal, elige el canal.
   - En «Google no verificó esta app»: **Configuración avanzada → Ir a Panel enserio (no seguro)**.
   - **Deja marcada** la casilla «Administrar tus videos de YouTube».
   - Al volver, la tarjeta de YouTube dice «Conectado».
4. Dime **«prende YouTube solo»**. Yo pongo `YT_SUBIR_SOLO=1`, vuelvo a publicar y reviso que el siguiente video salga bien. Desde ahí, la tarjeta «Subir» deja de aparecer.

---

## Por si algún día hace falta: formulario de auditoría y cuota

Formulario: https://support.google.com/youtube/contact/yt_api_form. Va en inglés, que es lo que leen los revisores. Hoy **no hay que enviarlo**.

**Section 1 · Request type:** Compliance audit for an increased quota.

**Section 2 · Organization**
- Legal name: `self` (individual creator)
- Primary website: `https://funciones-panel.vercel.app`
- Address: Quito, Ecuador (JIS completa la dirección)
- Category: Media & Entertainment · Organization size: 1

**Section 3 · Business model**
- Describe your work with YouTube (≥100 characters):
  > es_enserio.tv is an independent Spanish-language channel that tells true, surprising stories (history, science, crime, inventions, Latin America) with paper-puppet animation. I produce up to three YouTube Shorts per day and use a private web panel to schedule each Short and upload it to my own channel at its scheduled time, and to read my channel's public statistics.
- Target audience: Internal Users (the channel owner only)
- Monetization: none in the tool; the channel may earn through the YouTube Partner Program.

**Section 4 · API client**
- Name: `Panel enserio`
- Privacy policy: `https://funciones-panel.vercel.app/privacidad`
- Terms of service: `https://funciones-panel.vercel.app/terminos`
- Primary access URL: `https://funciones-panel.vercel.app`
- Publicly accessible? No. It is a private, password-protected panel used only by the channel owner. Instead of a demo account, there is an end-to-end screencast (see below).

**Section 5 · Project**
- Project number: the one shown on the «enseriotv» Dashboard in Cloud Console.
- Use cases: Internal Company Tool; Video Uploading & Account Management.
- OAuth: Yes, `https://www.googleapis.com/auth/youtube.upload` only.
- Expected volume: about 3 `videos.insert` calls per day, plus about 8 `channels.list` / `playlistItems.list` / `videos.list` calls per day with an API key for public statistics.
- How the data is used:
  > The upload scope is used only to upload the Shorts the channel owner scheduled, with the title, description and privacy status he chose (public, unlisted or private). Statistics are public data read with an API key. Tokens are stored server-side only; the owner can revoke access from the panel (the token is revoked immediately via oauth2.googleapis.com/revoke) or from Google's security settings.

**Evidence they ask for:**
- Screenshot of the privacy policy page.
- Screenshot of the home page with the privacy link (the login page has «Privacidad» and «Términos» at the bottom).
- The terms page.
- Screenshots of the OAuth screen.
- The end-to-end screencast below.

## Video de demostración (sirve para la auditoría o la verificación)

Unos 2 a 3 minutos. Se graba la pantalla de la compu (en Windows, Win+Alt+R o la Herramienta Recortes) y se sube a YouTube como **No listado**. Los textos que se dicen o se ponen como subtítulo van en inglés.

1. **0:00** Abre `https://funciones-panel.vercel.app/privacidad` y luego `/terminos`. Muestra los enlaces a YouTube Terms of Service y Google Privacy Policy. *«This is Panel enserio, a private tool I use to schedule and upload Shorts to my own channel.»*
2. **0:20** Entra al panel con la clave y ve a **Cuentas**. Toca **«Conectar YouTube para subir»**.
3. **0:35** En la pantalla de Google, muestra la barra de direcciones (se ve el `client_id`), el nombre de la app, el permiso **«Administrar tus videos de YouTube»** y el canal elegido. Para la verificación, Google pide esa pantalla **en inglés**: cambia el idioma abajo a English antes de grabar. Acepta.
4. **1:00** De vuelta en Cuentas: «Conectado».
5. **1:10** Ve a **Programar**:
   - Suelta un MP4 de prueba y escribe título y texto.
   - Elige la hora y en la cola deja la privacidad en **Privado** (es una prueba).
   - Toca **«Sacar ya»**.
6. **1:40** Espera la siguiente vuelta del reloj (máximo 5 min, se puede cortar en la edición). En la cola aparece «Publicado».
7. **2:00** Abre YouTube Studio: el video está ahí, con el mismo título, la misma descripción y la privacidad elegida.
8. **2:20** Vuelve a Cuentas y toca **«Desconectar»**. Muestra que en `myaccount.google.com/permissions` el panel ya no aparece.

## Fuentes
- https://developers.google.com/youtube/v3/revision_history (entrada del 2/11/2026)
- https://developers.google.com/youtube/v3/docs/videos/insert
- https://developers.google.com/youtube/v3/guides/quota_and_compliance_audits
- https://support.google.com/cloud/answer/13464323 (cuándo no hace falta verificar)
- https://support.google.com/cloud/answer/15549945 (En prueba: vence a los 7 días)
- https://support.google.com/cloud/answer/13464321 (requisitos de verificación)
- https://developers.google.com/youtube/terms/developer-policies
