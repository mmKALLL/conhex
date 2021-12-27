export const isDefined = <T>(val: T | undefined | null): val is T =>
  val !== null && val !== undefined
