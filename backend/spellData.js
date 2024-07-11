import spellBehaviors from "./spellBehaviors.js"

export const spellData = {
  jump: {
    id: "jump",
    name: "Jump",
    description: "Jump to a target location",
    range: 3,
    apCost: 3,
    behaviors: [
      { kind: "checkAp" },
      { kind: "checkRange" },
      { kind: "payAp" },
      { kind: "teleport" },
    ],
  },
  teleport: {
    id: "teleport",
    name: "Teleport",
    description: "Teleport to a target location",
    range: 6,
    apCost: 6,
    behaviors: [
      { kind: "checkAp" },
      { kind: "checkRange" },
      { kind: "payAp" },
      { kind: "teleport" },
    ],
  },
  teleport2: {
    id: "teleport2",
    name: "Teleport II",
    description: "Teleport to a target location",
    range: 9,
    apCost: 6,
    behaviors: [
      { kind: "checkAp" },
      { kind: "checkRange" },
      { kind: "payAp" },
      { kind: "teleport" },
    ],
  },
  teleport3: {
    id: "teleport3",
    name: "Teleport III",
    description: "Teleport to a target location",
    range: 12,
    apCost: 6,
    behaviors: [
      { kind: "checkAp" },
      { kind: "checkRange" },
      { kind: "payAp" },
      { kind: "teleport" },
    ],
  },
  devMove: {
    id: "devMove",
    name: "DevMove",
    description: "",
    range: 20,
    apCost: 0,
    behaviors: [
      { kind: "checkAp" },
      { kind: "checkRange" },
      { kind: "payAp" },
      { kind: "teleport" },
    ],
  },
  aetherShoot: {
    id: "aetherShoot",
    name: "Aether Shoot",
    description: "Hit at range",
    apCost: 3,
    range: 4,
    damageBaseAether: 8,
    damageBaseNyx: 0,
    critChance: 0.1,
    damageBaseAetherCrit: 14,
    damageBaseNyxCrit: 0,
    behaviors: [
      { kind: "checkAp" },
      { kind: "checkRange" },
      { kind: "payAp" },
      { kind: "hit" },
    ],
  },
  aetherShoot2: {
    id: "aetherShoot2",
    name: "Aether Shoot II",
    description: "Hit at range",
    apCost: 3,
    range: 4,
    damageBaseAether: 12,
    damageBaseNyx: 0,
    critChance: 0.1,
    damageBaseAetherCrit: 20,
    damageBaseNyxCrit: 0,
    behaviors: [
      { kind: "checkAp" },
      { kind: "checkRange" },
      { kind: "payAp" },
      { kind: "hit" },
    ],
  },
  aetherShoot3: {
    id: "aetherShoot3",
    name: "Aether Shoot III",
    description: "Hit at range",
    apCost: 3,
    range: 4,
    damageBaseAether: 18,
    damageBaseNyx: 0,
    behaviors: [
      { kind: "checkAp" },
      { kind: "checkRange" },
      { kind: "payAp" },
      { kind: "hit" },
    ],
  },
  nyxPunch: {
    id: "nyxPunch",
    name: "Nyx Punch",
    description: "Hit at close range",
    apCost: 4,
    range: 1,
    damageBaseAether: 0,
    damageBaseNyx: 18,
    behaviors: [
      { kind: "checkAp" },
      { kind: "checkRange" },
      { kind: "payAp" },
      { kind: "hit" },
    ],
  },
  mobCacHit: {
    id: "mobCacHit",
    name: "mobCacHit",
    description: "",
    apCost: 6,
    range: 1,
    damageBaseAether: 14,
    damageBaseNyx: 0,
    behaviors: [
      { kind: "checkAp" },
      { kind: "checkRange" },
      { kind: "payAp" },
      { kind: "hit" },
    ],
  },
  mobRangeHit: {
    id: "mobRangeHit",
    name: "mobRangeHit",
    description: "",
    apCost: 3,
    range: 3,
    damageBaseAether: 5,
    damageBaseNyx: 0,
    behaviors: [
      { kind: "checkAp" },
      { kind: "checkRange" },
      { kind: "payAp" },
      { kind: "hit" },
    ],
  },
  fireball: {
    id: "fireball",
    name: "Fireball",
    description: "Cast a fireball at range",
    apCost: 4,
    range: 8,
    damageBaseAether: 12,
    damageBaseNyx: 8,
    behaviors: [
      { kind: "checkAp" },
      { kind: "checkRange" },
      { kind: "payAp" },
      { kind: "hit" },
    ],
  },
  fireball2: {
    id: "fireball2",
    name: "Fireball II",
    description: "Cast a fireball at range",
    apCost: 4,
    range: 8,
    damageBaseAether: 18,
    damageBaseNyx: 12,
    behaviors: [
      { kind: "checkAp" },
      { kind: "checkRange" },
      { kind: "payAp" },
      { kind: "hit" },
    ],
  },
  fireball3: {
    id: "fireball3",
    name: "Fireball III",
    description: "Cast a fireball at range",
    apCost: 4,
    range: 8,
    damageBaseAether: 27,
    damageBaseNyx: 18,
    behaviors: [
      { kind: "checkAp" },
      { kind: "checkRange" },
      { kind: "payAp" },
      { kind: "hit" },
    ],
  },
  explosion: {
    id: "explosion",
    name: "Explosion",
    description: "Hit in an area around the target",
    apCost: 5,
    range: 7,
    damageBaseAether: 8,
    damageBaseNyx: 4,
    damageBaseAetherCrit: 8,
    damageBaseNyxCrit: 8,
    critChance: 0.1,
    areaOfEffect: {
      kind: "circle",
      radius: 2,
      coefPerTile: 0.7,
    },
    behaviors: [
      { kind: "checkAp" },
      { kind: "checkRange" },
      { kind: "payAp" },
      { kind: "hit" },
    ],
  },
  explosion2: {
    id: "explosion2",
    name: "Explosion II",
    description: "Hit in an area around the target",
    apCost: 5,
    range: 7,
    damageBaseAether: 12,
    damageBaseNyx: 4,
    damageBaseAetherCrit: 16,
    damageBaseNyxCrit: 8,
    critChance: 0.1,
    areaOfEffect: {
      kind: "circle",
      radius: 2,
      coefPerTile: 0.7,
    },
    behaviors: [
      { kind: "checkAp" },
      { kind: "checkRange" },
      { kind: "payAp" },
      { kind: "hit" },
    ],
  },
  devClear: {
    id: "devClear",
    name: "Dev Clear",
    description: "",
    apCost: 0,
    range: 12,
    damageBaseAether: 8000,
    damageBaseNyx: 4000,
    areaOfEffect: {
      kind: "circle",
      radius: 4,
      coefPerTile: 1,
    },
    behaviors: [
      { kind: "checkAp" },
      { kind: "checkRange" },
      { kind: "payAp" },
      { kind: "hit" },
    ],
  },
  pinch: {
    id: "pinch",
    name: "Pinch",
    description: "Pinch a target player",
    apCost: 0,
    range: 5,
    damageBaseAether: 1,
    behaviors: [
      { kind: "checkAp" },
      { kind: "checkRange" },
      { kind: "payAp" },
      { kind: "hit" },
    ],
  },
  execution: {
    id: "execution",
    name: "Execution",
    description: "*DEV* Inflicts very high dmg to target entity",
    apCost: 3,
    range: 20,
    damageBaseNyx: 999999,
    behaviors: [
      { kind: "checkAp" },
      { kind: "checkRange" },
      { kind: "payAp" },
      { kind: "hit" },
    ],
  },
  slow: {
    id: "slow",
    name: "Slow",
    description: "Slow down by reducing MP",
    apCost: 3,
    range: 4,
    rallMpBase: 2,
    behaviors: [
      { kind: "checkAp" },
      { kind: "checkRange" },
      { kind: "payAp" },
      { kind: "rallMp" },
    ],
  },
  rallAp: {
    id: "rallAp",
    name: "Cool down",
    description: "Slow down by reducing AP",
    apCost: 3,
    range: 4,
    rallApBase: 2,
    behaviors: [
      { kind: "checkAp" },
      { kind: "checkRange" },
      { kind: "payAp" },
      { kind: "rallAp" },
    ],
  },
  shootFeet: {
    id: "shootFeet",
    name: "Shoot Feet",
    description: "Hit at range and reduce MP",
    apCost: 3,
    range: 6,
    rallMpBase: 2,
    damageBaseAether: 6,
    behaviors: [
      { kind: "checkAp" },
      { kind: "checkRange" },
      { kind: "payAp" },
      { kind: "rallMp" },
      { kind: "hit" },
    ],
  },
  storm: {
    id: "storm",
    name: "Storm",
    description: "Hit in an area and reduce MP",
    apCost: 3,
    range: 6,
    rallMpBase: 1,
    damageBaseAether: 7,
    areaOfEffect: {
      kind: "circle",
      radius: 3,
      coefPerTile: 0.5,
    },
    behaviors: [
      { kind: "checkAp" },
      { kind: "checkRange" },
      { kind: "payAp" },
      { kind: "rallAp" },
      { kind: "hit" },
    ],
  },
  immobilize: {
    id: "immobilize",
    name: "Immobilize",
    description: "Reduce AP and MP by a lot",
    apCost: 6,
    range: 8,
    rallMpBase: 6,
    rallApBase: 6,
    behaviors: [
      { kind: "checkAp" },
      { kind: "checkRange" },
      { kind: "payAp" },
      { kind: "rallMp" },
      { kind: "rallAp" },
    ],
  },
  tacticalKick: {
    id: "tacticalKick",
    name: "Tactical Kick",
    description: "Hit at close range and reduce AP",
    apCost: 3,
    range: 1,
    rallApBase: 1,
    damageBaseNyx: 12,
    behaviors: [
      { kind: "checkAp" },
      { kind: "checkRange" },
      { kind: "payAp" },
      { kind: "rallMp" },
      { kind: "hit" },
    ],
  },
}
export default spellData

export const runSpellBehaviors = (
  spell,
  { battle, playerId, targetPosition }
) => {
  const player =
    battle.blueTeam.find((player) => player.id === playerId) ||
    battle.redTeam.find((player) => player.id === playerId)
  if (!player) {
    return { error: "Player (caster) not found" }
  }

  const behaviors = [...spell.behaviors]
  while (behaviors.length > 0) {
    const behavior = behaviors.shift()

    if (!spellBehaviors[behavior.kind]) {
      return { error: "Behavior not implemented" }
    }

    const result = spellBehaviors[behavior.kind]({
      battle,
      player,
      targetPosition,
      spell,
    })
    if (result?.error) {
      return result
    }
  }
  return { ok: true }
}
