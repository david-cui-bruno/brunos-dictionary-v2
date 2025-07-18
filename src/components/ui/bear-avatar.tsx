'use client'

import Image from 'next/image'

interface BearAvatarProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-20 h-20'
}

const bearSizeMap = {
  sm: 'w-6 h-6',
  md: 'w-9 h-9',
  lg: 'w-16 h-16'
}

const marginMap = {
  sm: '-mt-0.5',
  md: '-mt-0.5',
  lg: '-mt-1'
}

export function BearAvatar({ size = 'md', className = '' }: BearAvatarProps) {
  return (
    <div className={`relative ${sizeMap[size]} ${className} bg-[#4E3629] rounded-full flex items-center justify-center`}>
      <div className={`relative ${bearSizeMap[size]} ${marginMap[size]}`}>
        <Image
          src="/images/brunosdicticon.png"
          alt="Bruno's Dictionary Bear Avatar"
          fill
          className="object-contain"
        />
      </div>
    </div>
  )
} 