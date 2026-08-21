import { useMemo, useState } from "react"

import { InputControllerInterface } from "@/form/InputControllerInterface"
import { FormInputInterface } from "@/form/FormInputInterface"
import { FormInputController } from "@/form/component/InputController/FormInputController"
import { AddFormBlockDialog } from "@/form/component/InputController/AddFormBlockDialog"
import { BlockOrderInput } from "@/form/component/InputController/BlockOrderInput"
import { FormInterface } from "@/form/FormInterface"

import translate from "@/i18n/translate"
import {
  addValue,
  removeByColumn,
  updateByIndex,
} from "@/internal/utils/array/array"

import createUniqId from "@/internal/utils/id/createUniqId"

import { CirclePlus, GripVertical, Trash2 } from "lucide-react"
import { Button } from "@/ui/button"
import { Item, ItemActions, ItemContent, ItemHeader } from "@/ui/item"
import { IdAbleInterface } from "@/registry/jsonLd/jsonLDItem"
import { cn } from "@/ui/cn"
import {
  FormResourceItem,
  getForm,
  getFormLabel,
  getForms,
  getFormType,
} from "@/form/utils/addForm"

export interface MultiFormInputPropsInterface<
  T extends IdAbleInterface[] = IdAbleInterface[],
> extends FormInputInterface<T> {
  draggable?: boolean
  identifierKey?: keyof IdAbleInterface
  /**
   * Active la palette du page builder : liste des tags `@for` des formulaires
   * proposés au clic sur « Ajouter ». Vide/absent avec une valeur `[]` explicite
   * = tous les formulaires enregistrés ; absent = comportement historique (ajout
   * d'un bloc vide basé sur `form`).
   */
  forms?: string[]
}

/**
 * Factory construisant un input « tableau de formulaires » (page builder).
 * Câble automatiquement le {@link FormArrayInputController} comme `controller`
 * et permet de paramétrer la clef d'ordre (`identifierKey`, défaut `"order"`).
 */
export function createFormArrayInputController<
  T extends IdAbleInterface[] = IdAbleInterface[],
>(
  options: Omit<MultiFormInputPropsInterface<T>, "controller"> = {}
): FormInputInterface {
  return {
    identifierKey: "order",
    ...options,
    controller: FormArrayInputController,
  } as MultiFormInputPropsInterface<T>
}

export const FormArrayInputController = ({
  formInput,
  onChange,
}: InputControllerInterface<MultiFormInputPropsInterface>) => {
  const form = formInput?.form
  const [values, setValues] = useState<IdAbleInterface[]>(formInput?.value ?? [{}])
  const [startItem, setStartItem] = useState<IdAbleInterface | undefined>()
  const [error, setError] = useState<string>("")
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const identifierKey: keyof IdAbleInterface =
    formInput?.identifierKey ?? ("order" as keyof IdAbleInterface)

  const isDraggable = !!formInput?.draggable

  // Palette : formulaires disponibles à l'ajout. Le picker est actif dès que
  // `forms` est défini (même vide → tous les formulaires enregistrés).
  const availableForms: FormResourceItem[] = useMemo(
    () => (formInput?.forms ? getForms(formInput.forms) : []),
    [formInput?.forms]
  )
  const usePicker = availableForms.length > 0

  const changeValues = (newValues: IdAbleInterface[]) => {
    onChange({ ...formInput, value: newValues })
    setValues(newValues)
  }

  const remove = (value: IdAbleInterface) => () => {
    if (Object.hasOwn(value, "id")) {
      changeValues(removeByColumn(values, "id", value.id))
      return
    }

    if (Object.hasOwn(value, "@id")) {
      changeValues(removeByColumn(values, "id", value["@id"]))
    }
  }

  const nextOrder = () => {
    const orders = values
      .map((item) => item[identifierKey] as unknown as number | undefined)
      .filter((order): order is number => typeof order === "number")

    return orders.length ? Math.max(...orders) + 1 : values.length
  }

  const canAdd = () => {
    if (formInput?.min && formInput.min > values.length) {
      setError(translate("max.length.array", { size: formInput.min }))
      return false
    }

    setError("")
    return true
  }

  const add = () => {
    if (!canAdd()) return

    changeValues(addValue(values, { id: createUniqId() }))
  }

  const addBlock = (selectedForm: FormResourceItem) => {
    if (!canAdd()) return

    changeValues(
      addValue(values, {
        id: createUniqId(),
        type: getFormType(selectedForm),
        [identifierKey]: nextOrder(),
      })
    )
  }

  const handleItemChange = (childInput: FormInputInterface, index: number) => {
    changeValues(updateByIndex<object>(values, index, childInput.value))
  }

  const changeOrder = (item: IdAbleInterface) => (order: number) => {
    changeValues(
      values.map((value) =>
        value.id === item.id ? { ...value, [identifierKey]: order } : value
      )
    )
  }

  // On sort la clef d'ordre du corps du formulaire : elle est éditée depuis
  // l'en-tête du bloc via BlockOrderInput.
  const withoutOrderInput = (
    childForm?: FormInterface
  ): FormInterface | undefined => {
    const key = identifierKey as string
    if (!childForm?.inputs?.[key]) return childForm

    return {
      ...childForm,
      inputs: {
        ...childForm.inputs,
        [key]: { ...childForm.inputs[key], type: "hidden" },
      },
    }
  }

  const handleDragStart = (item: IdAbleInterface) => {
    if (!isDraggable) return
    setStartItem(item)
  }

  const handleDragOver = (item: IdAbleInterface) => {
    if (!isDraggable) return

    const targetIndex = item[identifierKey] as unknown as number | undefined
    if (typeof targetIndex === "number") {
      setDragIndex(targetIndex)
    }
  }

  const handleDragEnd = () => {
    if (!isDraggable || !startItem || dragIndex === null) return

    // 1. On travaille sur une copie triée selon identifierKey
    const sorted = [...values].sort((a, b) => {
      const aValue = (a[identifierKey] as unknown as number | undefined) ?? 0
      const bValue = (b[identifierKey] as unknown as number | undefined) ?? 0
      return aValue - bValue
    })

    // 2. Indice de l'item déplacé
    const fromIndex = sorted.findIndex((item) => item.id === startItem.id)
    if (fromIndex === -1) return

    // 3. Indice cible (basé sur la valeur de dragIndex)
    const toIndex = sorted.findIndex((item) => {
      const value = item[identifierKey] as unknown as number | undefined
      return value === dragIndex
    })
    if (toIndex === -1) return

    // 4. Déplacement
    const [movedItem] = sorted.splice(fromIndex, 1)
    sorted.splice(toIndex, 0, movedItem)

    // 5. Réindexation complète
    const reindexed = sorted.map((item, index) => ({
      ...item,
      [identifierKey]: index,
    }))

    setStartItem(undefined)
    setDragIndex(null)
    changeValues(reindexed)
  }

  const orderedValues = useMemo(() => {
    if (!identifierKey) {
      return values
    }

    return [...values].sort((a, b) => {
      const aValue = a[identifierKey] as unknown as number | undefined
      const bValue = b[identifierKey] as unknown as number | undefined

      if (aValue == null && bValue == null) return 0
      if (aValue == null) return 1
      if (bValue == null) return -1

      return aValue - bValue
    })
  }, [values, identifierKey])

  return (
    <>
      {error && <span className="text-sm text-destructive">{error}</span>}

      {orderedValues.map((item, index) => {
        const itemOrder = item[identifierKey] as unknown as number | undefined
        const isCurrentDragTarget = dragIndex !== null && dragIndex === itemOrder
        let currentForm = form
        if (Object.hasOwn(item, "type")) {
          currentForm = getForm({ type: item.type }) ?? currentForm
        }
        const blockLabel = currentForm
          ? getFormLabel(currentForm as FormResourceItem)
          : undefined
        return (
          <Item
            key={`${String(formInput?.id ?? "array-input")}-${item.id ?? index}`}
            variant="outline"
            className={cn(
              formInput?.form?.className,
              isCurrentDragTarget && "border-primary bg-primary/5",
              "relative flex-col items-stretch"
            )}
            onDragOver={() => handleDragOver(item)}
            onDragEnd={handleDragEnd}
          >
            <ItemHeader className="border-b border-border pb-2.5">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                {isDraggable && (
                  <span
                    className="cursor-grab text-muted-foreground/60 transition-colors hover:text-foreground active:cursor-grabbing"
                    draggable
                    onDragStart={() => handleDragStart(item)}
                    aria-label={translate("drag")}
                  >
                    <GripVertical className="size-4" />
                  </span>
                )}
                <BlockOrderInput
                  value={itemOrder}
                  onChange={changeOrder(item)}
                  label={translate("order")}
                />
                {blockLabel}
              </div>

              <ItemActions>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  type="button"
                  onClick={remove(item)}
                  className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label={translate("remove")}
                >
                  <Trash2 className="size-4" />
                </Button>
              </ItemActions>
            </ItemHeader>

            <ItemContent>
              <FormInputController
                onChange={(childInput) => handleItemChange(childInput, index)}
                formInput={{
                  value: item as Required<object>,
                  form: withoutOrderInput(currentForm),
                }}
              />
            </ItemContent>
          </Item>
        )
      })}

      {usePicker ? (
        <AddFormBlockDialog forms={availableForms} onSelect={addBlock} />
      ) : (
        <Button
          className="col-span-full"
          variant="secondary"
          onClick={add}
          type="button"
        >
          <CirclePlus />
          {translate("form.array.add")}
        </Button>
      )}
    </>
  )
}
