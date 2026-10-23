import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import * as library from "react-data-form"
import * as media from "react-data-form/media"
import { fr, translationKeys } from "react-data-form/i18n"
import { getTranslations } from "react-mini-i18n"
import { App } from "./App"
import { canonicalUrl, pages, pageTitle, sitemap } from "./pages"

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

/**
 * What a reader sees or hears off the page: text outside the code samples, and
 * the accessible names and placeholders.
 */
const visibleStrings = (root: HTMLElement): string[] => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const texts: string[] = []
  while (walker.nextNode()) {
    const node = walker.currentNode
    if (node.parentElement?.closest("pre, code")) continue
    texts.push(node.textContent ?? "")
  }
  const attributes = [
    ...root.querySelectorAll("[aria-label], [placeholder]"),
  ].flatMap((element) => [
    element.getAttribute("aria-label") ?? "",
    element.getAttribute("placeholder") ?? "",
  ])
  return [...texts, ...attributes].map((text) => text.trim()).filter(Boolean)
}

/** A translation key left as is: `form.array.add`, `drag`, `create`… */
const looksLikeKey = (text: string) =>
  /^[a-z]+([._][a-z]+)+$/.test(text) ||
  ["drag", "order", "collapse", "expand", "remove", "create", "update"].includes(
    text
  )

/** What the head of the document says the page shown is. */
const describedAs = () => ({
  title: document.title,
  canonical: [...document.head.querySelectorAll('link[rel="canonical"]')].map(
    (link) => link.getAttribute("href")
  ),
  url: document.head
    .querySelector('meta[property="og:url"]')
    ?.getAttribute("content"),
  description: document.head
    .querySelector('meta[name="description"]')
    ?.getAttribute("content"),
})

/** What it should say for the page `id`. */
const described = (id: string) => {
  const page = pages.find((item) => item.id === id)!
  return {
    title: pageTitle(page),
    canonical: [canonicalUrl(id)],
    url: canonicalUrl(id),
    description: page.description,
  }
}

describe("the documentation site", () => {
  afterEach(() => document.documentElement.classList.remove("dark"))

  it("renders the overview by default", () => {
    renderAt("")
    expect(
      screen.getByRole("heading", { name: "react-data-form", level: 1 })
    ).toBeInTheDocument()
  })

  describe("the controller gallery", () => {
    // The gallery renders every controller, which is by far the slowest page:
    // it is rendered once for all the tests below rather than once per test.
    // It is mounted outside Testing Library so that its cleanup after each test
    // leaves it in place. A couple of seconds usually, but far more on a loaded
    // machine: the hook gets a generous timeout of its own.
    let gallery: HTMLElement
    let root: Root

    beforeAll(() => {
      vi.stubGlobal("location", {
        ...window.location,
        search: "?page=controllers",
        pathname: "/",
      })
      gallery = document.body.appendChild(document.createElement("div"))
      root = createRoot(gallery)
      act(() => root.render(<App />))
    }, 120_000)

    afterAll(() => {
      act(() => root.unmount())
      gallery.remove()
    })

    it("gives the gallery its own canonical, title and share URL", () => {
      expect(describedAs()).toEqual(described("controllers"))
    })

    it("renders the controller gallery, with live fields", () => {
      expect(
        within(gallery).getByRole("heading", { name: "Field controllers", level: 1 })
      ).toBeInTheDocument()
      // Each demo renders a real form, so its labels are in the document.
      expect(
        within(gallery).getAllByText("SelectInputController").length
      ).toBeGreaterThan(0)
    })

    it("shows every controller the library exports in the gallery", () => {
      expect(exportedControllers).toContain("PasswordInputController")
      expect(exportedControllers).toContain("MediaObjectInputController")

      const shown = [...gallery.querySelectorAll("article[id]")].map(
        (article) => article.id
      )
      expect(exportedControllers.filter((name) => !shown.includes(name))).toEqual([])
    })

    it("shows each controller with how to declare it and in its states", () => {
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

    it("shows no translation key on screen, with no dictionary loaded", () => {
      // The site loads none: what it shows is what an application gets by default.
      expect(getTranslations()).toEqual({})
      expect(visibleStrings(gallery).filter(looksLikeKey)).toEqual([])
    })

    it("names every button of the gallery, icon-only ones included", async () => {
      // The rich text editor is loaded lazily: its toolbar comes in last. Role
      // queries are too slow on a page this size, hence the selectors.
      const named = (name: string) =>
        gallery.querySelectorAll(`button[aria-label="${name}"]`)
      await waitFor(() => expect(named("Undo")).not.toHaveLength(0), {
        timeout: 15_000,
      })

      expect(named("Clear the date")).not.toHaveLength(0)
      expect(named("Clear the selection")).not.toHaveLength(0)

      // Text, `aria-label`, `aria-labelledby` or a `<label for>` name a button.
      const unnamed = [
        ...gallery.querySelectorAll("button, [role='button']"),
      ].filter(
        (button) =>
          !button.textContent?.trim() &&
          !button.getAttribute("aria-label")?.trim() &&
          !button.getAttribute("aria-labelledby") &&
          !(button.id && gallery.querySelector(`label[for="${button.id}"]`))
      )
      expect(unnamed.map((button) => button.outerHTML)).toEqual([])
    })

    it("switches the controller gallery to the dark theme and back", () => {
      // The library's dark palette hangs off a class on the root element.
      act(() => fireEvent.click(within(gallery).getByText("Dark theme")))
      expect(document.documentElement).toHaveClass("dark")
      expect(document.getElementById("PasswordInputController")).toBeInTheDocument()

      // The page offers the way back, and takes it.
      act(() => fireEvent.click(within(gallery).getByText("Light theme")))
      expect(document.documentElement).not.toHaveClass("dark")
    })
  })

  it("shows no translation key in the block palette, with no dictionary loaded", async () => {
    expect(getTranslations()).toEqual({})
    const user = userEvent.setup()

    renderAt("?page=multi-forms")
    await user.click(screen.getByRole("button", { name: "Add a block" }))
    // The block palette is not part of the gallery: its title and description.
    const palette = await screen.findByRole("dialog")
    expect(
      within(palette).getByText("Pick the shape this entry takes.")
    ).toBeVisible()
    expect(visibleStrings(palette).filter(looksLikeKey)).toEqual([])
  })

  it("renders the form-building page", () => {
    renderAt("?page=forms")
    expect(
      screen.getByRole("heading", { name: "Building a form", level: 1 })
    ).toBeInTheDocument()
  })

  it("hides the company of a private customer, and submits without it", async () => {
    renderAt("?page=forms")
    const example = screen
      .getByText("Switch the customer type")
      .closest("div") as HTMLElement

    expect(
      within(example)
        .getByLabelText(/Company/)
        .closest(".hidden")
    ).not.toBeNull()

    fireEvent.click(within(example).getByRole("button", { name: "Save" }))
    expect(await within(example).findByText(/"type": "private"/)).toBeInTheDocument()
    expect(within(example).queryByText(/"company"/)).toBeNull()
  })

  it("tells unsaved changes apart, and resets them", async () => {
    renderAt("?page=forms")
    const example = screen
      .getByText("Edit, then reset or save")
      .closest("div") as HTMLElement
    const name = within(example).getByLabelText(/Name/)
    const reset = within(example).getByRole("button", { name: "Reset" })

    expect(within(example).getByText("Nothing to save")).toBeInTheDocument()
    expect(reset).toBeDisabled()

    fireEvent.change(name, { target: { value: "Ada King" } })
    expect(within(example).getByText("Unsaved changes")).toBeInTheDocument()

    fireEvent.click(reset)
    expect(within(example).getByText("Nothing to save")).toBeInTheDocument()
    expect(within(example).getByLabelText(/Name/)).toHaveValue("Ada Lovelace")

    fireEvent.change(within(example).getByLabelText(/Name/), {
      target: { value: "Ada King" },
    })
    fireEvent.click(within(example).getByRole("button", { name: "Save" }))
    expect(await within(example).findByText("Nothing to save")).toBeInTheDocument()
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

  it("moves a block down from its header, and the data panel reindexes", async () => {
    const user = userEvent.setup()
    renderAt("?page=multi-forms")

    await user.click(screen.getAllByRole("button", { name: "Move down" })[0])

    const data = JSON.parse(screen.getByTestId("form-data").textContent ?? "{}")
    const byOrder = [...data.blocks].sort(
      (a: { order: number }, b: { order: number }) => a.order - b.order
    )
    expect(byOrder.map((b: { type: string }) => b.type)).toEqual([
      "long-text",
      "title",
      "gallery",
    ])
    expect(byOrder.map((b: { order: number }) => b.order)).toEqual([0, 1, 2])
  })

  it("renders the validation page and its live example", () => {
    renderAt("?page=validation")
    expect(
      screen.getByRole("heading", { name: "Validation & errors", level: 1 })
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Book/ })).toBeInTheDocument()
  })

  it("shows the violation the demo API sends back under the email field", async () => {
    renderAt("?page=validation")
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/Email/), "taken@example.com")
    await user.click(screen.getByRole("button", { name: /Book/ }))
    expect(await screen.findByText("Already taken")).toBeInTheDocument()
  })

  it("lists every translation key with its French wording", () => {
    renderAt("?page=translations")
    expect(
      screen.getByRole("heading", { name: "Translations", level: 1 })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/import \{ fr \} from "react-data-form\/i18n"/)
    ).toBeInTheDocument()

    const rows = screen.getAllByRole("row").slice(1)
    expect(rows).toHaveLength(translationKeys.length)
    expect(within(rows[0]).getByText(translationKeys[0])).toBeInTheDocument()
    expect(within(rows[0]).getByText(fr[translationKeys[0]])).toBeInTheDocument()
  })

  it("falls back to the overview for an unknown page", () => {
    renderAt("?page=nonsense")
    expect(
      screen.getByRole("heading", { name: "react-data-form", level: 1 })
    ).toBeInTheDocument()
  })

  // The gallery is checked in its own block, where it is already rendered.
  it.each(pages.map((page) => page.id).filter((id) => id !== "controllers"))(
    "gives the %s page its own canonical, title and share URL",
    (id) => {
      renderAt(id === "overview" ? "" : `?page=${id}`)
      expect(describedAs()).toEqual(described(id))
    }
  )

  it("names no two pages alike", () => {
    expect(new Set(pages.map(pageTitle)).size).toBe(pages.length)
    expect(new Set(pages.map((page) => canonicalUrl(page.id))).size).toBe(
      pages.length
    )
    expect(canonicalUrl("validation")).toBe(
      "https://hermez.dev/react-data-form/?page=validation"
    )
  })

  it("lists every page in the sitemap", () => {
    const listed = [...sitemap().matchAll(/<loc>(.*?)<\/loc>/g)].map(
      ([, url]) => url
    )
    expect(listed).toEqual(pages.map((page) => canonicalUrl(page.id)))
  })

  it("links every page through the query parameter", () => {
    renderAt("")
    const link = screen.getAllByRole("link", { name: /Field controllers/ })[0]
    expect(link).toHaveAttribute("href", expect.stringContaining("page=controllers"))
  })
})
