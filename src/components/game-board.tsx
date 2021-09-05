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
      <section>Hello, nice board incoming</section>
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

  // return <>
  //   <polygon points="0,0 1200,0 0,1200 1200,1200" style={{ fill: '#A0A0FF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="0,0 0,1200 1200,0 1200,1200" style={{ fill: '#FFA0A0', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="100,1100 100,900 200,900 300,1000 300,1100" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="100,900 100,700 200,700 200,800 200,900" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="100,700 100,500 200,500 200,600 200,700" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="100,500 100,300 200,300 200,400 200,500" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="100,300 100,100 300,100 300,200 200,300" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="300,100 500,100 500,200 400,200 300,200" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="500,100 700,100 700,200 600,200 500,200" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="700,100 900,100 900,200 800,200 700,200" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="900,100 1100,100 1100,300 1000,300 900,200" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="1100,300 1100,500 1000,500 1000,400 1000,300" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="1100,500 1100,700 1000,700 1000,600 1000,500" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="1100,700 1100,900 1000,900 1000,800 1000,700" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="1100,900 1100,1100 900,1100 900,1000 1000,900" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="700,1000 800,1000 900,1000 900,1100 700,1100" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="500,1000 600,1000 700,1000 700,1100 500,1100" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="300,1000 400,1000 500,1000 500,1100 300,1100" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="200,900 200,800 300,800 400,900 400,1000 300,1000" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="200,800 200,700 200,600 300,600 300,700 300,800" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="200,600 200,500 200,400 300,400 300,500 300,600" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="200,400 200,300 300,200 400,200 400,300 300,400" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="400,300 400,200 500,200 600,200 600,300 500,300" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="600,300 600,200 700,200 800,200 800,300 700,300" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="800,300 800,200 900,200 1000,300 1000,400 900,400" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="900,400 1000,400 1000,500 1000,600 900,600 900,500" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="1000,600 1000,700 1000,800 900,800 900,700 900,600" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="1000,800 1000,900 900,1000 800,1000 800,900 900,800" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="800,900 800,1000 700,1000 600,1000 600,900 700,900" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="400,1000 400,900 500,900 600,900 600,1000 500,1000" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="300,800 300,700 400,700 500,800 500,900 400,900" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="300,700 300,600 300,500 400,500 400,600 400,700" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="300,500 300,400 400,300 500,300 500,400 400,500" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="500,400 500,300 600,300 700,300 700,400 600,400" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="700,400 700,300 800,300 900,400 900,500 800,500" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="800,700 800,600 800,500 900,500 900,600 900,700" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="700,900 700,800 800,700 900,700 900,800 800,900" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="500,900 500,800 600,800 700,800 700,900 600,900" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="400,700 400,600 500,600 600,700 600,800 500,800" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="400,600 400,500 500,400 600,400 600,500 500,600" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="600,500 600,400 700,400 800,500 800,600 700,600" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="600,800 600,700 700,600 800,600 800,700 700,800" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  //   <polygon points="500,600 600,500 700,600 600,700" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  // </>
}
