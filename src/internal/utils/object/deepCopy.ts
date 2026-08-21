export function deepCopy<T>(
  obj: T,
  seen: WeakMap<object, unknown> = new WeakMap()
): T {
  if (obj === null || typeof obj !== "object") {
    return obj
  }

  // Les ReactElement (et ReactPortal, etc.) sont identifiés par la propriété
  // `$$typeof` qui est un Symbol. Ils sont immuables et contiennent des
  // références circulaires (children → owner → ...), donc on les retourne tels quels.
  if (typeof (obj as { $$typeof?: unknown }).$$typeof === "symbol") {
    return obj
  }

  if (seen.has(obj as object)) {
    return seen.get(obj as object) as T
  }

  if (Array.isArray(obj)) {
    const copyArray: unknown[] = []
    seen.set(obj as object, copyArray)
    for (const item of obj) {
      copyArray.push(deepCopy(item, seen))
    }
    return copyArray as unknown as T
  }

  const copyObject: { [key: string]: unknown } = {}
  seen.set(obj as object, copyObject)
  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      copyObject[key] = deepCopy((obj as { [key: string]: unknown })[key], seen)
    }
  }
  return copyObject as T
}
