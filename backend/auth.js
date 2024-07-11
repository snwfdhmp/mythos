import { createPlayer } from "./players.js"
import { authStore, playerStore } from "./store.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const SALT_ROUNDS = 10
const JWT_SECRET = "135896198653dzeeger***???"

export const createAuth = async (playerId, password) => {
  if (authStore[playerId]) return { error: "Player already has an auth" }

  const hash = await bcrypt.hash(password, SALT_ROUNDS)
  authStore[playerId] = { hash: hash }

  return { ok: true }
}

export const checkAuth = async (playerId, password) => {
  if (!authStore[playerId]) return { error: "Player not found" }

  const passwordIsCorrect = await bcrypt.compare(
    password,
    authStore[playerId].hash
  )
  if (!passwordIsCorrect) return { error: "Password incorrect" }

  return { ok: true }
}

export const createJwt = (content) => {
  return new Promise((resolve, reject) => {
    jwt.sign(content, JWT_SECRET, (err, token) => {
      if (err) reject(err)
      resolve(token)
    })
  })
}

export const authenticate = async (playerId, password) => {
  const status = await checkAuth(playerId, password)
  if (status.error) return status

  const player = playerStore[playerId]
  player.lastSigninAt = Date.now()
  const response = {
    authToken: await createJwt({ playerId }),
    playerId: playerId,
  }

  player.messages = player.messages || []
  player.messages.push({
    at: Date.now(),
    from: "system",
    content: `You are now connected as <b>${player.name}</b>.`,
  })

  return response
}

export const verifyJwt = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) reject(err)
      resolve(decoded)
    })
  })
}

export const createAuthApiEndpoints = (app) => {
  app.post("/signup", async (req, res) => {
    let player = playerStore[req.body.username]
    if (player) {
      res.status(400).send({ error: "Player already exists" })
      console.log({ player })
      return
    }

    player = createPlayer(req.body.username)
    if (player.error) {
      res.status(400).send(player)
      return
    }

    const auth = await createAuth(player.id, req.body.password)
    if (auth.error) {
      res.status(400).send(auth)
      return
    }

    const response = await authenticate(player.id, req.body.password)
    res.send(response)
  })

  app.post("/signin", async (req, res) => {
    res.send(await authenticate(req.body.username, req.body.password))
  })
}
