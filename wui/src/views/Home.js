import React, { useEffect } from "react"
import axios from "axios"

import {
  API_URL,
  equipmentKindList,
  equipmentKindToIcon,
  spellIdToIcon,
} from "../config"
import { useNavigate } from "react-router-dom"
import { ChatView } from "./Chat"
import { usePlayer } from "../contexts/usePlayer"
import { itemKindToEmoji } from "../config"
import { GiBroadsword, GiPointySword, GiWingedSword } from "react-icons/gi"
import { PiCastleTurretFill } from "react-icons/pi"
import { Rankings } from "./Rankings"

const Home = ({ socket }) => {
  const navigate = useNavigate()
  const [error, setError] = React.useState(null)
  const [selectedItem, setSelectedItem] = React.useState(null)
  const [selectedSpell, setSelectedSpell] = React.useState(null)
  const [isSwitchingSpell, setIsSwitchingSpell] = React.useState(null)
  const [battleFactoryDb, setBattleFactoryDb] = React.useState(null)
  const [openLobbies, setOpenLobbies] = React.useState([])

  let playerUseItem = () => {
    if (!selectedItem) return
    axios
      .post(`${API_URL}/players/${player.id}/useItem/${selectedItem.id}`)
      .then((res) => {
        setSelectedItem(null)
      })
      .catch((error) => {
        alert(error)
      })
  }

  const { player } = usePlayer()

  const createBattle = ({ factoryId }) => {
    if (!player.unlockedZones.includes(factoryId)) {
      alert("You need to unlock this zone first")
      return
    }
    axios
      .post(`${API_URL}/battle`, {
        factoryId,
        blueTeam: [
          {
            ...player,
          },
        ],
      })
      .then((res) => {
        // navigate to battle id
        navigate(`/battle/${res.data.id}`)
      })
      .catch((error) => {
        alert(error)
      })
  }

  useEffect(() => {
    if (battleFactoryDb) return
    axios.get(`${API_URL}/data/battleFactory`).then((res) => {
      console.log({ res: res.data })
      setBattleFactoryDb(res.data)
    })
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      axios.get(`${API_URL}/lobbies`).then((res) => {
        setOpenLobbies(res.data)
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!socket) return
    socket.send(JSON.stringify({ type: "openLobbies.subscribe" }))
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data)
      if (message.type === "openLobbies.update") {
        setOpenLobbies(message.data)
      }
    })
  }, [socket])

  /* auto join lobby battle */
  useEffect(() => {
    if (!openLobbies) return
    if (!player?.lobbyId) return
    if (!openLobbies[player.lobbyId]) return
    if (!openLobbies[player.lobbyId].battleId) return

    // ask with dialog
    // const shouldJoin = window.confirm(
    //   "A battle is ready to start, do you want to join?"
    // )
    // if (shouldJoin) {
    //   navigate(`/battle/${openLobbies[player.lobbyId].battleId}`)
    // }
  }, [openLobbies, player])

  const statsDisplayOrder = ["ap", "mp", "hp", "aether", "nyx"]

  if (!player)
    return (
      <>
        <ChatView
          messages={[
            {
              at: Date.now(),
              from: "system",
              content:
                "You're offline. To login, use\n\n/login <i>playername</i>",
            },
          ]}
        />
      </>
    )

  if (!battleFactoryDb) return <div className="loading-text">Loading...</div>

  // determine inventory display size
  let INVENTORY_SIZE_X = 1
  while (
    (INVENTORY_SIZE_X + 1) * (INVENTORY_SIZE_X + 1) <=
    player?.inventory?.content.length
  ) {
    INVENTORY_SIZE_X++
  }

  const battleFactoriesAvailable = {}
  for (let factory of battleFactoryDb) {
    battleFactoriesAvailable[factory.id] =
      player?.unlockedZones?.includes(factory.id) || false
  }

  if (player.level <= 1) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <div
          style={{
            // width: "24em",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "3em", marginBottom: 0 }}>{player.name}</h1>
          <h3
            style={{ color: "#3E3E3E", marginTop: 0, fontFamily: "monospace" }}
          >
            Lvl. {player.level}
          </h3>
          <button
            style={{
              backgroundColor: "#151515",
              color: "#E0E0E0",
              padding: "1em 2em",
              border: "solid 1px #3E3E3E",
              borderRadius: "4px",
              cursor: "pointer",
              outline: "none",
              fontSize: "1em",
            }}
            onClick={() => {
              createBattle({
                factoryId: "amazon1",
              })
            }}
          >
            Join the fight
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <ChatView messages={player?.messages || []} />
      <div style={{ marginLeft: "21em" }}>
        {player.level > 1 && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              flexDirection: "row",
              justifyContent: "center",
              columnGap: "2em",
            }}
            onClick={() => {
              setSelectedItem(null)
              setSelectedSpell(null)
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "16em",
              }}
            >
              <h1 style={{ textAlign: "center", marginBottom: 0 }}>Spells</h1>
              <h3
                style={{
                  textAlign: "center",
                  margin: "0.5em 0",
                  color: "#3E3E3E",
                  fontSize: "0.8em",
                }}
              >
                In Use
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  width: "16em",
                }}
              >
                {player.spells.map((spell) => (
                  <div
                    key={spell.id}
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      // justifyContent: "space-between",
                      fontSize: "1.2em",
                      // margin: "0.2em auto",
                      borderRadius: "8px",
                      borderStyle: "solid",
                      borderColor:
                        selectedSpell?.id === spell.id ? "#9E9E9E" : "black",
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedSpell(spell)
                    }}
                    className={isSwitchingSpell?.id === spell.id && "vibrate"}
                  >
                    <div style={{ zoom: 0.8 }}>
                      {spellIdToIcon[spell.id] || spellIdToIcon["default"]}
                    </div>
                  </div>
                ))}
                <div
                  style={{
                    // paddingBottom: "0.8em",
                    color: "#1E1E1E",
                    width: "100%",
                    borderBottom: "solid 1px #1E1E1E",
                    marginTop: "1em",
                  }}
                ></div>
                <h3
                  style={{
                    textAlign: "center",
                    margin: "0.5em 0",
                    color: "#3E3E3E",
                    fontSize: "0.8em",
                  }}
                >
                  Not In Use
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    width: "16em",
                  }}
                >
                  {player?.spellInventory?.map((spell) => {
                    return (
                      <div
                        key={spell.id}
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          // justifyContent: "space-between",
                          fontSize: "1.2em",
                          // margin: "0.2em auto",
                          borderRadius: "8px",
                          borderStyle: "solid",
                          borderColor:
                            selectedSpell?.id === spell.id ||
                            isSwitchingSpell === spell
                              ? "#9E9E9E"
                              : "black",
                        }}
                        className={
                          isSwitchingSpell?.id === spell.id && "vibrate"
                        }
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedSpell(spell)
                        }}
                      >
                        <div style={{ zoom: 0.8 }}>
                          {spellIdToIcon[spell.id] || spellIdToIcon["default"]}
                        </div>
                      </div>
                    )
                  })}
                </div>
                {selectedSpell && (
                  <div
                    style={{
                      display: "flex",
                      width: "15em",
                      padding: "0 0.5em",
                      justifyContent: "flex-start",
                      flexDirection: "column",
                    }}
                  >
                    {!isSwitchingSpell && (
                      <button
                        style={{
                          backgroundColor: "#151515",
                          color: "#E0E0E0",
                          padding: "0.5em",
                          border: "solid 1px #3E3E3E",
                          borderRadius: "4px",
                          cursor: "pointer",
                          outline: "none",
                          marginTop: "1em",
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsSwitchingSpell(selectedSpell)
                        }}
                      >
                        Swap spell
                      </button>
                    )}
                    {isSwitchingSpell && (
                      <button
                        style={{
                          backgroundColor: "#1F1F1F",
                          color: "#E0E0E0",
                          padding: "0.5em",
                          border: "solid 1px #3E3E3E",
                          borderRadius: "4px",
                          cursor: "pointer",
                          outline: "none",
                          marginTop: "1em",
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          axios.post(
                            `${API_URL}/players/${player.id}/swapSpells`,
                            {
                              spellIdA: selectedSpell.id,
                              spellIdB: isSwitchingSpell.id,
                            }
                          )
                          setIsSwitchingSpell(null)
                        }}
                      >
                        Swap with {selectedSpell.name}
                      </button>
                    )}
                    <h3 style={{ margin: "0.5em 0 0 0", fontSize: "0.9em" }}>
                      {selectedSpell.name}
                      <span style={{ fontSize: "0.8em", color: "#9E9E9E" }}>
                        &nbsp;&nbsp;{selectedSpell.apCost} AP
                      </span>
                    </h3>
                    <div style={{ fontSize: "0.8em" }}>
                      {selectedSpell.description}
                    </div>
                    <div style={{ fontSize: "0.8em", color: "#9E9E9E" }}>
                      {selectedSpell.range > 1 && (
                        <div>Range 1-{selectedSpell.range}</div>
                      )}
                      {selectedSpell.areaOfEffect && (
                        <div>
                          Hit a {selectedSpell.areaOfEffect.kind} of radius{" "}
                          {selectedSpell.areaOfEffect.radius}
                        </div>
                      )}
                      {selectedSpell.damageBaseAether > 0 && (
                        <div>
                          Damage {selectedSpell.damageBaseAether} aether
                        </div>
                      )}
                      {selectedSpell.damageBaseNyx > 0 && (
                        <div>Damage {selectedSpell.damageBaseNyx} nyx</div>
                      )}
                      {selectedSpell.rallApBase > 0 && (
                        <div>Rall {selectedSpell.rallApBase} AP</div>
                      )}
                      {selectedSpell.rallMpBase > 0 && (
                        <div>Rall {selectedSpell.rallMpBase} MP</div>
                      )}
                    </div>
                    {/* <div>
                    <button
                      onClick={() => {
                        axios
                          .post(
                            `${API_URL}/players/${player.id}/castSpell/${selectedSpell.id}`
                          )
                          .catch((error) => {
                            alert(error)
                          })
                      }}
                    >
                      cast spell
                    </button>
                  </div> */}
                  </div>
                )}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: "12em",
                }}
              >
                <h1
                  style={{
                    textAlign: "center",
                  }}
                  className="prevent-select"
                >
                  Stats
                </h1>
                {error && (
                  <div
                    style={{
                      margin: "0.5em auto",
                      padding: "0.5em",
                      backgroundColor: "#1E1E1E",
                      borderRadius: "4px",
                      color: "white",
                      textAlign: "center",
                    }}
                  >
                    {error}
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    fontSize: "1.2em",
                    margin: "0.5em auto",
                    width: "100%",
                  }}
                  className="prevent-select"
                >
                  <span>lvl</span>
                  <span
                    style={{
                      width: "4em",
                      textAlign: "right",
                      outline: "none",
                      fontSize: "1em",
                    }}
                  >
                    {player.level}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    fontSize: "1.2em",
                    margin: "0.5em auto",
                    width: "100%",
                  }}
                  className="prevent-select"
                >
                  <span>xp</span>
                  <span
                    style={{
                      textAlign: "right",
                      outline: "none",
                      fontSize: "1em",
                    }}
                  >
                    <div style={{ fontSize: "0.5em" }}>
                      {player.xp} / {player.xpToNextLevel}
                    </div>
                    <div style={{ fontSize: "0.5em" }}>
                      {Math.floor(100 * (player.xp / player.xpToNextLevel))}%
                    </div>
                  </span>
                </div>
                {statsDisplayOrder.map((key) => (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      fontSize: "1.2em",
                      margin: "0.5em auto",
                      width: "100%",
                    }}
                    className="prevent-select"
                  >
                    <span style={{ flex: 4 }}>{key}</span>
                    {player?.statPointsAvailable > 0 &&
                      ["hp", "aether", "nyx"].includes(key) && (
                        <span
                          style={{
                            flex: 1,
                            fontSize: "1em",
                            color: "#afafaf",
                            cursor: "pointer",
                            alignContent: "center",
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            axios
                              .post(
                                `${API_URL}/players/${player.id}/attributePoint/${key}`
                              )
                              .catch((error) => {
                                alert(error)
                              })
                          }}
                          className="prevent-select"
                        >
                          +1
                        </span>
                      )}
                    <span
                      style={{
                        flex: 2,
                        width: "4em",
                        textAlign: "right",
                        outline: "none",
                        fontSize: "1em",
                      }}
                    >
                      {player?.initialState?.[key]}{" "}
                    </span>
                  </div>
                ))}
                {player?.statPointsAvailable > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      fontSize: "1.2em",
                      width: "100%",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.8em",
                        color: "#AFAFAF",
                        fontStyle: "italic",
                      }}
                    >
                      You have&nbsp;
                      <b>+{player.statPointsAvailable}</b>
                      &nbsp;new points available, attribute them to your stats
                      as you wish by clicking on the +1 buttons.
                    </p>
                  </div>
                )}
              </div>
            </div>
            {player.inventory && (
              <div
                style={{
                  display: "flex",
                  // margin: "1em auto 1em 2em",
                  alignItems: "center",
                  textAlign: "center",
                  flexDirection: "column",
                }}
                className="prevent-select"
              >
                <h1>Bag</h1>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    width: `${INVENTORY_SIZE_X * 1.2}em`,
                    fontSize: "2em",
                    position: "relative",
                    justifyContent: "center",
                  }}
                >
                  {player.inventory.content.map((slot, slotIndex) => (
                    <div
                      style={{
                        width: "1em",
                        height: "1em",
                        backgroundColor: "#151515",
                        borderRadius: "4px",
                        borderWidth: "1px",
                        borderStyle: "solid",

                        boxSizing: "border-box",
                        borderColor:
                          !slot.empty && selectedItem?.id === slot?.id
                            ? "#9E9E9E"
                            : "#151515",
                        margin: "0.1em",
                        cursor: "pointer",
                        lineHeight: "1em",
                        verticalAlign: "middle",
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (slot.empty) {
                          setSelectedItem(null)
                        } else {
                          if (selectedItem?.id === slot?.id) {
                            playerUseItem()
                          } else {
                            setSelectedItem(slot)
                          }
                        }
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.5em",
                        }}
                      >
                        {slot?.empty ? "" : itemKindToEmoji[slot.kind] || "❔"}
                      </div>
                    </div>
                  ))}
                </div>
                {selectedItem && (
                  <div
                    style={{
                      width: "100%",
                      textAlign: "left",
                      paddingLeft: "0.5em",
                      maxWidth: `${INVENTORY_SIZE_X * 1.2 * 2}em`,
                    }}
                  >
                    <h3
                      style={{
                        marginTop: "0.5em",
                        marginBottom: 0,
                        fontSize: "0.9em",
                        color: "#EFEFEF",
                      }}
                    >
                      {selectedItem.title || selectedItem.kind}
                    </h3>
                    <div
                      style={{
                        color: "#CFCFCF",
                        fontSize: "0.8em",
                      }}
                      dangerouslySetInnerHTML={{
                        __html:
                          selectedItem.description ||
                          "<span>Who knows what it does?</span>",
                      }}
                    />
                    <div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          playerUseItem()
                        }}
                        style={{
                          backgroundColor: "#151515",
                          color: "white",
                          padding: "0.5em",
                          border: "solid 1px #3E3E3E",
                          borderRadius: "4px",
                          cursor: "pointer",
                          outline: "none",
                          marginTop: "0.5em",
                        }}
                      >
                        use item
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {player.inventory && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  textAlign: "center",
                  flexDirection: "column",
                  width: "12em",
                }}
                className="prevent-select"
              >
                <h1>Equipment</h1>
                {equipmentKindList.map((equipmentKind) => {
                  // const equipment = player.equipment[equipmentKind]
                  return (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        fontSize: "1.2em",
                        // margin: "0.5em auto",
                        width: "100%",
                      }}
                      className="prevent-select"
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          margin: "0.2em 0",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          style={{
                            width: "1em",
                            height: "1em",
                            textAlign: "right",
                            outline: "none",
                            fontSize: "2em",
                            display: "inline-block",
                            backgroundColor: "#151515",
                            borderRadius: "8px",
                          }}
                        ></div>
                        <div
                          style={{
                            display: "inline-block",
                            width: "2em",
                            textAlign: "left",
                            marginLeft: "1em",
                            color: "#9E9E9E",
                          }}
                        >
                          {equipmentKindToIcon[equipmentKind] || "❔"}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: "4em",
          }}
        >
          <div
            style={{
              width: "100%",
              // marginRight: "4em",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h1
              style={{
                textAlign: "center",
              }}
              className="prevent-select"
            >
              World
            </h1>
            <div
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                display: "flex",
                height: "36em",
                width: "60em",
                justifyContent: "center",
              }}
            >
              {battleFactoryDb.map((battleFactory) => (
                <button
                  style={{
                    margin: "1em 0.5em",
                    width: "8em",
                    height: "4em",
                    padding: "0.5em",
                    fontSize: "1.5em",
                    backgroundColor: battleFactoriesAvailable[battleFactory.id]
                      ? "#151515"
                      : "#000000",
                    borderStyle: "solid",
                    borderWidth: "4px",
                    borderColor: "#1E1E1E",
                    boxSizing: "content-box",
                    borderRadius: "4px",
                    color: "white",
                    cursor: "pointer",
                    marginRight: "1em",
                    outline: "none",
                    zoom: 0.8,
                    ...(battleFactoriesAvailable[battleFactory.id]
                      ? battleFactory.style
                      : null),
                    opacity: battleFactoriesAvailable[battleFactory.id]
                      ? 1
                      : 0.2,
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    createBattle({
                      factoryId: battleFactory.id,
                      bluePlayer: {
                        name: "Hades",
                        color: "blue",
                      },
                    })
                  }}
                >
                  {battleFactory.displayIcon && (
                    <div
                      style={{
                        // marginTop: "0.2em",
                        fontSize: "1.6em",
                        color: "#AFAFAF",
                        fontStyle: "italic",
                        margin: 0,
                      }}
                    >
                      {{
                        simpleSword: <GiBroadsword />,
                        doubleSword: <GiPointySword />,
                        lotsOfSword: <PiCastleTurretFill />,
                        boss: <GiWingedSword style={{ fontSize: "1.2em" }} />,
                      }[battleFactory.displayIcon] || battleFactory.displayIcon}
                    </div>
                  )}
                  <div>{battleFactory.title || battleFactory.id}</div>
                  {battleFactory.subtitle && (
                    <div
                      style={{
                        fontSize: "0.6em",
                        color: "#AFAFAF",
                        fontStyle: "italic",
                      }}
                    >
                      {battleFactory.subtitle}
                    </div>
                  )}
                  {/* {battleFactory.level && (
                  <div>
                    <span
                      style={{
                        fontSize: "0.5em",
                        color: "#AFAFAF",
                        fontStyle: "italic",
                      }}
                    >
                      Lvl. {battleFactory.level}
                    </span>
                  </div>
                )} */}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* <div
        style={{
          marginTop: "4em",
          marginLeft: "10em",
          marginBottom: "8em",
        }}
      >
        <div
          style={{
            width: "100%",
            // marginRight: "4em",
            padding: "4em auto",
            flexDirection: "column",
            color: "white",
          }}
        >
          <h1
            style={{
              textAlign: "center",
              marginLeft: "8em",
            }}
            className="prevent-select"
          >
            PvP
            <div
              style={{ color: "#3E3E3E", fontSize: "0.8em", marginTop: "1em" }}
            >
              Coming soon
            </div>
          </h1>
        </div>
      </div> */}
        <div
          style={{
            marginTop: "8em",
          }}
        >
          <div
            style={{
              // marginRight: "4em",
              flexDirection: "column",
              color: "white",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Rankings />
          </div>
        </div>
        <div
          style={{
            marginTop: "8em",
            marginBottom: "12em",
            // width: "32em",
            flexDirection: "column",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h1>PvP</h1>
          {!player.lobbyId ? (
            <>
              <button
                style={{
                  backgroundColor: "#151515",
                  color: "#E0E0E0",
                  padding: "0.5em",
                  border: "solid 1px #3E3E3E",
                  borderRadius: "4px",
                  cursor: "pointer",
                  outline: "none",
                  fontSize: "1em",
                  width: "10em",
                }}
                onClick={() => {
                  axios
                    .post(`${API_URL}/lobby/init`, { playerId: player.id })
                    .catch((error) => {
                      console.error(error)
                    })
                }}
              >
                Create a lobby
              </button>
              {Object.values(openLobbies)
                .filter((l) => l.isOpen)
                .map((lobby) => (
                  <div
                    style={{
                      backgroundColor: "black",
                      color: "#E0E0E0",
                      padding: "1em",
                      border: "solid 1px #1E1E1E",
                      borderRadius: "16px",
                      cursor: "pointer",
                      outline: "none",
                      fontSize: "1em",
                      width: "16em",
                      margin: "0.5em",
                    }}
                  >
                    <div style={{ textAlign: "center", color: "#5E5E5E" }}>
                      <span style={{ fontSize: "0.8em" }}>Hosted by: </span>
                      <b style={{ color: "white" }}>{lobby?.hostId}</b>
                    </div>
                    <div
                      style={{
                        textAlign: "center",
                        color: "#5E5E5E",
                        fontSize: "0.8em",
                      }}
                    >
                      Draft mode: {lobby?.draftKind}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        margin: "1em 0 0.5em",
                      }}
                    >
                      <button
                        style={{
                          backgroundColor: "#151515",
                          color: "#E0E0E0",
                          padding: "0.5em",
                          border: "solid 1px #3E3E3E",
                          borderRadius: "4px",
                          cursor: "pointer",
                          outline: "none",
                          fontSize: "0.7em",
                          // fontSize: "0.8em",
                        }}
                        onClick={() => {
                          axios
                            .post(`${API_URL}/lobby/join`, {
                              playerId: player.id,
                              lobbyId: lobby.hostId,
                            })
                            .catch((error) => {
                              console.error(error)
                            })
                        }}
                      >
                        Join this lobby
                      </button>
                    </div>
                  </div>
                ))}
            </>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  backgroundColor: "black",
                  color: "#E0E0E0",
                  padding: "1em",
                  border: "solid 1px #5E5E5E",
                  borderRadius: "16px",
                  cursor: "pointer",
                  outline: "none",
                  fontSize: "1em",
                  width: "16em",
                  margin: "0.5em",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <h2
                  style={{
                    textAlign: "center",
                    marginTop: "0.5em",
                  }}
                >
                  In a lobby
                  <button
                    style={{
                      backgroundColor: "#151515",
                      color: "#E0E0E0",
                      // padding: "0.5em",
                      border: "solid 1px #3E3E3E",
                      borderRadius: "4px",
                      cursor: "pointer",
                      outline: "none",
                      fontSize: "0.5em",
                      marginLeft: "0.5em",
                    }}
                    onClick={() => {
                      axios
                        .post(`${API_URL}/lobby/leave`, {
                          playerId: player.id,
                        })
                        .catch((error) => {
                          console.error(error)
                        })
                    }}
                  >
                    leave
                  </button>
                </h2>

                <div style={{ textAlign: "center", color: "#5E5E5E" }}>
                  <span style={{ fontSize: "0.8em" }}>Hosted by: </span>
                  <b style={{ color: "white" }}>{player.lobbyId}</b>
                </div>
                <div
                  style={{
                    textAlign: "center",
                    color: "#5E5E5E",
                    fontSize: "0.8em",
                  }}
                >
                  Draft mode: {openLobbies[player.lobbyId]?.draftKind}
                </div>
                <div style={{ textAlign: "center" }}>
                  <h3 style={{ fontSize: "0.8em" }}>Players</h3>
                  {openLobbies[player.lobbyId]?.players.map(
                    (playerId, index) => (
                      <div style={{ fontSize: "0.8em" }}>
                        {index + 1}. {playerId}
                      </div>
                    )
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    margin: "1em",
                  }}
                >
                  <button
                    style={{
                      backgroundColor:
                        openLobbies[player.lobbyId]?.players.length < 2
                          ? "#3E3E3E"
                          : "#151515",
                      color: "#E0E0E0",
                      padding: "0.5em",
                      border: "solid 1px #3E3E3E",
                      borderRadius: "4px",
                      cursor:
                        openLobbies[player.lobbyId]?.players.length < 2
                          ? "not-allowed"
                          : "pointer",
                      outline: "none",
                      fontStyle:
                        openLobbies[player.lobbyId]?.players.length < 2
                          ? "italic"
                          : "",
                      // fontSize: "0.8em",
                    }}
                    disabled={openLobbies[player.lobbyId]?.players.length < 2}
                    onClick={() => {
                      if (!openLobbies[player.lobbyId]?.battleId) {
                        axios
                          .post(`${API_URL}/lobby/convertToBattle`, {
                            lobbyId: player.lobbyId,
                          })
                          .then((res) => {
                            navigate(`/battle/${res.data.id}`)
                          })
                          .catch((error) => {
                            console.error(error)
                          })
                      } else {
                        navigate(
                          `/battle/${openLobbies[player.lobbyId].battleId}`
                        )
                      }
                    }}
                  >
                    {openLobbies[player.lobbyId]?.battleId
                      ? "Join battle"
                      : openLobbies[player.lobbyId]?.players.length < 2
                      ? `Waiting for players ${
                          openLobbies[player.lobbyId]?.players.length
                        }/2`
                      : "Start battle"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
export default Home
