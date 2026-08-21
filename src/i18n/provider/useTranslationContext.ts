import { useContext } from "react"
import { TranslationContext } from "@/i18n/provider/TranslationContext"

export default function useTranslationContext() {
  return useContext(TranslationContext)
}
