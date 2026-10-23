import { describe, expect, it, vi } from "vitest"
import { renderHook } from "@testing-library/react"
import useFormContext from "@/form/provider/useFormContext"

describe("useFormContext", () => {
  it("throws an explicit error outside a FormProvider", () => {
    // React logs the error thrown during render
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})

    expect(() => renderHook(() => useFormContext())).toThrow(
      "useFormContext must be used inside a FormProvider"
    )

    consoleError.mockRestore()
  })
})
