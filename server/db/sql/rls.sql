-- Políticas RLS. Fuente de verdad de qué policy existe por tabla — la autorización real vive en
-- server/api/; esto es la red de seguridad, no el mecanismo.
--
-- Re-ejecutable: cada policy lleva su `drop policy if exists` delante, así que correr este archivo
-- completo contra un entorno que ya lo tiene aplicado no falla ni deja policies duplicadas.

-- categorias, comunas, comuna_vecinas: catálogo de referencia, público por diseño — pero solo vía
-- server/api/ (/api/categorias, /api/comunas con Drizzle), nunca por PostgREST directo. Lectura sin
-- restricción para cualquiera, incluida una fila inactiva — el filtro por `activa` vive en
-- server/utils/categorias.ts y comunas.ts, no acá. Sin policy de escritura: nada escribe estas tablas vía
-- server/api/, el seed y los cambios de `activa` van directo a la base a mano (no hay panel de
-- administración todavía). `comuna_vecinas` tampoco tiene panel: sus filas se cargan una sola vez desde un
-- script y no vuelven a tocarse salvo una corrección puntual a mano.
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

alter table comuna_vecinas enable row level security;

drop policy if exists comuna_vecinas_select_public on comuna_vecinas;
create policy comuna_vecinas_select_public on comuna_vecinas
  for select using (true);

revoke all on public.categorias from anon, authenticated;
revoke all on public.comunas from anon, authenticated;
revoke all on public.comuna_vecinas from anon, authenticated;

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

-- professional-photos: acá la policy es la barrera real, no un respaldo — las fotos se suben con el
-- cliente de sesión del propio usuario (mismo publishable key + JWT que arma requireUser()), que sí
-- evalúa storage.objects. file_size_limit y allowed_mime_types quedan fijados en el propio bucket:
-- son la única capa que sobrevive si alguien sube directo desde la consola del navegador, saltándose
-- la validación de server/api/.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('professional-photos', 'professional-photos', true, 4194304, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Las tres llevan bucket_id explícito: sin esa condición, `using (true)` aplicaría a toda la tabla
-- storage.objects, no solo a este bucket, y expondría cualquier otro bucket que se agregue después.
drop policy if exists professional_photos_select_own on storage.objects;
create policy professional_photos_select_own on storage.objects
  for select to authenticated using (
    bucket_id = 'professional-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists professional_photos_insert_own on storage.objects;
create policy professional_photos_insert_own on storage.objects
  for insert to authenticated with check (
    bucket_id = 'professional-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists professional_photos_delete_own on storage.objects;
create policy professional_photos_delete_own on storage.objects
  for delete to authenticated using (
    bucket_id = 'professional-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Sin policy de update: cada foto sube con un uuid nuevo, el código nunca llama upload() con
-- upsert: true.

-- professional_contact_events: el evento de contacto (misión 05) nunca identifica a quien contacta
-- (decisión de producto), así que nada en el diseño necesita que ningún rol lo lea ni lo escriba vía
-- PostgREST — solo Drizzle (rol dueño) lo toca, desde el endpoint público de contacto. Por eso va sin
-- ninguna policy: el revoke ya cierra el camino, y sin policy Postgres deniega por default para
-- anon/authenticated de todas formas.

alter table professional_contact_events enable row level security;

revoke all on public.professional_contact_events from anon, authenticated;

-- professional_contact_tokens (misión 07): el token es opaco y nace siempre en la misma request que un
-- professional_contact_events real — no identifica a nadie, pero funciona como credencial de verificación
-- de reseñas, así que cierra igual de estricto: solo Drizzle (rol dueño) lo toca, desde el mismo endpoint
-- de contacto. Sin ninguna policy: el revoke ya cierra el camino.

alter table professional_contact_tokens enable row level security;

revoke all on public.professional_contact_tokens from anon, authenticated;

-- reviews (misión 07): la lectura pública de reseñas pasa por GET /api/professionals/[id] (Drizzle, rol
-- dueño), nunca por PostgREST directo — igual que professionals. La escritura (POST /reviews) verifica el
-- token en el código (F-001); la policy de acá es respaldo, no el mecanismo (A-002).

alter table reviews enable row level security;

revoke all on public.reviews from anon, authenticated;
