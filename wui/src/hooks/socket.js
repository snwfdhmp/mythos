import React, { useEffect, useRef, useState } from "react"

export const useSocket = (url, options = {}) => {
  const [socket, setSocket] = useState(null)
  const [socketDisconnectedAt, setSocketDisconnectedAt] = useState(null)
  const [forceRefreshToken, setForceRefreshToken] = useState(0)

  useEffect(() => {
    if (socket) return
    console.log("forcing refresh", { url, options, forceRefreshToken })
    const newSocket = new WebSocket(url)

    // Connection opened
    newSocket.addEventListener("open", (event) => {
      setSocket(newSocket)
      newSocket.send(JSON.stringify({ type: "hello" }))

      newSocket.addEventListener("message", (event) => {
        console.log("Message from server", event.data)
      })

      newSocket.addEventListener("error", (event) => {
        console.error("Error from server", event)
        setSocket(null)
      })

      newSocket.addEventListener("close", (event) => {
        console.log("Connection closed", event)
        setSocket(null)
      })

      window.addEventListener("beforeunload", () => {
        newSocket.close()
      })
    })
  }, [socket, url, forceRefreshToken])

  useEffect(() => {
    const interval = setInterval(() => {
      if (socket) return
      if (!socketDisconnectedAt) {
        setSocketDisconnectedAt(Date.now())
        return
      }
      if (Date.now() - socketDisconnectedAt < 1000) return
      setForceRefreshToken(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [socket, forceRefreshToken, socketDisconnectedAt])

  return socket
}
