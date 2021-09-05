export type Point = { x: number; y: number }
export type NodeState = 'empty' | 'first' | 'second'
export type Node = Point & { state: NodeState }
export type Tile = { position: Point; neighbors: Tile[]; nodes: Point[] }

// Rotate a point 90 degrees clockwise
const rotateClockwise = (position: Point, rotations: number, size: number = 5): Point => {
  const rotate = (p: Point) => ({
    x: p.y,
    y: -p.x,
  })
  // We need to rotate by the origin, so translate the point for processing
  const offset = size + 1
  const offsetPosition = { x: position.x - offset, y: position.y - offset }
  const newPosition = Array(rotations).reduce<Point>(
    (acc, _) => rotate(acc),
    offsetPosition
  )
  return { x: newPosition.x + offset, y: newPosition.y + offset }
}

const isPointWithinRect = (
  point: Point,
  rect: Point,
  rectWidth: number,
  rectHeight: number
) =>
  point.x >= rect.x &&
  point.x <= rect.x + rectWidth &&
  point.y >= rect.y &&
  point.y <= rect.y + rectHeight

const getTileNodes = (
  positions: Point[],
  rectWidth: number,
  rectHeight: number
): Pick<Tile, 'position' | 'nodes'>[] => {
  return positions.map(p => ({
    position: p,
    nodes: defaultNodePoints.filter(node =>
      isPointWithinRect(node, p, rectWidth, rectHeight)
    ),
  }))
}

const getQuadrantTiles = (rotations: number, size: number = 5) => {
  // Get tiles on top-left diagonal. First get the top-left corner point of the smallest square that would encompass each tile
  const diagPoints: Point[] = Array.from(Array(size - 1), (_, i) => ({
    x: i + 1,
    y: i + 1,
  }))

  // Map each diagonal tile's topleft coordinate to its nodes by checking which nodes would be inside the 2x2 square
  const diagTileNodes = getTileNodes(diagPoints, 2, 2)

  // Getting the long tiles is similar but a bit more involved. First get top-left coordinate of tiles along top edge.
  // The base x-y is mapped into board x-y.
  // Each horizontal tile creates a diagonal "cascade" in order to recreate the "inverse pyramid" along the top edge.
  const horizPoints: Point[] = []
  for (let x = 0; x < size - 2; x++) {
    for (let y = 0; y < size - 2 - x; y++) {
      horizPoints.push({ x: x * 2 + 3, y: y + 1 })
    }
  }

  // Map each tile's topleft coordinate to its nodes
  const horizTileNodes = getTileNodes(horizPoints, 2, 1)

  // Finally rotate the whole thing
  const allTiles = diagTileNodes.concat(horizTileNodes)
  const rotatedTiles = allTiles.map(t => ({
    position: rotateClockwise(t.position, rotations, size),
    nodes: t.nodes.map(n => rotateClockwise(n, rotations, size)),
  }))
  return rotatedTiles
}

export const getInitialTiles = (size: number = 5) => {
  // First get tile nodes for each quadrant and flat them into a single array of tiles
  let tiles = Array.from(Array(4), (_, i) => getQuadrantTiles(i, size)).flat(Infinity)

  // Add the center tile
  tiles.push(getTileNodes([{ x: size, y: size }], 2, 2))

  // Then we find each tile's neighbors by checking if they share a node
  // TODO
}

export const defaultNodePoints: Node[] = [
  { x: 1, y: 11, state: 'empty' },
  { x: 1, y: 1, state: 'empty' },
  { x: 2, y: 9, state: 'empty' },
  { x: 2, y: 8, state: 'empty' },
  { x: 2, y: 7, state: 'empty' },
  { x: 2, y: 6, state: 'empty' },
  { x: 2, y: 5, state: 'empty' },
  { x: 2, y: 4, state: 'empty' },
  { x: 2, y: 3, state: 'empty' },
  { x: 3, y: 10, state: 'empty' },
  { x: 3, y: 8, state: 'empty' },
  { x: 3, y: 7, state: 'empty' },
  { x: 3, y: 6, state: 'empty' },
  { x: 3, y: 5, state: 'empty' },
  { x: 3, y: 4, state: 'empty' },
  { x: 3, y: 2, state: 'empty' },
  { x: 4, y: 10, state: 'empty' },
  { x: 4, y: 9, state: 'empty' },
  { x: 4, y: 7, state: 'empty' },
  { x: 4, y: 6, state: 'empty' },
  { x: 4, y: 5, state: 'empty' },
  { x: 4, y: 3, state: 'empty' },
  { x: 4, y: 2, state: 'empty' },
  { x: 5, y: 10, state: 'empty' },
  { x: 5, y: 9, state: 'empty' },
  { x: 5, y: 8, state: 'empty' },
  { x: 5, y: 6, state: 'empty' },
  { x: 5, y: 4, state: 'empty' },
  { x: 5, y: 3, state: 'empty' },
  { x: 5, y: 2, state: 'empty' },
  { x: 6, y: 10, state: 'empty' },
  { x: 6, y: 9, state: 'empty' },
  { x: 6, y: 8, state: 'empty' },
  { x: 6, y: 7, state: 'empty' },
  { x: 6, y: 6, state: 'empty' },
  { x: 6, y: 5, state: 'empty' },
  { x: 6, y: 4, state: 'empty' },
  { x: 6, y: 3, state: 'empty' },
  { x: 6, y: 2, state: 'empty' },
  { x: 7, y: 10, state: 'empty' },
  { x: 7, y: 9, state: 'empty' },
  { x: 7, y: 8, state: 'empty' },
  { x: 7, y: 6, state: 'empty' },
  { x: 7, y: 4, state: 'empty' },
  { x: 7, y: 3, state: 'empty' },
  { x: 7, y: 2, state: 'empty' },
  { x: 8, y: 10, state: 'empty' },
  { x: 8, y: 9, state: 'empty' },
  { x: 8, y: 7, state: 'empty' },
  { x: 8, y: 6, state: 'empty' },
  { x: 8, y: 5, state: 'empty' },
  { x: 8, y: 3, state: 'empty' },
  { x: 8, y: 2, state: 'empty' },
  { x: 9, y: 10, state: 'empty' },
  { x: 9, y: 8, state: 'empty' },
  { x: 9, y: 7, state: 'empty' },
  { x: 9, y: 6, state: 'empty' },
  { x: 9, y: 5, state: 'empty' },
  { x: 9, y: 4, state: 'empty' },
  { x: 9, y: 2, state: 'empty' },
  { x: 10, y: 9, state: 'empty' },
  { x: 10, y: 8, state: 'empty' },
  { x: 10, y: 7, state: 'empty' },
  { x: 10, y: 6, state: 'empty' },
  { x: 10, y: 5, state: 'empty' },
  { x: 10, y: 4, state: 'empty' },
  { x: 10, y: 3, state: 'empty' },
  { x: 11, y: 11, state: 'empty' },
  { x: 11, y: 1, state: 'empty' },
]