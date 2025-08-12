'use client'

import { motion, useInView } from 'framer-motion'
import WordCard from './WordCard'
import { useRef } from 'react'

interface AnimatedWordCardProps {
  word: string
  definition: string
  example?: string | null
  slug: string
  definitionId?: string
  score: number
  index: number
  row: number
}

export default function AnimatedWordCard({ 
  word, 
  definition, 
  example, 
  slug, 
  definitionId, 
  score, 
  index, 
  row
}: AnimatedWordCardProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, {
    once: true,
    amount: 0.5,
    margin: "0px 0px 0px 0px"
  })
  
  const isEvenRow = row % 2 === 0
  const xOffset = isEvenRow ? 100 : -100

  return (
    <motion.div
      ref={ref}
      initial={{ x: xOffset, opacity: 0 }}
      animate={isInView ? { x: 0, opacity: 1 } : { x: xOffset, opacity: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.2,
        ease: "easeOut"
      }}
    >
      <WordCard
        word={word}
        definition={definition}
        example={example}
        slug={slug}
        definitionId={definitionId}
        score={score}
        userVote={0}
      />
    </motion.div>
  )
} 