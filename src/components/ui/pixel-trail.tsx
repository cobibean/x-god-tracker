import React, { useCallback, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import { v4 as uuidv4 } from "uuid"

import { cn } from "@/lib/utils"
import { useDimensions } from "@/hooks/use-debounced-dimensions"

interface PixelTrailProps {
  pixelSize: number // px
  fadeDuration?: number // ms
  delay?: number // ms
  className?: string
  pixelClassName?: string
}

const PixelTrail: React.FC<PixelTrailProps> = ({
  pixelSize = 20,
  fadeDuration = 500,
  delay = 0,
  className,
  pixelClassName,
}) => {
  const containerRef = useRef<HTMLDivElement>(null!)
  const dimensions = useDimensions(containerRef)
  const trailId = useRef(uuidv4())

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = Math.floor((e.clientX - rect.left) / pixelSize)
      const y = Math.floor((e.clientY - rect.top) / pixelSize)

      const pixelElement = document.getElementById(
        `${trailId.current}-pixel-${x}-${y}`
      )
      if (pixelElement) {
        const animatePixel = (pixelElement as any).__animatePixel
        if (animatePixel) animatePixel()
      }
    },
    [pixelSize]
  )

  const columns = useMemo(
    () => {
      if (dimensions.width === 0) return 10; // fallback
      return Math.ceil(dimensions.width / pixelSize);
    },
    [dimensions.width, pixelSize]
  )
  const rows = useMemo(
    () => {
      if (dimensions.height === 0) return 10; // fallback 
      return Math.ceil(dimensions.height / pixelSize);
    },
    [dimensions.height, pixelSize]
  )

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 w-full h-full pointer-events-auto",
        className
      )}
      onMouseMove={handleMouseMove}
      style={{ minHeight: '100px', minWidth: '100px' }}
    >
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <PixelDot
              key={`${colIndex}-${rowIndex}`}
              id={`${trailId.current}-pixel-${colIndex}-${rowIndex}`}
              size={pixelSize}
              fadeDuration={fadeDuration}
              delay={delay}
              className={pixelClassName}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

interface PixelDotProps {
  id: string
  size: number
  fadeDuration: number
  delay: number
  className?: string
}

const PixelDot: React.FC<PixelDotProps> = React.memo(
  ({ id, size, fadeDuration, delay, className }) => {
    const [isAnimating, setIsAnimating] = useState(false)

    const animatePixel = useCallback(() => {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), fadeDuration + delay)
    }, [fadeDuration, delay])

    // Attach the animatePixel function to the DOM element
    const ref = useCallback(
      (node: HTMLDivElement | null) => {
        if (node) {
          ;(node as any).__animatePixel = animatePixel
        }
      },
      [animatePixel]
    )

    return (
      <motion.div
        id={id}
        ref={ref}
        className={cn("cursor-pointer-none", className)}
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
        initial={{ opacity: 0.1 }}
        animate={{ 
          opacity: isAnimating ? [0.8, 0.1] : 0.1 
        }}
        transition={{
          duration: fadeDuration / 1000,
          delay: delay / 1000,
          ease: "easeOut"
        }}
      />
    )
  }
)

PixelDot.displayName = "PixelDot"
export { PixelTrail } 