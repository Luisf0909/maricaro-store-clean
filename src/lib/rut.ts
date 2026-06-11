/** Valida un RUT chileno (acepta formatos: 12345678-9, 12.345.678-9, 123456789) */
export function validateRUT(rut: string): boolean {
  const clean = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase().trim()
  if (clean.length < 2) return false

  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  if (!/^\d+$/.test(body)) return false

  let sum = 0
  let mul = 2
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * mul
    mul = mul === 7 ? 2 : mul + 1
  }
  const remainder = sum % 11
  const expected = remainder === 0 ? '0' : remainder === 1 ? 'K' : String(11 - remainder)
  return dv === expected
}

/** Formatea un RUT al estilo 12.345.678-9 */
export function formatRUT(rut: string): string {
  const clean = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase().trim()
  if (clean.length < 2) return rut
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${formatted}-${dv}`
}

/** Normaliza un RUT eliminando puntos y dejando el guion */
export function normalizeRUT(rut: string): string {
  const clean = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase().trim()
  if (clean.length < 2) return clean
  return `${clean.slice(0, -1)}-${clean.slice(-1)}`
}
