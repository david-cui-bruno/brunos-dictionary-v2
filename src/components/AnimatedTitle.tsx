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
      speed={35} // Increased from 50 to 75 for slower typing
      cursor={false}
      repeat={1}
      className="text-5xl font-playfair font-bold"
    />
  )
} 