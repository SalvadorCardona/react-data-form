import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover"
import { Button } from "@/ui/button"
import { formatISO } from "date-fns"
import { Calendar } from "@/ui/calendar"
import { translate } from "react-mini-i18n"
import { formatDate } from "@/internal/date/formatDate"
import { cn } from "@/ui/cn"
import { InputControllerProps } from "@/form/InputControllerInterface"
import { useBoolean } from "@/internal/hook/useBoolean"
import { Calendar1, CircleX } from "lucide-react"

export const DatePickerInputController = ({
  formInput,
  onChange,
}: InputControllerProps<string | null | undefined>) => {
  const { value, setValue } = useBoolean(false)
  const change = (value: Date | undefined) => {
    setValue(false)

    onChange({
      ...formInput,
      ...{ value: value ? formatISO(value) : value },
    })
  }
  const reset = () => {
    onChange({ ...formInput, ...{ value: null } })
  }

  if (formInput.readonly) {
    return <>{formatDate(formInput.value)}</>
  }

  return (
    <div className={"flex"}>
      <Popover open={value} onOpenChange={(value) => setValue(value)}>
        <div className="w-full flex">
          <PopoverTrigger
            render={
              <Button
                variant={"outline"}
                className={cn(
                  "grow justify-between border-r-1 rounded-r-none",
                  !formInput.value && "text-muted-foreground"
                )}
              >
                {formInput.value ? (
                  formatDate(formInput.value)
                ) : (
                  <span>{translate("Choisir une date")}</span>
                )}
                <Calendar1 className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            }
          />
          <Button
            variant={"outline"}
            disabled={!formInput.value}
            className={"justify-items-end p-2 border-l-0 rounded-l-none"}
            onClick={reset}
          >
            <CircleX className={"w-5 h-5 cursor-pointer rounded-l-0"} />
          </Button>
        </div>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={formInput.value ? new Date(formInput.value) : undefined}
            onSelect={change}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
