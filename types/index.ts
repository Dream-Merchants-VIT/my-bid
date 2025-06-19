export interface Team {
  id: string
  name: string
  code: string
  ownerId: string
  tokens: number
  participants: TeamMember[]
}

export interface TeamMember {
  id: string
  name: string
  email: string
  teamId: string | null
}

export interface RawMaterial {
  id: string
  name: string
  largeBundlePrice: number | null
  smallBundlePrice: number
}

export interface BiddingSession {
  id: string
  materialId: string
  materialName: string
  bundleType: "large" | "small"
  basePrice: number
  startTime: Date
  endTime: Date
  isActive: boolean
  totalBundles: number
  remainingBundles: number
}

export interface Bid {
  id: string
  sessionId: string
  teamId: string
  teamName: string
  teamCode: string
  amount: number
  timestamp: Date
  isWinning: boolean
}

export interface WebSocketMessage {
  type: "session_started" | "new_bid" | "session_ended" | "timer_update" | "low_stock_alert" | "token_update"
  data: any
}

export interface TeamTokens {
  [teamId: string]: number
}
