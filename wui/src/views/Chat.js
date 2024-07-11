import React, { useEffect, useRef, useState } from "react"
import axios from "axios"
import { API_URL } from "../config"
import { usePlayer } from "../contexts/usePlayer"
import { useNavigate } from "react-router-dom"

export const ChatView = ({
  messages = [],
  sendMessage = () => {
    alert("not implemented in this chat view")
  },
}) => {
  const { player, loadPlayer } = usePlayer()
  // ref to the last message
  const containerRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    containerRef.current.scrollTop = containerRef.current.scrollHeight
  }, [messages])

  const hookedSendMessage = (content) => {
    // handle commands
    if (content.startsWith("/")) {
      const [command, ...args] = content.split(" ")
      switch (command) {
        case "/login":
          console.log({ command, args })
          loadPlayer(args[0])
          break
        case "/logout":
          console.log({ command, args })
          loadPlayer(null)
          navigate("/login")
          break
        default:
          axios.post(`${API_URL}/api/chat/message`, {
            playerId: player.id,
            content,
          })
          break
      }
      return
    }
    // send message if not command
    sendMessage(content)
  }

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: "2em",
        width: "20em",
        height: "100%",
        backgroundColor: "#090909",
        borderRadius: "16px",
        color: "white",
        padding: "0.5em 0 0.5em 0.5em",
        margin: "0.5em 0 0.5em 0.5em",
        overflowY: "auto",
        zIndex: 9,
      }}
      className="scrollbar-hide"
      ref={containerRef}
    >
      <div style={{ paddingBottom: "6.5em" }}>
        {messages.map((message, index) => (
          <div key={index}>
            <MessageRenderer {...message} />
          </div>
        ))}
      </div>
      <div
        style={{
          position: "fixed",
          bottom: "0",
          paddingBottom: "0.5em",
          left: "1em",
          textAlign: "center",
          background: "#090909",
          width: "20em",
        }}
      >
        <input
          style={{
            margin: "0.5em auto",
            padding: "0.5em",
            outline: "none",
            width: "22em",
            backgroundColor: "#1E1E1E",
            border: "none",
            borderRadius: "4px",
            color: "white",
          }}
          autoFocus
          placeholder="Say something or /command"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              hookedSendMessage(event.target.value)
              event.target.value = ""
            }
          }}
        />
      </div>
    </div>
  )
}

const MessageRenderer = ({ from, fromText, at, content }) => {
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshToken((t) => t + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Date.now() to HH:MM
  const date = new Date(at)
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const time = `${hours < 10 ? "0" : ""}${hours}:${
    minutes < 10 ? "0" : ""
  }${minutes}`

  let color = "white"
  if (from === "system") color = "#007000"
  if (from === "system-error") color = "red"
  return (
    <span
      style={{
        color,
        // filter: `grayscale(${Math.sqrt(
        //   Math.sqrt((Date.now() - at) / (1000 * 10000))
        // ).toFixed(2)})`,
      }}
    >
      <span style={{ fontSize: "0.5em", fontFamily: "monospace" }}>
        [{time}]
      </span>
      {fromText ? (
        <>
          {" "}
          <b>{fromText}</b> :
        </>
      ) : (
        ""
      )}{" "}
      <span dangerouslySetInnerHTML={{ __html: content }} />
      {/* {content} */}
    </span>
  )
}
