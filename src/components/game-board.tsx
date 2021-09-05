import React, { useState } from 'react'
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

type ColorKey = NodeState | 'stroke' | 'background' | 'selected'

const tileColors: Record<NodeState, string> = {
  empty: '#FFF',
  first: '#FAA', // first player move
  second: '#AAF', // second player move
  fake: '#000',
}

const colors: Record<ColorKey, string> = {
  empty: '#FFF',
  first: '#F00', // first player move
  second: '#00F', // second player move
  stroke: '#888', // stroke color for vertices or "lines" surrounding tiles
  background: '#FFF',
  selected: '#0F0',
  fake: '#000',
}

export type GameBoardProps = {
  size: number // in number of tiles surrounding the perimeter of the board
}

export function GameBoard({ size }: GameBoardProps) {
  const [moves, setMoves] = useState<Node[]>([])
  const [tiles, setTiles] = useState<Tile[]>(getInitialTiles(size))
  const lastMove = moves[moves.length - 1]

  const radius = 28
  const strokeWidth = 7

  const boardSize = 600
  const boardZoom = 1
  const scale = 100 // coordinate multiplier, based on rendering the logical (x,y) points using svg

  const handleMove = (e: React.MouseEvent<SVGCircleElement, MouseEvent>, node: Node) => {
    e.preventDefault()
    e.stopPropagation()
    e.nativeEvent.preventDefault()
    e.nativeEvent.stopImmediatePropagation()
    if (
      // no existing move with same coordinates
      moves.findIndex((move) => move.x === node.x && move.y === node.y) === -1
    ) {
      const newState = lastMove && lastMove.state === 'first' ? 'second' : 'first'
      setMoves([...moves, { ...node, state: newState }])

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
        .map((tile) => ({
          ...tile,
          state:
            tile.state === 'empty' &&
            tile.nodes.filter((n) => n.state === newState).length >= tile.nodes.length / 2
              ? newState
              : tile.state,
        }))
      setTiles(newTiles)
    }
  }

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
    </section>
  )
}

/* prettier-ignore */
const BoardBase5 = ({ strokeWidth, tiles, scale, boardCenter }: { strokeWidth: number, tiles: Tile[], scale: number, boardCenter: Point }) => {
  return <>
    <polygon points="0,0 0,1200 1200,0 1200,1200" style={{ fill: tileColors.first, stroke: colors.stroke, strokeWidth }}></polygon>
    <polygon points="0,0 1200,0 0,1200 1200,1200" style={{ fill: tileColors.second, stroke: colors.stroke, strokeWidth }}></polygon>
    {tiles.map((tile, i) =>
      <BoardTile key={i} {...tile} scale={scale} boardCenter={boardCenter} stroke={colors.stroke} strokeWidth={strokeWidth} fill={tileColors[tile.state]} />
    )}
  </>
}
