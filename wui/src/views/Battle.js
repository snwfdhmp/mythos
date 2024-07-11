import React, { useState, useEffect } from "react"
import axios from "axios"
import { FaHeart, FaStar } from "react-icons/fa"
import { GiFootprint } from "react-icons/gi"
import { useParams, useNavigate } from "react-router-dom"

import { ChatView } from "./Chat"
import { getPathWithCache, padArray } from "../utils"
import { API_URL, itemKindToEmoji, spellIdToIcon } from "../config"
import { usePlayer } from "../contexts/usePlayer"

let pingInterval
const Battle = ({ socket }) => {
  const navigate = useNavigate()
  const { player } = usePlayer()

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [])

  const [battleState, setBattleState] = useState(null)
  const { battleId: routeBattleId } = useParams()
  const battleId = battleState?.id

  const [controlledEntityId, setControlledEntityId] = useState(player?.id)
  const [controlledEntitySelectedSpell, setControlledEntitySelectedSpell] =
    useState(null)
  const [isError404, setIsError404] = useState(false)

  useEffect(() => {
    if (!player) return
    setControlledEntityId(player.id)
  }, [player])

  // Listen for messages
  const subscribeToBattleStateUpdates = (battleId, setBattleState) => {
    console.log("Subscribing to battle state updates")
    socket.send(JSON.stringify({ type: "battleState.subscribe", battleId }))
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data)
      if (message.type === "battleState.update") {
        console.log({ message })
        setBattleState(message.data)
      }
    })
  }

  useEffect(() => {
    if (!battleId || !socket) return
    subscribeToBattleStateUpdates(battleId, setBattleState)
  }, [battleId, socket])

  useEffect(() => {
    if (!battleId || !socket) return
    pingInterval = setInterval(() => {
      socket.send(JSON.stringify({ type: "keepRunning", battleId }))
    }, 5000)
    return () => clearInterval(pingInterval)
  }, [battleId, socket])

  useEffect(() => {
    if (!battleId) {
      if (routeBattleId) {
        loadBattle(routeBattleId)
        return
      }
      // create a new battle
      moveToNewBattle()
    }
  }, [battleId])

  const loadBattle = (battleId) => {
    axios
      .get(`${API_URL}/battle/${battleId}`)
      .then((response) => {
        setBattleState(response.data)
      })
      .catch((error) => {
        if (error?.response?.status === 404) {
          setIsError404(true)
        }
      })
  }

  const moveToNewBattle = () => {
    // create a new battle
    axios.post(`${API_URL}/battle`).then((response) => {
      navigate(`/battle/${response.data.id}`)
      loadBattle(response.data.id)
    })
  }

  if (!player) {
    return (
      <div>
        <h1>Not connected</h1>
        <p>Player is not loaded. Please go back to the home page.</p>
        <button onClick={() => navigate("/")}>Home</button>
      </div>
    )
  }

  if (isError404) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "2em",
        }}
      >
        <h1>404 Not Found</h1>
        <p>The battle you're looking for is not referenced or was deleted.</p>
        <button
          onClick={() => {
            setIsError404(false)
            navigate("/")
          }}
          style={{
            backgroundColor: "#101010",
            color: "white",
            padding: "0.5em 1em",
            margin: "1em",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "1.2em",
            border: "1px solid #2E2E2E",
          }}
        >
          Home
        </button>
      </div>
    )
  }

  if (!battleState) {
    return <div className="loading-text">Loading...</div>
  }

  if (battleState.state === "finished") {
    // print both teams
    const teamDisplays = {
      blue: {
        name: "Blue team",
        greet: battleState.winner === "blue" ? "Victory" : "Defeat",
        players: battleState.blueTeam.map((player) => {
          const grantedXp = battleState.xpGranted?.[player.id]
          const lootGranted = battleState.lootGranted?.[player.id]
          return (
            <div key={player.id}>
              <div
                style={{
                  display: "inline-block",
                  width: "12em",
                }}
              >
                {player.name}
              </div>
              <div
                style={{
                  display: "inline-block",
                  width: "12em",
                  textAlign: "center",
                }}
              >
                {lootGranted &&
                  lootGranted.map((item) => (
                    <div
                      style={{
                        width: "2em",
                        height: "2em",
                        backgroundColor: "#151515",
                        borderRadius: "4px",
                        borderWidth: "1px",
                        borderStyle: "solid",

                        boxSizing: "border-box",
                        borderColor: "#151515",
                        margin: "0 0.1em",
                        lineHeight: "1.8em",
                        verticalAlign: "middle",
                        textAlign: "center",
                        display: "inline-block",
                        fontSize: "0.5em",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "1.2em",
                        }}
                      >
                        {itemKindToEmoji[item.kind] || "❔"}
                      </div>
                    </div>
                  ))}
              </div>
              <div
                style={{
                  display: "inline-block",
                  width: "12em",
                  textAlign: "right",
                }}
              >
                {grantedXp && (
                  <div
                    style={{ display: "inline-block", marginRight: "0.5em" }}
                  >
                    <b class="gameboard-xpgranted">+{grantedXp} XP</b>
                  </div>
                )}
                Lvl. {player.level}
              </div>
            </div>
          )
        }),
      },
      red: {
        name: "Red team",
        greet: battleState.winner === "red" ? "Victory" : "Defeat",
        players: battleState.redTeam.map((player) => {
          return (
            <div key={player.id}>
              <div
                style={{
                  display: "inline-block",
                  width: "12em",
                }}
              >
                {player.name}
              </div>
              <div
                style={{
                  display: "inline-block",
                  width: "12em",
                }}
              ></div>
              <div
                style={{
                  display: "inline-block",
                  width: "12em",
                  textAlign: "right",
                }}
              >
                Lvl. {player.level}
              </div>
            </div>
          )
        }),
      },
    }

    return (
      <>
        <ChatView messages={player.messages} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginLeft: "21em",
          }}
        >
          <h1>Game over</h1>
          <h2>{teamDisplays[battleState.winner].greet}</h2>
          {teamDisplays[battleState.winner].players}
          <h2>{teamDisplays[battleState.looser].greet}</h2>
          {teamDisplays[battleState.looser].players}
          <div
            style={{
              marginTop: "1em",
            }}
          >
            <button
              onClick={() => {
                navigate("/")
              }}
              style={{
                backgroundColor: "#1E1E1E",
                color: "white",
                padding: "0.5em 1em",
                margin: "1em",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "1.2em",
                border: "1px solid #2E2E2E",
              }}
            >
              Home
            </button>
          </div>
        </div>
      </>
    )
  }

  const controlledEntityState =
    battleState?.blueTeam?.find((player) => player.id === controlledEntityId) ||
    battleState?.redTeam?.find((player) => player.id === controlledEntityId)
  const currentTurnEntityStateId =
    battleState?.turnOrder?.[battleState.turnOrderIndex]
  const currentTurnEntityState =
    battleState?.blueTeam?.find(
      (player) => player.id === currentTurnEntityStateId
    ) ||
    battleState?.redTeam?.find(
      (player) => player.id === currentTurnEntityStateId
    )

  const gameBoard = (
    <GameBoard
      sizeX={battleState.board.sizeX}
      sizeY={battleState.board.sizeY}
      battleId={battleId}
      entities={battleState.blueTeam
        .concat(battleState.redTeam)
        .filter((player) => !player.currentState.isDead)
        .concat(battleState.board.entities)}
      battleState={battleState}
      setBattleState={setBattleState}
      controlledEntityId={controlledEntityId}
      controlledEntityState={controlledEntityState}
      currentTurnEntityState={currentTurnEntityState}
      controlledEntitySelectedSpell={controlledEntitySelectedSpell}
      setControlledEntitySelectedSpell={setControlledEntitySelectedSpell}
    />
  )

  let bottomBar = null

  if (battleState.state === "placement") {
    bottomBar = (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginLeft: "21em",
        }}
      >
        <button
          onClick={async () => {
            if (player.lobbyId) {
              await axios.post(`${API_URL}/lobby/leave`, {
                playerId: player.id,
              })
            }
            navigate("/")
          }}
          style={{
            // align right, big orange button
            backgroundColor: "#1E1E1E",
            color: "white",
            padding: "1em",
            margin: "1em",
            borderRadius: "4px",
            border: "none",
            cursor: "pointer",
            fontSize: "1.2em",
          }}
        >
          Back
        </button>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h1
            style={{
              margin: "0",
            }}
          >
            Place your unit
          </h1>
          <p style={{ margin: 0 }}>Click on a blue cell to place your unit</p>
        </div>
        <button
          onClick={() => {
            battleActionPlacementReady({
              battleState,
              setBattleState,
              controlledEntityId,
            })
          }}
          style={{
            // align right, big orange button
            backgroundColor: "#008000",
            color: "white",
            padding: "1em",
            margin: "1em",
            borderRadius: "4px",
            border: "none",
            cursor: "pointer",
            fontSize: "1.2em",
          }}
        >
          Ready
        </button>
      </div>
    )
  }

  if (battleState.state === "playing") {
    let turnOrder
    if (battleState?.turnOrder?.length > 0) {
      turnOrder = battleState.turnOrder.map((playerId) => {
        let player
        player = battleState.blueTeam.find((player) => player.id === playerId)
        if (!player) {
          player = battleState.redTeam.find((player) => player.id === playerId)
          if (!player) {
            return "Unknown"
          }
        }
        return player
      })
    }

    bottomBar = controlledEntityState ? (
      <div
        style={{
          display: "flex",
          marginLeft: "22em",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
        className="prevent-select"
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
            // margin: "0em auto 0em 22em",
            backgroundColor: "black",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  fontSize: "0.8em",
                  marginLeft: "0.2em",
                  color: "#9E9E9E",
                  marginBottom: "0.5em",
                }}
              >
                Click any spell and click target cell
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  // max number per row
                  maxWidth: "24em",
                }}
              >
                {controlledEntityState &&
                  padArray(controlledEntityState?.spells, 12, {
                    id: "nonexistent",
                    kind: "nonexistent",
                  }).map((spell, index) => (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <div
                        key={spell.id}
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          // justifyContent: "space-between",
                          fontSize: "1.2em",
                          // margin: "0.2em auto",
                          borderRadius: "12px",
                          borderStyle: "solid",
                          margin: "0.05em",
                          zIndex: 999,
                          borderColor:
                            controlledEntitySelectedSpell?.id === spell.id
                              ? "#9E9E9E"
                              : "black",
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (spell.id !== "nonexistent")
                            setControlledEntitySelectedSpell(spell)
                        }}
                      >
                        <div style={{ zoom: 1.2 }}>
                          {spellIdToIcon[spell.id] || spellIdToIcon["default"]}
                        </div>
                      </div>
                      <div style={{ fontSize: "0.45em", textAlign: "center" }}>
                        {spell.name}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "12em",
                marginTop: "1.5em",
                border: "solid 1px #1E1E1E",
                padding: "0.5em",
                borderRadius: "8px",
                boxSizing: "border-box",
                height: "8.5em",
              }}
            >
              {!controlledEntitySelectedSpell && (
                <div
                  style={{
                    color: "#9E9E9E",
                    fontStyle: "italic",
                    fontSize: "0.8em",
                    // paddingTop: "0.5em",
                  }}
                >
                  Click any spell
                  <br />
                  to get their information
                </div>
              )}
              {controlledEntitySelectedSpell && (
                <div
                  style={{
                    height: "8em",
                  }}
                >
                  <h3 style={{ margin: "0", fontSize: "0.9em" }}>
                    {controlledEntitySelectedSpell.name}
                    <span style={{ fontSize: "0.8em", color: "#9E9E9E" }}>
                      &nbsp;&nbsp;{controlledEntitySelectedSpell.apCost} AP
                    </span>
                  </h3>
                  <div style={{ fontSize: "0.8em" }}>
                    {controlledEntitySelectedSpell.description}
                  </div>
                  <div style={{ fontSize: "0.8em", color: "#9E9E9E" }}>
                    {controlledEntitySelectedSpell.range > 1 && (
                      <div>Range 1-{controlledEntitySelectedSpell.range}</div>
                    )}
                    {controlledEntitySelectedSpell.areaOfEffect && (
                      <div>
                        Hit a {controlledEntitySelectedSpell.areaOfEffect.kind}{" "}
                        of radius{" "}
                        {controlledEntitySelectedSpell.areaOfEffect.radius}
                      </div>
                    )}
                    {controlledEntitySelectedSpell.damageBaseAether > 0 && (
                      <div>
                        Damage {controlledEntitySelectedSpell.damageBaseAether}{" "}
                        aether
                      </div>
                    )}
                    {controlledEntitySelectedSpell.damageBaseNyx > 0 && (
                      <div>
                        Damage {controlledEntitySelectedSpell.damageBaseNyx} nyx
                      </div>
                    )}
                    {controlledEntitySelectedSpell.rallApBase > 0 && (
                      <div>
                        Rall {controlledEntitySelectedSpell.rallApBase} AP
                      </div>
                    )}
                    {controlledEntitySelectedSpell.rallMpBase > 0 && (
                      <div>
                        Rall {controlledEntitySelectedSpell.rallMpBase} MP
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                flexDirection: "row",
                marginTop: "1.5em",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "6em",
                }}
              >
                <div
                  style={{
                    fontSize: "1.5em",
                    marginBottom: 0,
                  }}
                >
                  {controlledEntityState?.currentState.hp}
                  <FaHeart
                    style={{
                      fontSize: "0.8em",
                      color: "#af0000",
                      marginLeft: "0.2em",
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: "1.2em",
                  }}
                >
                  {controlledEntityState?.currentState.ap}
                  <FaStar
                    style={{
                      fontSize: "0.8em",
                      color: "#efbf00",
                      marginLeft: "0.2em",
                    }}
                  />
                  &nbsp;
                  {controlledEntityState?.currentState.mp}
                  <GiFootprint
                    style={{
                      fontSize: "0.8em",
                      color: "#00af00",
                      marginLeft: "0.2em",
                    }}
                  />
                </div>
                <div style={{ fontSize: "0.8em" }}>
                  Turn {battleState.turnCount + 1}
                </div>
                <div style={{ fontSize: "3em", fontFamily: "monospace" }}>
                  <TurnTimeoutRefresher timeoutAt={battleState.turnTimeoutAt} />
                </div>
                <button
                  style={{
                    backgroundColor: "#1E1E1E",
                    color: "white",
                    padding: "0.5em",
                    borderRadius: "4px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.7em",
                    zIndex: 999,
                  }}
                  disabled={
                    currentTurnEntityState?.id !== controlledEntityState?.id
                  }
                  onClick={() => {
                    battleActionEndTurn({
                      battleState,
                      setBattleState,
                      controlledEntityId: controlledEntityState?.id,
                    })
                  }}
                >
                  End turn
                </button>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                maxWidth: "30em",
              }}
            >
              {turnOrder.map((player, index) => (
                <div
                  key={index}
                  style={{
                    // blue or red portrait card aligned on the right
                    backgroundColor: player.currentState.isDead
                      ? "gray"
                      : player.team === "blue"
                      ? "#0000cc"
                      : "#cc0000",
                    borderColor:
                      battleState.turnOrderIndex === index
                        ? "#ffc000"
                        : "#111111",
                    borderWidth: "0.2em",
                    borderStyle: "solid",
                    color: "white",
                    margin: "0.2em",
                    padding: "0.25em",
                    width: "6em",
                    minHeight: "3.5em",
                    fontSize: "0.8em",
                    borderRadius: "4px",
                  }}
                >
                  <div style={{ fontSize: "0.9em", position: "relative" }}>
                    {player.name}{" "}
                    <div
                      style={{
                        fontSize: "0.6em",
                        position: "absolute",
                        top: 0,
                        right: 0,
                        backgroundColor: player.currentState.isDead
                          ? "gray"
                          : player.team === "blue"
                          ? "#0000cc"
                          : "#cc0000",
                      }}
                    >
                      [{player.level}]
                    </div>
                  </div>
                  <div style={{ fontSize: "0.8em" }}>
                    <span style={{ fontSize: "1.2em" }}>
                      {player.currentState.hp}
                    </span>{" "}
                    <FaHeart /> <br />
                    <span style={{ fontSize: "1.2em" }}>
                      {player.currentState.ap}
                    </span>{" "}
                    <FaStar />{" "}
                    <span style={{ fontSize: "1.2em" }}>
                      {player.currentState.mp}
                    </span>{" "}
                    <GiFootprint />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ) : null
  }

  return (
    <>
      <ChatView
        messages={player.messages}
        sendMessage={(content) => {
          alert("still in the old battle chat implementation")
          // axios
          //   .post(`${API_URL}/battle/${battleState.id}/action`, {
          //     playerId: controlledEntityId,
          //     action: {
          //       type: "message.send",
          //       content: content,
          //     },
          //   })
          //   .then((response) => {
          //     setBattleState(response.data)
          //   })
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {gameBoard}
      </div>
      {bottomBar}
    </>
  )
}

const GameBoard = ({
  sizeX,
  sizeY,
  entities,
  battleId,
  battleState,
  setBattleState,
  controlledEntityId,
  controlledEntityState,
  currentTurnEntityState,
  controlledEntitySelectedSpell,
  setControlledEntitySelectedSpell,
}) => {
  const [suggestedPath, setSuggestedPath] = useState(null)
  const [aoeProjection, setAoeProjection] = useState(null)
  const [playedAnimations, setPlayedAnimations] = useState({})
  useEffect(() => {
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [battleState])

  useEffect(() => {
    setAoeProjection(null)
  }, [controlledEntitySelectedSpell])

  const onKeyDown = (event) => {
    if (battleState.state === "placement") {
      if (event.key === " ") {
        battleActionPlacementReady({
          battleState,
          setBattleState,
          controlledEntityId: controlledEntityState?.id,
        })
      }
    }
    if (battleState.state === "playing") {
      const keys = ["&", "é", '"', "'", "(", "§", "a", "z", "e", "r", "t", "y"]
      if (keys.includes(event.key)) {
        const spellIndex = keys.indexOf(event.key)
        if (controlledEntityState?.spells[spellIndex]) {
          setControlledEntitySelectedSpell(
            controlledEntityState?.spells[spellIndex]
          )
        }
      }
      // if escape
      if (event.key === "Escape") {
        setControlledEntitySelectedSpell(null)
        setAoeProjection(null)
      }
      // if space, end turn
      if (event.key === " ") {
        battleActionEndTurn({
          battleState,
          setBattleState,
          controlledEntityId: controlledEntityState?.id,
        })
      }
    }
  }

  const cells = []
  for (let y = 0; y < sizeY; y++) {
    for (let x = 0; x < sizeX; x++) {
      const entity = entities.find(
        (entity) => entity.position.x === x && entity.position.y === y
      )
      cells.push(
        <Cell
          key={`${x}-${y}`}
          entity={entity}
          x={x}
          y={y}
          battleState={battleState}
          setBattleState={setBattleState}
          controlledEntityId={controlledEntityId}
          controlledEntityState={controlledEntityState}
          currentTurnEntityState={currentTurnEntityState}
          controlledEntitySelectedSpell={controlledEntitySelectedSpell}
          setControlledEntitySelectedSpell={setControlledEntitySelectedSpell}
          suggestedPath={suggestedPath}
          setSuggestedPath={setSuggestedPath}
          playedAnimations={playedAnimations}
          setPlayedAnimations={setPlayedAnimations}
          aoeProjection={aoeProjection}
          setAoeProjection={setAoeProjection}
        />
      )
    }
  }

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateRows: `repeat(${sizeY}, 1fr)`,
          gridTemplateColumns: `repeat(${sizeX}, 1fr)`,
          // width: "500px",
          // rotate grid 45 degrees and pivot z-axis
          transform: "rotateX(58deg) rotateZ(45deg)",
          transformStyle: "preserve-3d",
          // transformOrigin: "top left",
          marginTop: "-22em",
          marginBottom: "-22em",
          marginLeft: "16em",
          zoom: 1.3,
          zIndex: -1,
        }}
      >
        {cells}
      </div>
    </div>
  )
}

const Cell = ({
  entity = {},
  x,
  y,
  battleState,
  setBattleState,
  controlledEntityId,
  controlledEntityState,
  currentTurnEntityState,
  controlledEntitySelectedSpell,
  setControlledEntitySelectedSpell,
  suggestedPath,
  setSuggestedPath,
  playedAnimations,
  setPlayedAnimations,
  aoeProjection,
  setAoeProjection,
}) => {
  let onClick
  const [isHover, setIsHover] = useState(false)
  const [rerenderToken, setRerenderToken] = useState(0)
  let hasSuggestedPath = false

  if (entity.kind === "nonexistent") {
    return (
      <div
        style={{
          opacity: 0,
          display: "hidden",
          border: "1px solid black",
          height: "50px",
          width: "50px",
        }}
      ></div>
    )
  }

  if (battleState.state === "placement") {
    onClick = () => {
      console.log({ x, y })
      axios
        .post(`${API_URL}/battle/${battleState.id}/action`, {
          playerId: controlledEntityId,
          action: {
            type: "placement.place",
            position: { x, y },
          },
        })
        .then((response) => {
          setBattleState(response.data)
        })
        .catch((error) => {
          console.error(error.response.data)
          console.log({ x, y })
        })
    }
  }

  let backgroundColor = "black"
  let opacity = 1
  let border = "1px solid #333333"
  let borderRadius = null
  let cursor = "auto"
  let boxSizing = "content-box"

  // display movement range
  if (
    battleState.state === "playing" &&
    !controlledEntitySelectedSpell &&
    currentTurnEntityState.currentState.mp > 0
  ) {
    const computedDistance =
      Math.abs(currentTurnEntityState.position.x - x) +
      Math.abs(currentTurnEntityState.position.y - y)
    if (computedDistance <= currentTurnEntityState.currentState.mp) {
      // get shortest path to target
      const result = getPathWithCache(
        currentTurnEntityState.position,
        { x, y },
        battleState
      )

      if (
        result.status === "success" &&
        result.path.length <= currentTurnEntityState.currentState.mp + 1
      ) {
        if (currentTurnEntityState.team === "red") {
          backgroundColor = "#200000"
        }
        if (currentTurnEntityState.team === "blue") {
          backgroundColor = "#000020"
        }
        if (controlledEntityState?.id === currentTurnEntityState?.id) {
          backgroundColor = "#002000"
          if (isHover) {
            hasSuggestedPath = true
            backgroundColor = "green"
            cursor = "pointer"

            setSuggestedPath(result.path.slice(1))

            onClick = () => {
              axios
                .post(`${API_URL}/battle/${battleState.id}/action`, {
                  playerId: controlledEntityState.id,
                  action: {
                    type: "playing.move",
                    position: { x, y },
                  },
                })
                .then((response) => {
                  setBattleState(response.data)
                })
                .catch((error) => {
                  console.error(error.response.data)
                })
            }
          }
        }
      }
    }
  }

  // handle mouse out of path in range
  if (isHover && !hasSuggestedPath) {
    setSuggestedPath(null)
  }

  // display spell range
  if (battleState.state === "playing" && controlledEntitySelectedSpell) {
    // color the cell if in range
    const computedDistance =
      Math.abs(controlledEntityState.position.x - x) +
      Math.abs(controlledEntityState.position.y - y)
    if (computedDistance > controlledEntitySelectedSpell.range) {
      onClick = () => {
        setControlledEntitySelectedSpell(null)
        setAoeProjection(null)
      }
    } else {
      backgroundColor = "#000029"
      cursor = "pointer"
      if (isHover) {
        backgroundColor = "#000099"
        // if aoe
        if (controlledEntitySelectedSpell.areaOfEffect) {
          if (controlledEntitySelectedSpell.areaOfEffect.kind === "circle") {
            const newAoeProjection = []
            for (let i = 0; i < battleState.board.sizeX; i++) {
              for (let j = 0; j < battleState.board.sizeY; j++) {
                const distance = Math.abs(i - x) + Math.abs(j - y)
                if (
                  distance <= controlledEntitySelectedSpell.areaOfEffect.radius
                ) {
                  newAoeProjection.push({ x: i, y: j })
                }
              }
            }
            // compare with current aoe projection
            if (
              newAoeProjection.length !== aoeProjection?.length ||
              newAoeProjection.find(
                (pos) =>
                  !aoeProjection.find((p) => p.x === pos.x && p.y === pos.y)
              )
            ) {
              setAoeProjection(newAoeProjection)
            }
          }
        }
        onClick = () => {
          if (currentTurnEntityState.id !== controlledEntityState.id) return
          console.log({
            playerId: controlledEntityState.id,
            action: {
              type: "playing.cast",
              spellId: controlledEntitySelectedSpell.id,
              targetPosition: { x, y },
            },
          })
          try {
            axios
              .post(`${API_URL}/battle/${battleState.id}/action`, {
                playerId: controlledEntityState.id,
                action: {
                  type: "playing.cast",
                  spellId: controlledEntitySelectedSpell.id,
                  targetPosition: { x, y },
                },
              })
              .catch((error) => {
                console.error(error.response.data)
              })
              .finally(() => {
                setControlledEntitySelectedSpell(null)
                setAoeProjection(null)
              })
          } catch (error) {
            console.error(error)
          }
        }
      }
    }
  }

  if (
    battleState.state === "playing" &&
    controlledEntitySelectedSpell &&
    aoeProjection
  ) {
    // if in projection, colorize
    if (aoeProjection.find((pos) => pos.x === x && pos.y === y)) {
      backgroundColor = "#990000"
    }
  }

  if (entity.kind === "player") {
    borderRadius = "4px"
    // if dead
    if (entity.team === "red") {
      border = `1px solid #ff0000`
      backgroundColor = "#600000"
    }
    if (entity.team === "blue") {
      border = `1px solid #0000ff`
      backgroundColor = "#000066"
    }
  }

  if (battleState.state === "placement" && entity.kind === "blue-slot") {
    border = `1px solid #0000aa`
    backgroundColor = "#000022"
    boxSizing = "border-box"
  }

  if (battleState.state === "placement" && entity.kind === "red-slot") {
    border = `1px solid #aa0000`
    backgroundColor = "#220000"
    boxSizing = "border-box"
  }

  if (
    battleState.state === "playing" &&
    currentTurnEntityState.id === entity.id
  ) {
    border = `2px solid #ffc000`
    boxSizing = "border-box"
  }

  if (entity.kind === "wall") {
    backgroundColor = "#333333"
    boxSizing = "content-box"
  }

  // display if in suggested path
  if (
    suggestedPath &&
    suggestedPath.find((pos) => pos.x === x && pos.y === y)
  ) {
    backgroundColor = "green"
    borderRadius = "4px"
  }

  const availableAnimations = battleState.animations.filter(
    (animation) =>
      !playedAnimations[animation.id] &&
      animation.position.x === x &&
      animation.position.y === y
  )
  let animation
  const ANIMATION_DURATION = 800
  while (availableAnimations.length > 0) {
    animation = availableAnimations[0]
    // if still up to date, play
    if (animation.at > Date.now() - ANIMATION_DURATION) {
      setTimeout(() => {
        setRerenderToken(Math.random())
      }, ANIMATION_DURATION / 2)
      break
    }

    // remove animation from available
    availableAnimations.shift()
    animation = null
  }
  // if (didExpireOneAnimation) {
  //   setPlayedAnimations(newPlayedAnimations)
  // }

  return (
    <div
      style={{
        border,
        borderRadius,
        height: "50px",
        width: "50px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        boxSizing,
        backgroundColor,
        cursor,
        opacity,
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      {entity ? (
        <EntityRenderer
          entity={entity}
          battleState={battleState}
          animation={animation}
        />
      ) : null}
    </div>
  )
}

const EntityRenderer = ({ entity, onClick, battleState, animation }) => {
  if (!entity.kind) return null

  let backgroundColor = "black"
  if (entity.team) {
    backgroundColor = entity.team === "blue" ? "#0000a0" : "#a00000"
  }

  let borderColor = backgroundColor
  if (battleState.state === "placement") {
    // if is ready
    if (entity.isReady) {
      backgroundColor = "green"
      borderColor = "green"
    }
  }

  if (entity.kind === "blue-slot") return null
  if (entity.kind === "red-slot") return null
  if (entity.kind === "wall") return null

  let textContent = null
  if (entity.kind === "player") {
    textContent = (
      <div
        style={{
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "0.8em", cursor: "default" }}>
          {entity.name}
        </div>
        {battleState.state === "playing" && (
          <div style={{ textAlign: "center" }}>{entity.currentState.hp}</div>
        )}
      </div>
    )
  }

  return (
    <div
      style={{
        backgroundColor,
        borderRadius: "2px",
        // height: "80%",
        // width: "80%",
        color: "white",
        borderStyle: "solid",
        borderColor,
        boxSizing: "content-box",
        fontSize: "0.8em",
        zIndex: 1,
        padding: "0.1em",
      }}
      onClick={onClick}
      className="prevent-select"
    >
      {!animation ? (
        textContent
      ) : (
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.5)",
            color: "white",
          }}
          className={`gameboard-animate-${animation.kind}`}
        >
          {animation.data.value}
        </div>
      )}
    </div>
  )
}

const TurnTimeoutRefresher = ({ timeoutAt }) => {
  const [timeLeft, setTimeLeft] = useState(timeoutAt - Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(timeoutAt - Date.now())
    }, 200)
    return () => clearInterval(interval)
  }, [timeoutAt])

  if (timeLeft < 0) {
    return <span>00</span>
  }

  return (
    <span>
      {timeLeft < 10 * 1000 ? "0" : null}
      {Math.floor(timeLeft / 1000)}
    </span>
  )
}

const battleActionPlacementReady = ({
  battleState,
  setBattleState,
  controlledEntityId,
}) => {
  axios
    .post(`${API_URL}/battle/${battleState.id}/action`, {
      playerId: controlledEntityId,
      action: {
        type: "placement.ready",
      },
    })
    .then((response) => {
      setBattleState(response.data)
    })
}

const battleActionEndTurn = ({
  battleState,
  setBattleState,
  controlledEntityId,
}) => {
  axios
    .post(`${API_URL}/battle/${battleState.id}/action`, {
      playerId: controlledEntityId,
      action: {
        type: "playing.endTurn",
      },
    })
    .then((response) => {
      setBattleState(response.data)
    })
    .catch((error) => {
      console.error(error.response.data)
    })
}

export default Battle
