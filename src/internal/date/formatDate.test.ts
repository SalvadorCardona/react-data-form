import { describe, expect, it } from "vitest"
import {
  formatDate,
  formatDateWithOur,
  formatTimeLabel,
  getYear,
} from "./formatDate"

describe("Date formatting helpers", () => {
  // Date fixe pour les tests (1er janvier 2023)
  const testDate = new Date(2023, 0, 1, 14, 30)
  const testDateString = "2023-01-01T14:30:00"

  describe("formatDate", () => {
    it("returns a dash when the date is null", () => {
      expect(formatDate(null)).toBe("-")
    })

    it("returns a dash when the date is undefined", () => {
      expect(formatDate(undefined)).toBe("-")
    })

    it("formats a Date object", () => {
      expect(formatDate(testDate)).toBe("01/01/2023")
    })

    it("formats a date string", () => {
      expect(formatDate(testDateString)).toBe("01/01/2023")
    })
  })

  describe("formatTimeLabel", () => {
    it("returns a dash when the value is null or undefined", () => {
      expect(formatTimeLabel(null)).toBe("-")
      expect(formatTimeLabel(undefined)).toBe("-")
    })

    it("reads the entered time as-is, without timezone conversion", () => {
      // Opening hours: a naive label carried with a fake UTC offset.
      expect(formatTimeLabel("1970-01-01T09:00:00+00:00")).toBe("09:00")
      expect(formatTimeLabel("1970-01-01T18:30:00+00:00")).toBe("18:30")
    })
  })

  describe("formatDateWithOur", () => {
    it("returns a dash when the date is null", () => {
      expect(formatDateWithOur(null)).toBe("-")
    })

    it("returns a dash when the date is undefined", () => {
      expect(formatDateWithOur(undefined)).toBe("-")
    })

    it("formats a Date object including the time", () => {
      expect(formatDateWithOur(testDate)).toBe("01/01/2023 - 14:30")
    })

    it("formats a date string including the time", () => {
      expect(formatDateWithOur(testDateString)).toBe("01/01/2023 - 14:30")
    })
  })

  describe("getYear", () => {
    it("returns a dash when the date is null", () => {
      expect(getYear(null)).toBe("-")
    })

    it("returns a dash when the date is undefined", () => {
      expect(getYear(undefined)).toBe("-")
    })

    it("extracts the year from a Date object", () => {
      expect(getYear(testDate)).toBe("2023")
    })

    it("extracts the year from a date string", () => {
      expect(getYear(testDateString)).toBe("2023")
    })
  })
})
