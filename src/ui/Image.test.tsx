import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { Image } from "@/ui/Image"

describe("Image", () => {
  it("keeps an API URL as is", () => {
    const { container } = render(<Image src="/api/media_objects/12/content" />)

    expect(container.querySelector("img")?.getAttribute("src")).toBe(
      "/api/media_objects/12/content"
    )
  })

  it("uses the @id of a JSON-LD item as is", () => {
    const { container } = render(
      <Image src={{ "@id": "/api/media_objects/12", "@type": "MediaObject" }} />
    )

    expect(container.querySelector("img")?.getAttribute("src")).toBe(
      "/api/media_objects/12"
    )
  })

  it.each([undefined, null, ""])(
    "renders a local fallback without any request when src is %j",
    (src) => {
      const { container } = render(<Image src={src} alt="Avatar" />)

      expect(container.querySelector("img")).toBeNull()
      expect(screen.getByRole("img", { name: "Avatar" })).toBeTruthy()
    }
  )

  it("falls back when the image fails, even with an onError of its own", () => {
    const onError = vi.fn()
    const { container } = render(
      <Image src="/missing.png" alt="Avatar" onError={onError} />
    )

    fireEvent.error(container.querySelector("img")!)

    expect(onError).toHaveBeenCalled()
    expect(container.querySelector("img")).toBeNull()
    expect(screen.getByRole("img", { name: "Avatar" })).toBeTruthy()
  })
})
