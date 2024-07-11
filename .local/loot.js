import crypto from "crypto"
import colors from "colors"

const lootConfig = {
  groupLevel: 100,
  prospection: 100,
  weightScaleBonusMob: 125,
  weightScaleBonusZone: 75,
  probabilities: [
    [
      {
        kind: "ap",
        amountMax: 1,
        probability: 1,
      },
    ],
    [
      {
        kind: "aether",
        amountMax: 40,
        probability: 0.5,
      },
      {
        kind: "nyx",
        amountMax: 40,
        probability: 0.5,
      },
    ],
    [
      {
        kind: "health",
        amountMax: 500,
        probability: 0.99,
      },
      {
        kind: "mp",
        amountMax: 1,
        probability: 0.01,
      },
    ],
  ],
}

const weightConfig = {
  ap: 100,
  aether: 1,
  nyx: 1,
  mp: 90,
  health: 0.2,
}

const generateLoot = (lootConfig) => {
  const maxWeight =
    lootConfig.weightScaleBonusMob + lootConfig.weightScaleBonusZone

  // crypto secure random
  let effectiveWeightCoef = crypto.randomBytes(1)[0] / 255
  if (effectiveWeightCoef < 0.33) effectiveWeightCoef += 0.33
  const effectiveWeight = Math.ceil(maxWeight * effectiveWeightCoef)
  const remainingProbabilities = [...lootConfig.probabilities]
  const item = {}
  item.maxWeight = maxWeight
  item.effectiveWeight = effectiveWeight
  item.stats = {}
  // console.log({ maxWeight, effectiveWeight })
  while (
    computeWeight(item, weightConfig) < effectiveWeight &&
    remainingProbabilities.length > 0
  ) {
    const probabilitySum = remainingProbabilities[0].reduce(
      (acc, { probability }) => acc + probability,
      0
    )
    const random = Math.random() * probabilitySum
    // select the one
    let sum = 0
    for (const stat of remainingProbabilities[0]) {
      sum += stat.probability
      if (random < sum) {
        item.stats[stat.kind] = item.stats[stat.kind] || 0
        item.stats[stat.kind] += 1
        break
      }
    }
    // remove probabilities with maxAmount reached
    remainingProbabilities[0] = remainingProbabilities[0].filter(
      ({ amountMax, kind }) => {
        return (item.stats[kind] || 0) < amountMax
      }
    )
    // shift group if empty
    if (remainingProbabilities[0].length === 0) {
      remainingProbabilities.shift()
    }
  }
  return item
}

const computeWeight = (item, weightConfig) => {
  return Object.entries(item.stats).reduce(
    (acc, [kind, amount]) => acc + amount * weightConfig[kind],
    0
  )
}

const itemToString = (item) => {
  // join all on 1 line
  const percentWeight = (item.effectiveWeight / item.maxWeight) * 100
  const color =
    percentWeight < 20
      ? "gray"
      : percentWeight < 40
      ? "green"
      : percentWeight < 60
      ? "blue"
      : percentWeight < 80
      ? "yellow"
      : percentWeight < 90
      ? "magenta"
      : "red"
  const weightsDisplay = colors[color](
    `${item.effectiveWeight}/${item.maxWeight} (${percentWeight.toFixed(0)}%)`
  )
  const stats = Object.entries(item.stats)
    .map(([kind, amount]) => `${amount} ${kind}`)
    .join(", ")
  return `${weightsDisplay}\t${stats}`
}

const main = async () => {
  const desiredItem = {
    ap: 1,
    aether: 40,
    nyx: 40,
    mp: 1,
    health: 99,
  }

  // generate 20 and print them
  for (let i = 0; i < 1000000; i++) {
    const loot = generateLoot(lootConfig)
    console.log(itemToString(loot))
    // if its desired
    if (
      Object.entries(desiredItem).every(
        ([kind, amount]) => amount <= loot.stats[kind]
      )
    ) {
      console.log("Found in", i + 1, "tries")
      break
    }
  }
}

main()
