import React from 'react'
import { Tile } from '../utils/board-utils'

export type BoardTileProps = Tile & { scale: number }

export function BoardTile({
  nodes,
  scale,
  stroke,
  strokeWidth,
  fill,
}: BoardTileProps & React.SVGAttributes<SVGPolygonElement>) {
  return (
    <>
      {/* "100,900 100,700 200,700 200,800 200,900" */}
      <polygon
        points={nodes.map((n) => `${n.x * scale},${n.y * scale}`).join(' ')}
        style={{ fill, stroke, strokeWidth }}
      ></polygon>
    </>
  )
}
