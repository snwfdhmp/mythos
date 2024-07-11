import { WebSocketServer } from "ws"
import { battleStore, lobbyStore, playerStore } from "./store.js"
import { populatePlayerForServing } from "./players.js"

const WSS_PORT = 9877
const wss = new WebSocketServer({ port: WSS_PORT })

const DEBOUNCE_TIMER = 5

export const socketsStore = { battles: {}, userFeed: {}, openLobbies: {} }
const battles = socketsStore.battles
const userFeed = socketsStore.userFeed
const openLobbies = socketsStore.openLobbies

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    console.log(`Received message => ${message}`)
    ws.send(JSON.stringify({ type: "PONG", message: JSON.parse(message) }))
    message = JSON.parse(message)

    if (message.type === "battleState.subscribe") {
      if (!battles[message.battleId]) {
        battles[message.battleId] = {}
        battles[message.battleId].subscribers = []
        battles[message.battleId].lastPing = Date.now()
      }
      if (
        battles[message.battleId].subscribers.find(
          (subscriber) => subscriber.socket === ws
        )
      ) {
        console.log(`battle=${message.battleId} : already subscribed`)
        return
      }
      battles[message.battleId].subscribers.push({ socket: ws })
    }
    if (message.type === "keepRunning") {
      console.log(
        `battle=${message.battleId} : received keepRunning` +
          (battles[message.battleId] === undefined
            ? ` but battle not found`
            : ``)
      )
      if (battles[message.battleId] === undefined) {
        console.log(
          `battle=${message.battleId} : received keepRunning but battle not found`
        )
        return
      }
      battles[message.battleId].lastPing = Date.now()
    }

    if (message.type === "userFeed.subscribe") {
      if (!userFeed[message.playerId]) {
        userFeed[message.playerId] = {}
        userFeed[message.playerId].subscribers = []
      }
      // if already subscribed, do not add again
      if (
        userFeed[message.playerId].subscribers.find(
          (subscriber) => subscriber.socket === ws
        )
      ) {
        console.log(`player=${message.playerId} : already subscribed`)
        return
      }
      userFeed[message.playerId].subscribers.push({ socket: ws })
    }

    if (message.type === "openLobbies.subscribe") {
      if (!openLobbies) {
        openLobbies = {}
      }
      if (!openLobbies.subscribers) {
        openLobbies.subscribers = []
      }
      // if already subscribed, do not add again
      if (
        openLobbies?.subscribers?.find((subscriber) => subscriber.socket === ws)
      ) {
        console.log(`openLobbies : already subscribed`)
        return
      }
      openLobbies.subscribers.push({ socket: ws })
      pushOpenLobbies()
    }
  })

  ws.on("close", () => {
    // search for ws in subscribers
    const battleId = Object.keys(battles).find((battleId) => {
      return battles[battleId].subscribers.includes(ws)
    })
    if (battleId) {
      console.log(`battle=${battleId} : 1 subscriber left`)
      battles[battleId].subscribers = battles[battleId].subscribers.filter(
        (subscriber) => subscriber.socket === ws
      )
    }

    const playerId = Object.keys(userFeed).find((playerId) => {
      return userFeed[playerId].subscribers.includes(ws)
    })
    if (playerId) {
      console.log(`player=${playerId} : 1 subscriber left`)
      userFeed[playerId].subscribers = userFeed[playerId].subscribers.filter(
        (subscriber) => subscriber.socket === ws
      )
    }

    if (openLobbies) {
      console.log(`openLobbies : 1 subscriber left`)
      openLobbies.subscribers = openLobbies.subscribers?.filter(
        (subscriber) => subscriber.socket === ws
      )
    }
  })

  ws.send(JSON.stringify({ type: "ACK" }))
})

export const pushBattleState = (battleId) => {
  const subscribers = battles[battleId]?.subscribers
  if (!subscribers) return
  subscribers.forEach((subscriber) => {
    console.log(`Pushing battle state to subscribers`)

    clearTimeout(subscriber.debounce)
    subscriber.debounce = setTimeout(() => {
      subscriber.socket.send(
        JSON.stringify({
          type: "battleState.update",
          data: battleStore[battleId],
        })
      )
    }, DEBOUNCE_TIMER)
  })
}

export const pushPlayer = (playerId) => {
  const subscribers = userFeed[playerId]?.subscribers
  if (!subscribers) return

  subscribers.forEach((subscriber) => {
    console.log(`Pushing player state to subscribers`)

    clearTimeout(subscriber.debounce)
    subscriber.debounce = setTimeout(() => {
      subscriber.socket.send(
        JSON.stringify({
          type: "player.update",
          data: populatePlayerForServing(playerStore[playerId]),
        })
      )
    }, DEBOUNCE_TIMER)
  })
}

export const pushOpenLobbies = () => {
  const subscribers = openLobbies?.subscribers
  if (!subscribers) return

  subscribers.forEach((subscriber) => {
    console.log(`Pushing open lobbies to subscribers`)

    clearTimeout(subscriber.debounce)
    subscriber.debounce = setTimeout(() => {
      subscriber.socket.send(
        JSON.stringify({
          type: "openLobbies.update",
          data: lobbyStore,
        })
      )
    }, DEBOUNCE_TIMER)
  })
}

export const startWsServer = () => {
  console.log(`WebSocket server started on ${WSS_PORT}`)
}
