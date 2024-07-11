import aStar from "a-star"

const gridFromBattleState = (battleState) => {
  const grid = []
  for (let x = 0; x < battleState.board.sizeX; x++) {
    grid[x] = []
    for (let y = 0; y < battleState.board.sizeY; y++) {
      // find content
      const content =
        battleState.blueTeam.find(
          (player) => player.position.x === x && player.position.y === y
        ) ||
        battleState.redTeam.find(
          (player) => player.position.x === x && player.position.y === y
        ) ||
        battleState.board.entities.find(
          (entity) => entity.position.x === x && entity.position.y === y
        ) ||
        null
      let isFree = !content
      if (content && ["blue-slot", "dead"].includes(content.kind)) isFree = true
      grid[x][y] = { x, y, content, isFree }
    }
  }
  return grid
}

export const findPath = (startPosition, endPosition, battleState) => {
  const grid = gridFromBattleState(battleState)
  const path = aStar({
    start: startPosition,
    isEnd: (node) => {
      return node.x === endPosition.x && node.y === endPosition.y
    },
    neighbor: (node) => {
      const potentialNeighbors = []
      if (node.y > 0) potentialNeighbors.push(grid[node.x][node.y - 1])
      if (node.x < grid.length - 1)
        potentialNeighbors.push(grid[node.x + 1][node.y])
      if (node.x > 0) potentialNeighbors.push(grid[node.x - 1][node.y])
      if (node.y < grid[0].length - 1)
        potentialNeighbors.push(grid[node.x][node.y + 1])

      const validNeighbors = potentialNeighbors.filter(
        (neighbor) => neighbor.isFree
      )
      return validNeighbors
    },
    distance: (a, b) => 1,
    // distance: (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y),
    heuristic: (node) => {
      const diff =
        Math.abs(node.x - endPosition.x) + Math.abs(node.y - endPosition.y)
      return diff
    },
    hash: (node) => `${node.x},${node.y}`,
  })
  return path
}

export const waitMs = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const pathCache = {}
export const getPathWithCache = (from, to, battleState) => {
  const key = `${from.x},${from.y}-${to.x},${to.y}:${JSON.stringify(
    battleState
  )}`
  if (pathCache[key]) {
    if (pathCache[key].expires > Date.now()) return pathCache[key].content
    delete pathCache[key]
  }

  const path = findPath(from, to, battleState)
  pathCache[key] = { content: path, expires: Date.now() + 10000 }
  return pathCache[key].content
}

// clear cache every 10 seconds
setInterval(() => {
  for (const key in pathCache) {
    if (pathCache[key].expires < Date.now()) {
      delete pathCache[key]
    }
  }
}, 10000)

export const padArray = function (arr, len, fill) {
  return arr.concat(Array(len).fill(fill)).slice(0, len)
}
