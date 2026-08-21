import * as React from "react"
import { cn } from "@/ui/cn"

const LogoPort = () => {
  const Logo = getPorts().components.logo
  return <Logo />
}
import { getPorts } from "@/ports"

interface LoaderProps {
  isLoading?: boolean
  children?: React.ReactNode
  className?: string
}

export default function Loader({
  isLoading = true,
  children,
  className,
}: LoaderProps) {
  if (children === undefined) {
    return <LoaderSpinner className={className} />
  }

  return (
    <div className={cn("relative", className)}>
      <div className={cn(isLoading && "invisible")} aria-hidden={isLoading}>
        {children}
      </div>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoaderSpinner />
        </div>
      )}
    </div>
  )
}

function LoaderSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn("w-full h-full flex justify-center items-center p-5", className)}
    >
      <div className="relative size-20">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-muted animate-spin-slow" />
        {/* Inner rotating element */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        {/* Center dot */}
        <div className="absolute inset-0 m-auto size-3 rounded-full animate-pulse flex items-center justify-center ">
          <LogoPort />
        </div>
      </div>
    </div>
  )
}

export function LittleLoader() {
  return (
    <div className="relative size-5">
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border-4 border-muted animate-spin-slow" />
      {/* Inner rotating element */}
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
    </div>
  )
}

interface DotLoaderProps {
  className?: string
  dotClassName?: string
  text?: string
}

export function DotLoader({ className, dotClassName, text }: DotLoaderProps) {
  return (
    <div className={cn("flex items-center gap-2 text-foreground", className)}>
      {text && <span className="text-sm">{text}</span>}
      <div className="flex items-center gap-1">
        <span
          className={cn(
            "size-2 rounded-full bg-current animate-bounce [animation-delay:-0.3s] text-muted-foreground",
            dotClassName
          )}
        />
        <span
          className={cn(
            "size-2 rounded-full bg-current animate-bounce [animation-delay:-0.15s] text-muted-foreground",
            dotClassName
          )}
        />
        <span
          className={cn(
            "size-2 rounded-full bg-current animate-bounce text-muted-foreground",
            dotClassName
          )}
        />
      </div>
    </div>
  )
}

export function PageLoader({
  isLoading,
  isFixed = true,
}: {
  isLoading?: boolean
  isFixed?: boolean
}) {
  if (!isLoading) return null

  return (
    <div
      className={cn(
        "inset-0 z-50 flex items-center justify-center bg-background",
        isFixed ? "fixed" : "absolute w-full h-full"
      )}
    >
      <div className="flex flex-col items-center gap-8">
        {/* Loading text */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-lg font-medium text-foreground animate-pulse">
            <LogoPort />
          </div>
          <div className="flex gap-1">
            <span className="size-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
            <span className="size-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
            <span className="size-2 rounded-full bg-primary animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  )
}
