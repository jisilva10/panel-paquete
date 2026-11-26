# TikTok: que los videos se publiquen solos (Direct Post)

Revisado el 25/11/2026 en las páginas oficiales de TikTok for Developers (enlaces al final). App: **«Panel enserio»**, hoy en Sandbox **«enserio»**.

## Primero, lo honesto: TikTok probablemente lo rechace

Las reglas de TikTok para publicar por API dicen claramente dos cosas:

- La app debe ser **para un público amplio, no solo para uso interno o privado**.
- Ponen como ejemplo de lo que **no aceptan**: *«A utility tool to help upload contents to the account(s) you or your team manages.»*

Eso describe justo nuestro panel: una herramienta para nuestra propia cuenta. Si se manda la solicitud diciendo la verdad, lo más probable es que la rechacen. Si se manda disfrazando la app como producto para otros creadores, se arriesga la app (y la cuenta de desarrollador). **No recomiendo mentir.**

Mientras tanto, unos datos que cuentan:
- Sin auditoría, todo lo que se publique queda en **«Solo yo»**.
- Sin auditoría, solo se puede publicar en **cuentas privadas**. TikTok devuelve el error `unaudited_client_can_only_post_to_private_accounts`.
- Por eso, hoy no hay forma de que @es_enserio.tv publique solo por API.

### Las salidas, de la más barata a la más cara
1. **Seguir con borradores** (lo de hoy, cero costo):
   - A la hora, el video llega a los borradores con el texto listo en el panel.
   - JIS toca «Publicar». Es un toque por video.
2. **Mandar la solicitud igual, diciendo la verdad** (gratis; abajo está todo listo):
   - Lo peor que pasa es un «no». La app sigue en Sandbox y el flujo de borradores sigue funcionando.
   - Si la aprueban, se prende el interruptor y listo.
3. **Usar un programador que TikTok ya auditó** (Buffer, Metricool, Later y otros):
   - Ellos sí tienen la publicación directa aprobada. El panel les pasaría el video por su API.
   - Cuesta una suscripción mensual. Antes de pagar hay que comprobar que su API publique directo (no a borradores) y que deje programar.
   - Yo lo conecto si JIS decide pagar.

## Lo que ya quedó hecho en el panel (todo apagado)

El interruptor es **`TT_DIRECTO=1`** en Vercel. Hoy está **apagado**: todo va a borradores como siempre.

Con el interruptor prendido:
- **Pantalla de aprobación por video.** Está dentro de «Por salir → el video → Vistazo» y en «Ver» de la cola de /programar. Cumple lo que exigen las reglas de TikTok:
  - Pregunta a TikTok **en ese momento** los datos del creador (`creator_info`) y muestra su **apodo y foto**. Si TikTok dice que hoy no puede publicar, avisa y no deja seguir.
  - **Texto editable** (hasta 2200 caracteres).
  - **«¿Quién puede ver este video?»**: las opciones que da TikTok, **sin valor por defecto**.
  - **Comentarios, dúo y stitch**: apagados de entrada. Si la cuenta los tiene apagados en TikTok, aparecen en gris y bloqueados.
  - **Divulgar contenido comercial**: apagado de entrada.
    - Al prenderlo aparecen «Tu marca» y «Contenido de marca». Si no se elige ninguna, el botón no deja aprobar y sale el aviso.
    - También sale el aviso de la etiqueta («Contenido promocional» o «Colaboración pagada»).
    - El contenido de marca no deja elegir «Solo yo».
  - **Contenido generado con IA**: marcado de entrada, porque la voz es IA. Se puede quitar.
  - El aviso **«Al publicar, aceptas la Confirmación de uso de música de TikTok»** con su enlace. Si es contenido de marca, también la Política de contenido de marca.
  - La **vista previa** del video y el aviso de que TikTok tarda unos minutos en procesarlo.
  - Si el video dura más de lo que permite la cuenta, no deja aprobar.
  - Botón **«Aprobar: publicar en TikTok el [día y hora]»**. Es el consentimiento explícito, video por video, y **funciona con programar**: lo aprobado sale solo a su hora.
  - Botón **ES | EN**, para grabar el video demo en inglés.
- **A la hora:**
  - Si el video **está aprobado**, el reloj vuelve a preguntar a TikTok por el creador. Comprueba que la privacidad elegida siga disponible y que la duración quepa, y publica directo (`/v2/post/publish/video/init/`, permiso `video.publish`).
  - Si **no está aprobado**, va a **borradores** como siempre.
- El permiso `video.publish` solo se pide al conectar TikTok cuando el interruptor está prendido. Así hoy no se rompe nada.

## Lo que tiene que hacer JIS, en orden

> Solo si decides intentar la solicitud (salida 2). Si no, no hay nada que hacer: todo sigue igual.

1. **TikTok for Developers** (developers.tiktok.com → Manage apps → **Panel enserio**):
   - En la pestaña **Sandbox «enserio»**, en Content Posting API, prende **«Direct Post»** y agrega el permiso **`video.publish`**. Guarda.
2. **Cuenta de prueba para el video demo:**
   - Las apps sin auditar solo pueden publicar en **cuentas privadas**. Crea (o usa) una **segunda cuenta de TikTok**, ponla **privada** y agrégala como **usuario de prueba** («Target users») del Sandbox.
   - **No** pongas privada @es_enserio.tv.
3. Dime **«prende TikTok directo para grabar el demo»**:
   - Yo pongo `TT_DIRECTO=1` y vuelvo a publicar el panel.
   - Ojo: mientras esté prendido, el panel pide el permiso nuevo. Si TikTok aún no lo tiene activo, la conexión falla.
   - Los videos que no apruebes siguen yendo a borradores.
4. **Graba el video demo** con el guion de abajo, conectando el panel a la **cuenta de prueba**. Al terminar, conecta de nuevo @es_enserio.tv y dime **«apaga TikTok directo»** (si no lo aprobaron todavía).
5. En la app, botón **«Submit for review»** / **«Apply for audit»** de Content Posting API. Pega las respuestas de abajo y sube el video. **Lo envías tú.**
6. Cuando TikTok responda, me cuentas. Si aprueban, prendo `TT_DIRECTO=1` para siempre y desde ahí **apruebas cada video en «Por salir»** (es un toque, puede ser horas antes) y sale solo a su hora.

---

## Textos para pegar en la solicitud (en inglés)

> La página del formulario necesita sesión, así que no la pude leer. Estos son los campos que suele pedir: revísalos en pantalla y pega lo que corresponda.

**App name:** Panel enserio

**Category:** Entertainment / Content creation tools

**Website / Terms / Privacy:**
- `https://funciones-panel.vercel.app`
- `https://funciones-panel.vercel.app/terminos`
- `https://funciones-panel.vercel.app/privacidad`

**Products and scopes:** Login Kit · Content Posting API (Upload + **Direct Post**) · Display API — `user.info.basic`, `user.info.profile`, `user.info.stats`, `video.list`, `video.upload`, **`video.publish`**

**Describe your app / use case:**
> Panel enserio is the publishing tool of es_enserio.tv, an independent Spanish-language creator who makes short videos about true, surprising stories using paper-puppet animation. The creator finishes each video, schedules it in the panel, and reviews it on a «Post to TikTok» screen before it goes out. On that screen the panel queries creator_info and shows the creator's nickname and avatar. The creator edits the caption and picks who can view the video from the options TikTok returns (no default). The creator turns comments, Duet and Stitch on or off (all off by default; disabled when the account has them off) and can disclose commercial content (Your brand / Branded content). The creator sees the Music Usage Confirmation and explicitly approves the post for its scheduled time. Only approved videos are posted with Direct Post at the scheduled time. Any video that was not approved is sent to the creator's TikTok inbox as a draft instead (Upload API). The panel never adds watermarks, logos or promotional text, and never copies content from other platforms. All content is original and created by the account owner.

**How will you use `video.publish`?**
> To publish, at the time the creator scheduled, only the videos the creator explicitly approved on the post screen, with exactly the privacy level and interaction settings he selected. Before each post the panel queries creator_info again and stops if the creator cannot post or the settings are no longer valid.

**Who are your users / expected usage:**
> Today the tool is used by its creator to publish up to 3 original videos per day. (Expected: 1 creator, ~3 posts/day.)

> Esta última respuesta es la que choca con la regla de «uso interno». Es la verdad y así debe ir.

## Guion del video demo (2–3 minutos, con subtítulos en inglés)

Graba la pantalla de la compu y, al final, el teléfono con la app de TikTok. El panel en **EN** (botón arriba a la derecha de la pantalla de aprobación).

1. **0:00 · Qué es.** Muestra la página de entrada del panel con los enlaces a Privacy y Terms. Subtítulo: *«Panel enserio — the creator's own tool to schedule and post original videos.»*
2. **0:15 · Login Kit.** Cuentas → **Conectar TikTok** → pantalla de TikTok con la app «Panel enserio» y los permisos (se ve `video.publish`) → autorizar con la **cuenta de prueba privada** → vuelve: «Conectado».
3. **0:40 · Programar.** Programar → suelta un MP4 → texto con hashtags → hora a 10 minutos.
4. **1:00 · Pantalla de publicación** («Ver» en la cola). Muestra, despacio, cada regla:
   - Apodo y foto del creador (vienen de `creator_info`).
   - La vista previa del video.
   - Edita el texto.
   - Abre **«Who can view this video?»**: está vacío hasta elegir. Elige **Only me**.
   - Las casillas Comment / Duet / Stitch, todas apagadas. Muestra una gris si la cuenta la tiene apagada. Prende Comment.
   - Prende **Disclose video content**: sin elegir nada, el botón queda desactivado y sale el aviso. Marca *Your brand* y aparece «Promotional content». Marca *Branded content*: «Only me» queda bloqueado. Desmárcalo y apaga la divulgación.
   - El texto **«By posting, you agree to TikTok's Music Usage Confirmation»** y el aviso de procesamiento.
   - Toca **«Approve: post to TikTok on …»**: queda «Approved for TikTok».
5. **1:50 · A la hora.** Toca **«Sacar ya»** (o corta el video hasta la hora). La cola pasa a «TikTok procesa» y luego «Publicado».
6. **2:10 · Resultado.** En el teléfono, abre la cuenta de prueba en TikTok: el video está publicado con el texto, la privacidad y los ajustes elegidos.
7. **2:30 · Sin aprobar va a borradores.** Muestra otro video que no se aprobó: llega a la bandeja de TikTok como borrador.

## Fuentes
- https://developers.tiktok.com/doc/content-sharing-guidelines (actualizada el 4/8/2026)
- https://developers.tiktok.com/doc/content-posting-api-reference-direct-post
- https://developers.tiktok.com/doc/content-posting-api-reference-query-creator-info
- https://developers.tiktok.com/doc/content-posting-api-get-started
- Formulario de auditoría (necesita sesión): https://developers.tiktok.com/application/content-posting-api
