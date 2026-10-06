import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { PasswordInputController } from "@/form/component/InputController/PasswordInputController"
import { DefaultInputController } from "@/form/component/InputController/DefaultInputController"
import { FormInputInterface } from "@/form/FormInputInterface"

const buildFormInput = (
  overrides: Partial<FormInputInterface> = {}
): FormInputInterface =>
  ({
    name: "password",
    label: "Mot de passe",
    ...overrides,
  }) as FormInputInterface

const getPasswordInput = (container: HTMLElement) =>
  container.querySelector<HTMLInputElement>("input")!

describe("PasswordInputController", () => {
  it("toggles between password and text with the eye button", () => {
    const { container } = render(
      <PasswordInputController formInput={buildFormInput()} onChange={vi.fn()} />
    )
    const input = getPasswordInput(container)
    expect(input.type).toBe("password")

    fireEvent.click(screen.getByRole("button", { name: "Afficher le mot de passe" }))
    expect(input.type).toBe("text")

    fireEvent.click(screen.getByRole("button", { name: "Masquer le mot de passe" }))
    expect(input.type).toBe("password")
  })

  it("gives two password fields distinct ids", () => {
    const { container } = render(
      <>
        <PasswordInputController formInput={buildFormInput()} onChange={vi.fn()} />
        <PasswordInputController
          formInput={buildFormInput({ name: "confirmPassword" })}
          onChange={vi.fn()}
        />
      </>
    )
    const [password, confirmation] = container.querySelectorAll("input")

    expect(password.id).toBe("password")
    expect(confirmation.id).toBe("confirmPassword")
  })

  it("keeps an explicit id", () => {
    const { container } = render(
      <PasswordInputController
        formInput={buildFormInput({ id: "login-password" })}
        onChange={vi.fn()}
      />
    )

    expect(getPasswordInput(container).id).toBe("login-password")
  })

  it("has no default placeholder", () => {
    const { container } = render(
      <PasswordInputController formInput={buildFormInput()} onChange={vi.fn()} />
    )

    expect(getPasswordInput(container).placeholder).toBe("")
  })

  it("looks like the default input, with only room for the eye button", () => {
    const { container: password } = render(
      <PasswordInputController formInput={buildFormInput()} onChange={vi.fn()} />
    )
    const { container: email } = render(
      <DefaultInputController
        formInput={buildFormInput({ name: "email", type: "email" })}
        onChange={vi.fn()}
      />
    )

    const passwordClasses = getPasswordInput(password).className.split(" ")
    const emailClasses = getPasswordInput(email).className.split(" ")

    expect(passwordClasses.filter((c) => !emailClasses.includes(c))).toEqual([
      "pr-10",
    ])
    expect(password.querySelector("button")!.className).not.toContain("z-80")
  })

  it("propagates the typed value", () => {
    const onChange = vi.fn()
    const { container } = render(
      <PasswordInputController formInput={buildFormInput()} onChange={onChange} />
    )

    fireEvent.change(getPasswordInput(container), { target: { value: "secret" } })

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ name: "password", value: "secret" })
    )
  })
})
