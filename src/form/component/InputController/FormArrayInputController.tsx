import {
  KeyboardEvent,
  PointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { InputControllerInterface } from "@/form/InputControllerInterface"
import { FormInputInterface } from "@/form/FormInputInterface"
import { FormInputController } from "@/form/component/InputController/FormInputController"
import { AddFormBlockDialog } from "@/form/component/InputController/AddFormBlockDialog"
import { BlockOrderInput } from "@/form/component/InputController/BlockOrderInput"
import { FormInterface } from "@/form/FormInterface"
import useFormContext from "@/form/provider/useFormContext"
import { createForm } from "@/form/utils/createForm"
import { validateForm } from "@/form/utils/validateForm"
import { formHasError } from "@/form/utils/formHasError"

import { translate } from "react-mini-i18n"
import {
  addValue,
  removeByColumn,
  removeValue,
  updateByIndex,
} from "@/internal/utils/array/array"

import { createUniqId } from "jsonld-item"

import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  CirclePlus,
  GripVertical,
  Trash2,
} from "lucide-react"
import { Button } from "@/ui/button"
import { Item, ItemActions, ItemContent, ItemHeader } from "@/ui/item"
import { IdAbleInterface } from "jsonld-item"
import { cn } from "@/ui/cn"
import {
  FormResourceItem,
  getForm,
  getFormLabel,
  getForms,
  getFormType,
} from "@/form/utils/addForm"

/** The header controls a moved block hands the focus back to. */
type BlockControl = "handle" | "up" | "down"

export interface MultiFormInputPropsInterface<
  T extends IdAbleInterface[] = IdAbleInterface[],
> extends FormInputInterface<T> {
  draggable?: boolean
  identifierKey?: keyof IdAbleInterface
  /**
   * Active la palette du page builder : liste des tags `@for` des formulaires
   * offered when clicking "Add". An explicit empty `[]` means every registered
   * form; omitting the key keeps the legacy behaviour of adding a blank block
   * based on `form`.
   */
  forms?: string[]
  /**
   * Initial state of the collapse toggle carried by every block header: `true`
   * mounts the list folded, headers only. It applies to the blocks added later
   * too — except the one just inserted, which opens so that clicking "Add"
   * shows something.
   */
  closedByDefault?: boolean
}

/**
 * Factory construisant un input « tableau de formulaires » (page builder).
 * Câble automatiquement le {@link FormArrayInputController} comme `controller`
 * and makes the ordering key configurable (`identifierKey`, defaults to `"order"`).
 */
export function createFormArrayInputController<
  T extends IdAbleInterface[] = IdAbleInterface[],
>(
  options: Omit<MultiFormInputPropsInterface<T>, "controller"> = {}
): FormInputInterface {
  return {
    identifierKey: "order",
    ...options,
    // `min` is a validation rule, checked on submission: blocks can always be
    // added up to it. `max` is enforced by the "Add" button.
    validator: (value: T) => {
      options.validator?.(value)
      if (options.min && (value?.length ?? 0) < options.min) {
        throw new Error(
          translate("This collection should contain {{min}} elements or more.", {
            min: options.min,
          })
        )
      }
      return value
    },
    controller: FormArrayInputController,
  } as MultiFormInputPropsInterface<T>
}

export const FormArrayInputController = ({
  formInput,
  onChange,
}: InputControllerInterface<MultiFormInputPropsInterface>) => {
  const formContext = useFormContext()
  const form = formInput?.form
  const [values, setValues] = useState<IdAbleInterface[]>(formInput?.value ?? [])
  const [startItem, setStartItem] = useState<IdAbleInterface | undefined>()
  const [error, setError] = useState<string>("")
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  // Display state only: which blocks are unfolded, per block key. It never
  // reaches onChange — folding a block does not change the form value.
  const [openStates, setOpenStates] = useState<Record<string, boolean>>({})
  // Folded blocks opened by a failed submission: they show their violations
  // on mount.
  const [revealedKeys, setRevealedKeys] = useState<string[]>([])
  // Reordering controls, per block key, so that focus follows a moved block:
  // React moves its node, which drops the focus it held.
  const controlRefs = useRef(new Map<string, HTMLElement | null>())
  const pendingFocus = useRef<{ key: string; control: BlockControl } | null>(null)

  // The list follows a value changed from outside (updateData, async load).
  useEffect(() => {
    setValues(formInput?.value ?? [])
  }, [formInput?.value])

  const identifierKey: keyof IdAbleInterface =
    formInput?.identifierKey ?? ("order" as keyof IdAbleInterface)

  const isDraggable = !!formInput?.draggable

  // Same key as the one the list is rendered with: an item does not always
  // carry an id, so the index takes over.
  const itemKey = (item: IdAbleInterface, index: number) =>
    `${String(formInput?.id ?? "array-input")}-${item.id ?? index}`

  const openByDefault = !formInput?.closedByDefault

  const isOpen = (key: string) => openStates[key] ?? openByDefault

  const toggleOpen = (key: string) => () => {
    setRevealedKeys((keys) => keys.filter((revealedKey) => revealedKey !== key))
    setOpenStates((states) => ({
      ...states,
      [key]: !(states[key] ?? openByDefault),
    }))
  }

  // A block just added always opens, otherwise clicking "Add" would do nothing
  // visible when the list is closed by default.
  const openAddedItem = (item: IdAbleInterface) =>
    setOpenStates((states) => ({ ...states, [itemKey(item, values.length)]: true }))

  // Palette of forms available for insertion. The picker is active as soon as
  // `forms` is set — even empty, which means every registered form.
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
      changeValues(removeByColumn(values, "@id", value["@id"]))
      return
    }

    // A block without identifier (loaded without id, for instance) is the
    // very object held in `values`: it is removed by reference.
    changeValues(removeValue(values, value))
  }

  const nextOrder = () => {
    const orders = values
      .map((item) => item[identifierKey] as unknown as number | undefined)
      .filter((order): order is number => typeof order === "number")

    return orders.length ? Math.max(...orders) + 1 : values.length
  }

  const canAdd = () => {
    if (formInput?.max != null && values.length >= formInput.max) {
      setError(
        translate("This collection should contain {{max}} elements or less.", {
          max: formInput.max,
        })
      )
      return false
    }

    setError("")
    return true
  }

  const add = () => {
    if (!canAdd()) return

    const item = { id: createUniqId() }
    openAddedItem(item)
    changeValues(addValue(values, item))
  }

  const addBlock = (selectedForm: FormResourceItem) => {
    if (!canAdd()) return

    const item = {
      id: createUniqId(),
      type: getFormType(selectedForm),
      [identifierKey]: nextOrder(),
    }
    openAddedItem(item)
    changeValues(addValue(values, item))
  }

  const handleItemChange = (childInput: FormInputInterface, index: number) => {
    changeValues(updateByIndex<object>(values, index, childInput.value))
  }

  // Moves a block within the ordered list and reindexes every identifierKey
  // from 0: no gap, no duplicate.
  const moveBlock = (fromIndex: number, toIndex: number, focus?: BlockControl) => {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= orderedValues.length) {
      return
    }

    const reordered = [...orderedValues]
    const [movedItem] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, movedItem)

    if (focus) {
      pendingFocus.current = { key: itemKey(movedItem, toIndex), control: focus }
    }

    changeValues(
      reordered.map((item, index) => ({ ...item, [identifierKey]: index }))
    )
  }

  const moveBy = (index: number, offset: number, focus: BlockControl) => () =>
    moveBlock(index, index + offset, focus)

  // The order typed in the header places the block among the others: before
  // the ones holding the same order when it goes up, after them when it goes
  // down. The list is then reindexed, so two blocks never share an order.
  const changeOrder = (index: number) => (order: number) => {
    const current = orderedValues[index][identifierKey] as unknown as
      number | undefined
    const movesUp = current == null || order < current
    const toIndex = orderedValues.filter((item, otherIndex) => {
      if (otherIndex === index) return false
      const other = item[identifierKey] as unknown as number | undefined
      if (other == null) return false
      return movesUp ? other < order : other <= order
    }).length

    if (toIndex === index) {
      // Same place, but the order typed still has to be brought back in line.
      changeValues(
        orderedValues.map((item, position) => ({
          ...item,
          [identifierKey]: position,
        }))
      )
      return
    }
    moveBlock(index, toIndex)
  }

  const handleHandleKeyDown =
    (index: number) => (event: KeyboardEvent<HTMLElement>) => {
      const offset = { ArrowUp: -1, ArrowDown: 1 }[event.key]
      if (!offset) return

      event.preventDefault()
      moveBlock(index, index + offset, "handle")
    }

  useEffect(() => {
    if (!pendingFocus.current) return
    const { key, control } = pendingFocus.current
    pendingFocus.current = null

    // A block moved to an end disables the button just used: focus goes to
    // the other one rather than to the page.
    const fallback: Record<BlockControl, BlockControl> = {
      handle: "handle",
      up: "down",
      down: "up",
    }
    const element = controlRefs.current.get(`${key}:${control}`)
    const target =
      element && !(element as HTMLButtonElement).disabled
        ? element
        : controlRefs.current.get(`${key}:${fallback[control]}`)
    target?.focus()
  })

  // The ordering key is pulled out of the form body: it is edited from the
  // block header through BlockOrderInput.
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

    const fromIndex = orderedValues.findIndex((item) => item.id === startItem.id)
    if (fromIndex === -1) return

    const toIndex = orderedValues.findIndex((item) => {
      const value = item[identifierKey] as unknown as number | undefined
      return value === dragIndex
    })
    if (toIndex === -1) return

    setStartItem(undefined)
    setDragIndex(null)
    moveBlock(fromIndex, toIndex)
  }

  // Touch and pen: most mobile browsers never fire the HTML5 drag events, so
  // the handle follows the pointer and looks for the block under it. The
  // mouse keeps the native drag and drop.
  const handlePointerDown = (
    event: PointerEvent<HTMLElement>,
    item: IdAbleInterface
  ) => {
    if (!isDraggable || event.pointerType === "mouse") return

    // A touch pointer is implicitly captured by the handle: its moves keep
    // landing here while the finger travels over the other blocks.
    handleDragStart(item)
  }

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse" || !startItem) return

    const block = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>("[data-block-index]")
    const item = block ? orderedValues[Number(block.dataset.blockIndex)] : undefined
    if (item) handleDragOver(item)
  }

  const handlePointerUp = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse") return

    handleDragEnd()
    cancelDrag()
  }

  const cancelDrag = () => {
    setStartItem(undefined)
    setDragIndex(null)
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

  const getBlockForm = (item: IdAbleInterface): FormInterface | undefined => {
    if (Object.hasOwn(item, "type")) {
      return getForm({ type: item.type }) ?? form
    }
    return form
  }

  // An open block validates itself as a sub-form; a folded one is not mounted,
  // so it is validated here and opened when invalid.
  const validateFoldedBlocks = () => {
    const invalidKeys = orderedValues
      .map((item, index) => ({ item, key: itemKey(item, index) }))
      .filter(({ key }) => !isOpen(key))
      .filter(({ item }) =>
        formHasError(
          validateForm(createForm(withoutOrderInput(getBlockForm(item)) ?? {}, item))
        )
      )
      .map(({ key }) => key)

    if (!invalidKeys.length) return true

    setRevealedKeys((keys) => [...keys, ...invalidKeys])
    setOpenStates((states) => ({
      ...states,
      ...Object.fromEntries(invalidKeys.map((key) => [key, true])),
    }))
    return false
  }

  const validateRef = useRef(validateFoldedBlocks)
  useEffect(() => {
    validateRef.current = validateFoldedBlocks
  })

  const { registerSubForm } = formContext
  useEffect(() => registerSubForm?.(() => validateRef.current()), [registerSubForm])

  return (
    <>
      {error && <span className="text-sm text-destructive">{error}</span>}

      {orderedValues.map((item, index) => {
        const itemOrder = item[identifierKey] as unknown as number | undefined
        const isCurrentDragTarget = dragIndex !== null && dragIndex === itemOrder
        const currentForm = getBlockForm(item)
        const blockLabel = currentForm
          ? getFormLabel(currentForm as FormResourceItem)
          : undefined
        const key = itemKey(item, index)
        const isItemOpen = isOpen(key)
        return (
          <Item
            key={key}
            variant="outline"
            className={cn(
              formInput?.form?.className,
              isCurrentDragTarget && "border-primary bg-primary/5",
              "relative flex-col items-stretch"
            )}
            data-block-index={index}
            onDragOver={() => handleDragOver(item)}
            onDragEnd={handleDragEnd}
          >
            <ItemHeader
              className={cn(isItemOpen && "border-b border-border pb-2.5")}
            >
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                {isDraggable && (
                  <span
                    ref={(element) => {
                      controlRefs.current.set(`${key}:handle`, element)
                    }}
                    role="button"
                    tabIndex={0}
                    className="cursor-grab touch-none rounded-sm text-muted-foreground/60 outline-none transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing"
                    draggable
                    onDragStart={() => handleDragStart(item)}
                    onKeyDown={handleHandleKeyDown(index)}
                    onPointerDown={(event) => handlePointerDown(event, item)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={cancelDrag}
                    aria-label={translate("Drag")}
                    aria-keyshortcuts="ArrowUp ArrowDown"
                  >
                    <GripVertical className="size-4" />
                  </span>
                )}
                <BlockOrderInput
                  value={itemOrder}
                  onChange={changeOrder(index)}
                  label={translate("Order")}
                />
                {blockLabel}
              </div>

              <ItemActions>
                <Button
                  ref={(element) => {
                    controlRefs.current.set(`${key}:up`, element)
                  }}
                  variant="ghost"
                  size="icon-sm"
                  type="button"
                  onClick={moveBy(index, -1, "up")}
                  disabled={index === 0}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={translate("Move up")}
                >
                  <ArrowUp className="size-4" />
                </Button>

                <Button
                  ref={(element) => {
                    controlRefs.current.set(`${key}:down`, element)
                  }}
                  variant="ghost"
                  size="icon-sm"
                  type="button"
                  onClick={moveBy(index, 1, "down")}
                  disabled={index === orderedValues.length - 1}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={translate("Move down")}
                >
                  <ArrowDown className="size-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  type="button"
                  onClick={toggleOpen(key)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-expanded={isItemOpen}
                  aria-label={translate(
                    isItemOpen ? "Collapse the block" : "Expand the block"
                  )}
                >
                  {isItemOpen ? (
                    <ChevronDown className="size-4" />
                  ) : (
                    <ChevronRight className="size-4" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  type="button"
                  onClick={remove(item)}
                  className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label={translate("Remove")}
                >
                  <Trash2 className="size-4" />
                </Button>
              </ItemActions>
            </ItemHeader>

            {isItemOpen && (
              <ItemContent>
                <FormInputController
                  validateOnMount={revealedKeys.includes(key)}
                  onChange={(childInput) => handleItemChange(childInput, index)}
                  formInput={{
                    value: item as Required<object>,
                    form: withoutOrderInput(currentForm),
                  }}
                />
              </ItemContent>
            )}
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
          {translate("Add a block")}
        </Button>
      )}
    </>
  )
}
