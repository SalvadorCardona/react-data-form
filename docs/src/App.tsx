import { configurePorts } from "react-data-form"
import { DocLayout } from "./DocLayout"
import { currentPageId } from "./pages"
import { OverviewPage } from "./pages/overview"
import { ControllersPage } from "./pages/controllers"
import { FormsPage } from "./pages/forms"
import { ValidationPage } from "./pages/validation"

// The site configures the library, which doubles as a worked example.
configurePorts({ intlLocale: "en-GB", currency: "EUR" })

const pageComponents: Record<string, () => React.JSX.Element> = {
  overview: OverviewPage,
  controllers: ControllersPage,
  forms: FormsPage,
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
