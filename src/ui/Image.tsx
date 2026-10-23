import { BaseJsonLdItemInterface, getLdIri } from "jsonld-item"
import { ComponentProps, useEffect, useState } from "react"
import { cva, VariantProps } from "class-variance-authority"
import { cn } from "@/ui/cn"
import { ImageOff } from "lucide-react"
import { translate } from "react-mini-i18n"

const imageVariants = cva("object-contain", {
  variants: {
    variant: {
      default: "rounded-lg",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

// @ts-expect-error i test the value
export interface ImagePropsInterface
  extends ComponentProps<"img">, VariantProps<typeof imageVariants> {
  src: string | BaseJsonLdItemInterface | undefined | null
  alt?: string
}

export const Image = ({
  alt,
  className,
  variant,
  src,
  onError,
  ...props
}: ImagePropsInterface) => {
  // The source is used as is: resolving a media to a URL is the media port's job.
  const url = src ? getLdIri(src) : undefined
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false)
  }, [url])

  if (!url || hasError) {
    return (
      <div
        role="img"
        aria-label={alt ?? translate("Image unavailable")}
        className={cn(
          imageVariants({ variant, className }),
          "flex items-center justify-center bg-muted text-muted-foreground"
        )}
      >
        <ImageOff className="size-6 opacity-50" aria-hidden="true" />
      </div>
    )
  }

  return (
    <img
      src={url}
      alt={alt ?? ""}
      className={cn(imageVariants({ variant, className }))}
      {...props}
      onError={(event) => {
        onError?.(event)
        setHasError(true)
      }}
    />
  )
}
