import React from 'react'
import { Node } from '../utils/board-utils'

export type BoardNodeProps = Node & {
  radius: number
  onClick: (e: React.MouseEvent<SVGCircleElement, MouseEvent>) => void
}

export function BoardNode({
  x,
  y,
  fill,
  radius,
  onClick,
  ...props
}: BoardNodeProps & React.SVGAttributes<SVGCircleElement>) {
  return (
    <>
      <circle
        cx={x}
        cy={y}
        r={radius * 1.6}
        onClick={(e) => onClick(e)}
        strokeWidth={12}
        fill="#fff"
        style={{ opacity: 0, cursor: 'pointer' }}
      />
      <circle
        cx={x}
        cy={y}
        r={radius}
        {...props}
        fill={fill}
        style={{ cursor: 'pointer' }}
        onClick={(e) => onClick(e)}
      />
    </>
  )
}
