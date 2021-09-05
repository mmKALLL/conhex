import React from 'react'
import { Point, Tile } from '../utils/board-utils'

export type BoardTileProps = Tile & { scale: number; boardCenter: Point }

export function BoardTile({
  center,
  nodes,
  fakeNodes,
  scale,
  boardCenter,
  stroke,
  strokeWidth,
  fill,
}: BoardTileProps & React.SVGAttributes<SVGPolygonElement>) {
  return (
    <>
      <polygon
        points={nodes
          .concat(fakeNodes)
          .slice()
          .filter((node) => !(node.x === boardCenter.x && node.y === boardCenter.y)) // remove board center node from vertex rendering
          .sort(
            (a, b) =>
              // Return clockwise ordering using cross product of vectors (center -> a) x (center -> b), see https://stackoverflow.com/questions/6989100/sort-points-in-clockwise-order
              (a.x - center.x) * (b.y - center.y) - (b.x - center.x) * (a.y - center.y)
          )
          .map((n) => `${n.x * scale},${n.y * scale}`)
          .join(' ')}
        style={{ fill, stroke, strokeWidth }}
      ></polygon>
    </>
  )
}
