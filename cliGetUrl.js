/* Copyright 2013 - 2024 Waiterio LLC */

// Build-time replacement for the monorepo URL resolver. The published CLI
// only ever needs this product's own public URLs, so the full internal
// domain/port registry never enters the npm bundle. Overrides:
// IMAGELATO_API_URL and IMAGELATO_APP_URL.
export default function getUrl({ service } = {}) {
  if (service === 'api') {
    return process.env.IMAGELATO_API_URL || 'https://api.imagelato.com'
  }
  if (service === 'app') {
    return process.env.IMAGELATO_APP_URL || 'https://app.imagelato.com'
  }
  return 'https://www.imagelato.com'
}
