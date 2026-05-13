export function toModelDate(value, fallback = null) {
  if (!value) {
    return fallback
  }

  if (value instanceof Date) {
    return value
  }

  if (typeof value.toDate === 'function') {
    const converted = value.toDate()
    return converted instanceof Date ? converted : fallback
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const converted = new Date(value)
    return Number.isNaN(converted.getTime()) ? fallback : converted
  }

  return fallback
}
