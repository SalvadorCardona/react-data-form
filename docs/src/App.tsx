import { configurePorts } from "react-data-form"
import { setTranslation } from "react-mini-i18n"
import { DocLayout } from "./DocLayout"
import { currentPageId } from "./pages"
import { OverviewPage } from "./pages/overview"
import { ControllersPage } from "./pages/controllers"
import { FormsPage } from "./pages/forms"
import { MultiFormsPage } from "./pages/multi-forms"
import { ValidationPage } from "./pages/validation"

// The site configures the library, which doubles as a worked example.
configurePorts({ intlLocale: "en-GB", currency: "EUR" })

// The labels the components ship are translation keys: untranslated, they read
// as `form.array.add` on screen. The site provides the English dictionary.
setTranslation({
  drag: "Drag",
  order: "Order",
  remove: "Remove",
  "form.array.add": "Add a block",
  "form.array.add.title": "Add a block",
  "form.array.add.description": "Pick the shape this entry takes.",
})

const pageComponents: Record<string, () => React.JSX.Element> = {
  overview: OverviewPage,
  controllers: ControllersPage,
  forms: FormsPage,
  "multi-forms": MultiFormsPage,
  validation: ValidationPage,
}

/**
 * Picks the page the URL asks for.
 *
 * Navigation is plain anchors carrying a query parameter, so a static host
 * answers every one of them with the same real file.
 */
export function App() {
  const Page = pageComponents[currentPageId()] ?? OverviewPage

  return (
    <DocLayout>
      <Page />
    </DocLayout>
  )
}
