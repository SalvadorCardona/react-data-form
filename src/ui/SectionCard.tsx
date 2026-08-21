import { ElementType, PropsWithChildren, ReactNode } from "react"
import { ChevronDownIcon } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/ui/collapsible"

export function SectionCard({
  title,
  description,
  icon: Icon,
  collapsible = false,
  footer,
  className,
  children,
}: PropsWithChildren<{
  title?: string
  description?: string
  icon?: ElementType
  collapsible?: boolean
  footer?: ReactNode
  className?: string
}>) {
  const header = (
    <CardHeader className="flex items-center gap-3">
      {Icon && (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="size-4" />
        </div>
      )}
      <div className="flex-1">
        {title && <CardTitle className="font-semibold">{title}</CardTitle>}
        {description && <CardDescription>{description}</CardDescription>}
      </div>
      {collapsible && (
        <ChevronDownIcon className="size-5 -rotate-90 transition-transform in-data-open:rotate-0" />
      )}
    </CardHeader>
  )

  const content = <CardContent>{children}</CardContent>

  return (
    <Card className={className}>
      {collapsible ? (
        <Collapsible>
          <CollapsibleTrigger className="w-full cursor-pointer text-left">
            {header}
          </CollapsibleTrigger>
          <CollapsibleContent className="h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0">
            <div className="py-2">{content}</div>
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <>
          {header}
          {content}
        </>
      )}
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  )
}
