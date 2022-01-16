import { GameOrigin } from './gamestate-utils'
import { assertNever } from './type-utils'

export type Point = { x: number; y: number }
export type NodeState = 'empty' | 'first' | 'second' | 'fake'
export type Node = Point & { state: NodeState }
export type ResignMove = { state: 'resign' }
export type SwapMove = { state: 'swap' }
export type Move = Node | ResignMove | SwapMove
export type Tile = {
  position: Point
  center: Point // not actual center; approximate needed for constructing convex hull when rendering
  nodes: Node[]
  fakeNodes: Node[] // used for rendering an area for the edges
  neighbors: Point[] // positions of neighboring tiles
  state: NodeState
}

const emptyTile: Tile = {
  position: { x: 0, y: 0 },
  center: { x: 0, y: 0 },
  nodes: [],
  fakeNodes: [],
  neighbors: [],
  state: 'empty' as const,
}

export const getMoveCoordinateString = (
  node: Node,
  origin: GameOrigin | undefined,
  boardSize: number
) =>
  origin === undefined || origin === 'conhex.com'
    ? `${String.fromCharCode(64 + node.y)}${node.x}`
    : origin === 'little-golem'
    ? `${String.fromCharCode(64 + (getBoardCoordinateSize(boardSize) - node.y))}${node.x}` // Reversed Y axis
    : assertNever(origin)

// Convert boardSize to the coordinate size
export const getBoardCoordinateSize = (boardSize: number): number => boardSize * 2 + 2

// Rotate a point 90 degrees clockwise
const rotateClockwise = <T extends Point>(position: T, rotations: number, size: number = 5): T => {
  const rotate = (p: Point) => ({
    x: p.y,
    y: -p.x,
  })
  // We need to rotate by the origin, so translate the point to be based around (0,0) for processing
  const offset = size + 1
  const offsetPosition = { x: position.x - offset, y: position.y - offset }
  // Run the reduce `rotations` number of times
  const newPosition = Array(rotations)
    .fill(0)
    .reduce<Point>((acc, _) => rotate(acc), offsetPosition)
  return { ...position, x: newPosition.x + offset, y: newPosition.y + offset }
}

const isPointWithinRect = (
  point: Point,
  rect: Point,
  rectWidth: number,
  rectHeight: number,
  size: number
) =>
  // Is inside rectangle
  point.x >= rect.x &&
  point.x <= rect.x + rectWidth &&
  point.y >= rect.y &&
  point.y <= rect.y + rectHeight &&
  // Is not the dead center point (to exclude center of diagonals tiles' bounding box)
  !(point.x === rect.x + rectWidth / 2 && point.y === rect.y + rectHeight / 2) &&
  // Is not the center tile center point (since it might be inside diagonal tiles' bounding box)
  !(point.x === size + 1 && point.y === size + 1)

const getTileNodes = (
  positions: Point[],
  rectWidth: number,
  rectHeight: number,
  size: number
): Pick<Tile, 'position' | 'nodes' | 'fakeNodes'>[] => {
  return positions.map((p) => ({
    position: p,
    nodes: defaultNodePoints.filter((node) =>
      isPointWithinRect(node, p, rectWidth, rectHeight, size)
    ),
    fakeNodes: fakeNodePoints(size).filter((node) =>
      isPointWithinRect(node, p, rectWidth, rectHeight, size)
    ),
  }))
}

const getQuadrantTiles = (rotations: number, size: number = 5): Tile[] => {
  // Get tiles on top-left diagonal. First get the top-left corner point of the smallest square that would encompass each tile
  const diagPoints: Point[] = Array.from(Array(size - 1), (_, i) => ({
    x: i + 1,
    y: i + 1,
  }))

  // Map each diagonal tile's topleft coordinate to its nodes by checking which nodes would be inside the 2x2 square
  const diagTileNodes = getTileNodes(diagPoints, 2, 2, size)

  // Getting the long tiles is similar but a bit more involved. First get top-left coordinate of tiles along top edge.
  // The base x-y is mapped into board x-y.
  // Each horizontal tile creates a diagonal "cascade" in order to recreate the "inverse pyramid" along the top edge.
  const horizPoints: Point[] = []
  for (let x = 0; x < size - 2; x++) {
    for (let y = 0; y < size - 2 - x; y++) {
      horizPoints.push({ x: x * 2 + y + 3, y: y + 1 })
    }
  }

  // Map each tile's topleft coordinate to its nodes
  const horizTileNodes = getTileNodes(horizPoints, 2, 1, size)

  // Finally rotate the whole thing
  const allTiles = diagTileNodes.concat(horizTileNodes).map((tile) => ({
    ...tile,
    center: { x: tile.position.x + 1, y: tile.position.y + 0.5 },
  }))
  const rotatedTiles = allTiles.map((t) => ({
    position: rotateClockwise(t.position, rotations, size),
    center: rotateClockwise(t.center, rotations, size),
    nodes: t.nodes.map<Node>((n) => rotateClockwise(n, rotations, size)),
    fakeNodes: t.fakeNodes.map<Node>((n) => rotateClockwise(n, rotations, size)),
  }))

  // Add initial state to each tile
  const result = rotatedTiles.map((tile) => ({
    ...emptyTile,
    ...tile,
  }))
  return result
}

export const getInitialTiles = (size: number = 5): Tile[] => {
  // First get tile nodes for each quadrant and flat them into a single array of tiles
  let tiles: Tile[] = Array.from(Array(4), (_, i) => getQuadrantTiles(i, size)).flat(1)

  // Add the center tile manually
  tiles.push({
    ...emptyTile,
    position: { x: size + 1, y: size + 1 },
    center: { x: size + 2, y: size + 2 },
    nodes: [
      { x: size + 1, y: size, state: 'empty' },
      { x: size, y: size + 1, state: 'empty' },
      { x: size + 1, y: size + 1, state: 'empty' },
      { x: size + 2, y: size + 1, state: 'empty' },
      { x: size + 1, y: size + 2, state: 'empty' },
    ],
  })

  // Then we find each tile's unique neighbors by checking if they share a node
  const tilesWithNeighbors: Tile[] = tiles.map<Tile>((tile) => ({
    ...tile,
    neighbors: tiles
      .filter((tile2) =>
        tile.nodes.some((n) => tile2.nodes.some((n2) => n.x === n2.x && n.y === n2.y))
      )
      .map((t) => t.position)
      .reduce<Point[]>(
        (acc, cur) =>
          // Remove the original tile and duplicate neighbors to prevent recursion
          (cur.x === tile.position.x && cur.y === tile.position.y) ||
          acc.some((p) => p.x === cur.x && p.y === cur.y)
            ? acc
            : acc.concat([cur]),
        []
      ),
  }))

  return tilesWithNeighbors
}

// Fake nodes first, these are not playable but needed for rendering edges
const fakeEdge = (size: number): Node[] =>
  Array(size - 1)
    .fill(0)
    .map((_, i) => ({ x: 3 + i * 2, y: 1, state: 'fake' }))
const fakeNodePoints = (size: number): Node[] =>
  [0, 1, 2, 3]
    .map((rotations) => fakeEdge(size).map((p) => rotateClockwise(p, rotations, size)))
    .flat(1)

// Then the playable points
export const defaultNodePoints: Node[] = [
  // (size: number): Node[] => Array(size).fill(0).map((_, i) =>  [
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
