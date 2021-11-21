import React, { useEffect, useMemo, useState } from 'react'
import { BoardNode } from './board-node'
import {
  Node,
  defaultNodePoints,
  getInitialTiles,
  Tile,
  NodeState,
  Point,
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

type ColorKey = NodeState | 'stroke' | 'background' | 'selected'

const tileColors: Record<NodeState, string> = {
  empty: '#FFF',
  first: '#AAF', // first player move
  second: '#FAA', // second player move
  fake: '#000',
}

const colors: Record<ColorKey, string> = {
  empty: '#FFF',
  first: '#00F', // first player move
  second: '#F00', // second player move
  stroke: '#888', // stroke color for vertices or "lines" surrounding tiles
  background: '#FFF',
  selected: '#0F0',
  fake: '#000',
}

export type GameBoardProps = {
  size: number // in number of tiles surrounding the perimeter of the board
}

export function GameBoard({ size }: GameBoardProps) {
  const originalMoves = useMemo<Node[]>(() => [], []) // TODO: Will eventually be used when loading a game from URL or Little Golem
  const [currentBranch, setCurrentBranch] = useState<Node[]>([])
  const [moves, setMoves] = useState<Node[]>([])
  const [tiles, setTiles] = useState<Tile[]>(getInitialTiles(size))
  const lastMove = moves[moves.length - 1]

  const radius = 28
  const strokeWidth = 7

  const boardSize = 600
  const boardZoom = 1
  const scale = 100 // coordinate multiplier, based on rendering the logical (x,y) points using svg

  // Firebase
  const db = getFirestore()
  const dbConverter = {
    toFirestore(data: { moves: Node[]; tiles: Tile[] }): DocumentData {
      return data
    },
    fromFirestore(
      snapshot: QueryDocumentSnapshot,
      options: SnapshotOptions
    ): { moves: Node[]; tiles: Tile[] } {
      const data = snapshot.data(options)!
      return data as { moves: Node[]; tiles: Tile[] }
    },
  }
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'games/Pf2JJAfk3Bv6smP5MC01').withConverter(dbConverter),
      (doc) => {
        console.log('Current data: ', doc.data())
        const newMoves = doc.data()?.moves ?? []
        newMoves && setMoves(newMoves)
        newMoves && setCurrentBranch(newMoves)
        const newTiles = doc.data()?.tiles ?? getInitialTiles()
        newTiles && setTiles(newTiles)
      }
    )
    return unsub
  const updateFirebase = (newMoves: Node[], newTiles: Tile[], newBranch: Node[]) => {
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
      moves.findIndex((move) => move.x === node.x && move.y === node.y) === -1
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
    node: Node,
    { moves, tiles }: { moves: Node[]; tiles: Tile[] }
  ): { newMoves: Node[]; newTiles: Tile[] } => {
    const lastMove = moves[moves.length - 1]
    const newState =
      lastMove && lastMove.state === 'first' ? ('second' as const) : ('first' as const)
    const newMoves = [...moves, { ...node, state: newState }]
    const newTiles = tiles
      // Update tiles' individual nodes' state
      .map((tile) => ({
        ...tile,
        nodes: tile.nodes.map((n) => ({
          ...n,
          state: n.x === node.x && n.y === node.y ? newState : n.state,
        })),
      }))
      // Update tile state if majority has been won for the first time
      .map(updateTileStatus)

    return { newMoves, newTiles }
  }

  const jumpToMove = (moveNumber: number): void => {
    const newMoves = currentBranch.slice(0, moveNumber)
    setMoves(newMoves)
    // Only keep state of tile nodes which have remained in newMoves (there might be faster ways to do this but on 5x5 perf is not an issue)
    const newTiles = tiles
      .map((tile) => ({
        ...tile,
        nodes: tile.nodes.map((n) => ({
          ...n,
          state: newMoves.some((n2) => n.x === n2.x && n.y === n2.y) ? n.state : 'empty', // FIXME: We need to empty the tile status too
        })),
      }))
      .map(updateTileStatus)
    setTiles(newTiles)
    updateFirebase(newMoves, newTiles, resetBranch ? newMoves : currentBranch)
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
    <section>
      <div style={{ height: boardSize * boardZoom }}>
        <svg
          className="no-select"
          viewBox="0 0 1202 1202"
          style={{ position: 'relative', top: 0, left: 0, transformOrigin: 'top left' }}
          width={boardSize}
          height={boardSize}
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
          {moves.length > 0 && lastMove && (
            <circle
              cx={lastMove.x * scale}
              cy={lastMove.y * scale}
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
          {moves.map((n, i) => (
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
        {/* <button onClick={() => jumpToMove(1)}>&lt;&lt; First</button>
        <button onClick={() => jumpToMove(moves.length - 1)}>&lt; Prev</button>
        <button onClick={() => jumpToMove(moves.length + 1)}>&gt; Next</button>
        <button onClick={() => jumpToMove(currentBranch.length)}>&gt;&gt; Last</button> */}
        <button
          onClick={() => {
            setCurrentBranch(originalMoves)
            jumpToMove(originalMoves.length, { resetBranch: true })
          }}
        >
          Reset
        </button>
      </div>
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
