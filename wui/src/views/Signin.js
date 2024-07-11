import React, { useEffect, useState } from "react"
import axios from "axios"

import { API_URL } from "../config"
import { useNavigate } from "react-router-dom"
import { usePlayer } from "../contexts/usePlayer"

const Signin = ({ initInMode = "signin" }) => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { loadPlayer } = usePlayer()
  const [mode, setMode] = useState(initInMode)
  const navigate = useNavigate()

  useEffect(() => {
    loadPlayer(null)
  }, [mode])

  let pageTitle = "Sign in"

  let submitText = "Sign in"
  let submitCallback = () => {
    axios.post(`${API_URL}/signin`, { username, password }).then((res) => {
      if (res.data.error) {
        setError(res.data.error)
        return
      }
      setError(null)
      localStorage.setItem("authToken", res.data.authToken)
      localStorage.setItem("playerId", res.data.playerId)
      loadPlayer(res.data.playerId)
      navigate("/")
    })
  }

  let switchModeText = "Don't have an account?"
  let switchModeButtonText = "Sign up"
  let switchModeButtonCallback = () => {
    setMode("signup")
  }

  if (mode === "signup") {
    pageTitle = "Sign up"
    submitText = "Sign up"
    submitCallback = () => {
      axios
        .post(`${API_URL}/signup`, {
          username,
          password,
        })
        .then((res) => {
          if (res.data.error) {
            console.log(res.data.error)
            setError(res.data.error)
            return
          }

          setError(null)
          localStorage.setItem("authToken", res.data.authToken)
          localStorage.setItem("playerId", res.data.playerId)
          loadPlayer(res.data.playerId)
          navigate("/")
        })
        .catch((error) => {
          console.log({ error })
          setError(error.response.data.error)
        })
    }
    switchModeText = "Already have an account?"
    switchModeButtonText = "Sign in"
    switchModeButtonCallback = () => {
      setMode("signin")
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <h1 style={{ marginBottom: 0 }}>{pageTitle}</h1>
      <p>
        {switchModeText}{" "}
        <button
          style={{
            padding: "0.2em",
            margin: "0",
            backgroundColor: "#1E1E1E",
            color: "white",
            border: "0.1px solid #2E2E2E",
            borderRadius: "8px",
            cursor: "pointer",
            outline: "none",
          }}
          onClick={switchModeButtonCallback}
        >
          {switchModeButtonText}
        </button>
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submitCallback()
        }}
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="username"
          defaultValue={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
          style={{
            padding: "0.5em",
            margin: "0.5em",
            width: "10em",
            backgroundColor: "#1E1E1E",
            color: "white",
            border: "0.1px solid #2E2E2E",
            borderRadius: "8px",
            outline: "none",
          }}
        />
        <input
          type="password"
          placeholder="password"
          defaultValue={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: "0.5em",
            margin: "0 0.5em",
            width: "10em",
            backgroundColor: "#1E1E1E",
            color: "white",
            border: "0.1px solid #2E2E2E",
            borderRadius: "8px",
            outline: "none",
          }}
        />
        <button
          style={{
            padding: "0.5em",
            margin: "0.5em",
            width: "6em",
            backgroundColor: "#1E1E1E",
            color: "white",
            border: "0.1px solid #2E2E2E",
            borderRadius: "8px",
            cursor: "pointer",
            outline: "none",
          }}
          onClick={submitCallback}
        >
          {submitText}
        </button>
      </form>
      <p style={{ color: "#CF0000" }}>{error}</p>
    </div>
  )
}
export default Signin
