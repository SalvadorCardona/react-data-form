import type { FC } from "react"
import {
  Blocks,
  BookOpen,
  ListChecks,
  Languages,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react"

export interface DocPage {
  id: string
  name: string
  /** What the page is about, for search results and link previews. */
  description: string
  icon: FC<{ className?: string }>
}

/** Every documentation page, in reading order. */
export const pages: DocPage[] = [
  {
    id: "overview",
    name: "Overview",
    description:
      "Describe a form as an object; react-data-form renders the fields, holds the state, validates, and reports API errors. Try every field controller live.",
    icon: BookOpen,
  },
  {
    id: "controllers",
    name: "Field controllers",
    description:
      "Every built-in react-data-form input controller, running live: how to declare it, empty, filled, in error and read-only.",
    icon: SlidersHorizontal,
  },
  {
    id: "forms",
    name: "Building a form",
    description:
      "Build a react-data-form form: fields, conditional fields, groups, steps, submission and unsaved changes.",
    icon: ListChecks,
  },
  {
    id: "multi-forms",
    name: "Asymmetric forms",
    description:
      "One array field whose entries take different shapes: each entry is rendered by the form its type points at.",
    icon: Blocks,
  },
  {
    id: "validation",
    name: "Validation & errors",
    description:
      "Per-field validation rules in react-data-form, and the violations an API sends back shown under their fields.",
    icon: ShieldCheck,
  },
  {
    id: "translations",
    name: "Translations",
    description:
      "Translate react-data-form with react-mini-i18n: the French dictionary it ships and every key it uses.",
    icon: Languages,
  },
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

/**
 * Where the site is canonically served. It is also served from
 * hermez-agency.github.io: canonical and share URLs name this one, whatever
 * DOCS_BASE the build was given.
 */
export const siteUrl = "https://hermez.dev/react-data-form/"

/** The absolute URL search engines should index a page under. */
export const canonicalUrl = (id: string): string =>
  id === "overview" ? siteUrl : `${siteUrl}?page=${id}`

/** The document title of a page. */
export const pageTitle = (page: DocPage): string =>
  page.id === "overview"
    ? "react-data-form — data-driven React forms"
    : `${page.name} — react-data-form`

/**
 * The sitemap, built off the page list at build time so that a new page cannot
 * be left out of it.
 */
export const sitemap = (): string =>
  [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...pages.map((page) => `  <url><loc>${canonicalUrl(page.id)}</loc></url>`),
    `</urlset>`,
    "",
  ].join("\n")
