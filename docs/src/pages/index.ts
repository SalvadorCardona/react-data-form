import type { FC } from "react"
import { BookOpen, ListChecks, ShieldCheck, SlidersHorizontal } from "lucide-react"

export interface DocPage {
  id: string
  name: string
  icon: FC<{ className?: string }>
}

/** Every documentation page, in reading order. */
export const pages: DocPage[] = [
  { id: "overview", name: "Overview", icon: BookOpen },
  { id: "controllers", name: "Field controllers", icon: SlidersHorizontal },
  { id: "forms", name: "Building a form", icon: ListChecks },
  { id: "validation", name: "Validation & errors", icon: ShieldCheck },
]

/**
 * The page a link points at.
 *
 * Everything travels in a query parameter rather than a path: a static host has
 * no server to answer `/controllers`, and would return 404.
 */
export const pageHref = (id: string): string => {
  const base = import.meta.env.BASE_URL
  const path = base.endsWith("/") ? base : `${base}/`
  return id === "overview" ? path : `${path}?page=${id}`
}

/** The page the current URL asks for, falling back to the overview. */
export const currentPageId = (): string => {
  if (typeof window === "undefined") return "overview"
  const asked = new URLSearchParams(window.location.search).get("page")
  return pages.some((page) => page.id === asked) ? asked! : "overview"
}
