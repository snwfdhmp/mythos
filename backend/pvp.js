import { boardFactory } from "./boardFactory.js"
import { createBattle } from "./main.js"
import { populatePlayerForServing } from "./players.js"
import { playerStore, lobbyStore } from "./store.js"
import { generateUniqueId } from "./utils.js"
import { pushOpenLobbies, pushPlayer } from "./ws.js"

const initLobby = (playerId) => {
  console.log(`Init lobby for ${playerId}`)
  lobbyStore[playerId] = {
    hostId: playerId,
    players: [playerId],
    isOpen: true,
    draftKind: "balanced", // balanced or casual
  }
  playerStore[playerId].lobbyId = lobbyStore[playerId].hostId
  pushOpenLobbies()
  pushPlayer(playerId)
  return lobbyStore[playerId]
}

const closeLobby = (playerId) => {
  delete lobbyStore[playerId]
  pushOpenLobbies()
}

const patchLobby = (playerId, patch) => {
  lobbyStore[playerId] = {
    ...lobbyStore[playerId],
    ...patch,
  }
  pushOpenLobbies()
  return lobbyStore[playerId]
}

const getLobbies = () => {
  return lobbyStore
}

const joinLobby = (playerId, lobbyId) => {
  if (!lobbyStore[lobbyId]) return { error: "No lobby" }
  if (!lobbyStore[lobbyId].isOpen) return { error: "Lobby closed" }
  lobbyStore[lobbyId].players.push(playerId)
  playerStore[playerId].lobbyId = lobbyStore[lobbyId].hostId
  pushOpenLobbies()
  pushPlayer(playerId)
  return lobbyStore[lobbyId]
}

const leaveLobby = (playerId) => {
  const lobbyId = playerStore[playerId]?.lobbyId
  if (!lobbyStore[lobbyId]) return { error: "No lobby" }
  lobbyStore[lobbyId].players = lobbyStore[lobbyId].players.filter(
    (p) => p !== playerId
  )

  if (lobbyStore[lobbyId].players.length === 0) {
    closeLobby(lobbyId)
  } else if (lobbyStore[lobbyId].hostId === playerId) {
    const newHost = lobbyStore[lobbyId].players[0]
    lobbyStore[newHost] = {
      ...lobbyStore[lobbyId],
      hostId: newHost,
    }
    for (const player of lobbyStore[lobbyId].players) {
      playerStore[player].lobbyId = newHost
    }
    delete lobbyStore[lobbyId]
  }

  if (playerStore[playerId].lobbyId) {
    delete playerStore[playerId].lobbyId
  }

  pushOpenLobbies()
  pushPlayer(playerId)
  return lobbyStore[lobbyId]
}

export const convertLobbyToBattle = (lobbyId) => {
  const blueTeam = []
  const redTeam = []

  for (let i = 0; i < lobbyStore[lobbyId].players.length; i++) {
    const player = populatePlayerForServing(
      playerStore[lobbyStore[lobbyId].players[i]]
    )
    if (i % 2 === 0) {
      console.log(`Adding ${player.id} to blue team`)
      blueTeam.push(player)
    } else {
      console.log(`Adding ${player.id} to red team`)
      redTeam.push(player)
    }
  }

  const battle = createBattle({
    blueTeam,
    redTeam,
    board: boardFactory.pvp(),
    lobbyId,
    isPvp: true,
  })
  lobbyStore[lobbyId].isOpen = false
  lobbyStore[lobbyId].battleId = battle.id

  pushOpenLobbies()

  return battle
}

export const handleBattleEnd = (lobbyId) => {
  lobbyStore[lobbyId].battleId = null
  lobbyStore[lobbyId].isOpen = true
  pushOpenLobbies()
}

export const createLobbyApiEndpoints = (app) => {
  app.post("/lobby/init", async (req, res) => {
    const { playerId } = req.body
    const lobby = initLobby(playerId)
    res.json(lobby)
  })

  app.post("/lobby/close", async (req, res) => {
    const { playerId } = req.body
    closeLobby(playerId)
    res.json({ ok: true })
  })

  app.post("/lobby/patch", async (req, res) => {
    const { playerId, patch } = req.body
    const lobby = patchLobby(playerId, patch)
    res.json(lobby)
  })

  app.get("/lobbies", async (req, res) => {
    res.json(getLobbies())
  })

  app.post("/lobby/join", async (req, res) => {
    const { playerId, lobbyId } = req.body
    const lobby = joinLobby(playerId, lobbyId)
    res.json(lobby)
  })

  app.post("/lobby/leave", async (req, res) => {
    const { playerId } = req.body
    const lobby = leaveLobby(playerId)
    res.json(lobby)
  })

  app.post("/lobby/convertToBattle", async (req, res) => {
    const { lobbyId } = req.body
    const battle = convertLobbyToBattle(lobbyId)
    res.json(battle)
  })
}
