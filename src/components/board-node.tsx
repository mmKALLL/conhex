import * as React from 'react'

export type Point = { x: number; y: number }
export type NodeState = 'empty' | 'black' | 'white'
export type Node = Point & { state: NodeState }
export type BoardNodeProps = Node & {
  radius: number
  onClick: (e: React.MouseEvent<SVGCircleElement, MouseEvent>) => void
}

export function BoardNode({ x, y, state, radius, onClick }: BoardNodeProps) {
  return (
    <>
      <circle
        onClick={e => {
          onClick(e)
        }}
        cx={x}
        cy={y}
        r={radius}
        stroke="#000"
        {...(state === 'black'
          ? { fill: '#000' }
          : { stroke: '#000', strokeWidth: 2, fill: '#fff' })}
      />
    </>
  )
}
