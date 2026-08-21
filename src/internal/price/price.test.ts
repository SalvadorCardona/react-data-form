import { describe, expect, it } from "vitest"
import { centimesToPrice, formatPrice, priceToCentimes } from "./price"

describe("formatPrice", () => {
  it("formats a price in cents into a string using the configured locale", () => {
    expect(formatPrice(1050)).toBe("10,50 €")
    expect(formatPrice(100)).toBe("1,00 €")
    expect(formatPrice(0)).toBe("0,00 €")
    expect(formatPrice(999)).toBe("9,99 €")
    expect(formatPrice(10000)).toBe("100,00 €")
  })

  it("formats a price with fractional cents", () => {
    expect(formatPrice(1)).toBe("0,01 €")
    expect(formatPrice(50)).toBe("0,50 €")
    expect(formatPrice(99)).toBe("0,99 €")
  })

  it("handles large amounts", () => {
    expect(formatPrice(100000)).toBe("1 000,00 €")
    expect(formatPrice(1000000)).toBe("10 000,00 €")
    expect(formatPrice(123456789)).toBe("1 234 567,89 €")
  })

  it("works with different locales", () => {
    expect(formatPrice(1050, "en-US")).toBe("€10.50")
    expect(formatPrice(1050, "de-DE")).toBe("10,50 €")
    expect(formatPrice(1050, "fr-FR")).toBe("10,50 €")
  })

  it("handles negative amounts", () => {
    expect(formatPrice(-1050)).toBe("-10,50 €")
    expect(formatPrice(-100)).toBe("-1,00 €")
  })
})

describe("priceToCentimes", () => {
  it("converts euros into cents", () => {
    expect(priceToCentimes(10.5)).toBe(1050)
    expect(priceToCentimes(1)).toBe(100)
    expect(priceToCentimes(0)).toBe(0)
    expect(priceToCentimes(9.99)).toBe(999)
    expect(priceToCentimes(100)).toBe(10000)
  })

  it("rounds decimal values correctly", () => {
    expect(priceToCentimes(10.555)).toBe(1056) // rounded to 1056 cents
    expect(priceToCentimes(10.554)).toBe(1055) // rounded to 1055 cents
    expect(priceToCentimes(0.01)).toBe(1)
    expect(priceToCentimes(0.001)).toBe(0) // rounded to 0
    expect(priceToCentimes(0.005)).toBe(1) // rounded to 1
  })

  it("handles negative amounts", () => {
    expect(priceToCentimes(-10.5)).toBe(-1050)
    expect(priceToCentimes(-1)).toBe(-100)
    expect(priceToCentimes(-0.01)).toBe(-1)
  })

  it("handles large amounts", () => {
    expect(priceToCentimes(1000)).toBe(100000)
    expect(priceToCentimes(1234567.89)).toBe(123456789)
  })
})

describe("centimesToPrice", () => {
  it("converts cents into euros", () => {
    expect(centimesToPrice(1050)).toBe(10.5)
    expect(centimesToPrice(100)).toBe(1)
    expect(centimesToPrice(0)).toBe(0)
    expect(centimesToPrice(999)).toBe(9.99)
    expect(centimesToPrice(10000)).toBe(100)
  })

  it("handles partial cents", () => {
    expect(centimesToPrice(1)).toBe(0.01)
    expect(centimesToPrice(50)).toBe(0.5)
    expect(centimesToPrice(99)).toBe(0.99)
  })

  it("handles negative amounts", () => {
    expect(centimesToPrice(-1050)).toBe(-10.5)
    expect(centimesToPrice(-100)).toBe(-1)
    expect(centimesToPrice(-1)).toBe(-0.01)
  })

  it("handles large amounts", () => {
    expect(centimesToPrice(100000)).toBe(1000)
    expect(centimesToPrice(123456789)).toBe(1234567.89)
  })
})

describe("Consistency between the functions", () => {
  it("priceToCentimes and centimesToPrice are inverse functions", () => {
    const testValues = [0, 1, 10.5, 99.99, 100, 1234.56]

    testValues.forEach((price) => {
      const centimes = priceToCentimes(price)
      const backToPrice = centimesToPrice(centimes)
      expect(backToPrice).toBeCloseTo(price, 2)
    })
  })

  it("formatPrice stays consistent with the cents/euros conversion", () => {
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
