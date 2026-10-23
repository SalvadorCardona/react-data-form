import { useCallback, useLayoutEffect, useRef } from "react"

/**
 * Returns a stable function that always runs the latest `callback`.
 *
 * Meant for effects that must read the current props and state without
 * re-running when they change — what `useEffectEvent` does from React 19.2,
 * while the peer dependency still allows 19.0.
 */
export function useEffectCallback<Args extends unknown[], Result>(
  callback: (...args: Args) => Result
): (...args: Args) => Result {
  const callbackRef = useRef(callback)

  useLayoutEffect(() => {
    callbackRef.current = callback
  })

  return useCallback((...args: Args) => callbackRef.current(...args), [])
}
