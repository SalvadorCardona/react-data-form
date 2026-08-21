import { ReactNode, useEffect, useRef, useState } from "react"
import translate, {
  setTranslation,
  TranslationsBagInterface,
} from "@/i18n/translate"
import { TranslationContext } from "@/i18n/provider/TranslationContext"

interface ElemPropsInterface {
  children: ReactNode
  provider?: () => Promise<TranslationsBagInterface>
}

export const TranslationProvider = ({ children, provider }: ElemPropsInterface) => {
  const [translations, setTranslations] = useState<TranslationsBagInterface | null>(
    null
  )

  const hasFetched = useRef(false)

  const updateTranslations = () => {
    if (!provider) return
    provider()
      .then((data) => {
        setTranslation(data)
        setTranslations(data)
      })
      .catch(() => setTranslations({}))
  }

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    updateTranslations()
  }, [provider])

  if (translations === null) return null

  return (
    <TranslationContext.Provider
      value={{ translations, updateTranslations, translate }}
    >
      {children}
    </TranslationContext.Provider>
  )
}
