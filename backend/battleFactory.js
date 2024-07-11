import {
  SIZE_X,
  SIZE_Y,
  NONEXISTENT_SIZE,
  DEFAULT_PLAYER_STATE,
  battleFactoryDb,
} from "./config.js"
import { spellData } from "./spellData.js"
import { boardFactory } from "./boardFactory.js"
import { randIn, range } from "./utils.js"
import { defaultLootProbabilitiesGenerator } from "./loot.js"

const mobFactory = {
  base: ({ level }) => {
    return {
      id: Math.random().toString(36).substring(7),
      name: "Mob",
      kind: "player",
      team: "red",
      level: level,
      initialState: DEFAULT_PLAYER_STATE,
      lootProbabilities: defaultLootProbabilitiesGenerator,
      isAiControlled: true,
      spells: [],
    }
  },
  walker: ({ level }) => {
    return {
      ...mobFactory.base({ level }),
      name: "Walker",
      spells: [{ ...spellData.mobCacHit }],
    }
  },
  centaur: ({ level }) => {
    return {
      ...mobFactory.walker({ level }),
      name: "Centaur",
      spells: [
        { ...spellData.mobCacHit, name: "Hoof Kick" },
        { ...spellData.mobRangeHit, name: "Sputum" },
      ],
      initialState: {
        ...DEFAULT_PLAYER_STATE,
        hp: 6 + level * 4,
        ap: 3,
        mp: 3,
        aether: 20,
      },
    }
  },
  centaurKid: ({ level }) => {
    return {
      ...mobFactory.centaur({ level }),
      initialState: {
        ...DEFAULT_PLAYER_STATE,
        hp: 6 + level * 2,
        ap: 3,
        mp: 5,
      },
      name: "Centaur Kid",
    }
  },
  antiope: ({ level }) => {
    return {
      ...mobFactory.centaur({ level }),
      name: "Antiope",
      initialState: {
        hp: 120,
        ap: 9,
        mp: 4,
        aether: 50,
      },
    }
  },
  manbull: ({ level }) => {
    return {
      ...mobFactory.walker({ level }),
      name: "Manbull",
      spells: [
        {
          ...spellData.mobCacHit,
          name: "Horn Stomp",
        },
        {
          ...spellData.mobRangeHit,
          name: "Spear Throw",
          range: 1,
        },
      ],
      initialState: {
        ...DEFAULT_PLAYER_STATE,
        hp: 50 + level * 6,
        ap: 6,
        mp: 4,
        aether: 180,
      },
      lootProbabilities: defaultLootProbabilitiesGenerator,
    }
  },
}

export const battleFactory = {
  amazon1: ({ player }) => {
    const board = boardFactory["amazon1"]()

    const redTeam = [
      ...Array.from(
        {
          length: randIn([...range(1, Math.max(1, player.level / 2))]),
        },
        () =>
          mobFactory.centaur({
            level: randIn([...range(1, Math.max(1, player.level / 2))]),
          })
      ),
      ...Array.from(
        {
          length: randIn([...range(1, Math.max(1, player.level / 2))]),
        },
        () =>
          mobFactory.centaurKid({
            level: randIn([...range(1, Math.max(1, player.level / 2))]),
          })
      ),
    ].map((mob) => {
      return {
        ...mob,
        position: board.redPlacementSlots.shift(),
      }
    })

    const battleConfig = {
      board,
      redTeam,
      zoneName: "amazon",
    }

    return battleConfig
  },
  amazon2: () => {
    const board = boardFactory["amazon1"]()

    const redTeam = [
      ...Array.from({ length: randIn([2, 3]) }, () =>
        mobFactory.centaur({
          level: randIn([4, 5]),
        })
      ),
      ...Array.from({ length: randIn([2, 3]) }, () =>
        mobFactory.centaurKid({
          level: randIn([4, 5]),
        })
      ),
    ].map((mob) => {
      return {
        ...mob,
        position: board.redPlacementSlots.shift(),
      }
    })

    const battleConfig = {
      board,
      redTeam,
      zoneName: "amazon",
    }

    return battleConfig
  },
  amazon3: () => {
    const board = boardFactory["amazon3"]()

    const redTeam = [
      ...Array.from({ length: randIn([4]) }, () =>
        mobFactory.centaur({ level: randIn([5]) })
      ),
      ...Array.from({ length: randIn([8]) }, () =>
        mobFactory.centaurKid({
          level: randIn([2]),
        })
      ),
    ]
      .map((mob) => {
        if (board.redPlacementSlots.length === 0) {
          console.log("No more red placement slots")
          return null
        }
        return {
          ...mob,
          position: board.redPlacementSlots.shift(),
        }
      })
      .filter((mob) => mob)

    const battleConfig = {
      board,
      redTeam,
      xpBonusCoef: 2,
      zoneName: "amazon",
    }

    return battleConfig
  },
  amazonBoss: () => {
    const board = boardFactory["amazon3"]()

    const redTeam = [
      mobFactory.antiope({ level: 10 }),
      ...Array.from({ length: randIn([4]) }, () =>
        mobFactory.centaur({ level: randIn([8]) })
      ),
    ]
      .map((mob) => {
        if (board.redPlacementSlots.length === 0) {
          console.log("No more red placement slots")
          return null
        }
        return {
          ...mob,
          position: board.redPlacementSlots.shift(),
        }
      })
      .filter((mob) => mob)

    const battleConfig = {
      board,
      redTeam,
      xpBonusCoef: 4,
      lootBonusCoef: 4,
      zoneName: "amazon",
    }

    return battleConfig
  },
  knossos1: () => {
    const board = boardFactory["knossos1"]()

    const redTeam = [
      ...Array.from({ length: randIn([4]) }, () =>
        mobFactory.manbull({ level: randIn([16]) })
      ),
    ]
      .map((mob) => {
        if (board.redPlacementSlots.length === 0) {
          console.log("No more red placement slots")
          return null
        }
        return {
          ...mob,
          position: board.redPlacementSlots.shift(),
        }
      })
      .filter((mob) => mob)

    const battleConfig = {
      board,
      redTeam,
      zoneName: "knossos",
    }

    return battleConfig
  },
}
