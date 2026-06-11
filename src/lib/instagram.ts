/** Detecta si es un link de Instagram */
export function isInstagramUrl(url: string): boolean {
  return /instagram\.com\/(p|reel)\//.test(url)
}

/** Extrae el ID del post/reel de Instagram */
export function getInstagramPostId(url: string): string | null {
  // Elimina parámetros de query
  const cleanUrl = url.split('?')[0].split('#')[0]

  // Busca el ID en el formato /p/{ID}/ o /reel/{ID}/
  const match = cleanUrl.match(/\/(?:p|reel)\/([a-zA-Z0-9_-]+)\/?$/)
  return match?.[1] ?? null
}

/** Genera la URL del embed de Instagram */
export function getInstagramEmbedUrl(postId: string): string {
  return `https://www.instagram.com/p/${postId}/embed/`
}
