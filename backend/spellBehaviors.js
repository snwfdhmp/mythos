import spellData from "./spellData.js"
import { pushMessageToBattle } from "./chat.js"
import { pushAnimation } from "./animations.js"

export const spellBehaviors = {
  checkRange: ({ battle, player, targetPosition, spell }) => {
    // targetPosition is in range
    const distance =
      Math.abs(player.position.x - targetPosition.x) +
      Math.abs(player.position.y - targetPosition.y)
    if (distance > spell.range) {
      return { error: "Target out of range" }
    }
  },

  checkAp: ({ battle, player, targetPosition, spell }) => {
    // enough ap
    if (player.currentState.ap < spell.apCost) {
      return { error: "Not enough AP" }
    }
  },
  payAp: ({ battle, player, targetPosition, spell }) => {
    pushMessageToBattle(
      battle,
      "system",
      `<b>${player.name}</b> lance <b>${spell.name}</b>.`
    )
    player.currentState.ap -= spell.apCost
    // pushAnimation(battle, player.position, "ap", {
    //   value: `-${spell.apCost}`,
    // })
  },

  teleport: ({ battle, player, targetPosition, spell }) => {
    // targetPosition is not occupied
    if (
      battle.blueTeam.find(
        (player) =>
          player.position.x === targetPosition.x &&
          player.position.y === targetPosition.y
      ) ||
      battle.redTeam.find(
        (player) =>
          player.position.x === targetPosition.x &&
          player.position.y === targetPosition.y
      ) ||
      battle.board.entities.find(
        (entity) =>
          entity.position.x === targetPosition.x &&
          entity.position.y === targetPosition.y &&
          !["blue-slot", "dead"].includes(entity.kind)
      )
    ) {
      return { error: "Target position is occupied" }
    }

    // teleport player
    player.position = targetPosition
  },

  hit: ({ battle, player, targetPosition, spell }) => {
    const targets = computeTargets({ battle, player, targetPosition, spell })
    if (targets.length <= 0) return
    if (targets.length > 1)
      pushMessageToBattle(battle, "system", `${targets.length} targets.`)

    let damageBaseAether = spell.damageBaseAether
    let damageBaseNyx = spell.damageBaseNyx

    const crit = Math.random() < spell.critChance
    if (crit) {
      pushMessageToBattle(
        battle,
        "system",
        `<b class="gameboard-damage-crit">Critical hit!</b>`
      )
      damageBaseAether = spell.damageBaseAetherCrit
      damageBaseNyx = spell.damageBaseNyxCrit
    }

    targets.forEach(({ target, coef }) => {
      console.log({ target })
      console.log({ name: target.name, coef })
      const damage = {
        aether:
          Math.round(
            damageBaseAether * (1 + player.currentState.aether / 100) * coef
          ) || 0,
        nyx:
          Math.round(
            damageBaseNyx * (1 + player.currentState.nyx / 100) * coef
          ) || 0,
      }
      target.currentState.hp -= damage.aether + damage.nyx

      if (damage.aether > 0 && damage.nyx > 0) {
        pushMessageToBattle(
          battle,
          "system",
          `<b>${target.name}</b> : <b>-${
            damage.aether + damage.nyx
          }</b> PV (<span class="gameboard-damage-aether">${
            damage.aether
          }</span>+<span class="gameboard-damage-nyx">${damage.nyx}</span>).`
        )
      } else if (damage.aether > 0) {
        pushMessageToBattle(
          battle,
          "system",
          `<b>${target.name}</b> : <b class="gameboard-damage-aether">-${damage.aether}</b> PV.`
        )
      } else if (damage.nyx > 0) {
        pushMessageToBattle(
          battle,
          "system",
          `<b>${target.name}</b> : <b class="gameboard-damage-nyx">-${damage.nyx}</b> PV.`
        )
      }

      if (damage.aether > 0 || damage.nyx > 0) {
        pushAnimation(battle, target.position, "damage", {
          value: `-${damage.aether + damage.nyx}`,
        })
      }
    })
  },
  rallMp: ({ battle, player, targetPosition, spell }) => {
    const targets = computeTargets({
      battle,
      player,
      targetPosition,
      spell,
    })

    targets.forEach(({ target, coef }) => {
      // punch player
      target.currentState.mp -= spell.rallMpBase
      pushMessageToBattle(
        battle,
        "system",
        `<b>${target.name}</b> : -<b>${spell.rallMpBase} MP</b>.`
      )
      pushAnimation(battle, target.position, "rallMp", {
        value: `-${spell.rallMpBase}`,
      })
    })
  },
  rallAp: ({ battle, player, targetPosition, spell }) => {
    const targets = computeTargets({
      battle,
      player,
      targetPosition,
      spell,
    })

    targets.forEach(({ target, coef }) => {
      target.currentState.ap -= spell.rallApBase
      pushMessageToBattle(
        battle,
        "system",
        `<b>${target.name}</b> : -<b>${spell.rallMpBase} AP</b>.`
      )
      pushAnimation(battle, target.position, "rallAp", {
        value: `-${spell.rallApBase}`,
      })
    })
  },
}
export default spellBehaviors

const computeTargets = ({ battle, player, targetPosition, spell }) => {
  let targets = [] // each target has coef
  const primaryTarget =
    battle.blueTeam.find(
      (player) =>
        player.position.x === targetPosition.x &&
        player.position.y === targetPosition.y &&
        player.currentState.hp > 0
    ) ||
    battle.redTeam.find(
      (player) =>
        player.position.x === targetPosition.x &&
        player.position.y === targetPosition.y &&
        player.currentState.hp > 0
    )

  if (primaryTarget) targets.push({ target: primaryTarget, coef: 1 })
  if (spell.areaOfEffect) {
    if (spell.areaOfEffect.kind === "circle") {
      // find all targets in area of effect
      const aoeTargets = [...battle.blueTeam, ...battle.redTeam]
        .map((target) => {
          console.log({ target })
          return target
        })
        .filter((target) => target?.currentState?.hp > 0)
        .filter((target) => target.position)
        .filter((target) => {
          // already in targets
          if (
            targets.find(
              (t) =>
                t.target.position.x === target.position.x &&
                t.target.position.y === target.position.y
            )
          ) {
            return false
          }
          return true
        })
        .map((target) => {
          console.log({ target })
          const distance =
            Math.abs(target.position.x - targetPosition.x) +
            Math.abs(target.position.y - targetPosition.y)
          return { target, distance }
        })
        .filter(({ target, distance }) => {
          return distance <= spell.areaOfEffect.radius
        })
        .map(({ target, distance }) => {
          return {
            target,
            coef:
              Math.floor(
                Math.pow(spell.areaOfEffect.coefPerTile, distance) * 1000
              ) / 1000,
          }
        })
      if (aoeTargets.length > 0) {
        targets.push(...aoeTargets)
      }
    }
  }

  return targets
}
