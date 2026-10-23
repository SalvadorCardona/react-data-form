import { beforeAll, describe, expect, it, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SelectSearchInputController } from "@/form/component/InputController/SelectSearchInputController"
import { MultiSelectSearchInputController } from "@/form/component/InputController/MultiSelectSearchInputController"
import { FormInputInterface } from "@/form/FormInputInterface"

const buildFormInput = (
  overrides: Partial<FormInputInterface> = {}
): FormInputInterface =>
  ({
    name: "owner",
    label: "Owner",
    ...overrides,
  }) as FormInputInterface

// cmdk relies on browser APIs that jsdom does not implement.
beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Element.prototype.scrollIntoView ??= () => {}
})

const hasLoader = () => document.querySelector(".animate-spin") !== null

describe("ComboboxMulti", () => {
  it("stops the loader and shows an error when onSearch rejects", async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn(() => Promise.reject(new Error("server down")))

    render(
      <SelectSearchInputController
        formInput={buildFormInput({ onSearch })}
        onChange={() => {}}
      />
    )

    await user.click(screen.getByRole("combobox"))
    await user.type(await screen.findByPlaceholderText("Search..."), "ali")

    expect(
      await screen.findByText("Unable to load the options.", {}, { timeout: 2000 })
    ).toBeDefined()
    expect(onSearch).toHaveBeenCalledWith("ali", expect.anything())
    expect(hasLoader()).toBe(false)
  })

  it("searches again with an empty query when the search is cleared", async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn((query: string) =>
      Promise.resolve([{ label: `result ${query || "all"}`, value: query }])
    )

    render(
      <SelectSearchInputController
        formInput={buildFormInput({ onSearch })}
        onChange={() => {}}
      />
    )

    await user.click(screen.getByRole("combobox"))
    const input = await screen.findByPlaceholderText("Search...")
    await user.type(input, "ali")
    await waitFor(
      () => expect(onSearch).toHaveBeenCalledWith("ali", expect.anything()),
      {
        timeout: 2000,
      }
    )

    onSearch.mockClear()
    await user.clear(input)

    await waitFor(
      () => expect(onSearch).toHaveBeenCalledWith("", expect.anything()),
      {
        timeout: 2000,
      }
    )
  })

  it("renders a readonly IRI through the iriLabel port", () => {
    render(
      <SelectSearchInputController
        formInput={buildFormInput({
          value: "/api/users/42",
          readonly: true,
          onSearch: () => Promise.resolve([]),
        })}
        onChange={() => {}}
      />
    )

    expect(screen.getByText("42")).toBeDefined()
  })

  it("renders readonly values with the label of their option", () => {
    render(
      <MultiSelectSearchInputController
        formInput={buildFormInput({
          value: ["a", "b"],
          readonly: true,
          valueOptions: [
            { label: "Alice", value: "a" },
            { label: "Bob", value: "b" },
          ],
        })}
        onChange={() => {}}
      />
    )

    expect(screen.getByText("Alice")).toBeDefined()
    expect(screen.getByText("Bob")).toBeDefined()
    expect(screen.queryByRole("textbox")).toBeNull()
  })
})
