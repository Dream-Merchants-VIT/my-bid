"use client"

interface TimerProps {
  remainingTime: number
}

export default function Timer({ remainingTime }: TimerProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getTimerColor = () => {
    if (remainingTime <= 5) return "text-red-600"
    if (remainingTime <= 10) return "text-yellow-600"
    return "text-green-600"
  }

  const getProgressPercentage = () => {
    return (remainingTime / 30) * 100
  }

  return (
    <div className="bg-[#978056]/37 rounded-xl shadow-lg minecraft-font p-6">
      <div className="flex items-center justify-center space-x-3">
      <img src="/assets/images/bid/timer.png" className="w-8 h-8 mx-auto mb-4"></img>
      <h2 className="text-xl font-semibold text-[#FDE047] text-outline-black mb-4 text-center tracking-widest">TIME REMAINING</h2>
</div>
      {/* Circular Progress */}
      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-[#573C17]"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgressPercentage() / 100)}`}
            className={getTimerColor()}
            strokeLinecap="round"
          />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center text-3xl font-bold tracking-widest ${getTimerColor()}`}>
          {formatTime(remainingTime)}
        </div>
      </div>

      {remainingTime <= 10 && remainingTime > 0 && (
        <div className="text-center">
          <span className="bg-red-100 text-[#573C17] px-4 py-2 rounded-full text-sm font-bold animate-pulse">
            ⚡ HURRY UP!
          </span>
        </div>
      )}

      {remainingTime === 0 && (
        <div className="text-center">
          <span className="text-white px-4 py-2 rounded-full text-sm font-medium">
             Waiting for next auction
          </span>
        </div>
      )}
    </div>
  )
}
