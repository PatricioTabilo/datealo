-- Políticas RLS. Fuente de verdad de qué policy existe por tabla — la autorización real vive en
-- server/api/ (A-002 del skill arquitectura); esto es la red de seguridad, no el mecanismo.

-- categorias, comunas (misión 03): catálogo de referencia, público por diseño. Lectura sin restricción
-- para cualquiera, incluida una fila inactiva — el filtro por `activa` vive en server/utils/taxonomia.ts,
-- no acá. Sin policy de escritura: nada escribe estas tablas vía server/api/, el seed y los cambios de
-- `activa` van directo a la base (ver ingenieria.md de la misión 03).

alter table categorias enable row level security;

create policy categorias_select_public on categorias
  for select using (true);

alter table comunas enable row level security;

create policy comunas_select_public on comunas
  for select using (true);
