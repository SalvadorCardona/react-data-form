import { Checkbox } from "@/ui/checkbox"
import { InputControllerInterface } from "@/form/InputControllerInterface"
import { FormInputInterface } from "@/form/FormInputInterface"
import { Item, ItemContent } from "@/ui/item"

export interface CheckboxFormInputInterface extends FormInputInterface {
  title?: string
  subTitle?: string
}

export function createCheckboxFormInput(props: CheckboxFormInputInterface) {
  return {
    controller: CheckboxInputController,
    ...props,
  } as CheckboxFormInputInterface
}

export const CheckboxInputController = ({
  formInput,
  onChange,
}: InputControllerInterface<CheckboxFormInputInterface>) => {
  const change = (value: boolean) => {
    onChange({ ...formInput, ...{ value: Boolean(value) } })
  }

  const value = !!formInput?.value
  const toggle = () => {
    change(!value)
  }

  return (
    <Item
      onClick={toggle}
      className="cursor-pointer border-muted hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:bg-primary/10 has-[[aria-checked=true]]:border-primary dark:has-[[aria-checked=true]]:border-primary dark:has-[[aria-checked=true]]:bg-primary"
    >
      <div>
        <Checkbox
          name={formInput.name}
          checked={value}
          onCheckedChange={(e) => change(e as boolean)}
          id={formInput.id}
        />
      </div>
      <ItemContent>
        <div className="grid gap-1.5 font-normal">
          {formInput.title && (
            <label
              htmlFor={formInput.id}
              className="cursor-pointer text-sm leading-none font-medium"
            >
              {formInput.title}
            </label>
          )}
          {formInput.subTitle && (
            <p className="text-muted-foreground text-sm">{formInput.subTitle}</p>
          )}
        </div>
      </ItemContent>
    </Item>
  )
}
