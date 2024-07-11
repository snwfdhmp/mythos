// dofus-like
// player is playing blue team, red team is AI
import express from "express"
import { aiDb } from "./ai.js"
import spellData, { runSpellBehaviors } from "./spellData.js"
import { waitMs, capitalizeFirstChar } from "./utils.js"
import { createChatApiEndpoints, pushMessageToBattle } from "./chat.js"
import { startWsServer, pushBattleState, socketsStore } from "./ws.js"
import { battleStore, loadStores, playerStore } from "./store.js"
import {
  SIZE_X,
  SIZE_Y,
  NONEXISTENT_SIZE,
  DEFAULT_PLAYER_STATE,
  battleFactoryDb,
} from "./config.js"
import { battleFactory } from "./battleFactory.js"
import {
  computeXpGranted,
  createPlayersApiEndpoints,
  grantXp,
} from "./players.js"
import { generateAndGrantLoot } from "./loot.js"
import { createAuthApiEndpoints } from "./auth.js"
import { createLobbyApiEndpoints, handleBattleEnd } from "./pvp.js"
await loadStores()

const HTTP_PORT = 9876

const GAME_CONFIG = {
  turnTimeout: 240000,
}

export const createBattle = (settings) => {
  let { blueTeam, redTeam, board, factoryId, ...additionalProps } = settings

  // generate battle id
  let battleId
  do {
    battleId = Math.random().toString(36).substring(7)
  } while (battleStore[battleId])

  let battleState = {}
  if (factoryId) {
    const factory = battleFactory[factoryId]
    if (!factory) throw new Error(`factory not found: ${factoryId}`)
    battleState = { ...battleState, ...factory({ player: blueTeam[0] }) }
  }

  battleState.id = battleId
  battleState.settingsUsed = settings
  battleState.state = "placement"
  battleState.createdAt = Date.now()
  battleState.animations = battleState.animations || []
  battleState.messages = battleState.messages || []
  battleState.messages.push({
    at: Date.now(),
    from: "system",
    content: "Choose your starting position.",
  })
  if (blueTeam) battleState.blueTeam = blueTeam
  if (redTeam) battleState.redTeam = redTeam
  if (board) battleState.board = board
  if (additionalProps) battleState = { ...battleState, ...additionalProps }

  // assign every blue player a position in the placement slots
  const bluePlacementSlots = battleState.board.entities.filter(
    (entity) => entity.kind === "blue-slot"
  )
  for (let i = 0; i < blueTeam.length; i++) {
    blueTeam[i].position = bluePlacementSlots[i].position
    blueTeam[i].isReady = false
  }

  if (redTeam) {
    // assign every blue player a position in the placement slots
    const redPlacementSlots = battleState.board.entities.filter(
      (entity) => entity.kind === "red-slot"
    )
    for (let i = 0; i < redTeam.length; i++) {
      redTeam[i].position = redPlacementSlots[i].position
      redTeam[i].isReady = false
    }
  }

  // create "nonexistent" entities for NONEXISTENT_SIZE
  for (let x = 0; x < SIZE_X; x++) {
    for (let y = 0; y < SIZE_Y; y++) {
      if (
        x + y < NONEXISTENT_SIZE ||
        x + y >= SIZE_X + SIZE_Y - (NONEXISTENT_SIZE + 1)
      ) {
        battleState.board.entities.push({
          kind: "nonexistent",
          position: { x, y },
        })
      }
      if (
        x - y > SIZE_X - (NONEXISTENT_SIZE + 1) ||
        y - x > SIZE_Y - (NONEXISTENT_SIZE + 1)
      ) {
        battleState.board.entities.push({
          kind: "nonexistent",
          position: { x, y },
        })
      }
    }
  }

  battleState.blueTeam = battleState.blueTeam.map(populatePlayerWithSpellData)
  battleState.redTeam = battleState.redTeam.map(populatePlayerWithSpellData)

  // init-ing player states
  const initPlayerCurrentState = (player) => {
    return { ...player, currentState: { ...player.initialState } }
  }
  battleState.blueTeam = battleState.blueTeam.map(initPlayerCurrentState)
  battleState.redTeam = battleState.redTeam.map(initPlayerCurrentState)

  // ensure all players have kind=player
  const ensureKindPlayer = (player) => {
    return { ...player, kind: "player" }
  }
  battleState.blueTeam = battleState.blueTeam.map(ensureKindPlayer)
  battleState.redTeam = battleState.redTeam.map(ensureKindPlayer)

  // ensure all players know their team
  battleState.blueTeam = battleState.blueTeam.map((player) => {
    return { ...player, team: "blue" }
  })
  battleState.redTeam = battleState.redTeam.map((player) => {
    return { ...player, team: "red" }
  })

  // store and return
  battleStore[battleState.id] = battleState
  return battleStore[battleState.id]
}

const app = express()
app.use(
  express.json({
    limit: "200kb",
  })
)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  )
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type")
  res.setHeader("Access-Control-Allow-Credentials", true)
  next()
})
app.use((req, res, next) => {
  console.log(req.method, req.url)
  // if action print it
  if (req.body.action) {
    console.log(req.body.action)
  }
  next()
})

createPlayersApiEndpoints(app)
createChatApiEndpoints(app)
createAuthApiEndpoints(app)
createLobbyApiEndpoints(app)
app.post("/battle", (req, res) => {
  const battle = createBattle({
    blueTeam: req.body.blueTeam,
    factoryId: req.body.factoryId,
  })
  res.json(battle)
})

app.get("/battle/:battleId", (req, res) => {
  if (!battleStore[req.params.battleId]) {
    res.status(404).send("battle not found")
    return
  }

  res.json(battleStore[req.params.battleId])
})

app.post("/battle/:battleId/action", (req, res) => {
  const battle = battleStore[req.params.battleId]
  const { playerId, action } = req.body

  const result = runAction(battle, playerId, action)
  if (result.ok) {
    pushBattleState(battle.id)
    res.json(battle)
  } else if (result.error) {
    res.status(400).send(result.error)
    pushMessageToBattle(
      battle,
      "system-error",
      `<b>System</b> : ${capitalizeFirstChar(result.error)}`
    )
  } else {
    console.error("500 unidentified error")
    console.error(result)
    res.status(500).send("unidentified error")
  }
})

app.get("/data/battleFactory", (req, res) => {
  res.json(battleFactoryDb)
})

const runAction = (battle, playerId, action) => {
  let player
  player =
    battle.blueTeam.find((player) => player.id === playerId) ||
    battle.redTeam.find((player) => player.id === playerId)
  if (!player) return { error: `player not found: ${playerId}` }
  if (player.currentState.isDead || player.currentState.hp <= 0)
    return { error: "player is dead" }
  switch (action.type) {
    case "message.send":
      battle.messages.push({
        at: Date.now(),
        from: playerId,
        fromText: player.name,
        content: action.content,
      })
      return { ok: true }
      break
    case "placement.place":
      if (battle.state !== "placement") {
        return {
          error: `[${action.position.x},${action.position.y}] not in placement state`,
        }
      }
      if (
        battle.blueTeam.find(
          (player) =>
            player.position.x === action.position.x &&
            player.position.y === action.position.y
        ) ||
        battle.redTeam.find(
          (player) =>
            player.position.x === action.position.x &&
            player.position.y === action.position.y
        )
      ) {
        return {
          error: `[${action.position.x},${action.position.y}] position already taken`,
        }
      }

      player =
        battle.blueTeam.find((player) => player.id === playerId) ||
        battle.redTeam.find((player) => player.id === playerId)

      // if not a placement slot
      if (
        !battle.board.entities.find(
          (entity) =>
            entity.position.x === action.position.x &&
            entity.position.y === action.position.y &&
            entity.kind === `${player.team}-slot`
        )
      ) {
        return {
          error: `[${action.position.x},${action.position.y}] position is not a placement slot of team's color (team=${player.team})`,
        }
      }
      player.position = action.position
      pushBattleState(battle.id)
      return { ok: true }
      break
    case "placement.ready":
      if (battle.state !== "placement") {
        return { error: "not in placement state" }
      }
      player =
        battle.blueTeam.find((player) => player.id === playerId) ||
        battle.redTeam.find((player) => player.id === playerId)
      if (!player) return { error: "player not found" }
      player.isReady = true
      // if all blue players are ready, switch to playing state
      if (
        battle.blueTeam.every(
          (player) => player.isReady || player.isAiControlled
        ) &&
        battle.redTeam.every(
          (player) => player.isReady || player.isAiControlled
        )
      ) {
        battle.state = "playing"
        battle.turnCount = 0
        // one of each team after the other
        battle.turnOrder = []
        const remainingBluePlayers = battle.blueTeam.slice()
        const remainingRedPlayers = battle.redTeam.slice()
        while (
          remainingBluePlayers.length > 0 ||
          remainingRedPlayers.length > 0
        ) {
          if (remainingBluePlayers.length > 0) {
            battle.turnOrder.push(remainingBluePlayers.shift().id)
          }
          if (remainingRedPlayers.length > 0) {
            battle.turnOrder.push(remainingRedPlayers.shift().id)
          }
        }
        battle.turnOrderIndex = 0
        battle.turnTimeoutAt = Date.now() + GAME_CONFIG.turnTimeout
      } else {
        console.log("not all players are ready")
        console.log({
          notReadyBlue: battle.blueTeam.filter(
            (p) => !(p.isReady || p.isAiControlled)
          ),
        })
        console.log({
          notReadyRed: battle.redTeam.filter(
            (p) => !(p.isReady || p.isAiControlled)
          ),
        })
      }
      return { ok: true }
      break
    case "playing.move":
      // is playing
      if (battle.state !== "playing") {
        return { error: "not in playing state" }
      }
      // is player's turn
      if (battle.turnOrder[battle.turnOrderIndex] !== playerId) {
        return { error: "not player's turn" }
      }
      const distance =
        Math.abs(player.position.x - action.position.x) +
        Math.abs(player.position.y - action.position.y)
      if (distance > player.currentState.mp) {
        return { error: "distance is greater than player's mp" }
      }
      // position is not taken
      if (
        battle.redTeam.find(
          (player) =>
            player.position.x === action.position.x &&
            player.position.y === action.position.y &&
            !player.currentState.isDead
        ) ||
        battle.blueTeam.find(
          (player) =>
            player.position.x === action.position.x &&
            player.position.y === action.position.y &&
            !player.currentState.isDead
        )
      ) {
        return { error: "position already taken" }
      }
      // position is not nonexistent
      if (
        battle.board.entities.find(
          (entity) =>
            entity.position.x === action.position.x &&
            entity.position.y === action.position.y &&
            entity.kind === "nonexistent"
        )
      ) {
        return { error: "position is nonexistent" }
      }
      player.position = action.position
      player.currentState.mp -= distance
      return { ok: true }
      break
    case "playing.endTurn":
      // is playing
      if (battle.state !== "playing") {
        return { error: "not in playing state" }
      }
      // is player's turn
      if (battle.turnOrder[battle.turnOrderIndex] !== playerId) {
        return { error: "not player's turn" }
      }
      // end turn
      endTurn(battle)
      return { ok: true }
      break
    case "playing.cast":
      // is playing
      if (battle.state !== "playing") {
        return { error: "not in playing state" }
      }
      // is player's turn
      if (battle.turnOrder[battle.turnOrderIndex] !== playerId) {
        return { error: "not player's turn" }
      }

      const spell = player.spells.find((spell) => spell.id === action.spellId)
      if (!spell) {
        return { error: "spell not found" }
      }

      const result = runSpellBehaviors(spell, {
        battle,
        playerId,
        targetPosition: action.targetPosition,
      })
      if (result.error) {
        return { error: result.error }
      }

      setTimeout(() => {
        verifyDeath(battle)
        // check dead player
        pushBattleState(battle.id)
      }, 800)

      return { ok: true }
      break
    default:
      return { error: "unknown action type" }
      break
  }
}

// replace spells as string to spells as spellData[string]
export const populatePlayerWithSpellData = (player) => {
  const spellToSpellData = (spell) => {
    if (typeof spell !== "string") return { ...spell }
    if (!spellData[spell]) {
      console.error(`spell not found: ${spell}`)
      return null
    }
    return { ...spellData[spell] }
  }
  return {
    ...player,
    spells: player?.spells?.map((spell) => spellToSpellData(spell)),
    spellInventory: player?.spellInventory?.map((spell) =>
      spellToSpellData(spell)
    ),
  }
}

const verifyDeath = (battle) => {
  for (const player of battle.blueTeam.concat(battle.redTeam)) {
    if (player.currentState.hp <= 0) {
      player.currentState.hp = 0
      player.currentState.isDead = true
      player.kind = "dead"
    }
  }

  let isFinished = false

  // if already finished, return
  if (battle.state === "finished") return

  // if all blue players are dead, red wins
  if (battle.blueTeam.every((player) => player.currentState.isDead)) {
    battle.state = "finished"
    battle.winner = "red"
    battle.looser = "blue"
    isFinished = true
  }
  // if all red players are dead, blue wins
  if (battle.redTeam.every((player) => player.currentState.isDead)) {
    battle.state = "finished"
    battle.winner = "blue"
    battle.looser = "red"
    isFinished = true
  }

  if (!isFinished) return

  if (battle.winner === "blue" && !battle.isPvp) {
    // grant xp and loot
    battle.xpGranted = {}
    battle.lootGranted = {}
    for (const player of battle.blueTeam) {
      const xp = computeXpGranted(battle, player.id)
      if (!battle.xpGranted[player.id]) {
        battle.xpGranted[player.id] = xp
        grantXp(player.id, xp)
      }
      const loot = generateAndGrantLoot(battle, player.id)
      if (loot.error) {
        console.error(loot.error)
      }
      if (loot.ok && !battle.lootGranted[player.id]) {
        battle.lootGranted[player.id] = loot.items
      }
    }
  }

  if (battle.lobbyId) {
    handleBattleEnd(battle.lobbyId)
  }
}

const endTurn = (battle) => {
  const player =
    battle.blueTeam.find(
      (player) => player.id === battle.turnOrder[battle.turnOrderIndex]
    ) ||
    battle.redTeam.find(
      (player) => player.id === battle.turnOrder[battle.turnOrderIndex]
    )
  if (player && !player.currentState.isDead) {
    player.currentState = {
      ...player.currentState,
      ap: player.initialState.ap,
      mp: player.initialState.mp,
    }
  }

  battle.turnOrderIndex++
  if (battle.turnOrderIndex >= battle.turnOrder.length) {
    battle.turnOrderIndex = 0
    battle.turnCount++
  }
  // if player is dead
  const nextPlayer =
    battle.blueTeam.find(
      (player) => player.id === battle.turnOrder[battle.turnOrderIndex]
    ) ||
    battle.redTeam.find(
      (player) => player.id === battle.turnOrder[battle.turnOrderIndex]
    )
  if (nextPlayer.currentState.isDead) {
    endTurn(battle)
  }
  battle.turnTimeoutAt = Date.now() + GAME_CONFIG.turnTimeout
  pushBattleState(battle.id)
  if (nextPlayer.isAiControlled) {
    setTimeout(() => {
      playAiTurn(battle, nextPlayer.id)
    }, 100)
  }
}

const AI_DELAY_PER_ACTION = 1000
const playAiTurn = async (battle, mobId) => {
  const actions = aiDb.melee(battle, mobId)
  while (actions.length > 0) {
    const action = actions.shift()
    let nextActionAt = Date.now() + AI_DELAY_PER_ACTION
    if (action.type === "playing.move") nextActionAt = Date.now() + 400
    await waitMs(Math.max(0, nextActionAt - Date.now())) // humanize

    console.log({ mobId, action })
    const result = runAction(battle, mobId, action)
    if (result.error) {
      console.error(result.error)
      break
    }
    pushBattleState(battle.id)
  }

  await waitMs(AI_DELAY_PER_ACTION) // humanize
  // send end turn
  runAction(battle, mobId, { type: "playing.endTurn" })
}

const skipTurnIfTimeout = () => {
  for (const battleId in battleStore) {
    const battle = battleStore[battleId]
    if (Date.now() - battle.createdAt > 1000 * 60 * 5) {
      // if more than 2 minutes
      // look for last ping
      const lastPing = socketsStore.battles[battleId]?.lastPing
      if (!lastPing || Date.now() - lastPing > 1000 * 60 * 5) {
        console.log({
          battleId: battle.id,
          event: "playing.forceEndBattle",
          reason: "ping-timeout",
        })
        battle.state = "aborted"
        delete battleStore[battle.id]
        return
      }
    }
    if (battle.state === "playing") {
      const playerId = battle.turnOrder[battle.turnOrderIndex]
      const player =
        battle.blueTeam.find((player) => player.id === playerId) ||
        battle.redTeam.find((player) => player.id === playerId)
      if (player.currentState.isDead) {
        endTurn(battle)
      }
      if (Date.now() > battle.turnTimeoutAt) {
        console.log({
          battleId: battle.id,
          playerId: battle.turnOrder[battle.turnOrderIndex],
          event: "playing.forceEndTurn",
        })
        endTurn(battle)
      }
    }
  }
}
setInterval(skipTurnIfTimeout, 900)

app.listen(HTTP_PORT, () => {
  console.log("Server started on http://localhost:" + HTTP_PORT)
})
startWsServer()
