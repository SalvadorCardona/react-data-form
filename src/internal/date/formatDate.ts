export function formatDate(date: Date | string | null | undefined): string {
  if (!date) {
    return "-"
  }

  if (typeof date === "string") {
    date = new Date(date)
  }

  return new Intl.DateTimeFormat("fr").format(date)
}

// 08/10/2025 - 14:58
export function formatDateWithOur(date: Date | string | null | undefined): string {
  if (!date) {
    return "-"
  }

  if (typeof date === "string") {
    date = new Date(date)
  }

  return `${new Intl.DateTimeFormat("fr").format(date)} - ${date.toLocaleTimeString(
    "fr",
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

// Heure « naïve » (ex. horaires d'ouverture) : la valeur transporte le libellé
// HH:MM saisi par le pro avec un faux offset +00:00. Il faut l'afficher tel
// quel, sans le convertir dans le fuseau du navigateur (sinon « 09:00 » saisi
// devient « 11:00 » affiché en été).
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
