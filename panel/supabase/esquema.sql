-- Panel de la cuenta · esquema de la base (Supabase / Postgres)
-- Todo se lee y se escribe desde el servidor con la llave de servicio.
-- RLS encendido y SIN políticas: la llave pública no ve nada.

create table if not exists cuentas (
  red            text primary key check (red in ('instagram','tiktok','youtube')),
  cuenta_id      text,
  usuario        text,
  access_token   text not null,
  refresh_token  text,
  expira         timestamptz,
  refresh_expira timestamptz,
  actualizado    timestamptz not null default now()
);

create table if not exists publicaciones (
  id               uuid primary key default gen_random_uuid(),
  pieza            text not null,
  texto            text not null default '',
  programada_para  timestamptz not null,
  redes            text[] not null default '{instagram,tiktok,youtube}',
  video_url        text,
  portada_url      text,
  video_bytes      bigint,
  duracion         numeric,
  estado           text not null default 'programada'
                   check (estado in ('programada','en_curso','hecha','con_error','cancelada')),
  ig_estado        text not null default 'pendiente',
  ig_desde         timestamptz,
  ig_contenedor    text,
  ig_media_id      text,
  ig_error         text,
  tt_estado        text not null default 'pendiente',
  tt_desde         timestamptz,
  tt_publish_id    text,
  tt_video_id      text,
  tt_error         text,
  yt_estado        text not null default 'pendiente',   -- pendiente · para_ti · publicado · no_va (YouTube lo sube él)
  yt_url           text,
  -- qué se probó en esta función (tipo de historia, duración, gancho, cierre…): así se sabe qué gana
  etiquetas        jsonb not null default '{}'::jsonb,
  creado           timestamptz not null default now()
);
create index if not exists publicaciones_cola on publicaciones (estado, programada_para);

-- Cada pieza publicada, por red. Los números de dos redes nunca se suman.
create table if not exists medios (
  red            text not null,
  media_id       text not null,
  pieza          text,
  titulo         text,
  formato        text,
  publicado_en   timestamptz,
  duracion       numeric,
  permalink      text,
  origen         text not null default 'api',   -- 'api' o 'excel'
  reemplazado    boolean not null default false, -- fila del Excel que ya trajo la API
  publicacion_id uuid references publicaciones(id) on delete set null,
  primary key (red, media_id)
);

-- Una foto por pieza y por día: así se ve cómo crece.
create table if not exists metricas (
  red                text not null,
  media_id           text not null,
  fecha              date not null,
  vistas             bigint,
  alcance            bigint,
  me_gusta           bigint,
  comentarios        bigint,
  guardados          bigint,
  compartidos        bigint,
  seguidores_ganados bigint,
  tiempo_promedio_s  numeric,
  leido_en           timestamptz not null default now(),
  primary key (red, media_id, fecha),
  foreign key (red, media_id) references medios(red, media_id) on delete cascade
);

-- La cuenta, un renglón por día.
create table if not exists cuenta_diaria (
  red         text not null,
  fecha       date not null,
  seguidores  bigint,
  vistas_7d   bigint,
  alcance_7d  bigint,
  leido_en    timestamptz not null default now(),
  primary key (red, fecha)
);

-- Lo que hizo el robot, para saber qué pasó si algo falla.
create table if not exists bitacora (
  id      bigint generated always as identity primary key,
  cuando  timestamptz not null default now(),
  tipo    text not null,
  detalle text
);

-- El último número de cada pieza.
create or replace view ultima_metrica as
select distinct on (red, media_id) *
from metricas
order by red, media_id, fecha desc;

alter table cuentas        enable row level security;
alter table publicaciones  enable row level security;
alter table medios         enable row level security;
alter table metricas       enable row level security;
alter table cuenta_diaria  enable row level security;
alter table bitacora       enable row level security;
revoke all on ultima_metrica from anon, authenticated;
