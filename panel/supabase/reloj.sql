-- El reloj: Supabase llama al panel cada 5 minutos para publicar
-- y cada 3 horas para leer los números. Vercel Hobby solo deja un cron al día.
-- {{PANEL_URL}} se reemplaza al correr «npm run db -- reloj».
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.unschedule(jobname) from cron.job where jobname in ('panel-publicar','panel-estadisticas');

select cron.schedule('panel-publicar', '*/5 * * * *', $$
  select net.http_get(
    url := '{{PANEL_URL}}/api/cron/publicar',
    headers := jsonb_build_object('Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'panel_cron')),
    timeout_milliseconds := 300000);
$$);

select cron.schedule('panel-estadisticas', '17 */3 * * *', $$
  select net.http_get(
    url := '{{PANEL_URL}}/api/cron/estadisticas',
    headers := jsonb_build_object('Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'panel_cron')),
    timeout_milliseconds := 300000);
$$);
