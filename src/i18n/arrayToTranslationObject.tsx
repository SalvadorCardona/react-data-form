import { TranslationsBagInterface } from "@/i18n/translate"

interface TranslationsInterface {
  languageCode?: string
  key: string | null
  value: string | null
}

export function arrayToTranslationObject(
  newTranslations: TranslationsInterface[]
): TranslationsBagInterface {
  const translations = {}

  newTranslations.forEach((e) => {
    if (!e.key || !e.value) return

    // @ts-expect-error is the string
    translations[e.key as string] = e.value as string
  })

  return translations
}
