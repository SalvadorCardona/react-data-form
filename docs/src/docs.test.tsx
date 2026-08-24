import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { App } from "./App"

/**
 * The site is a live demonstration, so it is worth checking it renders: a page
 * that merely builds proves nothing about whether it runs.
 */
const renderAt = (search: string) => {
  vi.stubGlobal("location", { ...window.location, search, pathname: "/" })
  return render(<App />)
}

describe("the documentation site", () => {
  it("renders the overview by default", () => {
    renderAt("")
    expect(
      screen.getByRole("heading", { name: "react-data-form", level: 1 })
    ).toBeInTheDocument()
  })

  it("renders the controller gallery, with live fields", () => {
    renderAt("?page=controllers")
    expect(
      screen.getByRole("heading", { name: "Field controllers", level: 1 })
    ).toBeInTheDocument()
    // Each demo renders a real form, so its labels are in the document.
    expect(screen.getAllByText("SelectInputController").length).toBeGreaterThan(0)
  })

  it("renders the form-building page", () => {
    renderAt("?page=forms")
    expect(
      screen.getByRole("heading", { name: "Building a form", level: 1 })
    ).toBeInTheDocument()
  })

  it("renders the validation page and its live example", () => {
    renderAt("?page=validation")
    expect(
      screen.getByRole("heading", { name: "Validation & errors", level: 1 })
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Book/ })).toBeInTheDocument()
  })

  it("falls back to the overview for an unknown page", () => {
    renderAt("?page=nonsense")
    expect(
      screen.getByRole("heading", { name: "react-data-form", level: 1 })
    ).toBeInTheDocument()
  })

  it("links every page through the query parameter", () => {
    renderAt("")
    const link = screen.getAllByRole("link", { name: /Field controllers/ })[0]
    expect(link).toHaveAttribute("href", expect.stringContaining("page=controllers"))
  })
})
