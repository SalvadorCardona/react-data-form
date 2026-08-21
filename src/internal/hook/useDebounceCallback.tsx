import { useCallback, useRef } from "react"

//
// import React, { useState } from "react";
// import useDebounceCallback from "./useDebounceCallback";
//
// const SearchComponent: React.FC = () => {
//   const [query, setQuery] = useState("");
//
//   const handleSearch = (value: string) => {
//   };
//
//   const debouncedSearch = useDebounceCallback(handleSearch, 500);
//
//   const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setQuery(event.target.value);
//     debouncedSearch(event.target.value);
//   };
//
//   return (
//     <div>
//       <input
//         type="text"
//         value={query}
//         onChange={handleChange}
//         placeholder="Search..."
//         className="border p-2"
//       />
//     </div>
//   );
// };
//
// export default SearchComponent;

export default function useDebounceCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const callbackRef = useRef(callback)

  // Update the callback ref without triggering a re-render
  callbackRef.current = callback

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    },
    [delay]
  )
}
