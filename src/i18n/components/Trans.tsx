import { ReactNode } from "react"
import useTranslationContext from "@/i18n/provider/useTranslationContext"
import translate from "@/i18n/translate"

export interface TransPropsInterface {
  params?: Record<string, any>
  children?: ReactNode | string
  className?: string
}

export function Trans({ children, params, className }: TransPropsInterface) {
  const translateContext = useTranslationContext()
  if (!children) return

  const trans = translateContext ? translateContext.translate : translate

  const content = trans(children as string, params)
  if (isValidHtml(content)) {
    return <div dangerouslySetInnerHTML={{ __html: content }} />
  }
  if (className) {
    return <span className={className}>{trans(children as string, params)}</span>
  }

  return <>{trans(children as string, params)}</>
}

const isValidHtml = (str: string): boolean => {
  const regex = /^<([a-z]+)([^<]+)*(?:>(.*)<\/\1>|\s+\/>)$/i
  if (!regex.test(str)) {
    return false
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(str, "text/html")
  return doc.body.firstChild !== null
}
