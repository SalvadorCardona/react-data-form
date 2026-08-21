interface ZodError extends Error {
  issues?: ZodIssueBase[]
}

export function isZodError(error: Error): error is ZodError {
  return Object.hasOwn(error, "issues")
}

interface ZodIssueBase {
  readonly code?: string
  readonly input?: unknown
  readonly path: PropertyKey[]
  readonly message: string
}

export default interface ViolationInterface {
  /** @description The property path of the violation */
  propertyPath?: string
  /** @description The message associated with the violation */
  message?: string
  code?: string
}

export function createViolation(violation: ViolationInterface): ViolationInterface {
  return {
    ...violation,
  }
}
