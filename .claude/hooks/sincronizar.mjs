// Mantiene Titeres igual en las dos compus, sin que nadie se acuerde.
//   inicio → al abrir cualquier sesión (chat nuevo o tarea programada): trae lo último de GitHub.
//   fin    → cada vez que Claude termina de responder: guarda lo cambiado y lo sube.
// Lo llaman los hooks de .claude/settings.json (en la PC y en la Mac) y, en la Mac,
// también los de ~/.claude/settings.json con --desde-fuera para las sesiones abiertas en otra carpeta.
// Nunca frena a Claude: si algo falla, avisa y sale.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join, resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hostname, platform } from 'node:os';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const modo = process.argv[2];
const desdeFuera = process.argv.includes('--desde-fuera');

// Si la sesión ya está dentro de Titeres, lo hace el hook del proyecto; el de fuera no se mete.
const proyecto = process.env.CLAUDE_PROJECT_DIR ? resolve(process.env.CLAUDE_PROJECT_DIR) : null;
const dentro = (d) => { const r = relative(REPO, d); return r === '' || (!r.startsWith('..') && !isAbsolute(r)); };
if (desdeFuera && proyecto && dentro(proyecto)) process.exit(0);
if (!existsSync(join(REPO, '.git'))) process.exit(0);

const FIRMA = ['-c', 'user.name=jisilva10', '-c', 'user.email=jisilva10@users.noreply.github.com'];
function git(...args) {
  const r = spawnSync('git', [...FIRMA, ...args], { cwd: REPO, encoding: 'utf8', timeout: 45000 });
  return { ok: r.status === 0, out: (r.stdout || '').trim(), err: (r.stderr || r.error?.message || '').trim() };
}
const enMedio = () => ['rebase-merge', 'rebase-apply', 'MERGE_HEAD'].some((f) => existsSync(join(REPO, '.git', f)));

// Dos sesiones a la vez en la misma compu: se espera a que la otra suelte git.
async function esperarCandado() {
  for (let i = 0; i < 40 && existsSync(join(REPO, '.git', 'index.lock')); i++) await new Promise((r) => setTimeout(r, 500));
}

function aviso(texto) {
  if (modo === 'inicio') {
    // En el inicio, lo que se imprime le llega a Claude: así lo resuelve antes de tocar nada.
    console.log(`⚠️ Titeres/GitHub: ${texto} Arréglalo antes de tocar Titeres (git status en ${REPO}).`);
  } else {
    console.log(JSON.stringify({ systemMessage: `Titeres no se pudo subir a GitHub: ${texto}` }));
  }
  process.exit(0);
}

function traer() {
  const p = git('pull', '--rebase', '--autostash', '-q');
  if (p.ok) return true;
  if (enMedio()) git('rebase', '--abort');
  const choque = /conflict|could not apply/i.test(p.err + p.out);
  return choque ? 'las dos compus cambiaron las mismas líneas; hay que juntarlas a mano'
    : p.err.split('\n').filter((l) => !l.startsWith('hint:')).slice(-2).join(' ');
}

const adelante = () => Number(git('rev-list', '--count', '@{u}..HEAD').out || 0);

function subir() {
  if (!adelante()) return true;
  if (git('push', '-q').ok) return true;
  const t = traer();
  if (t !== true) return `chocó con lo que hay en GitHub (${t})`;
  const p = git('push', '-q');
  return p.ok || p.err.split('\n').slice(-1)[0];
}

await esperarCandado();
if (enMedio()) aviso('hay un rebase o merge a medias.');

if (modo === 'inicio') {
  const t = traer();
  if (t !== true) aviso(`no pude traer lo último (${t}).`);
  const s = subir(); // si la vez anterior quedó algo sin subir
  if (s !== true) aviso(`quedaron cambios sin subir (${s}).`);
  if (!desdeFuera) console.log(`Titeres al día con GitHub (${git('log', '-1', '--format=%h %s').out}).`);
} else if (modo === 'fin') {
  if (git('status', '--porcelain').out) {
    git('add', '-A');
    const c = git('commit', '-q', '-m', `Automático: cambios de ${platform() === 'win32' ? 'la PC' : platform() === 'darwin' ? 'la Mac' : hostname()}`);
    if (!c.ok && !/nothing to commit/.test(c.out + c.err)) aviso(`no pude guardar (${c.err})`);
  }
  const s = subir();
  if (s !== true) aviso(String(s));
}
process.exit(0);
