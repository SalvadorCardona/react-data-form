export function formatPrice(centimes?: number | null, locale = "fr-FR"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
  }).format((centimes ?? 0) / 100)
}

export function priceToCentimes(euros: number): number {
  return Math.round(euros * 100)
}

export function centimesToPrice(centimes: number): number {
  return centimes / 100
}

// `vat` remonte de l'API en `number | null` : on accepte null au même titre
// qu'un paramètre omis, plutôt que d'imposer un `?? undefined` à chaque appel.
export function formatPriceWithVat(
  centimes: number,
  vatRate: number | null = 20,
  locale = "fr-FR"
): string {
  const priceWithVat = (centimes ?? 0) * (1 + (vatRate ?? 20) / 100)
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
  }).format(priceWithVat / 100)
}
