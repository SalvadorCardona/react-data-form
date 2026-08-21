import { BaseJsonLdItemInterface } from "@/registry/jsonLd/jsonLDItem"
import { mediaObjetToUrl } from "@/internal/utils/mediaObjetToUrl"
import { ComponentProps, useEffect, useState } from "react"
import { cva, VariantProps } from "class-variance-authority"
import { cn } from "@/ui/cn"
import { ImageOff } from "lucide-react"

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
  ...props
}: ImagePropsInterface) => {
  const url = mediaObjetToUrl(src)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false)
  }, [url])

  if (!url || hasError) {
    return (
      <div
        role="img"
        aria-label={alt ?? "Image indisponible"}
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
      onError={() => setHasError(true)}
      className={cn(imageVariants({ variant, className }))}
      {...props}
    />
  )
}
