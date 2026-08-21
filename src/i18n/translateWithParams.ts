import { TranslationsBagInterface } from "@/i18n/translate"

export function translateWithParams(
  text: string,
  params: TranslationsBagInterface
): string {
  const regex = /\{\{(.*?)}}/g

  return text.replace(regex, (match, key) => {
    if (params[key]) {
      return params[key]
    }
    return match
  })
}
