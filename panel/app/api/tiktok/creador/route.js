import { NextResponse } from 'next/server';
import { tokenDe } from '../../../../lib/cuentas';
import { enDemo } from '../../../../lib/demo';
import * as tt from '../../../../lib/tiktok';

export const dynamic = 'force-dynamic';

// Para la pantalla de aprobación de TikTok: lo que TikTok dice del creador en este momento
// (apodo, opciones de privacidad, qué tiene apagado y el largo máximo). Se pide cada vez que se abre.
export async function GET() {
  if (enDemo()) {
    return NextResponse.json({ creator_nickname: 'es_enserio.tv', creator_username: 'es_enserio.tv', creator_avatar_url: null, privacy_level_options: ['PUBLIC_TO_EVERYONE', 'MUTUAL_FOLLOW_FRIENDS', 'SELF_ONLY'], comment_disabled: false, duet_disabled: false, stitch_disabled: true, max_video_post_duration_sec: 600 });
  }
  if (!tt.directo()) return NextResponse.json({ error: 'La publicación directa en TikTok está apagada' }, { status: 409 });
  const c = await tokenDe('tiktok');
  if (!c) return NextResponse.json({ error: 'TikTok no está conectado' }, { status: 409 });
  try {
    return NextResponse.json(await tt.infoCreador(c.access_token));
  } catch (e) {
    const permiso = /scope_not_authorized/.test(e.message);
    const tope = /spam_risk|reached_active_user_cap|banned/.test(e.message);
    return NextResponse.json({ error: permiso ? 'Falta el permiso de publicar: vuelve a conectar TikTok en Cuentas.' : tope ? 'TikTok dice que esta cuenta no puede publicar más por ahora. Prueba más tarde.' : e.message, codigo: e.message }, { status: 409 });
  }
}
