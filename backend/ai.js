import { findPath } from "./utils.js"

const melee = (battleState, mobId) => {
  // we will populate this array with actions and return it
  const actions = []

  // get mob object
  const mob = battleState.redTeam.find((mob) => mob.id === mobId)

  // find target
  const nearestBluePlayer = battleState.blueTeam.reduce((nearest, player) => {
    const distance =
      Math.abs(player.position.x - mob.position.x) +
      Math.abs(player.position.y - mob.position.y)
    if (!nearest.distance || nearest.distance > distance) {
      nearest.distance = distance
      nearest.player = player
    }
    return nearest
  }, {}).player
  if (!nearestBluePlayer) {
    return { error: "No player found" }
  }

  const distanceToNearestBluePlayer =
    Math.abs(nearestBluePlayer.position.x - mob.position.x) +
    Math.abs(nearestBluePlayer.position.y - mob.position.y)

  let soonPosition = mob.position
  if (distanceToNearestBluePlayer !== 1) {
    // move
    const aStarResult = findPath(
      mob.position,
      nearestBluePlayer.position,
      battleState
    )
    if (!aStarResult) {
      return { error: "A-star didn't return anything" }
    }
    const targetArrayIndex = Math.min(
      aStarResult.path.length - 1,
      mob.currentState.mp
    )
    let targetMovePosition = aStarResult.path[targetArrayIndex]
    if (!targetMovePosition === nearestBluePlayer.position) {
      // take a step back
      targetMovePosition = aStarResult.path[targetArrayIndex - 1]
    }

    // if position different, push move action
    if (
      targetMovePosition &&
      (mob.position.x !== targetMovePosition.x ||
        mob.position.y !== targetMovePosition.y)
    ) {
      // insert move from +1 to targetMovePosition
      aStarResult.path.slice(1, targetArrayIndex + 1).forEach((position) => {
        actions.push({
          type: "playing.move",
          position: { x: position.x, y: position.y },
        })
      })
      soonPosition = targetMovePosition
    }
  }

  // attack
  console.log({ spells: mob.spells })
  const spellsInRange = mob.spells.filter(
    (spell) =>
      spell.range >=
      Math.abs(soonPosition.x - nearestBluePlayer.position.x) +
        Math.abs(soonPosition.y - nearestBluePlayer.position.y)
  )
  console.log({ spellsInRange })

  let apAvailable = mob.currentState.ap
  let highestDamagePerAp = null
  do {
    highestDamagePerAp = spellsInRange.reduce(
      (highest, spell) => {
        if (spell.apCost > apAvailable) return highest
        const damagePerAp =
          (spell.damageBaseAether + spell.damageBaseNyx) / spell.apCost
        if (damagePerAp > highest.damagePerAp) {
          highest.damagePerAp = damagePerAp
          highest.spell = spell
        }
        return highest
      },
      { damagePerAp: 0 }
    )
    if (highestDamagePerAp.spell) {
      console.log({ highestDamagePerAp })
      actions.push({
        type: "playing.cast",
        spellId: highestDamagePerAp.spell.id,
        targetPosition: nearestBluePlayer.position,
      })
      apAvailable -= highestDamagePerAp.spell.apCost
    }
  } while (highestDamagePerAp.spell && apAvailable > 0)

  console.log({ actions })
  return [...actions]
}

export const aiDb = {
  melee,
}
