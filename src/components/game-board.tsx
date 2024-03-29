import React, { useEffect, useMemo, useState } from 'react'
import { BoardNode } from './board-node'
import {
  Node,
  defaultNodePoints,
  getInitialTiles,
  Tile,
  NodeState,
  Point,
  Move,
  getMoveCoordinateString,
} from '../utils/board-utils'
import { BoardTile } from './board-tile'
import {
  doc,
  DocumentData,
  getFirestore,
  onSnapshot,
  QueryDocumentSnapshot,
  setDoc,
  SnapshotOptions,
} from 'firebase/firestore'
import { computeSwapMove, GameState } from '../utils/gamestate-utils'
import { isDefined, isPlayedMove, isSpecialMove } from '../utils/type-utils'

type ColorKey = NodeState | 'stroke' | 'background' | 'selected'

const tileColors: Record<NodeState, string> = {
  empty: '#FFF',
  first: '#AAF', // first player move
  second: '#FAA', // second player move
  fake: '#000',
}

const colors: Record<ColorKey, string> = {
  empty: '#FFF',
  first: '#00F', // first player move (blue)
  second: '#F00', // second player move (red)
  stroke: '#888', // stroke color for vertices or "lines" surrounding tiles
  background: '#FFF',
  selected: '#0F0',
  fake: '#000',
}

export type GameBoardProps = {
  boardSize: number // in number of tiles surrounding the perimeter of the board
  initialState: GameState | undefined // State to initialize board with instead of Firebase. Used when loading a game in book, from URL, or Little Golem
}

export function GameBoard({ boardSize, initialState }: GameBoardProps) {
  const originalMoves = useMemo<Move[]>(
    () => (isDefined(initialState) ? initialState.mainBranch : []),
    []
  )
  const emptyTiles = useMemo(() => getInitialTiles(boardSize), [])
  const [currentBranch, setCurrentBranch] = useState<Move[]>(originalMoves)
  const [moves, setMoves] = useState<Move[]>(originalMoves)
  const [tiles, setTiles] = useState<Tile[]>(emptyTiles)

  const radius = 28
  const strokeWidth = 7

  const boardRenderSize = 600
  const boardZoom = 1
  const scale = 100 // coordinate multiplier, based on rendering the logical (x,y) points using svg

  // Handle tile coloring when game is loaded from SGF
  useEffect(() => {
    if (originalMoves.length > 0) {
      jumpToMove(originalMoves.length, { resetBranch: true })
    }
  }, [originalMoves])

  // Firebase
  const firebaseGameId = undefined // TODO: originalMoves.length === 0 ? 'Pf2JJAfk3Bv6smP5MC01' : undefined
  const db = getFirestore()
  const dbConverter = {
    toFirestore(data: { moves: Node[]; tiles: Tile[]; branch: Node[] }): DocumentData {
      return data
    },
    fromFirestore(
      snapshot: QueryDocumentSnapshot,
      options: SnapshotOptions
    ): { moves: Node[]; tiles: Tile[]; branch: Node[] } {
      const data = snapshot.data(options)!
      return data as { moves: Node[]; tiles: Tile[]; branch: Node[] }
    },
  }
  useEffect(() => {
    if (firebaseGameId) {
      const unsub = onSnapshot(
        doc(db, `games/${firebaseGameId}`).withConverter(dbConverter),
        (doc) => {
          // console.log('Current data: ', doc.data())
          const newMoves = doc.data()?.moves ?? []
          const newTiles = doc.data()?.tiles ?? emptyTiles
          const newBranch = doc.data()?.branch ?? []
          newMoves && setMoves(newMoves)
          newTiles && setTiles(newTiles)
          newBranch && setCurrentBranch(newBranch)
        }
      )
      return unsub
    }
    return () => {}
  }, [firebaseGameId])

  const updateFirebase = (newMoves: Move[], newTiles: Tile[], newBranch: Move[]) => {
    if (firebaseGameId) {
      void setDoc(doc(db, `games/${firebaseGameId}`).withConverter(dbConverter), {
        moves: newMoves,
        tiles: newTiles,
        branch: newBranch,
      })
    }
  }

  // Handle a new move based on mouse click. For traversing the existing moves, use jumpToMove instead.
  const handleMove = (e: React.MouseEvent<SVGCircleElement, MouseEvent>, node: Node): void => {
    e.preventDefault()
    e.stopPropagation()
    e.nativeEvent.preventDefault()
    e.nativeEvent.stopImmediatePropagation()
    if (
      // no existing move with same coordinates
      moves.filter(isPlayedMove).findIndex((move) => move.x === node.x && move.y === node.y) === -1
    ) {
      const { newMoves, newTiles } = computeMove(node, { moves, tiles })
      setMoves(newMoves)
      setTiles(newTiles)

      // Update current play branch, prev/next buttons use the this state as the baseline
      setCurrentBranch(newMoves)
      updateFirebase(newMoves, newTiles, newMoves)
    }
  }

  const computeMove = (
    node: Move,
    { moves, tiles }: { moves: Move[]; tiles: Tile[] }
  ): { newMoves: Move[]; newTiles: Tile[] } => {
    if (isSpecialMove(node)) {
      if (node.state === 'swap' && isPlayedMove(moves[0])) {
        const swappedMove = computeSwapMove(moves[0], boardSize, initialState?.origin)
        return {
          newMoves: [swappedMove, node],
          newTiles: updateTilesForMove(swappedMove, swappedMove.state, emptyTiles),
        }
      }
      return { newMoves: moves.concat(node), newTiles: tiles }
    }

    const lastMove = moves[moves.length - 1]
    const newState =
      lastMove && lastMove.state === 'first' ? ('second' as const) : ('first' as const)
    const newMoves = [...moves, { ...node, state: newState }]
    const newTiles = updateTilesForMove(node, newState, tiles)

    return { newMoves, newTiles }
  }

  const jumpToMove = (
    moveNumber: number,
    { resetBranch }: { resetBranch: boolean } = { resetBranch: false }
  ): void => {
    const branchSlice = resetBranch
      ? originalMoves
      : originalMoves.length > 1 && originalMoves[1]?.state === 'swap'
      ? [...originalMoves.slice(0, 2), ...currentBranch.slice(2, moveNumber)]
      : currentBranch.slice(0, moveNumber)
    const { newMoves, newTiles } = branchSlice.reduce<{ newMoves: Move[]; newTiles: Tile[] }>(
      ({ newMoves, newTiles }, move) => computeMove(move, { moves: newMoves, tiles: newTiles }),
      {
        newMoves: [],
        newTiles: emptyTiles,
      }
    )

    if (resetBranch) {
      setMoves(newMoves)
      setTiles(newTiles)
      setCurrentBranch(newMoves)
      updateFirebase(newMoves, newTiles, newMoves)
    } else {
      setMoves(newMoves)
      setTiles(newTiles)
      updateFirebase(newMoves, newTiles, currentBranch)
    }
  }

  const updateTilesForMove = (newNode: Node, newState: NodeState, tiles: Tile[]): Tile[] => {
    return (
      tiles
        // Update tiles' individual nodes' state
        .map((tile) => ({
          ...tile,
          nodes: tile.nodes.map((n) => ({
            ...n,
            state: n.x === newNode.x && n.y === newNode.y ? newState : n.state,
          })),
        }))
        // Update tile state if majority has been won for the first time
        .map(updateTileStatus)
    )
  }

  const updateTileStatus = (tile: Tile): Tile => ({
    ...tile,
    state:
      tile.state === 'empty'
        ? tile.nodes.filter((n) => n.state === 'first').length >= tile.nodes.length / 2
          ? 'first'
          : tile.nodes.filter((n) => n.state === 'second').length >= tile.nodes.length / 2
          ? 'second'
          : tile.state
        : tile.state,
  })

  return (
    <section className="game-board">
      <div className="board-wrapper">
        <div style={{ height: boardRenderSize * boardZoom }}>
          <svg
            className="no-select"
            viewBox="0 0 1202 1202"
            style={{ position: 'relative', top: 0, left: 0, transformOrigin: 'top left' }}
            width={boardRenderSize}
            height={boardRenderSize}
            transform={`scale(${boardZoom})`}
            xmlns="http://www.w3.org/2000/svg"
          >
            <BoardBase5
              strokeWidth={strokeWidth}
              tiles={tiles}
              scale={scale}
              boardCenter={{ x: 6, y: 6 }}
            />

            {/** Selection border */}
            {moves.length > 0 && isPlayedMove(moves[moves.length - 1]) && (
              <circle
                cx={(moves[moves.length - 1] as Node).x * scale}
                cy={(moves[moves.length - 1] as Node).y * scale}
                r={radius * 1.8}
                stroke="#ffffff"
                strokeWidth="0"
                fill={colors.selected}
                opacity="0.35"
              />
            )}

            {/* Empty nodes with click handler */}
            {defaultNodePoints.map((n, i) => (
              <BoardNode
                key={i}
                x={n.x * scale}
                y={n.y * scale}
                state={n.state}
                fill={colors[n.state]}
                radius={radius}
                stroke="#808080"
                strokeWidth={strokeWidth}
                onClick={(e) => handleMove(e, n)}
              />
            ))}

            {/* Circles for existing moves */}
            {moves.filter(isPlayedMove).map((n, i) => (
              <BoardNode
                key={i + '-move'}
                state={n.state}
                x={n.x * scale}
                y={n.y * scale}
                fill={colors[n.state]}
                radius={radius}
                stroke="#808080"
                strokeWidth={strokeWidth}
                onClick={() => {}}
                style={{ cursor: 'default' }}
              />
            ))}
          </svg>
        </div>
        <div className="board-buttons">
          <button onClick={() => jumpToMove(1)}>&lt;&lt; First</button>
          <button onClick={() => jumpToMove(moves.length - 1)}>&lt; Prev</button>
          <button onClick={() => jumpToMove(moves.length + 1)}>&gt; Next</button>
          <button onClick={() => jumpToMove(currentBranch.length)}>&gt;&gt; Last</button>
          <button
            onClick={() => {
              setCurrentBranch(originalMoves)
              jumpToMove(originalMoves.length, { resetBranch: true })
            }}
          >
            Reset
          </button>
        </div>
      </div>
      <ol className="move-list">
        {moves.map((move, i) => (
          <li key={i} onClick={() => (jumpToMove(i + 1))}>
            {isSpecialMove(move)
              ? move.state
              : getMoveCoordinateString(move, boardSize, initialState?.origin)}
          </li>
        ))}
      </ol>
    </section>
  )
}

/* prettier-ignore */
const BoardBase5 = ({ strokeWidth, tiles, scale, boardCenter }: { strokeWidth: number, tiles: Tile[], scale: number, boardCenter: Point }) => {
  return <>
    <polygon points="0,0 1200,0 0,1200 1200,1200" style={{ fill: tileColors.first, stroke: colors.stroke, strokeWidth }}></polygon>
    <polygon points="0,0 0,1200 1200,0 1200,1200" style={{ fill: tileColors.second, stroke: colors.stroke, strokeWidth }}></polygon>
    {tiles.map((tile, i) =>
      <BoardTile key={i} {...tile} scale={scale} boardCenter={boardCenter} stroke={colors.stroke} strokeWidth={strokeWidth} fill={tileColors[tile.state]} />
    )}
  </>
}
