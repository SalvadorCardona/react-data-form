import { describe, expect, it } from "vitest"
import {
  formatDate,
  formatDateWithOur,
  formatTimeLabel,
  getYear,
} from "./formatDate"

describe("Fonctions de formatage de date", () => {
  // Date fixe pour les tests (1er janvier 2023)
  const testDate = new Date(2023, 0, 1, 14, 30)
  const testDateString = "2023-01-01T14:30:00"

  describe("formatDate", () => {
    it("devrait retourner un tiret si la date est null", () => {
      expect(formatDate(null)).toBe("-")
    })

    it("devrait retourner un tiret si la date est undefined", () => {
      expect(formatDate(undefined)).toBe("-")
    })

    it("devrait formater correctement un objet Date", () => {
      expect(formatDate(testDate)).toBe("01/01/2023")
    })

    it("devrait convertir et formater correctement une chaîne de date", () => {
      expect(formatDate(testDateString)).toBe("01/01/2023")
    })
  })

  describe("formatTimeLabel", () => {
    it("devrait retourner un tiret si la valeur est null ou undefined", () => {
      expect(formatTimeLabel(null)).toBe("-")
      expect(formatTimeLabel(undefined)).toBe("-")
    })

    it("devrait lire l'heure saisie telle quelle, sans conversion de fuseau", () => {
      // Horaire d'ouverture : libellé naïf transporté avec un faux offset UTC.
      expect(formatTimeLabel("1970-01-01T09:00:00+00:00")).toBe("09:00")
      expect(formatTimeLabel("1970-01-01T18:30:00+00:00")).toBe("18:30")
    })
  })

  describe("formatDateWithOur", () => {
    it("devrait retourner un tiret si la date est null", () => {
      expect(formatDateWithOur(null)).toBe("-")
    })

    it("devrait retourner un tiret si la date est undefined", () => {
      expect(formatDateWithOur(undefined)).toBe("-")
    })

    it("devrait formater correctement un objet Date avec l'heure", () => {
      expect(formatDateWithOur(testDate)).toBe("01/01/2023 - 14:30")
    })

    it("devrait convertir et formater correctement une chaîne de date avec l'heure", () => {
      expect(formatDateWithOur(testDateString)).toBe("01/01/2023 - 14:30")
    })
  })

  describe("getYear", () => {
    it("devrait retourner un tiret si la date est null", () => {
      expect(getYear(null)).toBe("-")
    })

    it("devrait retourner un tiret si la date est undefined", () => {
      expect(getYear(undefined)).toBe("-")
    })

    it("devrait extraire correctement l'année d'un objet Date", () => {
      expect(getYear(testDate)).toBe("2023")
    })

    it("devrait convertir et extraire correctement l'année d'une chaîne de date", () => {
      expect(getYear(testDateString)).toBe("2023")
    })
  })
})
