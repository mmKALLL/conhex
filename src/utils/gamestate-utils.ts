import { getBoardCoordinateSize, Move, Node, NodeState } from './board-utils'
import { assertNever, isDefined } from './type-utils'

export type GameOrigin = 'conhex.com' | 'little-golem'

export type Player = {
  name: string
  rating: number
  wins: Player[]
  losses: Player[]
}

export type GameState = {
  type: 'ongoing' | 'ended' | 'review'
  origin: GameOrigin
  players: Player[]
  boardSize: number
  mainBranch: Move[]
}

export const computeSwapMove = (
  node: Node,
  boardSize: number,
  origin: GameOrigin | undefined
): Node => {
  if (origin === undefined || origin === 'conhex.com') {
    // Reflect along the diagonal from top-left to bottom-right
    return {
      state: node.state === 'first' ? 'second' : 'first',
      x: node.y,
      y: node.x,
    }
  }
  if (origin === 'little-golem') {
    // Reflect along the diagonal from bottom-left to top-right
    return {
      state: node.state === 'first' ? 'second' : 'first',
      x: getBoardCoordinateSize(boardSize) - node.y,
      y: getBoardCoordinateSize(boardSize) - node.x,
    }
  }
  // TODO: For Yucata, keep x and y the same but change state
  assertNever(origin)
}

// Only Little Golem style support right now. Good to note that their SGFs always have the same fields in the same order. See examples below.
// NOTE: Board coordinates start from bottom left on LG
export const readGame = (sgfText: string | undefined, origin: GameOrigin): GameState => {
  const gameState = {
    type: 'review' as const,
    players: [],
    origin,
    boardSize: 5,
    mainBranch: [],
  }
  if (sgfText === undefined) {
    return gameState
  }
  const baseText = sgfText.split('\n').join('').replace(/^\(/, '').replace(/\)$/, '') // join newlines, trim surrounding parentheses
  let gameType, variant, event, firstPlayer, secondPlayer, sgfOrigin, remaining
  ;[gameType, remaining] = baseText.split(/(?<=FF\[[^\]]*\])/) // use lookbehind assertion to avoid removing the match with .split()

  if (!gameType?.toLowerCase().includes('conhex')) {
    throw new Error('Loaded game does not match expected format (SGF FF field is not CONHEX).')
  }

  ;[variant, remaining] = remaining!.split(/(?<=VA\[[^\]]*\])/)

  if (!variant?.toLowerCase().includes('conhex')) {
    throw new Error(
      "Loaded game's variation does not match expected format (SGF VA field is not CONHEX)"
    )
  }

  // TODO: add player fields to gameState
  // TODO: if field order becomes a problem, use a map object for matches
  ;[event, remaining] = remaining!.split(/(?<=EV\[[^\]]*\])/).map((s) => s.trim())
  ;[firstPlayer, remaining] = remaining!.split(/(?<=PB\[[^\]]*\])/).map((s) => s.trim())
  ;[secondPlayer, remaining] = remaining!.split(/(?<=PW\[[^\]]*\])/).map((s) => s.trim())
  ;[sgfOrigin, remaining] = remaining!.split(/(?<=SO\[[^\]]*\])/).map((s) => s.trim())

  const moves = remaining!.split(/(?<=;.*?[BRW]\[[^\]]*?\])/)

  console.log(
    [gameType, variant, event, firstPlayer, secondPlayer, sgfOrigin, moves.join('\n')].join('\n')
  )

  const allMoves = moves
    .map((s) => s.trim().match(/;.*?([BRW])\[(.*)\]/) ?? undefined)
    .map((matches) => matches?.slice(1)) // drop the full match and process only [player, coordinate] tuple, e.g. ["B", "J4"]
  const mainBranch = allMoves.filter(isDefined).map((s): Move => {
    if (s[1] === 'resign' || s[1] === 'swap') {
      return { state: s[1] }
    }
    const state: NodeState = s[0] === 'B' ? 'first' : 'second'
    const column = s[1]?.slice(0, 1)
    const row = Number.parseInt(s[1]?.slice(1) ?? '', 10)

    if (column === undefined || row === undefined || isNaN(row)) {
      throw new Error(
        `Can\'t parse state from "${s}", input move should be in format ";B[D10]". Allowed colors are "B" for first player and "R" or "W" for second.`
      )
    }

    return {
      state,
      x: column.toUpperCase().charCodeAt(0) - 64, // A => 1, B => 2, etc
      y: gameState.boardSize * 2 + 2 - row, // reverse row since LG counts from bottom right but I from top left
    }
  })

  return { ...gameState, mainBranch }
}

/** Try to read following game (https://www.littlegolem.net/jsp/game/game.jsp?gid=2203451):
 * (;FF[CONHEX]VA[CONHEX]EV[conhex.ch.21.1.1]PB[David Milne]PW[leandro ?]SO[https://www.littlegolem.net];
 * B[J3];R[H5];B[I6];R[I8];B[H7];R[I4];B[J4];R[I7];B[H6];R[J6];B[I5];R[G9];B[E8];R[F8];B[C10];R[D9];B[C8];
 * R[B8];B[B9];R[D6];B[D7];R[F7];B[G8];R[F9];B[C5];R[C6];B[D5];R[E3];B[C2];R[C4];B[D3];R[resign])
 */

/** With swap:
 * https://www.littlegolem.net/jsp/game/game.jsp?gid=2169205
 * (;FF[CONHEX]VA[CONHEX]EV[conhex.ch.19.1.1]PB[David Milne]PW[mmKALLL]SO[https://www.littlegolem.net]
 * ;B[J3];R[swap];B[J9];R[G4];B[J3];R[I6];B[J6];R[J5];B[J4];R[J7];B[I5];R[I7];B[H5];R[E9];B[H7];R[G9]
 * ;B[B9];R[B8];B[H9];R[G8];B[A11];R[B7];B[D9];R[C8];B[resign])
 *
 * https://www.littlegolem.net/jsp/game/game.jsp?gid=2273728
 * (;FF[CONHEX]VA[CONHEX]EV[conhex.ch.26.1.1]PB[David Milne]PW[mmKALLL]SO[https://www.littlegolem.net]
 * ;B[J3];R[swap];B[J9];R[G4];B[J3];R[J5];B[J4];R[J6];B[E4];R[E6];B[F5];R[H7];B[D7];R[E9];B[B9];R[B8]
 * ;B[D9];R[D10];B[F8];R[G8];B[F9];R[E8];B[resign])
 *
 *
 */
