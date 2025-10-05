interface TimerDisplayProps {
  formattedTime: string
  progress: number
}

export default function TimerDisplay({ formattedTime, progress }: TimerDisplayProps) {
  const isLowTime = progress < 20
  const isMediumTime = progress < 50 && progress >= 20

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-10">
      <div className="bg-gray-900 bg-opacity-90 rounded-lg p-4 border-2 border-gray-700 min-w-[200px]">
        <div className="text-center mb-2">
          <div className="text-xs text-gray-400 mb-1">残り時間</div>
          <div
            className={`text-4xl font-bold font-mono ${
              isLowTime
                ? 'text-red-500 animate-pulse'
                : isMediumTime
                  ? 'text-yellow-500'
                  : 'text-green-500'
            }`}
          >
            {formattedTime}
          </div>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isLowTime
                ? 'bg-red-500'
                : isMediumTime
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
