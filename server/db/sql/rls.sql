-- Políticas RLS. Fuente de verdad de qué policy existe por tabla — la autorización real vive en
-- server/api/ (A-002 del skill arquitectura); esto es la red de seguridad, no el mecanismo.

-- categorias, comunas: catálogo de referencia, público por diseño. Lectura sin restricción para
-- cualquiera, incluida una fila inactiva — el filtro por `activa` vive en server/utils/categorias.ts
-- y comunas.ts, no acá. Sin policy de escritura: nada escribe estas tablas vía server/api/, el seed y
-- los cambios de `activa` van directo a la base a mano (no hay panel de administración todavía).

alter table categorias enable row level security;

create policy categorias_select_public on categorias
  for select using (true);

alter table comunas enable row level security;

create policy comunas_select_public on comunas
  for select using (true);

-- professionals: el perfil es el producto (lectura pública), la escritura es solo del dueño.
-- La autorización real vive en server/api/ (A-002) — Drizzle entra como rol dueño y salta RLS
-- por completo, así que estas tres policies son respaldo, no el mecanismo.
--
-- El revoke de abajo es lo que sí es el mecanismo (A-007): sin él, estas policies quedarían
-- como la única puerta de la tabla, alcanzable directo desde PostgREST con la publishable key
-- que ya vive en el bundle del cliente (A-001) — no un respaldo del código del servidor.

alter table professionals enable row level security;

create policy professionals_select_public on professionals
  for select to authenticated, anon using (true);

create policy professionals_insert_own on professionals
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy professionals_update_own on professionals
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Sin policy de delete: ninguna operación de esta misión borra una fila; sin policy, Postgres
-- deniega por default, que es el comportamiento que se quiere.

-- A-007: cierra PostgREST por completo para esta tabla. Nada en el diseño necesita leerla ni
-- escribirla por ahí (A-001: todo pasa por server/api/, salvo Auth); Drizzle usa el rol dueño
-- y no le afecta. force row level security NO se usa a propósito: forzaría RLS también sobre
-- el rol dueño de Drizzle, donde auth.uid() es NULL, y rompería todo insert/update del servidor.
revoke all on public.professionals from anon, authenticated;
