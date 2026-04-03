'use client'

interface MemberAvatarProps {
  emoji: string
  name: string
  size?: 'sm' | 'md' | 'lg'
  active?: boolean
}

export function MemberAvatar({ emoji, name, size = 'md', active = true }: MemberAvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-base',
    md: 'w-12 h-12 text-xl',
    lg: 'w-16 h-16 text-3xl',
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`${sizes[size]} rounded-full flex items-center justify-center ${
          active ? 'bg-purple-100' : 'bg-gray-100 opacity-50'
        }`}
      >
        {emoji}
      </div>
      <span className={`text-xs ${active ? 'text-gray-700' : 'text-gray-400'}`}>{name}</span>
    </div>
  )
}
