// Script de una sola vez: calcula qué comunas comparten frontera real cruzando el catálogo de `comunas`
// contra un dataset público de límites geográficos, y regenera server/db/seed/comuna-vecinas.ts con el
// resultado. No corre en producción ni lo importa ningún otro archivo — se ejecuta a mano
// (`npx tsx scripts/compute-comuna-vecinas.ts`) solo cuando el catálogo de comunas cambia de verdad (una
// comuna nueva, un límite oficial que se redibuja), no en cada deploy.
//
// Fuente: https://github.com/fcortes/Chile-GeoJSON, comunas.geojson, fijado a un commit exacto para que
// dos corridas produzcan el mismo resultado. El repo no declara una licencia de software explícita, pero
// su propio README cita como origen los mapas vectoriales de la Biblioteca del Congreso Nacional de
// Chile — límites administrativos oficiales, no un trazado propio del autor del repo. Cada feature trae
// `cod_comuna`, el mismo código SUBDERE que usa `comunas.codigo`, así que casi todo el cruce es directo
// por código, sin ambigüedad de nombres — con dos excepciones reales, documentadas abajo en NUBLE_RENAME
// y SIN_GEOMETRIA.

import booleanIntersects from '@turf/boolean-intersects'
import { asc } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { writeFileSync } from 'node:fs'
import { comunas } from '../server/db/schema/comunas'

process.loadEnvFile('.env')

const databaseUrlSession = process.env.DATABASE_URL_SESSION
if (!databaseUrlSession) {
  throw new Error('Falta DATABASE_URL_SESSION en el entorno — ver .env.example')
}

const GEOJSON_URL = 'https://raw.githubusercontent.com/fcortes/Chile-GeoJSON/76a5c884ce0adf68c483785e72873ff8692c97db/comunas.geojson'

// El dataset todavía usa los códigos de región 8 (Biobío) de antes de la creación de la región de Ñuble
// en 2018, para comunas que hoy tienen un código SUBDERE distinto en `comunas` — mismo nombre, cruce
// resuelto a mano una sola vez, no un algoritmo de coincidencia difusa corriendo en cada ejecución.
const NUBLE_RENAME: Record<string, string> = {
  '8401': '16101',
  '8402': '16102',
  '8403': '16202',
  '8404': '16203',
  '8405': '16302',
  '8406': '16103',
  '8407': '16104',
  '8408': '16204',
  '8409': '16303',
  '8410': '16105',
  '8411': '16106',
  '8412': '16205',
  '8413': '16107',
  '8414': '16201',
  '8415': '16206',
  '8416': '16301',
  '8417': '16304',
  '8418': '16108',
  '8419': '16305',
  '8420': '16207',
  '8421': '16109',
}

type GeoJsonGeometry = {
  type: 'Polygon' | 'MultiPolygon'
  coordinates: unknown
}

type ComunaFeature = {
  properties: { cod_comuna: number }
  geometry: GeoJsonGeometry
}

function flattenPositions(geometry: GeoJsonGeometry): [number, number][] {
  const rings = geometry.type === 'Polygon'
    ? (geometry.coordinates as number[][][])
    : (geometry.coordinates as number[][][][]).flat()
  return rings.flat() as [number, number][]
}

type BoundingBox = { minLon: number, minLat: number, maxLon: number, maxLat: number }

function boundingBox(geometry: GeoJsonGeometry): BoundingBox {
  const positions = flattenPositions(geometry)
  let minLon = Infinity; let minLat = Infinity; let maxLon = -Infinity; let maxLat = -Infinity
  for (const [lon, lat] of positions) {
    if (lon < minLon) minLon = lon
    if (lon > maxLon) maxLon = lon
    if (lat < minLat) minLat = lat
    if (lat > maxLat) maxLat = lat
  }
  return { minLon, minLat, maxLon, maxLat }
}

function bboxesOverlap(a: BoundingBox, b: BoundingBox): boolean {
  return a.minLon <= b.maxLon && a.maxLon >= b.minLon && a.minLat <= b.maxLat && a.maxLat >= b.minLat
}

async function main() {
  const client = postgres(databaseUrlSession!, { prepare: false })
  const db = drizzle({ client, schema: { comunas } })

  const catalogo = await db
    .select({ codigo: comunas.codigo, nombre: comunas.nombre })
    .from(comunas)
    .orderBy(asc(comunas.codigo))
  await client.end()

  const response = await fetch(GEOJSON_URL)
  if (!response.ok) {
    throw new Error(`No se pudo descargar el dataset de comunas: ${response.status}`)
  }
  const geojson = await response.json() as { features: ComunaFeature[] }

  const featureByCode = new Map<string, ComunaFeature>()
  for (const feature of geojson.features) {
    featureByCode.set(String(feature.properties.cod_comuna), feature)
  }

  const geometryByCodigo = new Map<string, GeoJsonGeometry>()
  const bboxByCodigo = new Map<string, BoundingBox>()
  const sinGeometria: string[] = []

  for (const { codigo, nombre } of catalogo) {
    const geoCode = featureByCode.has(codigo) ? codigo : NUBLE_RENAME[codigo]
    const feature = geoCode ? featureByCode.get(geoCode) : undefined
    if (!feature) {
      sinGeometria.push(`${codigo} ${nombre}`)
      continue
    }
    geometryByCodigo.set(codigo, feature.geometry)
    bboxByCodigo.set(codigo, boundingBox(feature.geometry))
  }

  if (sinGeometria.length > 0) {
    console.warn(`Comunas sin geometría en el dataset (quedan sin vecinas en el seed): ${sinGeometria.join(', ')}`)
  }

  const codigos = [...geometryByCodigo.keys()]
  const pares: { comunaCodigo: string, vecinaCodigo: string }[] = []

  for (let i = 0; i < codigos.length; i++) {
    const codigoA = codigos[i]!
    const bboxA = bboxByCodigo.get(codigoA)!
    const geometryA = geometryByCodigo.get(codigoA)!

    for (let j = i + 1; j < codigos.length; j++) {
      const codigoB = codigos[j]!
      if (!bboxesOverlap(bboxA, bboxByCodigo.get(codigoB)!)) continue

      const geometryB = geometryByCodigo.get(codigoB)!
      if (booleanIntersects(geometryA as never, geometryB as never)) {
        pares.push({ comunaCodigo: codigoA, vecinaCodigo: codigoB })
        pares.push({ comunaCodigo: codigoB, vecinaCodigo: codigoA })
      }
    }
  }

  pares.sort((a, b) => a.comunaCodigo.localeCompare(b.comunaCodigo) || a.vecinaCodigo.localeCompare(b.vecinaCodigo))

  const filas = pares.map(({ comunaCodigo, vecinaCodigo }) => `  { comunaCodigo: '${comunaCodigo}', vecinaCodigo: '${vecinaCodigo}' },`).join('\n')

  const archivo = `// Adyacencia geográfica real entre comunas: se corre una vez por entorno, \`npm run
// db:seed:comuna-vecinas\`.
//
// Los pares salen de \`scripts/compute-comuna-vecinas.ts\`, que cruza el catálogo de comunas contra un
// dataset público de límites geográficos (ver ese script para la fuente y el detalle del cálculo) y
// calcula qué comunas comparten frontera real, en las dos direcciones de cada par. No se recalcula acá:
// este archivo es el resultado ya congelado, igual que \`taxonomia.ts\` con su seed de categorías y
// comunas.
//
// Una sola comuna del catálogo (Antártica) quedó sin geometría en el dataset elegido y por lo tanto sin
// ninguna fila acá — hoy no tiene ningún impacto porque no está activa en el catálogo.

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { comunaVecinas } from '../schema/comuna-vecinas'

process.loadEnvFile('.env')

const databaseUrlSession = process.env.DATABASE_URL_SESSION
if (!databaseUrlSession) {
  throw new Error('Falta DATABASE_URL_SESSION en el entorno — ver .env.example')
}

const comunaVecinasSeed = [
${filas}
]

async function main() {
  const client = postgres(databaseUrlSession!, { prepare: false })
  const db = drizzle({ client, schema: { comunaVecinas } })

  await db.insert(comunaVecinas).values(comunaVecinasSeed).onConflictDoNothing()

  console.log(\`pares de comunas vecinas sembrados: \${comunaVecinasSeed.length}\`)

  await client.end()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
`

  writeFileSync(new URL('../server/db/seed/comuna-vecinas.ts', import.meta.url), archivo)
  console.log(`pares calculados (ambos sentidos): ${pares.length} — server/db/seed/comuna-vecinas.ts regenerado`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
