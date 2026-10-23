import { describe, expect, it, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useRef } from "react"
import FormElement from "@/form/component/form/FormElement"
import useForm, { FormContextOutput } from "@/form/hook/useForm"
import { ApiJsonLdError } from "@/form/ApiJsonLdError"
import { addErrorFromViolations } from "@/form/utils/addErrorFromViolations"

interface Booking {
  name?: string
  email?: string
  seats?: number
}

/**
 * Stands in for the HTTP client: resolves with the saved resource, or rejects
 * with the problem+json body an API Platform backend answers a 422 with.
 */
type Api = (data: Booking) => Promise<Booking & { id: number }>

/**
 * A booking form wired the way an application does it: `form.onSubmit` sends
 * the data, and maps the violations of a refused request onto the form.
 */
function BookingForm({ api, onSaved }: { api: Api; onSaved: (data: any) => void }) {
  const context = useRef<FormContextOutput<Booking>>(null)
  const formContext = useForm<Booking>({
    form: {
      label: { submit: "Book" },
      inputs: {
        name: { label: "Name", required: true },
        email: {
          label: "Email",
          validator: (value) => {
            if (value && !String(value).includes("@")) {
              throw new Error("That is not an email address")
            }
            return value
          },
        },
        seats: { label: "Seats", type: "number", min: 1, max: 4 },
      },
      onSubmit: async (data) => {
        try {
          return await api(data)
        } catch (error) {
          const form = context.current!.form
          context.current!.updateForm(
            addErrorFromViolations(form, error as ApiJsonLdError)
          )
        }
      },
    },
    data: { seats: 1 },
    onSubmit: onSaved,
  })
  context.current = formContext

  return <FormElement {...formContext} />
}

const refused: ApiJsonLdError = {
  status: 422,
  title: "An error occurred",
  violations: [
    { propertyPath: "email", message: "This email is already used", code: "taken" },
    { propertyPath: "", message: "The show is fully booked", code: "full" },
  ],
}

describe("the submission cycle of a form", () => {
  it("validates, submits, shows the API errors and lets the user try again", async () => {
    const user = userEvent.setup()
    const api = vi
      .fn<Api>()
      .mockRejectedValueOnce(refused)
      .mockImplementation(async (data) => ({ ...data, id: 42 }))
    const onSaved = vi.fn()
    const { container } = render(<BookingForm api={api} onSaved={onSaved} />)

    const submit = screen.getByRole("button", { name: "Book" })
    const field = (key: string) =>
      container.querySelector<HTMLInputElement>(`[data-field="${key}"] input`)!
    const name = field("name")
    const email = field("email")
    const seats = field("seats")

    // 1. Nothing typed: the required field stops the submission locally.
    await user.click(submit)
    expect(await screen.findByText("This field is required")).toBeInTheDocument()
    expect(api).not.toHaveBeenCalled()

    // 2. Typed, but invalid: the validator and the bounds stop it as well.
    await user.type(name, "Ada")
    await user.type(email, "ada")
    await user.clear(seats)
    await user.type(seats, "9")
    await user.click(submit)
    expect(
      await screen.findByText("That is not an email address")
    ).toBeInTheDocument()
    expect(
      screen.getByText("This value should be less than or equal to 4")
    ).toBeInTheDocument()
    expect(screen.queryByText("This field is required")).not.toBeInTheDocument()
    expect(api).not.toHaveBeenCalled()

    // 3. Valid: the data reaches the API, which refuses it.
    await user.type(email, "@example.com")
    await user.clear(seats)
    await user.type(seats, "2")
    await user.click(submit)
    await waitFor(() => expect(api).toHaveBeenCalledTimes(1))
    expect(api).toHaveBeenLastCalledWith({
      name: "Ada",
      email: "ada@example.com",
      seats: 2,
    })

    // The API's violations land on their field, or on the form without one,
    // and the local ones are gone.
    expect(await screen.findByText("This email is already used")).toBeInTheDocument()
    expect(screen.getByText("The show is fully booked")).toBeInTheDocument()
    expect(
      screen.queryByText("That is not an email address")
    ).not.toBeInTheDocument()
    // The values typed are kept, and the button is usable again.
    expect(email).toHaveValue("ada@example.com")
    await waitFor(() => expect(submit).not.toBeDisabled())

    // 4. Another try: the API accepts it, and the field errors are cleared.
    await user.clear(email)
    await user.type(email, "lovelace@example.com")
    await user.click(submit)
    await waitFor(() => expect(api).toHaveBeenCalledTimes(2))
    expect(api).toHaveBeenLastCalledWith({
      name: "Ada",
      email: "lovelace@example.com",
      seats: 2,
    })
    await waitFor(() =>
      expect(onSaved).toHaveBeenLastCalledWith({
        name: "Ada",
        email: "lovelace@example.com",
        seats: 2,
        id: 42,
      })
    )
    expect(screen.queryByText("This email is already used")).not.toBeInTheDocument()
    expect(submit).not.toBeDisabled()
  })

  // Left to tickets of their own: each is to become a test with its fix.
  it.todo("clears the form-level errors of the API on the next submission")
  it.todo("stops loading and stays usable when form.onSubmit rejects")
})
