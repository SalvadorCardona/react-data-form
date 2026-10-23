import { afterEach, describe, expect, it, vi } from "vitest"
import { render, waitFor } from "@testing-library/react"
import { setTranslation } from "react-mini-i18n"
import WysiwygEditor from "@/ui/Wysiwyg"
import { WysiwygInputController } from "@/form/component/InputController/WysiwygInputController"
import { FormInputInterface } from "@/form/FormInputInterface"

const placeholderOf = (container: HTMLElement) =>
  container.querySelector("[data-placeholder]")?.getAttribute("data-placeholder")

describe("WysiwygEditor", () => {
  afterEach(() => {
    vi.restoreAllMocks()
    setTranslation({})
  })

  it("registers each TipTap extension once", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})

    const { container } = render(<WysiwygEditor value="" onChange={vi.fn()} />)

    await waitFor(() =>
      expect(container.querySelector(".ProseMirror")).not.toBeNull()
    )
    expect(warn.mock.calls.flat().join(" ")).not.toMatch(/Duplicate extension/)
  })

  it("still renders links without opening them on click", async () => {
    const { container } = render(
      <WysiwygEditor
        value='<p><a href="https://example.com">a</a></p>'
        onChange={vi.fn()}
      />
    )

    await waitFor(() => expect(container.querySelector("a")).not.toBeNull())
    expect(container.querySelector("a")?.className).toContain("text-primary")
  })

  it("follows a value changed from outside", async () => {
    const onChange = vi.fn()
    const { container, rerender } = render(
      <WysiwygEditor value="<p>First</p>" onChange={onChange} />
    )
    await waitFor(() => expect(container.textContent).toContain("First"))

    rerender(<WysiwygEditor value="<p>Second</p>" onChange={onChange} />)

    await waitFor(() => expect(container.textContent).toContain("Second"))
    expect(container.textContent).not.toContain("First")
    expect(onChange).not.toHaveBeenCalled()
  })

  it("shows the given placeholder", async () => {
    const { container } = render(
      <WysiwygEditor
        value=""
        placeholder="Describe the product"
        onChange={vi.fn()}
      />
    )

    await waitFor(() =>
      expect(placeholderOf(container)).toBe("Describe the product")
    )
  })
})

describe("WysiwygInputController placeholder", () => {
  afterEach(() => setTranslation({}))

  const renderController = (formInput: Partial<FormInputInterface>) =>
    render(
      <WysiwygInputController
        formInput={{ name: "description", ...formInput } as FormInputInterface}
        onChange={vi.fn()}
      />
    )

  it("translates the default placeholder", async () => {
    setTranslation({ "Start writing something great…": "Commencez à écrire…" })

    const { container } = renderController({})

    await waitFor(() => expect(placeholderOf(container)).toBe("Commencez à écrire…"))
  })

  it("uses formInput.placeholder first", async () => {
    const { container } = renderController({ placeholder: "Your bio" })

    await waitFor(() => expect(placeholderOf(container)).toBe("Your bio"))
  })
})
