import {
  FaFire,
  FaFirefox,
  FaFistRaised,
  FaHatCowboy,
  FaLock,
  FaQuestion,
  FaSnowflake,
} from "react-icons/fa"
import {
  GiBelt,
  GiBootKick,
  GiBoots,
  GiBranchArrow,
  GiCape,
  GiCrossbow,
  GiFireball,
  GiFootTrip,
  GiHeartNecklace,
  GiJumpAcross,
  GiMiddleArrow,
  GiMineExplosion,
  GiNailedFoot,
  GiRing,
  GiTeleport,
  GiThrownSpear,
} from "react-icons/gi"
import { IoThunderstorm } from "react-icons/io5"
import { RiUserForbidLine } from "react-icons/ri"

export const API_URL = "http://10.1.0.14:9876"
export const WSS_URL = "ws://10.1.0.14:9877"

export const itemKindToEmoji = {
  superCandy: "🍬",
  xpParchment: "🔮",
  inventorySlotBonus: "🎒",
  zoneUnlocker: "🗺️",
  spellUnlocker: "📜",
  bonusPointGifter: "🧪",
}

const SpellLayout = ({ icon, styleKind }) => {
  let backgroundColor = "#1E1E1E"
  let color = "black"
  let border = "0.1px solid #2E2E2E"
  let circleBackgroundColor = "#FFFFFFB0"
  if (styleKind === "aether") {
    backgroundColor = "#fcba03a0"
    color = "#451c05"
  } else if (styleKind === "aether2") {
    backgroundColor = "#fcba03c0"
    color = "#451c05"
    border = "0.1px solid #fcba03F0"
  } else if (styleKind === "aether3") {
    backgroundColor = "#fcba03e0"
    color = "#451c05"
    border = "0.1px solid #fcba03FF"
  } else if (styleKind === "nyx") {
    backgroundColor = "#8557cba0"
    color = "#551555"
  } else if (styleKind === "both") {
    backgroundColor = "#ff5757a0"
    color = "#751515"
  } else if (styleKind === "both2") {
    backgroundColor = "#ff5757c0"
    color = "#751515"
    border = "0.1px solid #ff5757"
  } else if (styleKind === "both3") {
    backgroundColor = "#ff4747e0"
    color = "#751515"
    border = "0.1px solid #ff0707"
  } else if (styleKind === "none") {
    backgroundColor = "#9E9E9E"
    color = "#1E1E1E"
  } else if (styleKind === "none2") {
    backgroundColor = "#AEAEAE"
    color = "#1E1E1E"
    border = "0.1px solid #FFFFFF"
  } else if (styleKind === "none3") {
    backgroundColor = "#CECECE"
    color = "#1E1E1E"
    border = "0.1px solid #FFFFFF"
  } else if (styleKind === "nonexistent") {
    backgroundColor = "#000"
    color = "#000"
    circleBackgroundColor = "#000"
  }

  return (
    <div
      style={{
        backgroundColor,
        color: "white",
        borderRadius: "8px",
        border,
        padding: "0.1em",
        verticalAlign: "middle",
        width: "2.2em",
        height: "2.2em",
        textAlign: "center",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          margin: "0.2em",
          backgroundColor: circleBackgroundColor,
          borderRadius: "50%",
          borderWidth: "1px",
          borderStyle: "double",
          borderColor: backgroundColor,
          // borderColor: "#90909090",
          color: "black",
          height: "1.7em",
          width: "1.7em",
        }}
      >
        <div style={{ paddingTop: "0.2em", fontSize: "1.2em", color }}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export const spellIdToIcon = {
  aetherShoot: <SpellLayout icon={<GiMiddleArrow />} styleKind="aether" />,
  aetherShoot2: <SpellLayout icon={<GiMiddleArrow />} styleKind="aether2" />,
  aetherShoot3: <SpellLayout icon={<GiMiddleArrow />} styleKind="aether3" />,
  storm: <SpellLayout icon={<IoThunderstorm />} styleKind="aether" />,
  nyxPunch: <SpellLayout icon={<FaFistRaised />} styleKind="nyx" />,
  fireball: <SpellLayout icon={<FaFire />} styleKind="both" />,
  jump: <SpellLayout icon={<GiJumpAcross />} styleKind="none" />,
  teleport: <SpellLayout icon={<GiTeleport />} styleKind="none" />,
  teleport2: <SpellLayout icon={<GiTeleport />} styleKind="none2" />,
  teleport3: <SpellLayout icon={<GiTeleport />} styleKind="none3" />,
  rallAp: <SpellLayout icon={<FaSnowflake />} styleKind="none" />,
  immobilize: <SpellLayout icon={<RiUserForbidLine />} styleKind="none" />,
  explosion: <SpellLayout icon={<GiMineExplosion />} styleKind="both" />,
  explosion2: <SpellLayout icon={<GiMineExplosion />} styleKind="both2" />,
  shootFeet: <SpellLayout icon={<GiThrownSpear />} styleKind="aether" />,
  tacticalKick: <SpellLayout icon={<GiBootKick />} styleKind="nyx" />,
  slow: <SpellLayout icon={<GiNailedFoot />} styleKind="none" />,
  default: <SpellLayout icon={<FaQuestion />} styleKind="default" />,
  nonexistent: <SpellLayout icon={<FaLock />} styleKind="nonexistent" />,
}

export const equipmentKindList = [
  "hat",
  "amulet",
  "cape",
  "belt",
  "boots",
  "ringL",
  "ringR",
]
export const equipmentKindToIcon = {
  hat: <FaHatCowboy />,
  cape: <GiCape />,
  ringL: (
    <GiRing
      style={{
        transform: "rotate(3deg)",
      }}
    />
  ),
  ringR: (
    <GiRing
      style={{
        transform: "rotate(-3deg)",
      }}
    />
  ),
  amulet: <GiHeartNecklace />,
  belt: <GiBelt />,
  boots: <GiBoots />,
}
