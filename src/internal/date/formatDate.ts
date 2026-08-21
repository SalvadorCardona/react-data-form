import { getPorts } from "@/ports"

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) {
    return "-"
  }

  if (typeof date === "string") {
    date = new Date(date)
  }

  return new Intl.DateTimeFormat(getPorts().intlLocale).format(date)
}

// 08/10/2025 - 14:58
export function formatDateWithOur(date: Date | string | null | undefined): string {
  if (!date) {
    return "-"
  }

  if (typeof date === "string") {
    date = new Date(date)
  }

  return `${new Intl.DateTimeFormat(getPorts().intlLocale).format(date)} - ${date.toLocaleTimeString(
    getPorts().intlLocale,
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  )}`
}

export function getYear(date: Date | string | null | undefined): string {
  if (!date) {
    return "-"
  }

  if (typeof date === "string") {
    date = new Date(date)
  }

  return new Intl.DateTimeFormat("fr", { year: "numeric" }).format(date)
}

// "Naive" time (e.g. opening hours): the value carries an HH:MM label entered
// by a human, with a fake +00:00 offset. It must be displayed as-is, without
// converting it to the browser timezone — otherwise "09:00" would read "11:00"
// in summer.
export function formatTimeLabel(value: string | null | undefined): string {
  if (!value) {
    return "-"
  }

  return value.match(/T(\d{2}:\d{2})/)?.[1] ?? value
}

// output vendredi: 14:55 - 18:33
export function formatDateToDateWithHours(
  value: Date | string | null | undefined
): string {
  const newValue = value ? new Date(value) : undefined

  return newValue
    ? String(newValue.getHours()).padStart(2, "0") +
        ":" +
        String(newValue.getMinutes()).padStart(2, "0")
    : ""
}
