import { describe, expect, it } from "vitest"
import { fallbackEndTime, selectionFromDuration } from "./DateRangeInputController"

describe("selectionFromDuration", () => {
  it("adds the duration (in seconds) to the start date", () => {
    const start = new Date(2026, 5, 15, 9, 0, 0) // 15 juin 2026 09:00
    const result = selectionFromDuration(start, 3600) // +1h

    expect(result.date?.getHours()).toBe(10)
    expect(result.date?.getMinutes()).toBe(0)
    expect(result.hour).toBe("10")
    expect(result.minute).toBe("00")
  })

  it("handles durations with minutes", () => {
    const start = new Date(2026, 5, 15, 9, 0, 0)
    const result = selectionFromDuration(start, 1800) // +30min

    expect(result.date?.getHours()).toBe(9)
    expect(result.date?.getMinutes()).toBe(30)
    expect(result.hour).toBe("09")
    expect(result.minute).toBe("30")
  })

  it("crosses over to the next day when needed", () => {
    const start = new Date(2026, 5, 15, 23, 30, 0)
    const result = selectionFromDuration(start, 3600) // +1h => lendemain 00:30

    expect(result.date?.getDate()).toBe(16)
    expect(result.date?.getHours()).toBe(0)
    expect(result.minute).toBe("30")
  })
})

describe("fallbackEndTime", () => {
  it("derives the end time from the duration while nothing is entered", () => {
    expect(fallbackEndTime({ hour: "09", minute: "00" }, 14400)).toEqual({
      hour: "13",
      minute: "00",
    })
  })

  it("handles durations with minutes", () => {
    expect(fallbackEndTime({ hour: "09", minute: "30" }, 1800)).toEqual({
      hour: "10",
      minute: "00",
    })
  })

  it("falls back to the end of day without a usable duration", () => {
    expect(fallbackEndTime({ hour: "09", minute: "00" }, Number.NaN)).toEqual({
      hour: "17",
      minute: "00",
    })
    expect(fallbackEndTime({ hour: "09", minute: "00" }, 0)).toEqual({
      hour: "17",
      minute: "00",
    })
  })

  it("falls back to the end of day when the duration overflows it", () => {
    expect(fallbackEndTime({ hour: "22", minute: "00" }, 3 * 3600)).toEqual({
      hour: "17",
      minute: "00",
    })
  })
})
