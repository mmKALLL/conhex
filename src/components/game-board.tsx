import React, { useState } from 'react'
import { BoardNode, NodeState, Node } from './board-node'

export type GameBoardProps = {
  size: number // in number of tiles surrounding the perimeter of the board
}

export function GameBoard({ size }: GameBoardProps) {
  const initialNodes = Array.from(Array(20), (_, i) => ({
    x: Math.floor(Math.random() * i * 1.5) + 2,
    y: Math.floor(Math.random() * i * 1.5) + 2,
    state: Math.random() < 0.5 ? 'white' : 'black',
  }))
  console.log(initialNodes)
  const [nodes, setNodes] = useState(initialNodes as Node[])

  const setNode = (index: number, newState: NodeState) => {
    const tempNodes = nodes.slice()
    tempNodes[index].state = newState
    console.log('test')
    setNodes(tempNodes)
  }

  const radius = 8
  const margin = 8
  const getNodePosition = (val: number) => val * (radius * 2 + margin)

  const boardSize = 300
  const boardScale = 1.1

  return (
    <section>
      <section>Hello, nice board incoming</section>
      <div style={{ height: boardSize * boardScale }}>
        <svg
          className="no-select"
          style={{ position: 'relative', top: 0, left: 0, transformOrigin: 'top left' }}
          width={boardSize}
          height={boardSize}
          transform={`scale(${boardScale})`}
        >
          <g>
            <rect width="100%" height="100%" stroke="#000" strokeWidth="2" fill="none" />

            {nodes.map((n, i) => (
              <BoardNode
                key={i}
                x={getNodePosition(n.x)}
                y={getNodePosition(n.y)}
                state={n.state}
                radius={radius}
                onClick={() => setNode(i, nodes[i].state === 'black' ? 'white' : 'black')}
              />
            ))}
          </g>
        </svg>
      </div>
    </section>
  )
}
