import type { ReactNode } from "react"

export function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-8 border-t border-border py-12 first:border-t-0 first:pt-0">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="prose-docs mt-4 max-w-2xl">{children}</div>
    </section>
  )
}

export function CodeBlock({
  children,
  language = "ts",
}: {
  children: string
  language?: string
}) {
  return (
    <pre
      data-language={language}
      className="not-prose my-4 overflow-x-auto rounded-lg border border-border bg-muted/60 p-4 text-sm leading-relaxed"
    >
      <code>{children}</code>
    </pre>
  )
}
