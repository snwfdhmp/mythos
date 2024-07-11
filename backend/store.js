import fs from "fs"

export let battleStore = {}
export let playerStore = {}
export let authStore = {}
export let lobbyStore = {} // matchmaking store

const saveStoreCache = {}
const saveStore = async (store, path, options = { force: false }) => {
  const serialized = JSON.stringify(store)
  if (!options.force && saveStoreCache[path] === serialized) return
  console.log(`Saving ${path}`)
  try {
    await fs.promises.writeFile(path, serialized)
    saveStoreCache[path] = serialized
  } catch (e) {
    console.error(e)
  }
}

export const loadStores = async () => {
  try {
    battleStore = JSON.parse(
      await fs.promises.readFile(`./data/battleStore.json`)
    )
    console.log(
      `Loaded battleStore (${(
        Buffer.byteLength(JSON.stringify(battleStore)) / 1024
      ).toFixed(2)}kb)`
    )
  } catch (e) {
    if (e.code === "ENOENT") {
      console.log(`No battleStore found, starting fresh`)
    } else {
      console.error(e)
      console.error(`FATAL: Failed to load battleStore`)
      process.exit(1)
    }
  }

  saveStore(battleStore, `./data/battleStore.json`, { force: true })
  setInterval(() => {
    saveStore(battleStore, `./data/battleStore.json`)
  }, 1000)

  try {
    playerStore = JSON.parse(
      await fs.promises.readFile(`./data/playerStore.json`)
    )
    console.log(
      `Loaded playerStore (${(
        Buffer.byteLength(JSON.stringify(playerStore)) / 1024
      ).toFixed(2)}kb)`
    )
  } catch (e) {
    if (e.code === "ENOENT") {
      console.log(`No playerStore found, starting fresh`)
    } else {
      console.error(e)
      console.error(`FATAL: Failed to load playerStore`)
      process.exit(1)
    }
  }

  saveStore(playerStore, `./data/playerStore.json`, { force: true })
  setInterval(() => {
    saveStore(playerStore, `./data/playerStore.json`)
  }, 1000)

  try {
    authStore = JSON.parse(await fs.promises.readFile(`./data/authStore.json`))
    console.log(
      `Loaded authStore (${(
        Buffer.byteLength(JSON.stringify(authStore)) / 1024
      ).toFixed(2)}kb)`
    )
  } catch (e) {
    if (e.code === "ENOENT") {
      console.log(`No authStore found, starting fresh`)
    } else {
      console.error(e)
      console.error(`FATAL: Failed to load authStore`)
      process.exit(1)
    }
  }

  saveStore(authStore, `./data/authStore.json`, { force: true })
  setInterval(() => {
    saveStore(authStore, `./data/authStore.json`)
  }, 1000)

  try {
    lobbyStore = JSON.parse(
      await fs.promises.readFile(`./data/lobbyStore.json`)
    )
    console.log(
      `Loaded lobbyStore (${(
        Buffer.byteLength(JSON.stringify(lobbyStore)) / 1024
      ).toFixed(2)}kb)`
    )
  } catch (e) {
    if (e.code === "ENOENT") {
      console.log(`No lobbyStore found, starting fresh`)
    } else {
      console.error(e)
      console.error(`FATAL: Failed to load lobbyStore`)
      process.exit(1)
    }
  }

  saveStore(lobbyStore, `./data/lobbyStore.json`, { force: true })
  setInterval(() => {
    saveStore(lobbyStore, `./data/lobbyStore.json`)
  }, 1000)
}
