import { Move, Node, ResignMove, SwapMove } from './board-utils'

export const isDefined = <T>(val: T | undefined | null): val is T =>
  val !== null && val !== undefined

export const isPlayedMove = (val: Move | Node | undefined): val is Node =>
  isDefined(val) && (val.state === 'first' || val.state === 'second')

export const isSpecialMove = (val: Move | Node): val is ResignMove | SwapMove =>
  val.state === 'resign' || val.state === 'swap'

// Explicitly check that all inferred types are used
export function assertNever(x: never): never {
  throw new Error(`Unexpected object in assertNever:\n  ${x}`)
}
