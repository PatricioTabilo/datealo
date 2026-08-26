-- Políticas RLS. Fuente de verdad de qué policy existe por tabla — la autorización real vive en
-- server/api/; esto es la red de seguridad, no el mecanismo.
--
-- Re-ejecutable: cada policy lleva su `drop policy if exists` delante, así que correr este archivo
-- completo contra un entorno que ya lo tiene aplicado no falla ni deja policies duplicadas.

-- categorias, comunas: catálogo de referencia, público por diseño — pero solo vía server/api/
-- (/api/categorias, /api/comunas con Drizzle), nunca por PostgREST directo. Lectura sin restricción
-- para cualquiera, incluida una fila inactiva — el filtro por `activa` vive en server/utils/categorias.ts
-- y comunas.ts, no acá. Sin policy de escritura: nada escribe estas tablas vía server/api/, el seed y
-- los cambios de `activa` van directo a la base a mano (no hay panel de administración todavía).
--
-- El revoke de abajo es el mecanismo real, igual que en professionals: sin él, el default de
-- Supabase deja SELECT/INSERT/UPDATE/DELETE/TRUNCATE abiertos a anon/authenticated por PostgREST desde
-- el día en que la tabla se crea — las policies de solo-lectura de acá abajo quedarían como la única
-- puerta, alcanzable directo con la publishable key del bundle del cliente.

alter table categorias enable row level security;

drop policy if exists categorias_select_public on categorias;
create policy categorias_select_public on categorias
  for select using (true);

alter table comunas enable row level security;

drop policy if exists comunas_select_public on comunas;
create policy comunas_select_public on comunas
  for select using (true);

revoke all on public.categorias from anon, authenticated;
revoke all on public.comunas from anon, authenticated;

-- professionals: el perfil es el producto (lectura pública), la escritura es solo del dueño.
-- La autorización real vive en server/api/ — Drizzle entra como rol dueño y salta RLS por
-- completo, así que estas tres policies son respaldo, no el mecanismo (ese es el revoke de
-- más abajo).

alter table professionals enable row level security;

-- Si algún día se revierte el revoke de abajo para servir esta tabla por PostgREST (ej. un perfil
-- público futuro), esta policy tiene que ajustarse en el mismo cambio: hoy es `using (true)` porque
-- nada la evalúa, pero expone `user_id` (el id de auth.users, que no debería quedar público) y las
-- filas con `active = false`. Acotarla a columnas públicas y a `using (active)` antes de reabrir el grant.
drop policy if exists professionals_select_public on professionals;
create policy professionals_select_public on professionals
  for select to authenticated, anon using (true);

drop policy if exists professionals_insert_own on professionals;
create policy professionals_insert_own on professionals
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists professionals_update_own on professionals;
create policy professionals_update_own on professionals
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Sin policy de delete: ninguna operación de esta misión borra una fila; sin policy, Postgres
-- deniega por default, que es el comportamiento que se quiere.

-- Cierra PostgREST por completo para esta tabla: nada en el diseño necesita leerla ni escribirla
-- por ahí, todo pasa por server/api/ salvo Auth; Drizzle usa el rol dueño y no le afecta.
-- `force row level security` queda deliberadamente sin usar: forzarlo aplicaría RLS también al
-- rol dueño de Drizzle, donde auth.uid() es NULL, y rompería todo insert/update del servidor.
revoke all on public.professionals from anon, authenticated;
