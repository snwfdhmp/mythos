import React, { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"
import { API_URL } from "../config"

export const PlayerContext = createContext()

export const PlayerProvider = ({ socket, children }) => {
  const [player, setPlayer] = useState(null)

  useEffect(() => {
    if (player) return
    if (!socket) return
    const playerId = localStorage.getItem("playerId")
    if (!playerId) return
    loadPlayer(playerId)
  }, [player, socket])

  const loadPlayer = (id, callbackError = () => {}) => {
    axios
      .get(`${API_URL}/players/${id}`)
      .then((res) => {
        setPlayer(res.data)
        // store in local storage
        localStorage.setItem("playerId", res.data.id)
        socket.send(
          JSON.stringify({ type: "userFeed.subscribe", playerId: id })
        )
        socket.addEventListener("message", (event) => {
          const message = JSON.parse(event.data)
          if (message.type === "player.update") {
            setPlayer(message.data)
          }
        })
        callbackError(null)
      })
      .catch((error) => {
        setPlayer(null)
        callbackError(error.message)
      })
  }

  return (
    <PlayerContext.Provider value={{ player, loadPlayer }}>
      {children}
    </PlayerContext.Provider>
  )
}

export const usePlayer = () => {
  const context = useContext(PlayerContext)
  if (context === undefined) {
    throw new Error("usePlayer must be used within a LocalPlayerProvider")
  }
  return context
}
