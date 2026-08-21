import { useState } from "react"

import { CirclePlus, LayoutGrid } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/ui/dialog"
import { Button } from "@/ui/button"
import { cn } from "@/ui/cn"
import { translate } from "react-mini-i18n"

import { FormResourceItem, getFormLabel } from "@/form/utils/addForm"

interface AddFormBlockDialogProps {
  forms: FormResourceItem[]
  onSelect: (form: FormResourceItem) => void
  className?: string
}

/**
 * An "Add" button opening a dialog to pick which block (form) to insert. This
 * is the page-builder palette: every form registered through `addForm` becomes
 * a selectable block type.
 */
export const AddFormBlockDialog = ({
  forms,
  onSelect,
  className,
}: AddFormBlockDialogProps) => {
  const [open, setOpen] = useState(false)

  const handleSelect = (form: FormResourceItem) => {
    onSelect(form)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            className={cn("col-span-full", className)}
            variant="secondary"
            type="button"
          />
        }
      >
        <CirclePlus />
        {translate("form.array.add")}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{translate("form.array.add.title")}</DialogTitle>
          <DialogDescription>
            {translate("form.array.add.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {forms.map((form) => {
            const Icon = form.icon ?? LayoutGrid
            return (
              <button
                key={form["@id"]}
                type="button"
                onClick={() => handleSelect(form)}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-background p-4 text-center text-sm font-medium transition-colors",
                  "hover:border-primary hover:bg-primary/5 hover:text-primary",
                  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
                )}
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground group-hover:text-primary [&_svg]:size-5">
                  <Icon />
                </span>
                {getFormLabel(form)}
              </button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
