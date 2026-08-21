import { cn } from "@/ui/cn"

export function WysiwygReader({
  content,
  className,
}: {
  content?: string | null
  className?: string
}) {
  return (
    <>
      {content && (
        <div
          className={cn(
            "whitespace-pre-line [&_p]:min-h-[1lh] [&_p+p]:mt-2",
            className
          )}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
    </>
  )
}
