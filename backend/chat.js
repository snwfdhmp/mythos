import { pushPlayer } from "./ws.js"
import { playerStore } from "./store.js"
import { battleFactoryDb } from "./config.js"
import { initPlayerStore } from "./players.js"
import { spellData } from "./spellData.js"

export const pushMessageToBattle = (battleState, from, content) => {
  console.log({
    event: "battle.message.push",
    battleId: battleState.id,
    from,
    content,
  })
  battleState.blueTeam.forEach((player) => {
    pushMessageToUser(player.id, from, content)
  })
}

export const pushMessageToUser = (playerId, from, content) => {
  console.log({
    event: "user.message.push",
    playerId,
    from,
    content,
  })
  const player = playerStore[playerId]
  player.messages = player.messages || []

  while (player.messages.length > 1000) {
    player.messages.shift()
  }

  if (!Array.isArray(content)) {
    content = [content]
  }
  content.forEach((c) => {
    player.messages.push({
      at: Date.now(),
      from,
      content: c,
    })
  })
  pushPlayer(playerId)
}

export const handleCommand = (playerId, command) => {
  const player = playerStore[playerId]
  switch (command) {
    case "unlockallzones":
      player.unlockedZones = battleFactoryDb.map((b) => b.id)
      break
    case "unlockallspells":
      player.spells.push(
        ...Object.keys(spellData).filter(
          (s) =>
            !player.spells.includes(s) && !player.spellInventory.includes(s)
        )
      )
      const additional = player.spells.splice(12)
      player.spellInventory.push(...additional)
      break
    case "clear":
      player.messages = []
      break
    case "init":
      initPlayerStore(true)
      break
    default:
      pushMessageToUser(playerId, "system", [
        `Unknown command <b>/${command}</b>.`,
      ])
  }
}

export const createChatApiEndpoints = (app) => {
  app.post("/api/chat/message", (req, res) => {
    const { playerId, content } = req.body

    // handle command
    if (content.startsWith("/")) {
      handleCommand(playerId, content.slice(1))
      pushPlayer(playerId)
      return res.send({ ok: true })
    }

    res.send({ ok: true })
  })
}
