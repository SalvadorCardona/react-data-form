import {
  FormBuiltInterface,
  FormInterface,
  FormInterfaceValueType,
} from "@/form/FormInterface"
import { deepCopy } from "@/internal/utils/object/deepCopy"
import { deepMerge } from "@/internal/utils/object/deepMerge"
import { getDataFromKey } from "@/internal/utils/object/nestedProperty"
import { getDataFromForm } from "@/form/utils/getDataFromForm"
import { createUniqId } from "jsonld-item"
import getIdFromObject from "@/internal/utils/id/getIdFromObject"
import { ActionList } from "@/internal/action/ActionList"
import { getFormConfig } from "@/form/FormConfig"

export function upsertForm<
  Data extends FormInterfaceValueType = FormInterfaceValueType,
>(
  form: Partial<FormInterface<Data>> | FormBuiltInterface<Data>,
  data: Data = {} as Data,
  options: {
    isUpdate?: boolean
    partial?: boolean
  } = {}
): FormBuiltInterface<Data> {
  const { isUpdate = false, partial = true } = options

  const dataId = getIdFromObject(data)

  let newForm: FormBuiltInterface

  if (isUpdate) {
    newForm = deepCopy(form as FormBuiltInterface) as FormBuiltInterface
    if (!newForm.errors) newForm.errors = []
  } else {
    newForm = deepMerge(getFormConfig().defaultForm, form) as FormBuiltInterface
    newForm.id = newForm.id ?? createUniqId()

    // deepMerge reuses the input references of the source form, so they must be
    // cloned before mutating their `value`. Otherwise the previous state is
    // mutated in place and React (Compiler) skips re-rendering those controllers.
    newForm.inputs = Object.fromEntries(
      Object.entries(newForm.inputs ?? {}).map(([key, input]) => [key, { ...input }])
    )
  }

  if (newForm.action !== ActionList.read) {
    newForm.action = dataId ? ActionList.update : ActionList.create
  }

  newForm.originalData = data

  if (newForm.allowGeneratedValue) {
    Object.keys(data ?? {}).map((key) => {
      if (newForm.inputs[key]) return

      newForm.inputs[key] = {
        id: createUniqId(),
        name: key,
        value: data[key],
        generatedValue: true,
      }
    })
  }

  Object.keys(newForm.inputs).map((key) => {
    const currentFormInput = newForm.inputs[key]

    if (!isUpdate) {
      if (!currentFormInput.id) currentFormInput.id = createUniqId()
      if (!currentFormInput?.name) {
        currentFormInput.name = key
      }
    }

    if (isUpdate) {
      currentFormInput.value = partial
        ? (getDataFromKey(data, key) ?? currentFormInput.value)
        : (getDataFromKey(data, key) ?? undefined)
    } else {
      currentFormInput.value = getDataFromKey(data, key)

      if (
        typeof currentFormInput.value === "undefined" &&
        currentFormInput.defaultValue &&
        newForm.version === 1
      ) {
        if (typeof currentFormInput.defaultValue === "function") {
          currentFormInput.value = currentFormInput.defaultValue(
            currentFormInput.value
          )
        } else {
          currentFormInput.value = currentFormInput.defaultValue
        }
      }
    }

    currentFormInput.getForm = () => newForm

    newForm.inputs[key] = currentFormInput
  })

  newForm.data = getDataFromForm(newForm)

  newForm.version++

  return newForm
}
