const MAX_DIMENSION = 1600
const JPEG_QUALITY = 0.8

// Canvas, sin librería nueva — el archivo siempre sale como JPEG sin importar el formato de entrada,
// así el servidor y el bucket solo ven un tipo real en el camino normal de la app (png/webp en
// allowed_mime_types quedan como defensa del bucket contra alguien que suba directo, saltándose esto).
export async function compressPhoto(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No se pudo comprimir la imagen')
  ctx.drawImage(bitmap, 0, 0, width, height)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('No se pudo comprimir la imagen'))),
      'image/jpeg',
      JPEG_QUALITY,
    )
  })
}

// El perfil solo trae la URL pública de cada foto, nunca su path dentro del bucket — para borrar una
// foto hace falta ese path, así que se reconstruye a partir del prefijo fijo con el que el servidor
// arma la URL.
export function photoPathFromUrl(url: string, supabaseUrl: string): string {
  const prefix = `${supabaseUrl}/storage/v1/object/public/professional-photos/`
  return url.startsWith(prefix) ? url.slice(prefix.length) : url
}
