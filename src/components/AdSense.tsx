'use client'

import { useEffect, useState, useRef } from 'react'

// Improve TypeScript types
declare global {
  interface Window {
    adsbygoogle: Array<Record<string, unknown>>
  }
}

interface AdSenseProps {
  adSlot: string
  adFormat?: 'auto' | 'fluid'
  className?: string
  style?: React.CSSProperties
}

export default function AdSense({ 
  adSlot, 
  adFormat = 'auto', 
  className = '', 
  style = {}
}: AdSenseProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const scriptRef = useRef<HTMLScriptElement | null>(null)

  useEffect(() => {
    // Only load AdSense on content-rich pages
    if (typeof window !== 'undefined' && window.location.pathname !== '/admin' && window.location.pathname !== '/auth') {
      // Load AdSense script dynamically
      const script = document.createElement('script')
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9062937758410331'
      script.async = true
      script.crossOrigin = 'anonymous'
      
      script.onload = () => {
        setIsLoaded(true)
        // Initialize ads
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({} as Record<string, unknown>)
        } catch (error) {
          console.error('AdSense error:', error)
        }
      }
      
      document.head.appendChild(script)
      scriptRef.current = script
      
      return () => {
        // Safe cleanup: check if script exists before removing
        if (scriptRef.current && document.head.contains(scriptRef.current)) {
          document.head.removeChild(scriptRef.current)
        }
      }
    }
  }, [])

  if (!isLoaded) {
    return null
  }

  return (
    <div className={`ad-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-9062937758410331"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  )
} 