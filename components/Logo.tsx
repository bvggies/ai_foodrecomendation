'use client'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export default function Logo({ className = '', size = 'md', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Plate/Circle Background */}
          <circle cx="50" cy="50" r="42" fill="url(#gradient1)" />
          
          {/* Fork */}
          <path
            d="M32 20 L32 48 M30 20 L34 20 M30 25 L34 25 M32 48 L28 58 L32 58 L36 48"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Spoon */}
          <path
            d="M68 20 L68 46 M66 46 Q68 52 70 56 Q68 58 66 56 Q64 52 66 46"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Bite mark - semi circle at top */}
          <path
            d="M45 18 Q50 15 55 18"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          
          {/* AI Sparkle */}
          <g transform="translate(72, 28)">
            <circle r="3.5" fill="#FFD700" />
            <path
              d="M0 -4 L0 4 M-4 0 L4 0"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
          
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F97316" stopOpacity="1" />
              <stop offset="100%" stopColor="#EA580C" stopOpacity="1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold text-orange-500 ${textSizes[size]} leading-tight`}>
            SmartBite
          </span>
          {size === 'lg' && (
            <span className="text-xs text-gray-500 font-normal leading-tight">
              AI helping you pick the right bite
            </span>
          )}
        </div>
      )}
    </div>
  )
}
