import { pushMessageToUser } from "./chat.js"
import { playerStore } from "./store.js"
import { pushBattleState, pushPlayer } from "./ws.js"
import { itemDb } from "./itemData.js"
import { populatePlayerWithSpellData } from "./main.js"

const MAX_INVENTORY_SLOTS = 64
export const addEmptyInventorySlots = (player, count) => {
  if (!player.inventory) {
    player.inventory = { content: [] }
  }
  let addedCount = 0
  for (let i = 0; i < count; i++) {
    if (player.inventory.content.length >= MAX_INVENTORY_SLOTS) {
      pushMessageToUser(
        player.id,
        "system-error",
        "Max inventory slots reached"
      )
      break
    }
    player.inventory.content.push({ empty: true })
    addedCount++
  }
  pushMessageToUser(player.id, "system", [
    `Your <b>bag capacity</b> increased by <b>+${addedCount}</b>.`,
  ])
  pushPlayer(player.id)
  return { ok: true, addedCount }
}

const DEFAULT_PLAYER_PROPS = {
  xp: 0,
  level: 1,
  statPointsAvailable: 0,
  statPointsUsed: 0,
  statPointsRepartition: {},
  bonusPoints: {},
  spells: ["aetherShoot", "nyxPunch", "jump"],
  spellInventory: [],
  unlockedZones: ["amazon1"],
}

export const createPlayer = (name, setProps = {}) => {
  const id = name
  if (playerStore[id]) {
    return { error: "Player already exists" }
  }

  const props = { ...DEFAULT_PLAYER_PROPS, ...setProps }

  const player = {
    id,
    name,
    ...props,
  }
  playerStore[id] = player
  player.messages = player.messages || []
  // player.messages.push({
  //   at: Date.now(),
  //   from: "system",
  //   content: `Join us on <a href="https://discord.gg/2xVHQQxGRa" target="_blank" class="chat-discord-link">Discord</a>.`,
  // })
  pushPlayer(id)
  return player
}

export const initPlayerStore = (force = false) => {
  const playersToCreate = {
    noob: {
      level: 13,
      statPointsAvailable: 5,
      statPointsRepartition: { hp: 2, aether: 200, nyx: 1 },
    },
    lvl1: {},
  }

  Object.entries(playersToCreate).forEach(([name, props]) => {
    if (playerStore[name]) {
      if (!force) return
      delete playerStore[name]
    }
    createPlayer(name, props)
  })
}
setTimeout(() => initPlayerStore(), 3000)

export const computeInitialState = (player) => {
  const { level, statPointsRepartition, bonusPoints } = player

  return {
    hp:
      1 +
      (level - 1) * 5 +
      3 * (statPointsRepartition?.hp || 0) +
      (bonusPoints?.hp * 5 || 0),
    ap: 6,
    mp: 3,
    aether:
      0 + (statPointsRepartition?.aether || 0) + (bonusPoints?.aether || 0),
    nyx: 0 + (statPointsRepartition?.nyx || 0) + (bonusPoints?.nyx || 0),
  }
}

export const computeXpToNextLevel = (currentLevel) => {
  return Math.ceil(
    0.3496 * Math.pow(currentLevel, 3) +
      63.045 * Math.pow(currentLevel, 2) -
      107.963 * Math.pow(currentLevel, 1) +
      180
  )
}

export const grantXp = (playerId, xp) => {
  const player = playerStore[playerId]
  if (!player) {
    console.log(`Player not found: ${playerId}`)
    return
  }
  player.xp += xp
  pushMessageToUser(playerId, "system", `You earned <b>${xp}</b> XP.`)

  const levelUp = () => {
    const xpToNextLevel = computeXpToNextLevel(player.level)
    if (player.xp < xpToNextLevel) return false

    player.level++
    player.xp -= xpToNextLevel
    player.statPointsAvailable += 5
    pushMessageToUser(
      playerId,
      "system",
      `You are now level <b>${player.level}</b>.`
    )
    return true
  }
  do {} while (levelUp())

  pushPlayer(playerId)
}

export const computeXpGranted = (battleState, playerId) => {
  const player = battleState.blueTeam.find((p) => p.id === playerId)
  if (!player) {
    console.log(`Player not found: ${playerId}`)
    return
  }

  const mobLevelSum = battleState.redTeam.reduce(
    (acc, mob) => acc + mob.level || 0,
    0
  )

  const xp = Math.ceil(
    Math.sqrt(player.level) *
      20 *
      Math.sqrt(40 * mobLevelSum) *
      (battleState?.xpBonusCoef || 1)
  )
  return xp
}

export const populatePlayerForServing = (player) => {
  return populatePlayerWithSpellData({
    ...player,
    initialState: computeInitialState(player),
    xpToNextLevel: computeXpToNextLevel(player.level),
  })
}

export const useItem = (playerId, itemId) => {
  const item = playerStore[playerId].inventory.content.find(
    (item) => item.id === itemId
  )
  if (!item || item.empty) {
    console.log(`Item not found: ${itemId}`)
    return { error: "Item not found" }
  }

  console.log(`Using item: ${itemId}`)
  console.log({ item })
  if (!itemDb[item.kind]?.effect) {
    console.log(`Item has no effect: ${itemId}`)
    return { error: "Item has no effect" }
  }

  itemDb[item.kind]?.effect({ item, playerId })
  item.empty = true
  pushPlayer(playerId)
  return { ok: true }
}

const RANKINGS_LIMIT = 8
export const computeRankings = () => {
  const players = Object.values(playerStore)

  const computeXpTotal = (player) => {
    // range from 1 to player.level
    return (
      Array.from({ length: player.level }, (_, i) => i + 1).reduce(
        (acc, level) => acc + computeXpToNextLevel(level),
        0
      ) + player.xp
    )
  }
  const xpRankings = players
    .map((p) => {
      return { ...p, totalXpGained: computeXpTotal(p) }
    })
    .sort((a, b) => b.totalXpGained - a.totalXpGained)
    .map((p) => ({
      id: p.id,
      name: p.name,
      level: p.level,
      totalXpGained: p.totalXpGained,
    }))
    .slice(0, RANKINGS_LIMIT)

  const unlockedZonesRankings = players
    .sort((a, b) => b.unlockedZones.length - a.unlockedZones.length)
    .map((p) => ({
      id: p.id,
      name: p.name,
      unlockedZones: p.unlockedZones.length,
    }))
    .slice(0, RANKINGS_LIMIT)

  const cumulateStatPoints = (player) =>
    Object.values(player.statPointsRepartition).reduce((acc, v) => acc + v, 0) +
    Object.values(player.bonusPoints).reduce((acc, v) => acc + v, 0)
  const cumulatedStatPointsRankings = players
    .sort((a, b) => cumulateStatPoints(b) - cumulateStatPoints(a))
    .map((p) => ({
      id: p.id,
      name: p.name,
      cumulatedStatPoints: cumulateStatPoints(p),
    }))
    .slice(0, RANKINGS_LIMIT)

  return {
    xpRankings,
    unlockedZonesRankings,
    cumulatedStatPointsRankings,
  }
}

export const createPlayersApiEndpoints = (app) => {
  app.get("/players/:id", (req, res) => {
    const { id } = req.params
    const player = playerStore[id]
    if (!player) {
      console.log(`Player not found: ${id}`)
      return res.status(404).send("Player not found")
    }

    return res.send(populatePlayerForServing(player))
  })

  app.get("/rankings", (req, res) => {
    res.send(computeRankings())
  })

  app.post("/players/:id/attributePoint/:statName", (req, res) => {
    const { id, statName } = req.params

    // player exists
    const player = playerStore[id]

    // player has stat points available
    if (player.statPointsAvailable <= 0) {
      return res.status(400).send("No stat points available")
    }

    // stat category is valid
    if (!["hp", "aether", "nyx"].includes(statName)) {
      return res.status(400).send("Invalid stat category")
    }

    // increment stat category
    if (!player.statPointsRepartition[statName])
      player.statPointsRepartition[statName] = 0
    player.statPointsRepartition[statName]++
    player.statPointsAvailable--

    // update player store
    pushPlayer(id)
    return res.send(player)
  })

  app.post("/players/:id/useItem/:itemIndex", (req, res) => {
    const { id, itemIndex } = req.params
    const result = useItem(id, itemIndex)
    if (result.error) {
      return res.status(400).send(result.error)
    }
    return res.send(result)
  })

  app.post("/players/:id/swapSpells", (req, res) => {
    const { id } = req.params
    const player = playerStore[id]
    const { spellIdA, spellIdB } = req.body

    const findSpell = (spellId) => {
      let index
      index = playerStore[id].spells.findIndex((s) => s === spellId)
      if (index >= 0) {
        return { array: playerStore[id].spells, index }
      }

      index = playerStore[id].spellInventory.findIndex((s) => s === spellId)
      if (index >= 0) {
        return { array: playerStore[id].spellInventory, index }
      }

      return null
    }

    const spellA = findSpell(spellIdA)
    const spellB = findSpell(spellIdB)

    if (!spellA) {
      return res.status(400).send("Spell A was not found")
    } else if (!spellB) {
      return res.status(400).send("Spell B was not found")
    }

    const temp = spellA.array[spellA.index]
    spellA.array[spellA.index] = spellB.array[spellB.index]
    spellB.array[spellB.index] = temp

    pushPlayer(id)
    return res.send({ ok: true })
  })
}
