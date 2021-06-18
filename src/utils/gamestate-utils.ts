import { Node } from "./board-utils"

type Player = {
  name: string
  rating: number
  wins: Player[]
  losses: Player[]
}

type GameState = {
  type: 'ongoing' | 'ended' | 'review'
  players: Player[]
  boardSize: number
  mainBranch: Node[]
}

const readGame = (sgfText: string): GameState => {
  let baseText = sgfText.split(/\w*\n\w*/).join('')
  let [header, remaining] = baseText.split(/(?<=FF\[CONHEX\])/)
  console.log(header, '\n', remaining)

  if (!header.toLowerCase().includes('conhex')) {
    throw new Error(
      'Loaded game does not match expected format (SGF FF field is not CONHEX).'
    )
  }

  return {
    type: 'review',
    players: [],
    boardSize: 5,
    mainBranch: [],
  }
}

/** Try to read following game:
 * (;FF[CONHEX]VA[CONHEX]EV[conhex.ch.21.1.1]PB[David Milne]PW[leandro ?]SO[https://www.littlegolem.net];
 * B[J3];R[H5];B[I6];R[I8];B[H7];R[I4];B[J4];R[I7];B[H6];R[J6];B[I5];R[G9];B[E8];R[F8];B[C10];R[D9];B[C8];
 * R[B8];B[B9];R[D6];B[D7];R[F7];B[G8];R[F9];B[C5];R[C6];B[D5];R[E3];B[C2];R[C4];B[D3];R[resign])
 */
readGame(
  `(;FF[CONHEX]VA[CONHEX]EV[conhex.ch.21.1.1]PB[David Milne]PW[leandro ?]SO[https://www.littlegolem.net];B[J3];R[H5];B[I6];R[I8];B[H7];R[I4];B[J4];R[I7];B[H6];R[J6];B[I5];R[G9];B[E8];R[F8];B[C10];R[D9];B[C8];R[B8];B[B9];R[D6];B[D7];R[F7];B[G8];R[F9];B[C5];R[C6];B[D5];R[E3];B[C2];R[C4];B[D3];R[resign])`
)

