import { pushMessageToUser } from "./chat.js"
import { addEmptyInventorySlots, computeXpGranted } from "./players.js"
import spellData from "./spellData.js"
import { playerStore } from "./store.js"
import { generateUniqueId } from "./utils.js"
import { pushPlayer } from "./ws.js"

export const generateAndGrantLoot = (battleState, playerId) => {
  if (!battleState.redTeam) return { error: "No red team" }
  if (!playerStore[playerId]) return { error: "No player" }

  const mobs = battleState.redTeam

  const looted = []
  mobs.forEach((mob) => {
    // if is a function
    if (typeof mob.lootProbabilities === "function") {
      mob.lootProbabilities = mob.lootProbabilities({
        battleState,
        playerId,
        mob,
      })
    }
    // for lootProbabilities[], generate a random number between 0 and 1
    mob?.lootProbabilities?.forEach(({ item, probability }) => {
      const random = Math.random()
      const coef = battleState?.lootBonusCoef || 1
      console.log({ random, probability, coef })
      if (random / coef < probability) {
        console.log({ event: "loot", item })
        looted.push({ ...item, id: generateUniqueId() })
      }
    })
  })

  console.log({ looted })

  if (!looted.length) {
    return { ok: true, items: [] }
  }

  // if player looted an inventory
  if (looted.some((item) => item.kind === "inventory")) {
    pushMessageToUser(playerId, "system", "<b>You found a bag !</b>")
    pushMessageToUser(
      playerId,
      "system",
      "You can now keep some stuff with you."
    )
    addEmptyInventorySlots(playerStore[playerId], 16)
    // remove from looted[] the inventory item
  }

  while (looted.some((item) => item.kind === "inventory")) {
    looted.splice(
      looted.findIndex((item) => item.kind === "inventory"),
      1
    )
  }

  // if no inventory
  if (!playerStore[playerId].inventory) {
    pushMessageToUser(
      playerId,
      "system-error",
      "You found something but you don't know how to store it..."
    )
    return { error: "No inventory" }
  }

  const unlockedSpells = [
    ...playerStore[playerId].spells,
    ...playerStore[playerId].spellInventory,
  ]
  const unlockedZones = [...playerStore[playerId].unlockedZones]

  // filter spellUnlocker if player already knows the spell
  for (let i = 0; i < looted.length; i++) {
    const item = looted[i]
    if (item.kind === "spellUnlocker") {
      if (unlockedSpells.includes(item.value)) {
        looted.splice(i, 1)
        i--
        continue
      }
      unlockedSpells.push(item.value)
    } else if (item.kind === "zoneUnlocker") {
      if (unlockedZones.includes(item.value)) {
        looted.splice(i, 1)
        i--
        continue
      }
      unlockedZones.push(item.value)
    }
  }

  const toNotify = [...looted]
  while (toNotify.length > 0) {
    const item = toNotify.shift()
    // find empty array slot in playerStore[playerId].inventory.content
    const freeSlotIndex = playerStore[playerId].inventory.content.findIndex(
      (slot) => slot?.empty
    )
    if (freeSlotIndex === -1) {
      pushMessageToUser(
        playerId,
        "system-error",
        "An item was looted but your bag is full..."
      )
    } else {
      pushMessageToUser(
        playerId,
        "system",
        `You obtained <b>${item.title || item.kind}</b>.`
      )
      playerStore[playerId].inventory.content[freeSlotIndex] = item
      console.log({ event: "loot.confirmed", item })
    }
  }

  pushPlayer(playerId)

  return { ok: true, items: looted }
}

export const defaultLootProbabilitiesGenerator = ({
  battleState,
  playerId,
  mob,
}) => {
  const computedXp = computeXpGranted(battleState, playerId)
  const player = playerStore[playerId]
  if (!player) {
    console.log(
      `defaultLootProbabilitiesGenerator: Player not found: ${playerId}`
    )
    return []
  }

  const factoryId = battleState.settingsUsed?.factoryId

  const factoryIdToZoneUnlockerLootProbability = (factoryId) => {
    switch (factoryId) {
      case "amazon1":
        return {
          zoneToUnlock: "amazon2",
          zoneUnlockerProbability: player.level / 5 / 3,
        }
      case "amazon2":
        return {
          zoneToUnlock: "amazon3",
          zoneUnlockerProbability: player.level / 8 / 3,
        }
      case "amazon3":
        return { zoneToUnlock: "amazonBoss", zoneUnlockerProbability: 0.05 }
      case "amazonBoss":
        if (mob.name === "Antiope")
          return { zoneToUnlock: "knossos1", zoneUnlockerProbability: 1 }
        else return { zoneToUnlock: "", zoneUnlockerProbability: 0 }
      case "knossos1":
        return { zoneToUnlock: "knossos2", zoneUnlockerProbability: 0.05 }
      case "knossos2":
        return { zoneToUnlock: "knossos3", zoneUnlockerProbability: 0.05 }
      case "knossos3":
        return { zoneToUnlock: "knossosBoss", zoneUnlockerProbability: 0.05 }
      case "knossosBoss":
        if (mob.name === "Minotaur")
          return { zoneToUnlock: "ocean1", zoneUnlockerProbability: 1 }
        else return { zoneToUnlock: "", zoneUnlockerProbability: 0 }
      default:
        return 0
    }
  }

  const { zoneToUnlock, zoneUnlockerProbability } =
    factoryIdToZoneUnlockerLootProbability(factoryId)

  const bonusPointsGifterPotentialTargets = ["hp", "aether", "nyx"]
  const bonusPointGifterTarget =
    bonusPointsGifterPotentialTargets[
      Math.floor(Math.random() * bonusPointsGifterPotentialTargets.length)
    ]

  const lootProbabilities = [
    {
      // if player has inventory
      probability:
        !player.inventory && player.level >= 3 ? player.level / 5 / 3 : 0,
      item: {
        kind: "inventory",
      },
    },
    {
      // does player already have unlocked this zone?
      probability: playerStore[playerId].unlockedZones.includes(zoneToUnlock)
        ? 0
        : zoneUnlockerProbability,
      item: {
        title: "Map Fragment",
        kind: "zoneUnlocker",
        value: zoneToUnlock,
        description: `Discover a new place.`,
      },
    },

    /* Tous les mobs */
    {
      probability: 0.1,
      item: {
        title: "Super Candy",
        description: `Grants <b>+1</b> stat point.`,
        kind: "superCandy",
        value: 1,
      },
    },
    {
      probability: 0.04,
      item: {
        title: "Rare Candy",
        description: `Grants <b>+2</b> stat point.`,
        kind: "superCandy",
        value: 2,
      },
    },
    {
      probability: 0.1,
      item: {
        title: "Crystal Ball",
        kind: "xpParchment",
        description: `Grants <b>+${computedXp}</b> XP.`,
        value: computedXp,
      },
    },
    {
      probability: 0.05,
      item: {
        title: "Bag Expansion",
        kind: "inventorySlotBonus",
        description: `Increase bag size.`,
        value: 1,
      },
    },
    {
      probability: 0.1,
      item: {
        title: "Experiment Result",
        kind: "bonusPointGifter",
        description: `Grants <b>+1 ${bonusPointGifterTarget}</b>.`,
        value: { amount: 1, kind: bonusPointGifterTarget },
      },
    },
  ]

  const zoneOrder = ["amazon", "knossos", "ocean", "underworld"].findIndex(
    (zone) => battleState.zoneName === zone
  )

  const spellUnlockerLootProbabilities = [
    {
      explosion: 0.25,
      fireball: 0.2,
      aetherShoot2: 0.02,
      shootFeet: 0.1,
      tacticalKick: 0.1,
      slow: 0.05,
      rallAp: 0.05,
      teleport: 0.05,
    },
    {
      explosion2: 0.04,
      storm: 0.04,
      fireball2: 0.02,
      teleport2: 0.04,
      teleport3: 0.01,
    },
  ]
  spellUnlockerLootProbabilities.forEach(
    (spellUnlockerLootProbability, index) => {
      if (index > zoneOrder) return
      Object.entries(spellUnlockerLootProbability).forEach(
        ([spellId, probability]) => {
          // verify spell in player.spells and player.spellInventory and player.inventory.content
          if (
            player.spells.includes(spellId) ||
            player.spellInventory.includes(spellId) ||
            player?.inventory?.content.some(
              (item) => item.kind === "spellUnlocker" && item?.value === spellId
            )
          ) {
            return
          }
          lootProbabilities.push({
            probability: probability,
            item: {
              title: "Spell Parchment",
              kind: "spellUnlocker",
              description: `Teaches about a spell. The title says "${spellData[spellId].name}".`,
              value: spellId,
            },
          })
        }
      )
    }
  )
  return lootProbabilities
}
