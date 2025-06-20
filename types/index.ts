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

export interface TeamTokens {
  [teamId: string]: number
}

// Socket message types
export interface WebSocketMessage {
  type: "session_started" | "new_bid" | "session_ended" | "timer_update" | "low_stock_alert" | "token_update"
  data: SessionStartedData | NewBidData | SessionEndedData | TimerUpdateData | LowStockAlertData | TokenUpdateData
}

export interface SessionStartedData {
  session: BiddingSession
  teamTokens: TeamTokens
}

export interface NewBidData {
  bid: Bid
  session: BiddingSession
  teamTokens: TeamTokens
}

export interface SessionEndedData {
  session: BiddingSession
  winningBid: Bid | null
  allBids: Bid[]
  teamTokens: TeamTokens
}

export interface TimerUpdateData {
  remainingTime: number
}

export interface LowStockAlertData {
  remainingBundles: number
}

export interface TokenUpdateData {
  teamTokens: TeamTokens
}

// Socket response types
export interface SessionStartResponse {
  success: boolean
  session?: BiddingSession
  error?: string
}

export interface BidPlaceResponse {
  success: boolean
  bid?: Bid
  error?: string
}

export interface CurrentDataResponse {
  session: BiddingSession | null
  bids: Bid[]
  highestBid: Bid | null
  teamTokens: TeamTokens
}

// Socket event data types
export interface StartSessionData {
  materialId: string
  materialName: string
  bundleType: "large" | "small"
  totalBundles: number
  basePrice: number
}

export interface PlaceBidData {
  teamId: string
  teamName: string
  teamCode: string
  amount: number
}
