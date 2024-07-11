import { pushBattleState } from "./ws.js"
export const pushAnimation = (battleState, position, kind, data) => {
  console.log({
    event: "animation.push",
    battleId: battleState.id,
    kind,
    data,
  })
  const id = `${Date.now()}-${JSON.stringify({
    position,
    data,
  })}-${Math.random()}`

  battleState.animations.push({
    id,
    at: Date.now(),
    position,
    kind,
    data,
  })
  pushBattleState(battleState.id)
}
