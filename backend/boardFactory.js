import { SIZE_X, SIZE_Y, NONEXISTENT_SIZE } from "./config.js"
import { shuffleArray } from "./utils.js"

export const boardFactory = {
  pvp: () => {
    const bluePlacementSlots = shuffleArray([
      {
        x: 14,
        y: 17,
      },
      {
        x: 15,
        y: 16,
      },
      {
        x: 16,
        y: 15,
      },
      {
        x: 8,
        y: 17,
      },
      {
        x: 7,
        y: 16,
      },
      {
        x: 6,
        y: 15,
      },
      {
        x: 3,
        y: 11,
      },
      {
        x: 3,
        y: 12,
      },
      {
        x: 3,
        y: 10,
      },
      {
        x: 19,
        y: 11,
      },
      {
        x: 19,
        y: 12,
      },
      {
        x: 19,
        y: 10,
      },
      {
        x: 11,
        y: 5,
      },
      {
        x: 11,
        y: 3,
      },
      {
        x: 12,
        y: 3,
      },
      {
        x: 10,
        y: 3,
      },
      {
        x: 10,
        y: 4,
      },
      {
        x: 12,
        y: 4,
      },
      {
        x: 10,
        y: 5,
      },
      {
        x: 12,
        y: 5,
      },
      {
        x: 12,
        y: 16,
      },
      {
        x: 10,
        y: 16,
      },
      {
        x: 11,
        y: 17,
      },
      {
        x: 11,
        y: 15,
      },
      {
        x: 10,
        y: 15,
      },
      {
        x: 12,
        y: 15,
      },
      {
        x: 12,
        y: 17,
      },
      {
        x: 10,
        y: 17,
      },
    ])

    const walls = [
      { x: 11, y: 8 },
      { x: 12, y: 8 },
      { x: 10, y: 8 },
      { x: 11, y: 9 },
      { x: 11, y: 7 },
      { x: 10, y: 12 },
      { x: 8, y: 12 },
      { x: 12, y: 12 },
      { x: 14, y: 12 },
      { x: 8, y: 12 },
      { x: 12, y: 12 },
      { x: 14, y: 12 },
      { x: 9, y: 11 },
      { x: 9, y: 12 },
      { x: 9, y: 13 },
      { x: 13, y: 11 },
      { x: 13, y: 12 },
      { x: 13, y: 13 },
    ]

    const redPlacementSlots = shuffleArray([
      { x: 10, y: 11 },
      { x: 12, y: 11 },
      { x: 8, y: 11 },
      { x: 14, y: 11 },
      { x: 6, y: 11 },
      { x: 16, y: 11 },
      { x: 10, y: 9 },
      { x: 12, y: 9 },
      { x: 8, y: 9 },
      { x: 14, y: 9 },
      { x: 8, y: 7 },
      { x: 14, y: 7 },
    ])

    return {
      sizeX: SIZE_X,
      sizeY: SIZE_Y,
      entities: [
        ...bluePlacementSlots.map((slot) => ({
          kind: "blue-slot",
          position: slot,
        })),
        ...redPlacementSlots.map((slot) => ({
          kind: "red-slot",
          position: slot,
        })),
        ...walls.map((wall) => ({
          kind: "wall",
          position: wall,
        })),
      ],
    }
  },
  amazon1: () => {
    const bluePlacementSlots = shuffleArray([
      {
        x: 14,
        y: 17,
      },
      {
        x: 15,
        y: 16,
      },
      {
        x: 16,
        y: 15,
      },
      {
        x: 8,
        y: 17,
      },
      {
        x: 7,
        y: 16,
      },
      {
        x: 6,
        y: 15,
      },
      {
        x: 3,
        y: 11,
      },
      {
        x: 3,
        y: 12,
      },
      {
        x: 3,
        y: 10,
      },
      {
        x: 19,
        y: 11,
      },
      {
        x: 19,
        y: 12,
      },
      {
        x: 19,
        y: 10,
      },
      {
        x: 11,
        y: 5,
      },
      {
        x: 11,
        y: 3,
      },
      {
        x: 12,
        y: 3,
      },
      {
        x: 10,
        y: 3,
      },
      {
        x: 10,
        y: 4,
      },
      {
        x: 12,
        y: 4,
      },
      {
        x: 10,
        y: 5,
      },
      {
        x: 12,
        y: 5,
      },
      {
        x: 12,
        y: 16,
      },
      {
        x: 10,
        y: 16,
      },
      {
        x: 11,
        y: 17,
      },
      {
        x: 11,
        y: 15,
      },
      {
        x: 10,
        y: 15,
      },
      {
        x: 12,
        y: 15,
      },
      {
        x: 12,
        y: 17,
      },
      {
        x: 10,
        y: 17,
      },
    ])

    const walls = [
      { x: 11, y: 8 },
      { x: 12, y: 8 },
      { x: 10, y: 8 },
      { x: 11, y: 9 },
      { x: 11, y: 7 },
      { x: 10, y: 12 },
      { x: 8, y: 12 },
      { x: 12, y: 12 },
      { x: 14, y: 12 },
      { x: 8, y: 12 },
      { x: 12, y: 12 },
      { x: 14, y: 12 },
      { x: 9, y: 11 },
      { x: 9, y: 12 },
      { x: 9, y: 13 },
      { x: 13, y: 11 },
      { x: 13, y: 12 },
      { x: 13, y: 13 },
    ]

    return {
      sizeX: SIZE_X,
      sizeY: SIZE_Y,
      redPlacementSlots: shuffleArray([
        { x: 10, y: 11 },
        { x: 12, y: 11 },
        { x: 8, y: 11 },
        { x: 14, y: 11 },
        { x: 6, y: 11 },
        { x: 16, y: 11 },
        { x: 10, y: 9 },
        { x: 12, y: 9 },
        { x: 8, y: 9 },
        { x: 14, y: 9 },
        { x: 8, y: 7 },
        { x: 14, y: 7 },
      ]),
      entities: [
        ...bluePlacementSlots.map((slot) => ({
          kind: "blue-slot",
          position: slot,
        })),
        ...walls.map((wall) => ({
          kind: "wall",
          position: wall,
        })),
      ],
    }
  },
  amazon3: () => {
    const bluePlacementSlots = [
      {
        x: 14,
        y: 17,
      },
      {
        x: 15,
        y: 16,
      },
      {
        x: 16,
        y: 15,
      },
      {
        x: 8,
        y: 17,
      },
      {
        x: 7,
        y: 16,
      },
      {
        x: 6,
        y: 15,
      },
      {
        x: 3,
        y: 11,
      },
      {
        x: 3,
        y: 12,
      },
      {
        x: 3,
        y: 10,
      },
      {
        x: 19,
        y: 11,
      },
      {
        x: 19,
        y: 12,
      },
      {
        x: 19,
        y: 10,
      },
      {
        x: 11,
        y: 5,
      },
      {
        x: 11,
        y: 3,
      },
      {
        x: 12,
        y: 3,
      },
      {
        x: 10,
        y: 3,
      },
      {
        x: 10,
        y: 4,
      },
      {
        x: 12,
        y: 4,
      },
      {
        x: 10,
        y: 5,
      },
      {
        x: 12,
        y: 5,
      },
      {
        x: 12,
        y: 16,
      },
      {
        x: 10,
        y: 16,
      },
      {
        x: 11,
        y: 17,
      },
      {
        x: 11,
        y: 15,
      },
      {
        x: 10,
        y: 15,
      },
      {
        x: 12,
        y: 15,
      },
      {
        x: 12,
        y: 17,
      },
      {
        x: 10,
        y: 17,
      },
    ]

    const walls = [
      { x: 11, y: 8 },
      { x: 12, y: 8 },
      { x: 10, y: 8 },
      { x: 11, y: 9 },
      { x: 11, y: 7 },
      { x: 10, y: 12 },
      { x: 8, y: 12 },
      { x: 12, y: 12 },
      { x: 14, y: 12 },
      { x: 8, y: 12 },
      { x: 12, y: 12 },
      { x: 14, y: 12 },
      { x: 9, y: 11 },
      { x: 9, y: 12 },
      { x: 9, y: 13 },
      { x: 13, y: 11 },
      { x: 13, y: 12 },
      { x: 13, y: 13 },
      {
        x: 8,
        y: 6,
      },
      {
        x: 8,
        y: 5,
      },
      {
        x: 9,
        y: 5,
      },
      {
        x: 7,
        y: 5,
      },
      {
        x: 8,
        y: 4,
      },
      //

      {
        x: 14,
        y: 6,
      },
      {
        x: 14,
        y: 5,
      },
      {
        x: 15,
        y: 5,
      },
      {
        x: 13,
        y: 5,
      },
      {
        x: 14,
        y: 4,
      },

      //

      {
        x: 16,
        y: 10,
      },
      {
        x: 16,
        y: 9,
      },
      {
        x: 17,
        y: 9,
      },
      {
        x: 15,
        y: 9,
      },
      {
        x: 16,
        y: 8,
      },

      //

      {
        x: 6,
        y: 10,
      },
      {
        x: 6,
        y: 9,
      },
      {
        x: 7,
        y: 9,
      },
      {
        x: 5,
        y: 9,
      },
      {
        x: 6,
        y: 8,
      },
    ]

    return {
      sizeX: SIZE_X,
      sizeY: SIZE_Y,
      redPlacementSlots: [
        { x: 10, y: 11 },
        { x: 12, y: 11 },
        { x: 8, y: 11 },
        { x: 14, y: 11 },
        { x: 6, y: 11 },
        { x: 16, y: 11 },
        { x: 10, y: 9 },
        { x: 12, y: 9 },
        { x: 8, y: 9 },
        { x: 14, y: 9 },
        { x: 8, y: 7 },
        { x: 14, y: 7 },
      ],
      entities: [
        ...bluePlacementSlots.map((slot) => ({
          kind: "blue-slot",
          position: slot,
        })),
        ...walls.map((wall) => ({
          kind: "wall",
          position: wall,
        })),
      ],
    }
  },
  knossos1: () => {
    const bluePlacementSlots = [
      {
        x: 12,
        y: 16,
      },
      {
        x: 10,
        y: 16,
      },
      {
        x: 11,
        y: 17,
      },
      {
        x: 11,
        y: 15,
      },
      {
        x: 10,
        y: 15,
      },
      {
        x: 12,
        y: 15,
      },
      {
        x: 12,
        y: 17,
      },
      {
        x: 10,
        y: 17,
      },
    ]

    const walls = [
      { x: 9, y: 10 },
      { x: 9, y: 11 },
      { x: 9, y: 12 },
      //
      { x: 11, y: 10 },
      { x: 11, y: 11 },
      { x: 11, y: 12 },
      //
      { x: 13, y: 10 },
      { x: 13, y: 11 },
      { x: 13, y: 12 },
      //
      { x: 7, y: 8 },
      { x: 8, y: 8 },
      { x: 9, y: 8 },
      { x: 10, y: 8 },
      { x: 11, y: 8 },
      { x: 12, y: 8 },
      { x: 13, y: 8 },
      { x: 14, y: 8 },
      { x: 15, y: 8 },
    ]

    return {
      sizeX: SIZE_X,
      sizeY: SIZE_Y,
      redPlacementSlots: [
        { x: 10, y: 11 },
        { x: 12, y: 11 },
        { x: 8, y: 11 },
        { x: 14, y: 11 },
        { x: 6, y: 11 },
        { x: 16, y: 11 },
        { x: 10, y: 9 },
        { x: 12, y: 9 },
        { x: 8, y: 9 },
        { x: 14, y: 9 },
        { x: 8, y: 7 },
        { x: 14, y: 7 },
      ],
      entities: [
        ...bluePlacementSlots.map((slot) => ({
          kind: "blue-slot",
          position: slot,
        })),
        ...walls.map((wall) => ({
          kind: "wall",
          position: wall,
        })),
      ],
    }
  },
}
