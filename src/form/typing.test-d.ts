import { describe, expectTypeOf, it } from "vitest"
import { FC } from "react"
import { FormInterface } from "@/form/FormInterface"
import { FormInputInterface } from "@/form/FormInputInterface"
import {
  InputControllerComponentInterface,
  InputControllerInterface,
} from "@/form/InputControllerInterface"
import { MultiSelectInputController } from "@/form/component/InputController/MultiSelectInputController"
import { createStepForm } from "@/step/FormStep"

interface User {
  name: string
  age: number
  address: { city: string }
}

interface ColorFormInputInterface extends FormInputInterface<string> {
  palette: string[]
}

const ColorInputController: FC<
  InputControllerInterface<ColorFormInputInterface>
> = ({ formInput }) => formInput.palette.join()

describe("controller", () => {
  it("accepts a controller typed on its own input interface, without a cast", () => {
    expectTypeOf(ColorInputController).toExtend<InputControllerComponentInterface>()
    expectTypeOf(
      MultiSelectInputController
    ).toExtend<InputControllerComponentInterface>()

    const input: FormInputInterface = { controller: ColorInputController }
    expectTypeOf(input.controller).toEqualTypeOf<
      InputControllerComponentInterface | undefined
    >()
  })
})

describe("inputs", () => {
  it("types each input by the field of Data it is keyed by", () => {
    type Inputs = NonNullable<FormInterface<User>["inputs"]>

    expectTypeOf<NonNullable<Inputs["age"]>>().toEqualTypeOf<
      FormInputInterface<number>
    >()
    expectTypeOf<NonNullable<Inputs["name"]>>().toEqualTypeOf<
      FormInputInterface<string>
    >()
  })

  it("reports an unknown field name when Data is given", () => {
    const form: FormInterface<User> = {
      inputs: {
        name: {},
        // A dotted path reaches a nested field
        "address.city": {},
        // @ts-expect-error `nmae` is not a field of User
        nmae: {},
      },
    }
    expectTypeOf(form).toExtend<FormInterface<User>>()
  })

  it("accepts any field name when Data is not given", () => {
    const form: FormInterface = { inputs: { anything: {}, "a.b": {} } }
    expectTypeOf(form.inputs).toEqualTypeOf<
      Record<string, FormInputInterface> | undefined
    >()
  })
})

describe("createStepForm", () => {
  it("types the form handed to onNextStep by Data", () => {
    const form = createStepForm<User>({
      inputs: { name: {}, age: {} },
      groupOption: {
        itemGroups: [
          {
            group: "identity",
            order: 1,
            onNextStep: async ({ form }) => {
              expectTypeOf(form.data).toEqualTypeOf<User>()
              return form
            },
          },
        ],
      },
    })
    expectTypeOf(form.data).toEqualTypeOf<User>()
  })

  it("reports an unknown field name when Data is given", () => {
    createStepForm<User>({
      // @ts-expect-error `nmae` is not a field of User
      inputs: { nmae: {} },
      groupOption: { itemGroups: [{ group: "identity", order: 1 }] },
    })
  })

  it("accepts any field name when Data is not given", () => {
    const form = createStepForm({
      inputs: { firstName: {}, email: {} },
      groupOption: { itemGroups: [{ group: "identity", order: 1 }] },
    })
    expectTypeOf(form.data).toBeAny()
  })
})
