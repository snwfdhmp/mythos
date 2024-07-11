import React, { useEffect, useState } from "react"
import axios from "axios"
import { API_URL } from "../config"

export const Rankings = () => {
  const [rankings, setRankings] = useState(null)

  const updateRankings = () => {
    axios.get(`${API_URL}/rankings`).then((res) => {
      setRankings(res.data)
    })
  }

  useEffect(() => {
    updateRankings()
    const interval = setInterval(updateRankings, 1000 * 60)
    return () => clearInterval(interval)
  }, [])

  if (!rankings) return <p className="loading-text">Loading rankings...</p>

  const rankDisplay = (index) =>
    [0, 1, 2].includes(index) ? (
      <span style={{ fontSize: "1.2em", marginRight: "0.5em" }}>
        {["🥇", "🥈", "🥉"][index]}
      </span>
    ) : (
      <span style={{ marginLeft: "0.3em", marginRight: "0.3em" }}>
        {index + 1}.
      </span>
    )

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Ladder</h1>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          marginBottom: "1em",
        }}
      >
        <div>
          <h3>World</h3>
          {rankings.unlockedZonesRankings.map((player, index) => (
            <div key={player.id}>
              <div
                style={{
                  width: "10em",
                  display: "inline-block",
                  textAlign: "left",
                  fontFamily: "monospace",
                }}
              >
                <span style={{ color: "#3E3E3E" }}>{rankDisplay(index)}</span>
                {player.name}
              </div>
              <div
                style={{
                  width: "6em",
                  display: "inline-block",
                  textAlign: "right",
                  fontFamily: "monospace",
                }}
              >
                <span
                  style={{
                    fontSize: "0.9em",
                  }}
                >
                  {player.unlockedZones}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div>
          <h3>XP</h3>
          {rankings.xpRankings.map((player, index) => (
            <div key={player.id}>
              <div
                style={{
                  width: "10em",
                  display: "inline-block",
                  textAlign: "left",
                  fontFamily: "monospace",
                }}
              >
                <span style={{ color: "#3E3E3E" }}>{rankDisplay(index)}</span>
                {player.name}
              </div>
              <div
                style={{
                  width: "6em",
                  display: "inline-block",
                  textAlign: "right",
                  fontFamily: "monospace",
                }}
              >
                <span
                  style={{
                    fontSize: "0.9em",
                  }}
                >
                  {player.totalXpGained}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div>
          <h3>Power</h3>
          {rankings.cumulatedStatPointsRankings.map((player, index) => (
            <div key={player.id}>
              <div
                style={{
                  width: "10em",
                  display: "inline-block",
                  textAlign: "left",
                  fontFamily: "monospace",
                }}
              >
                <span style={{ color: "#3E3E3E" }}>{rankDisplay(index)}</span>
                {player.name}
              </div>
              <div
                style={{
                  width: "6em",
                  display: "inline-block",
                  textAlign: "right",
                  fontFamily: "monospace",
                }}
              >
                <span
                  style={{
                    fontSize: "0.9em",
                  }}
                >
                  {player.cumulatedStatPoints}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
