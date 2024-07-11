import aStar from "a-star"
import { v4 as uuidv4 } from "uuid"

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
      if (node.x > 0) potentialNeighbors.push(grid[node.x - 1][node.y])
      if (node.y > 0) potentialNeighbors.push(grid[node.x][node.y - 1])
      if (node.x < grid.length - 1)
        potentialNeighbors.push(grid[node.x + 1][node.y])
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

export const capitalizeFirstChar = (str) => {
  if (!str) return str // Return the string if it's empty or null
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const generateUniqueId = () => {
  return uuidv4()
}

export const randIn = (distribution) => {
  return distribution[Math.floor(Math.random() * distribution.length)]
}

export const range = (start, end) => {
  return Array.from(
    { length: Math.floor(end - start + 1) },
    (_, i) => start + i
  )
}

export const shuffleArray = (array) => {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1))
    var temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
  return array
}

export const randCoef = (initialValue, coefMin, coefMax) => {
  const coefRand = Math.random() * (coefMax - coefMin) + coefMin
  return initialValue * coefRand
}
