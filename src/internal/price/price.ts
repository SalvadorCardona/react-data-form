import { getPorts } from "@/ports"

export function formatPrice(
  centimes?: number | null,
  locale = getPorts().intlLocale
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: getPorts().currency ?? "EUR",
  }).format((centimes ?? 0) / 100)
}

export function priceToCentimes(euros: number): number {
  return Math.round(euros * 100)
}

export function centimesToPrice(centimes: number): number {
  return centimes / 100
}

// `vat` comes back from the API as `number | null`, so null is accepted just
// like an omitted argument rather than forcing a `?? undefined` at every call.
export function formatPriceWithVat(
  centimes: number,
  vatRate: number | null = 20,
  locale = getPorts().intlLocale
): string {
  const priceWithVat = (centimes ?? 0) * (1 + (vatRate ?? 20) / 100)
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: getPorts().currency ?? "EUR",
  }).format(priceWithVat / 100)
}
