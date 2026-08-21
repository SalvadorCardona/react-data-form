import { translateWithParams } from "@/i18n/translateWithParams"

export type TranslationsBagInterface = Record<string, any>

let translations = {} as TranslationsBagInterface

export const getTranslations = () => translations

export default function translate(
  key: string,
  params?: TranslationsBagInterface
): string {
  let value = translations[key] ? translations[key] : key

  if (params) {
    value = translateWithParams(value, params)
  }

  return value
}

export function setTranslation(newTranslation: TranslationsBagInterface) {
  translations = newTranslation
}

export function addTrans(key: string, value: string) {
  translations[key] = value
}
