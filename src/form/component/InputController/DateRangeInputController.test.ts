import { describe, expect, it } from "vitest"
import { fallbackEndTime, selectionFromDuration } from "./DateRangeInputController"

describe("selectionFromDuration", () => {
  it("ajoute la durée (en secondes) à la date de début", () => {
    const start = new Date(2026, 5, 15, 9, 0, 0) // 15 juin 2026 09:00
    const result = selectionFromDuration(start, 3600) // +1h

    expect(result.date?.getHours()).toBe(10)
    expect(result.date?.getMinutes()).toBe(0)
    expect(result.hour).toBe("10")
    expect(result.minute).toBe("00")
  })

  it("gère les durées avec minutes", () => {
    const start = new Date(2026, 5, 15, 9, 0, 0)
    const result = selectionFromDuration(start, 1800) // +30min

    expect(result.date?.getHours()).toBe(9)
    expect(result.date?.getMinutes()).toBe(30)
    expect(result.hour).toBe("09")
    expect(result.minute).toBe("30")
  })

  it("franchit le changement de jour si nécessaire", () => {
    const start = new Date(2026, 5, 15, 23, 30, 0)
    const result = selectionFromDuration(start, 3600) // +1h => lendemain 00:30

    expect(result.date?.getDate()).toBe(16)
    expect(result.date?.getHours()).toBe(0)
    expect(result.minute).toBe("30")
  })
})

describe("fallbackEndTime", () => {
  it("déduit l'horaire de fin de la durée quand rien n'est saisi", () => {
    expect(fallbackEndTime({ hour: "09", minute: "00" }, 14400)).toEqual({
      hour: "13",
      minute: "00",
    })
  })

  it("gère les durées avec minutes", () => {
    expect(fallbackEndTime({ hour: "09", minute: "30" }, 1800)).toEqual({
      hour: "10",
      minute: "00",
    })
  })

  it("retombe sur la fin de journée sans durée exploitable", () => {
    expect(fallbackEndTime({ hour: "09", minute: "00" }, Number.NaN)).toEqual({
      hour: "17",
      minute: "00",
    })
    expect(fallbackEndTime({ hour: "09", minute: "00" }, 0)).toEqual({
      hour: "17",
      minute: "00",
    })
  })

  it("retombe sur la fin de journée si la durée déborde du jour", () => {
    expect(fallbackEndTime({ hour: "22", minute: "00" }, 3 * 3600)).toEqual({
      hour: "17",
      minute: "00",
    })
  })
})
