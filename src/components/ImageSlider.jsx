import React, { useState, useRef } from 'react'

export default function ImageSlider({ 
  beforeImage, 
  beforeDate, 
  beforeStatus, 
  afterImage, 
  afterDate, 
  afterStatus 
}) {
  const [sliderPos, setSliderPos] = useState(50)
  const containerRef = useRef(null)
  const isDragging = useRef(false)

  const handleMove = (clientX) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPos(pos)
  }

  const handleTouchMove = (e) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX)
    }
  }

  const handleMouseMove = (e) => {
    if (e.buttons === 1 || isDragging.current) {
      handleMove(e.clientX)
    }
  }

  const startDrag = () => {
    isDragging.current = true
  }

  const stopDrag = () => {
    isDragging.current = false
  }

  return (
    <div className="space-y-2">
      <div 
        ref={containerRef}
        className="relative w-full aspect-video rounded-2xl overflow-hidden select-none cursor-ew-resize border border-offwhite-dark shadow-md bg-offwhite-dark"
        onMouseMove={handleMouseMove}
        onMouseDown={(e) => {
          startDrag()
          handleMove(e.clientX)
        }}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        onTouchMove={handleTouchMove}
        onTouchStart={startDrag}
        onTouchEnd={stopDrag}
      >
        {/* After Image (Background) */}
        <div className="absolute inset-0 w-full h-full">
          <img 
            src={afterImage} 
            alt="After" 
            className="w-full h-full object-cover pointer-events-none" 
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=600&q=80'
            }}
          />
          <div className="absolute bottom-3 right-3 bg-terracotta/90 backdrop-blur-sm text-offwhite text-[10px] px-2.5 py-1 rounded-lg font-semibold border border-white/10 uppercase tracking-wider shadow-sm">
            After: {afterDate} ({afterStatus.replace('_', ' ')})
          </div>
        </div>

        {/* Before Image (Foreground, clipped) */}
        <div 
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
        >
          <img 
            src={beforeImage} 
            alt="Before" 
            className="w-full h-full object-cover pointer-events-none" 
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80'
            }}
          />
          <div className="absolute bottom-3 left-3 bg-forest/90 backdrop-blur-sm text-offwhite text-[10px] px-2.5 py-1 rounded-lg font-semibold border border-white/10 uppercase tracking-wider shadow-sm">
            Before: {beforeDate} ({beforeStatus.replace('_', ' ')})
          </div>
        </div>

        {/* Slider Handle Divider */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center shadow-2xl"
          style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
        >
          <div className="w-8 h-8 rounded-full bg-white text-forest shadow-lg flex items-center justify-center font-bold text-sm border border-offwhite-dark hover:scale-105 transition-transform">
            ↔
          </div>
        </div>
      </div>
      <span className="block text-[10px] text-center text-charcoal/40 italic">
        Drag the circle to compare tree appearance before and after status updates.
      </span>
    </div>
  )
}
