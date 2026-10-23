import { describe, expect, it } from "vitest"
import { render } from "@testing-library/react"
import Loader, { DotLoader, LittleLoader, PageLoader } from "@/ui/Loader"

const animated = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>("[class*='animate-']"))

describe("Loader and prefers-reduced-motion", () => {
  it.each([
    ["Loader", <Loader key="loader" />],
    ["Loader with children", <Loader key="children">content</Loader>],
    ["LittleLoader", <LittleLoader key="little" />],
    ["DotLoader", <DotLoader key="dot" text="Loading" />],
    ["PageLoader", <PageLoader key="page" isLoading />],
  ])("%s stops every animation with motion-reduce", (_, element) => {
    const { container } = render(element)
    const elements = animated(container)

    expect(elements.length).toBeGreaterThan(0)
    for (const element of elements) {
      expect(element).toHaveClass("motion-reduce:animate-none")
    }
  })
})
