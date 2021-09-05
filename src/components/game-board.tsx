import React, { useState } from 'react'
import { BoardNode } from './board-node'
import { Node, defaultNodePoints } from '../utils/board-utils'

export type GameBoardProps = {
  size: number // in number of tiles surrounding the perimeter of the board
}

export function GameBoard({ }: GameBoardProps) {
  // const initialNodes = Array.from(Array(20), (_, i) => ({
  //   x: Math.floor(Math.random() * i * 1.5) + 2,
  //   y: Math.floor(Math.random() * i * 1.5) + 2,
  //   state: Math.random() < 0.5 ? 'second' : 'first',
  // }))

  const [moves, setMoves] = useState<Node[]>([])
  const lastMove = moves[moves.length - 1]

  // const setNode = (index: number, newState: NodeState) => {
  //   const tempNodes = nodes.slice()
  //   tempNodes[index].state = newState
  //   setNodes(tempNodes)
  // }

  const radius = 28
  const strokeWidth = 7
  // const getNodePosition = (val: number) => val * (radius * 2 + margin)

  const boardSize = 600
  const boardScale = 1
  const coordinateMultiplier = 100 // based on rendering the svg

  return (
    <section>
      <section>Hello, nice board incoming</section>
      <div style={{ height: boardSize * boardScale }}>
        <svg
          className="no-select"
          viewBox="0 0 1202 1202"
          style={{ position: 'relative', top: 0, left: 0, transformOrigin: 'top left' }}
          width={boardSize}
          height={boardSize}
          transform={`scale(${boardScale})`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <BoardBase5 strokeWidth={strokeWidth} />
          {/* <rect width="100%" height="100%" stroke="#000" strokeWidth="2" fill="none" /> */}

          {/** Selection border */}
          {moves.length > 0 && lastMove && (
            <circle
              cx={lastMove.x * coordinateMultiplier}
              cy={lastMove.y * coordinateMultiplier}
              r={radius * 1.8}
              stroke="#ffffff"
              strokeWidth="0"
              fill="#00FF00"
              opacity="0.35"
            />
          )}
          {defaultNodePoints.map((n, i) => (
            <BoardNode
              key={i}
              x={n.x * coordinateMultiplier}
              y={n.y * coordinateMultiplier}
              state={n.state}
              radius={radius}
              stroke="#808080"
              strokeWidth={strokeWidth}
              onClick={e => {
                e.preventDefault()
                e.stopPropagation()
                e.nativeEvent.preventDefault()
                e.nativeEvent.stopImmediatePropagation()
                const node = defaultNodePoints[i]
                if (
                  node &&
                  moves.findIndex(move => move.x === n.x && move.y === n.y) === -1 // no existing move with same coordinates
                ) {
                  setMoves([
                    ...moves,
                    {
                      ...node,
                      state: lastMove && lastMove.state === 'first' ? 'second' : 'first',
                    },
                  ])
                }
              }}
            />
          ))}

          {moves.map((n, i) => (
            <BoardNode
              key={i + '-move'}
              x={n.x * coordinateMultiplier}
              y={n.y * coordinateMultiplier}
              state={n.state}
              radius={radius}
              stroke="#808080"
              strokeWidth={strokeWidth}
              onClick={() => { }}
              style={{ cursor: 'default' }}
            />
          ))}
        </svg>
      </div>
    </section>
  )
}

/* prettier-ignore */
const BoardBase5 = ({ strokeWidth }: { strokeWidth: number }) => {
  return <>
    <polygon points="0,0 1200,0 0,1200 1200,1200" style={{ fill: '#A0A0FF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="0,0 0,1200 1200,0 1200,1200" style={{ fill: '#FFA0A0', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="100,1100 100,900 200,900 300,1000 300,1100" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="100,900 100,700 200,700 200,800 200,900" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="100,700 100,500 200,500 200,600 200,700" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="100,500 100,300 200,300 200,400 200,500" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="100,300 100,100 300,100 300,200 200,300" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="300,100 500,100 500,200 400,200 300,200" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="500,100 700,100 700,200 600,200 500,200" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="700,100 900,100 900,200 800,200 700,200" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="900,100 1100,100 1100,300 1000,300 900,200" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="1100,300 1100,500 1000,500 1000,400 1000,300" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="1100,500 1100,700 1000,700 1000,600 1000,500" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="1100,700 1100,900 1000,900 1000,800 1000,700" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="1100,900 1100,1100 900,1100 900,1000 1000,900" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="700,1000 800,1000 900,1000 900,1100 700,1100" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="500,1000 600,1000 700,1000 700,1100 500,1100" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="300,1000 400,1000 500,1000 500,1100 300,1100" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="200,900 200,800 300,800 400,900 400,1000 300,1000" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="200,800 200,700 200,600 300,600 300,700 300,800" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="200,600 200,500 200,400 300,400 300,500 300,600" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="200,400 200,300 300,200 400,200 400,300 300,400" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="400,300 400,200 500,200 600,200 600,300 500,300" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="600,300 600,200 700,200 800,200 800,300 700,300" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="800,300 800,200 900,200 1000,300 1000,400 900,400" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="900,400 1000,400 1000,500 1000,600 900,600 900,500" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="1000,600 1000,700 1000,800 900,800 900,700 900,600" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="1000,800 1000,900 900,1000 800,1000 800,900 900,800" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="800,900 800,1000 700,1000 600,1000 600,900 700,900" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="400,1000 400,900 500,900 600,900 600,1000 500,1000" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="300,800 300,700 400,700 500,800 500,900 400,900" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="300,700 300,600 300,500 400,500 400,600 400,700" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="300,500 300,400 400,300 500,300 500,400 400,500" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="500,400 500,300 600,300 700,300 700,400 600,400" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="700,400 700,300 800,300 900,400 900,500 800,500" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="800,700 800,600 800,500 900,500 900,600 900,700" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="700,900 700,800 800,700 900,700 900,800 800,900" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="500,900 500,800 600,800 700,800 700,900 600,900" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="400,700 400,600 500,600 600,700 600,800 500,800" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="400,600 400,500 500,400 600,400 600,500 500,600" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="600,500 600,400 700,400 800,500 800,600 700,600" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="600,800 600,700 700,600 800,600 800,700 700,800" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
    <polygon points="500,600 600,500 700,600 600,700" style={{ fill: '#FFFFFF', stroke: '#808080', strokeWidth }}></polygon>
  </>
}
