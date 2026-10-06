import { afterEach, describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as library from "react-data-form"
import * as media from "react-data-form/media"
import { App } from "./App"

/**
 * The site is a live demonstration, so it is worth checking it renders: a page
 * that merely builds proves nothing about whether it runs.
 */
const renderAt = (search: string) => {
  vi.stubGlobal("location", { ...window.location, search, pathname: "/" })
  return render(<App />)
}

/**
 * Every controller the library ships, read off its entry points rather than
 * listed by hand: a new one fails the gallery test until it is shown there.
 */
const exportedControllers = Object.entries({ ...library, ...media })
  .filter(
    ([name, value]) =>
      /^[A-Z]\w*InputController$/.test(name) && typeof value === "function"
  )
  .map(([name]) => name)

describe("the documentation site", () => {
  afterEach(() => document.documentElement.classList.remove("dark"))

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

  it("shows every controller the library exports in the gallery", () => {
    const { container } = renderAt("?page=controllers")

    expect(exportedControllers).toContain("PasswordInputController")
    expect(exportedControllers).toContain("MediaObjectInputController")

    const shown = [...container.querySelectorAll("article[id]")].map(
      (article) => article.id
    )
    expect(exportedControllers.filter((name) => !shown.includes(name))).toEqual([])
  })

  it("shows each controller with how to declare it and in its states", () => {
    renderAt("?page=controllers")
    const password = document.getElementById("PasswordInputController")!

    expect(
      within(password).getByText("controller: PasswordInputController")
    ).toBeInTheDocument()
    expect(within(password).getByText(/inputs: \{/)).toBeInTheDocument()
    for (const state of ["Empty", "Filled", "Error"]) {
      expect(within(password).getByText(state)).toBeInTheDocument()
    }
    expect(
      within(password).getByText("This value is not valid.")
    ).toBeInTheDocument()

    // A controller that honours `readonly` is shown that way too.
    const email = document.getElementById("EmailInputController")!
    expect(within(email).getByText("Read-only")).toBeInTheDocument()
  })

  it("renders the controller gallery in the dark theme as well", () => {
    // The library's dark palette hangs off a class on the root element.
    document.documentElement.classList.add("dark")
    renderAt("?page=controllers")

    expect(
      screen.getByRole("heading", { name: "Field controllers", level: 1 })
    ).toBeInTheDocument()
    expect(document.getElementById("PasswordInputController")).toBeInTheDocument()

    // The page offers the way back, and takes it.
    fireEvent.click(screen.getByText("Light theme"))
    expect(document.documentElement).not.toHaveClass("dark")
  })

  it("renders the form-building page", () => {
    renderAt("?page=forms")
    expect(
      screen.getByRole("heading", { name: "Building a form", level: 1 })
    ).toBeInTheDocument()
  })

  it("renders the asymmetric-form demo, one block per shape", () => {
    renderAt("?page=multi-forms")
    expect(
      screen.getByRole("heading", { name: "Asymmetric forms", level: 1 })
    ).toBeInTheDocument()

    // Each entry of the array is rendered by the form its `type` points at, so
    // the three registered shapes name the three blocks on screen.
    expect(screen.getAllByText("Title").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Rich text").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Gallery").length).toBeGreaterThan(0)

    // Their fields differ, which is the whole point of the page.
    expect(screen.getByText("Your title")).toBeInTheDocument()
    expect(screen.getByText("Images")).toBeInTheDocument()

    // The palette is there to insert a fourth one.
    expect(screen.getByRole("button", { name: /Add a block/ })).toBeInTheDocument()

    // And the data panel follows the array, type tag included.
    expect(screen.getByText(/"type": "gallery"/)).toBeInTheDocument()
  })

  it("inserts a block from the palette, and the data panel follows", async () => {
    const user = userEvent.setup()
    renderAt("?page=multi-forms")

    await user.click(screen.getByRole("button", { name: /Add a block/ }))

    // The palette offers one entry per tag the field was given.
    const palette = await screen.findByRole("dialog")
    for (const shape of ["Title", "Rich text", "Gallery"]) {
      expect(
        within(palette).getByRole("button", { name: shape })
      ).toBeInTheDocument()
    }

    await user.click(within(palette).getByRole("button", { name: "Gallery" }))

    // The new entry carries the type it was created from, so the array now
    // holds two galleries, and the data shown next to the form says so.
    const data = JSON.parse(screen.getByTestId("form-data").textContent ?? "{}")
    expect(
      data.blocks.filter((b: { type: string }) => b.type === "gallery")
    ).toHaveLength(2)
    expect(data.blocks).toHaveLength(4)
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
