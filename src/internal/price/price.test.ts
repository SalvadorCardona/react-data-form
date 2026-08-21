import { describe, expect, it } from "vitest"
import { centimesToPrice, formatPrice, priceToCentimes } from "./price"

describe("formatPrice", () => {
  it("devrait formater un prix en centimes vers une chaîne de caractères avec la locale par défaut (fr-FR)", () => {
    expect(formatPrice(1050)).toBe("10,50 €")
    expect(formatPrice(100)).toBe("1,00 €")
    expect(formatPrice(0)).toBe("0,00 €")
    expect(formatPrice(999)).toBe("9,99 €")
    expect(formatPrice(10000)).toBe("100,00 €")
  })

  it("devrait formater un prix avec des centimes décimaux", () => {
    expect(formatPrice(1)).toBe("0,01 €")
    expect(formatPrice(50)).toBe("0,50 €")
    expect(formatPrice(99)).toBe("0,99 €")
  })

  it("devrait gérer les grands montants", () => {
    expect(formatPrice(100000)).toBe("1 000,00 €")
    expect(formatPrice(1000000)).toBe("10 000,00 €")
    expect(formatPrice(123456789)).toBe("1 234 567,89 €")
  })

  it("devrait fonctionner avec différentes locales", () => {
    expect(formatPrice(1050, "en-US")).toBe("€10.50")
    expect(formatPrice(1050, "de-DE")).toBe("10,50 €")
    expect(formatPrice(1050, "fr-FR")).toBe("10,50 €")
  })

  it("devrait gérer les montants négatifs", () => {
    expect(formatPrice(-1050)).toBe("-10,50 €")
    expect(formatPrice(-100)).toBe("-1,00 €")
  })
})

describe("priceToCentimes", () => {
  it("devrait convertir des euros en centimes", () => {
    expect(priceToCentimes(10.5)).toBe(1050)
    expect(priceToCentimes(1)).toBe(100)
    expect(priceToCentimes(0)).toBe(0)
    expect(priceToCentimes(9.99)).toBe(999)
    expect(priceToCentimes(100)).toBe(10000)
  })

  it("devrait arrondir correctement les valeurs décimales", () => {
    expect(priceToCentimes(10.555)).toBe(1056) // Arrondi à 1056 centimes
    expect(priceToCentimes(10.554)).toBe(1055) // Arrondi à 1055 centimes
    expect(priceToCentimes(0.01)).toBe(1)
    expect(priceToCentimes(0.001)).toBe(0) // Arrondi à 0
    expect(priceToCentimes(0.005)).toBe(1) // Arrondi à 1
  })

  it("devrait gérer les montants négatifs", () => {
    expect(priceToCentimes(-10.5)).toBe(-1050)
    expect(priceToCentimes(-1)).toBe(-100)
    expect(priceToCentimes(-0.01)).toBe(-1)
  })

  it("devrait gérer les grands montants", () => {
    expect(priceToCentimes(1000)).toBe(100000)
    expect(priceToCentimes(1234567.89)).toBe(123456789)
  })
})

describe("centimesToPrice", () => {
  it("devrait convertir des centimes en euros", () => {
    expect(centimesToPrice(1050)).toBe(10.5)
    expect(centimesToPrice(100)).toBe(1)
    expect(centimesToPrice(0)).toBe(0)
    expect(centimesToPrice(999)).toBe(9.99)
    expect(centimesToPrice(10000)).toBe(100)
  })

  it("devrait gérer les centimes partiels", () => {
    expect(centimesToPrice(1)).toBe(0.01)
    expect(centimesToPrice(50)).toBe(0.5)
    expect(centimesToPrice(99)).toBe(0.99)
  })

  it("devrait gérer les montants négatifs", () => {
    expect(centimesToPrice(-1050)).toBe(-10.5)
    expect(centimesToPrice(-100)).toBe(-1)
    expect(centimesToPrice(-1)).toBe(-0.01)
  })

  it("devrait gérer les grands montants", () => {
    expect(centimesToPrice(100000)).toBe(1000)
    expect(centimesToPrice(123456789)).toBe(1234567.89)
  })
})

describe("Cohérence entre les fonctions", () => {
  it("priceToCentimes et centimesToPrice devraient être des fonctions inverses", () => {
    const testValues = [0, 1, 10.5, 99.99, 100, 1234.56]

    testValues.forEach((price) => {
      const centimes = priceToCentimes(price)
      const backToPrice = centimesToPrice(centimes)
      expect(backToPrice).toBeCloseTo(price, 2)
    })
  })

  it("formatPrice devrait être cohérent avec la conversion centimes/euros", () => {
    const testCentimes = [0, 1, 50, 100, 1050, 9999, 100000]

    testCentimes.forEach((centimes) => {
      const euros = centimesToPrice(centimes)
      const formatted = formatPrice(centimes)
      const expectedFormatted = new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
      }).format(euros)
      expect(formatted).toBe(expectedFormatted)
    })
  })
})
