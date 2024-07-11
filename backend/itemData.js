import { playerStore } from "./store.js"
import { pushMessageToUser } from "./chat.js"
import { addEmptyInventorySlots, grantXp } from "./players.js"
import { pushPlayer } from "./ws.js"
import spellData from "./spellData.js"

export const itemDb = {
  superCandy: {
    effect: ({ item, playerId }) => {
      const player = playerStore[playerId]

      const statPointsGained = item.value || 1
      player.statPointsAvailable += statPointsGained
      pushMessageToUser(player.id, "system", [
        "You eat a <b>Super Candy</b>.",
        `You gained <b>+${statPointsGained}</b> stat point.`,
      ])
    },
  },
  xpParchment: {
    effect: ({ item, playerId }) => {
      const player = playerStore[playerId]

      const xp = item.value || 0
      pushMessageToUser(player.id, "system", [
        "You look into the <b>Crystal ball</b>.",
      ])
      grantXp(playerId, xp)
    },
  },
  inventorySlotBonus: {
    effect: ({ item, playerId }) => {
      const player = playerStore[playerId]

      const count = item.value || 1
      addEmptyInventorySlots(player, count)
    },
  },
  bonusPointGifter: {
    effect: ({ item, playerId }) => {
      const player = playerStore[playerId]

      const { kind, amount } = item.value
      player.bonusPoints = player.bonusPoints || {}
      player.bonusPoints[kind] = player.bonusPoints[kind] || 0
      player.bonusPoints[kind] += amount

      pushMessageToUser(player.id, "system", [
        `You gained <b>+${amount} ${kind}</b>`,
      ])
    },
  },
  zoneUnlocker: {
    effect: ({ item, playerId }) => {
      const player = playerStore[playerId]

      const targetZone = item.value
      if (!targetZone) {
        pushMessageToUser(player.id, "system-error", [
          "BUG: Item is missing a target zone.",
        ])
        return
      }
      if (player.unlockedZones.includes(targetZone)) {
        pushMessageToUser(player.id, "system", [
          `You read the map fragment and realize that you already know this place.`,
        ])
        return
      }
      player.unlockedZones.push(targetZone)
      console.log({ unlockedZones: player.unlockedZones })
      pushMessageToUser(player.id, "system", [
        `You added a new map fragment to your world map.`,
        `You discovered a <b>new place</b>.`,
      ])
    },
  },
  spellUnlocker: {
    effect: ({ item, playerId }) => {
      const player = playerStore[playerId]

      const target = item.value

      if (!target) {
        pushMessageToUser(player.id, "system-error", [
          `BUG: Item is missing a target.`,
        ])
        return
      }

      const spell = spellData[target]
      if (!spell) {
        pushMessageToUser(player.id, "system-error", [
          `BUG: Item is not a valid spell: ${target}`,
        ])
        return
      }

      if (
        player.spellInventory.includes(target) ||
        player.spells.includes(target)
      ) {
        pushMessageToUser(player.id, "system", [
          `You read the parchment and realize you already know this spell.`,
        ])
        return
      }

      console.log({ spellInventory: player.spellInventory })

      if (player.spells.length < 12) {
        player.spells.push(target)
      } else {
        player.spellInventory.push(target)
      }

      pushMessageToUser(player.id, "system", [
        `You learned <b>${spell.name}</b>.`,
      ])
    },
  },
}
