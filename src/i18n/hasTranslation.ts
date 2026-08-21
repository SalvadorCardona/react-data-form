import { getTranslations } from "@/i18n/translate"

export function hasTranslation(key: string): boolean {
  key = key.toLowerCase()

  return !!getTranslations()[key]
}
