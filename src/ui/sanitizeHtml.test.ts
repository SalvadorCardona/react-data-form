import { describe, expect, it } from "vitest"
import { sanitizeHtml } from "@/ui/sanitizeHtml"

describe("sanitizeHtml", () => {
  it("removes event handler attributes", () => {
    expect(sanitizeHtml('<img src="x" onerror="alert(1)">')).toBe('<img src="x">')
  })

  it("drops script elements and their content", () => {
    expect(sanitizeHtml("<p>Hi</p><script>alert(1)</script>")).toBe("<p>Hi</p>")
  })

  it.each([
    "javascript:alert(1)",
    " JavaScript:alert(1)",
    "java\tscript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)",
  ])("removes the unsafe href %j", (href) => {
    const html = sanitizeHtml(`<a href="${href.replace(/"/g, "&quot;")}">x</a>`)
    expect(html).toBe("<a>x</a>")
  })

  it("removes an unsafe image src", () => {
    expect(
      sanitizeHtml('<img src="data:image/svg+xml,<svg onload=alert(1)>">')
    ).toBe("<img>")
    expect(sanitizeHtml('<img src="javascript:alert(1)">')).toBe("<img>")
  })

  it.each([
    "https://example.com",
    "http://example.com",
    "mailto:a@example.com",
    "tel:+33123456789",
    "/relative/path",
    "page.html#anchor",
    "//example.com",
  ])("keeps the safe href %j", (href) => {
    expect(sanitizeHtml(`<a href="${href}">x</a>`)).toBe(`<a href="${href}">x</a>`)
  })

  it('adds rel="noopener noreferrer" to target="_blank" links', () => {
    expect(sanitizeHtml('<a href="https://a.b" target="_blank">x</a>')).toBe(
      '<a href="https://a.b" target="_blank" rel="noopener noreferrer">x</a>'
    )
    expect(
      sanitizeHtml('<a href="https://a.b" target="_blank" rel="nofollow">x</a>')
    ).toBe(
      '<a href="https://a.b" target="_blank" rel="nofollow noopener noreferrer">x</a>'
    )
  })
})
