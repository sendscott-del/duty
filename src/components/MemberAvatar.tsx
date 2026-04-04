'use client'

interface MemberAvatarProps {
  emoji: string
  name: string
  photoUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
  active?: boolean
}

export function MemberAvatar({ emoji, name, photoUrl, size = 'md', active = true }: MemberAvatarProps) {
  const containerSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-3xl',
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`${containerSizes[size]} rounded-full flex items-center justify-center overflow-hidden ${
          active ? '' : 'opacity-50'
        } ${photoUrl ? '' : active ? 'bg-orange-100' : 'bg-gray-100'}`}
      >
        {photoUrl ? (
          <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className={textSizes[size]}>{emoji}</span>
        )}
      </div>
      <span className={`text-xs ${active ? 'text-gray-700' : 'text-gray-400'}`}>{name}</span>
    </div>
  )
}
