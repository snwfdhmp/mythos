// only output <Battle />
import React, { useEffect } from "react"
import Battle from "./views/Battle"
import Home from "./views/Home"
import "./App.css"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { WSS_URL } from "./config"
import { useSocket } from "./hooks/socket"
import { PlayerProvider } from "./contexts/usePlayer"
import Signin from "./views/Signin"
import axios from "axios"

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // if network error
    if (!error.response) {
      setTimeout(() => {
        window.location.reload()
      }, 1000)
      return
    }
  }
)

// const useResponsiveFontSize = () => {
//   useEffect(() => {
//     const setFontSize = () => {
//       console.log({ innerWidth: window.innerWidth })
//       const baseWidth = 1512
//       const baseFontSize = 15
//       const width = window.innerWidth
//       const fontSize = (width / baseWidth) * baseFontSize
//       document.documentElement.style.fontSize = `${fontSize}px`
//     }
//     setFontSize()
//     window.addEventListener("resize", setFontSize)
//     return () => window.removeEventListener("resize", setFontSize)
//   }, [])
// }

const App = () => {
  const socket = useSocket(WSS_URL)

  // useResponsiveFontSize()

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home socket={socket} />,
    },
    {
      path: "/login",
      element: <Signin />,
    },
    {
      path: "/signup",
      element: <Signin initInMode="signup" />,
    },
    {
      path: "/battle/:battleId?",
      element: <Battle socket={socket} />,
    },
  ])

  if (!socket) {
    return (
      <div style={{ padding: "1em", fontSize: "0.8em", paddingTop: "2.5em" }}>
        Connecting socket...
      </div>
    )
  }

  return (
    <div>
      <div
        style={{
          height: "2em",
          textAlign: "left",
          marginRight: "1em",
          marginLeft: "4.5em",
        }}
      >
        <div
          style={{
            display: "inline-block",
            marginTop: "0.25em",
            position: "fixed",
            top: 0,
          }}
        >
          {[
            { title: "Home", path: "/" },
            { title: "Logout", path: "/login" },
          ].map(({ title, path }) => (
            <div
              style={{
                backgroundColor: "#090909",
                color: "#9E9E9E",
                padding: "0.25em",
                margin: "0.25em",
                fontSize: "0.8em",
                borderRadius: "8px",
                border: "0.1px solid #1E1E1E",
                cursor: "pointer",
                display: "inline-block",
              }}
              onClick={() => router.navigate(path)}
            >
              {title}
            </div>
          ))}
        </div>
      </div>
      <PlayerProvider socket={socket}>
        <RouterProvider router={router} />
      </PlayerProvider>
    </div>
  )
}
export default App
