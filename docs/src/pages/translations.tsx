import { fr, translationKeys } from "react-data-form/i18n"
import { CodeBlock, PageHeader, Section } from "../DocLayout"

export function TranslationsPage() {
  return (
    <>
      <PageHeader
        title="Translations"
        intro="Every label the library displays is plain English, and goes through react-mini-i18n — so it reads fine with no dictionary, and follows yours when there is one."
      />

      <Section
        title="French, ready to use"
        intro="react-data-form/i18n ships a French dictionary covering every key."
      >
        <CodeBlock>{useFr}</CodeBlock>
        <p>
          <code>setTranslation</code> replaces the whole dictionary: spread{" "}
          <code>fr</code> under your own keys rather than calling it twice. Any entry
          of yours wins over the one shipped.
        </p>
      </Section>

      <Section
        title="Every key"
        intro="translationKeys lists them all, so your own dictionary can be checked against it instead of against the components."
      >
        <CodeBlock>{checkKeys}</CodeBlock>
        <p>
          A key is the English text itself; <code>{"{{min}}"}</code>-style
          placeholders are filled in after translation, so keep them in yours. Your
          own labels — field labels, options, <code>label.submit</code> — are
          translated the same way, under whatever key you wrote.
        </p>
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Key (English)</th>
                <th className="px-3 py-2 font-medium">fr</th>
              </tr>
            </thead>
            <tbody>
              {translationKeys.map((key) => (
                <tr key={key} className="border-t border-border">
                  <td className="px-3 py-1.5">
                    <code>{key}</code>
                  </td>
                  <td className="px-3 py-1.5">{fr[key]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  )
}

const useFr = `import { setTranslation } from "react-mini-i18n"
import { fr } from "react-data-form/i18n"

setTranslation({
  ...fr,
  // your application's own keys
  "My profile": "Mon profil",
})`

const checkKeys = `import { translationKeys } from "react-data-form/i18n"
import { messages } from "./messages"

it("translates every key of react-data-form", () => {
  const missing = translationKeys.filter((key) => !messages[key])
  expect(missing).toEqual([])
})`
