import { useEffect } from "react"
import { configurePorts } from "react-data-form"
import { DocLayout } from "./DocLayout"
import { canonicalUrl, currentPageId, pages, pageTitle, type DocPage } from "./pages"
import { OverviewPage } from "./pages/overview"
import { ControllersPage } from "./pages/controllers"
import { FormsPage } from "./pages/forms"
import { MultiFormsPage } from "./pages/multi-forms"
import { ValidationPage } from "./pages/validation"
import { TranslationsPage } from "./pages/translations"

// The site configures the library, which doubles as a worked example.
configurePorts({ intlLocale: "en-GB", currency: "EUR" })

const pageComponents: Record<string, () => React.JSX.Element> = {
  overview: OverviewPage,
  controllers: ControllersPage,
  forms: FormsPage,
  "multi-forms": MultiFormsPage,
  validation: ValidationPage,
  translations: TranslationsPage,
}

/** The head element `selector` names, created with `attributes` if missing. */
const setHead = (
  selector: string,
  tag: string,
  attributes: Record<string, string>
) => {
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.head.appendChild(document.createElement(tag))
    for (const [name, value] of Object.entries(attributes)) {
      element.setAttribute(name, value)
    }
  }
  return element
}

/**
 * Gives the document the title, description, canonical and share URLs of the
 * page shown. index.html carries those of the overview; every page is the same
 * file, so without this they would all claim to be the overview.
 */
const describePage = (page: DocPage) => {
  const title = pageTitle(page)
  const url = canonicalUrl(page.id)
  document.title = title
  setHead('link[rel="canonical"]', "link", { rel: "canonical" }).setAttribute(
    "href",
    url
  )
  const metas: [string, string, string][] = [
    ["name", "description", page.description],
    ["property", "og:url", url],
    ["property", "og:title", title],
    ["property", "og:description", page.description],
    ["name", "twitter:title", title],
    ["name", "twitter:description", page.description],
  ]
  for (const [key, name, content] of metas) {
    setHead(`meta[${key}="${name}"]`, "meta", { [key]: name }).setAttribute(
      "content",
      content
    )
  }
}

/**
 * Picks the page the URL asks for.
 *
 * Navigation is plain anchors carrying a query parameter, so a static host
 * answers every one of them with the same real file.
 */
export function App() {
  const id = currentPageId()
  const Page = pageComponents[id] ?? OverviewPage

  useEffect(() => describePage(pages.find((page) => page.id === id)!), [id])

  return (
    <DocLayout>
      <Page />
    </DocLayout>
  )
}
