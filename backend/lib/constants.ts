import type { RawMaterial } from "../types/index"

export const RAW_MATERIALS: RawMaterial[] = [
  { id: "bricks", name: "Bricks", largeBundlePrice: 50, smallBundlePrice: 30 },
  { id: "cement", name: "Cement", largeBundlePrice: 60, smallBundlePrice: 40 },
  { id: "steel", name: "Steel", largeBundlePrice: 120, smallBundlePrice: 60 },
  { id: "wood", name: "Wood", largeBundlePrice: 70, smallBundlePrice: 40 },
  { id: "glass", name: "Glass", largeBundlePrice: 180, smallBundlePrice: 120 },
  { id: "medical-supplies", name: "Medical Supplies", largeBundlePrice: null, smallBundlePrice: 300 },
  { id: "pipes", name: "Pipes", largeBundlePrice: null, smallBundlePrice: 100 },
  { id: "wires", name: "Wires", largeBundlePrice: null, smallBundlePrice: 140 },
  { id: "furniture", name: "Furniture", largeBundlePrice: null, smallBundlePrice: 200 },
  { id: "tiles", name: "Tiles", largeBundlePrice: null, smallBundlePrice: 300 },
  { id: "marble-granite", name: "Marble/Granite", largeBundlePrice: null, smallBundlePrice: 250 },
]

export const INITIAL_TEAM_TOKENS = 1500
export const BID_DURATION = 30 // seconds
export const LOW_STOCK_NOTIFICATIONS = [20, 5]
