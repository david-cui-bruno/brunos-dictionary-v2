'use client'

import { TypeAnimation } from 'react-type-animation'

export default function AnimatedTitle() {
  return (
    <TypeAnimation
      sequence={[
        "Bruno's Dictionary",
        1000
      ]}
      wrapper="span"
      speed={25}
      cursor={false}
      repeat={1}
      className="text-7xl font-playfair font-bold drop-shadow-[0_6px_8px_rgba(0,0,0,0.6)]" // Increased shadow blur and opacity
    />
  )
} 