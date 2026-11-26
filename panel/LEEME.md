# Panel de Noerion

https://panel.noerionconsulting.com · proyecto Vercel `noerion-panel` (jisilva10s-projects) · datos en Supabase · videos en Vercel Blob `noerion-videos`.

## Qué hace
- **Cómo va** (`/`): seguidores y vistas de la semana por red, vistas por pieza, lo que viene y la tabla pieza por pieza. IG y TikTok nunca se suman.
- **Programar** (`/programar`): se suelta el MP4, texto y hora (Ecuador). A esa hora:
  - Instagram: se publica solo como reel.
  - TikTok: llega a los **borradores** de la cuenta con una notificación; JIS toca Publicar. TikTok prohíbe que una herramienta propia publique en público (Content Sharing Guidelines: «utility tool to help upload contents to the account(s) you or your team manages» no es aceptable). Máximo 5 pendientes en 24 h.
- **Publicar en TikTok**: cuando un video queda en borradores, «Cómo va» muestra arriba una tarjeta con el texto y el botón «Copiar y abrir TikTok»; «Ya lo publiqué» la cierra (si no, el reloj se entera solo).
- **En el teléfono**: se instala como app (Safari → Compartir → «Agregar a pantalla de inicio»), con el isotipo dorado del manual de icono.
- **Cuentas** (`/conectar`): conectar Instagram y TikTok una vez; las llaves quedan en la tabla `cuentas` y se renuevan solas.

## El reloj
Supabase (pg_cron + pg_net) llama a `/api/cron/publicar` cada 5 min y a `/api/cron/estadisticas` cada 3 h con `CRON_SECRET` (guardado en Vault como `panel_cron`). Vercel Hobby solo da un cron diario: queda en `vercel.json` de respaldo.

## Variables en Vercel (Production)
| Variable | Quién la pone |
|---|---|
| SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, POSTGRES_URL… | la integración de Supabase |
| BLOB_READ_WRITE_TOKEN | el almacén de Blob |
| CRON_SECRET, PANEL_URL, IG_APP_ID | Claude (no son llaves de nadie) |
| PANEL_CLAVE | **JIS** (la clave para entrar al panel) |
| PANEL_TOKEN_MAC | Claude (la llave de la Mac; copia en `.secretos/mac.txt`) |
| IG_APP_SECRET | **JIS** (Meta → Noerion Radar → API de Instagram → Clave secreta de la app de Instagram) |
| TT_CLIENT_KEY, TT_CLIENT_SECRET | **JIS** (TikTok for Developers → Noerion Panel → **Sandbox** «Noerion» → Credentials) |
| YT_API_KEY, YT_CANAL | Claude (llave de Google del proyecto «enseriotv» para leer números públicos) |
| YT_CLIENT_ID, YT_CLIENT_SECRET | **JIS** (Google Cloud → enseriotv → Google Auth Platform → Clients). Para subir Shorts solos |
| YT_SUBIR_SOLO | Claude. **Interruptor**: `1` = YouTube sube solo (si la cuenta está conectada para subir). Sin poner = tarjeta «Subir» (hoy) |
| TT_DIRECTO | Claude. **Interruptor**: `1` = TikTok publica directo los videos aprobados en el panel (pide `video.publish`). Sin poner = borradores (hoy) |

## Comandos (los corro yo)
Las llaves de Supabase son secretas en Vercel y no bajan a la Mac: la Mac entra al panel con su propia llave (`.secretos/mac.txt` = `PANEL_TOKEN_MAC`) y el servidor hace el trabajo de base.
- `npm run programar -- --video "<mp4>" --pieza "NN. Título" --hora "AAAA-MM-DD HH:MM" --texto-archivo copy.txt` → revisa el MP4, lo sube y lo pone en la cola. Con `--probar` solo revisa; `--solo instagram|tiktok` para una red.
- `npm run cola` → lo que viene · `npm run estado` → conteos, cuentas y últimas llamadas del reloj.
- `npm run db` → tablas + reloj + Excel (lo corre el servidor; se puede repetir) · `npm run importar` → vuelve a leer `RESULTADOS.xlsx`.
- `npx vercel deploy --prod` → publica cambios. `npx vercel env pull .env.local --environment production` → baja lo que no es secreto (el token del almacén de videos).
- Vista de prueba sin base: servidor `panel-demo` del launch.json (`.env.development.local` con PANEL_DEMO=1).

## Publicar solas (25/11/2026)
Todo detrás de interruptores apagados. Qué falta y en qué orden: `marca/auditorias/youtube.md` y `marca/auditorias/tiktok.md`. Después de cambiar `supabase/esquema.sql`: `npm run db -- tablas`.
