import { Move, Node } from './board-utils'

export const isDefined = <T>(val: T | undefined | null): val is T =>
  val !== null && val !== undefined

export const isNode = (val: Move | Node): val is Node =>
  val.state !== 'resign' && val.state !== 'swap'

// Explicitly check that all inferred types are used
export function assertNever(x: never): never {
  throw new Error(`Unexpected object in assertNever:\n  ${x}`)
}
