import { Dispatch, SetStateAction, useCallback, useState } from "react"

export type BooleanStateInterface = {
  /** The current boolean state value. */
  value: boolean
  /** Function to set the boolean state directly. */
  setValue: Dispatch<SetStateAction<boolean>>
  /** Function to set the boolean state to `true`. */
  setTrue: () => void
  /** Function to set the boolean state to `false`. */
  setFalse: () => void
  /** Function to toggle the boolean state. */
  toggle: () => void
}

// const expanded = useBoolean(false)
// const toggleExpand = () => {
//     expanded.toggle()
//   }

export function useBoolean(defaultValue = false): BooleanStateInterface {
  const [value, setValue] = useState(defaultValue)

  const setTrue = useCallback(() => {
    setValue(true)
  }, [])

  const setFalse = useCallback(() => {
    setValue(false)
  }, [])

  const toggle = useCallback(() => {
    setValue((x) => !x)
  }, [])

  return { value, setValue, setTrue, setFalse, toggle }
}
