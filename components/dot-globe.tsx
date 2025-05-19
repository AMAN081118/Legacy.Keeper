"use client"

import { useEffect, useRef } from "react"

export function DotGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions with device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    ctx.scale(dpr, dpr)

    // Globe parameters
    const width = rect.width
    const height = rect.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) * 0.4

    // Create dots for the globe
    const dots: { x: number; y: number; size: number; opacity: number }[] = []

    // Generate dots in a sphere-like pattern
    for (let i = 0; i < 1500; i++) {
      // Parametric equations for a sphere
      const theta = Math.random() * 2 * Math.PI
      const phi = Math.acos(2 * Math.random() - 1)

      // Focus on Asia/Pacific region by limiting the angles
      // This creates the partial globe effect seen in the design
      if (theta > Math.PI * 0.5 && theta < Math.PI * 1.8 && phi > Math.PI * 0.2 && phi < Math.PI * 0.8) {
        const x = centerX + radius * Math.sin(phi) * Math.cos(theta)
        const y = centerY + radius * Math.sin(phi) * Math.sin(theta)

        // Vary dot sizes slightly
        const size = 0.5 + Math.random() * 1

        // Vary opacity based on position (dots at the edge are more transparent)
        const distFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))
        const opacity = Math.max(0.1, 1 - distFromCenter / radius)

        dots.push({ x, y, size, opacity })
      }
    }

    // Draw the dots
    function draw() {
      ctx.clearRect(0, 0, width, height)

      dots.forEach((dot) => {
        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${dot.opacity})`
        ctx.fill()
      })
    }

    draw()

    // Optional: Add subtle animation
    let animationFrameId: number

    function animate() {
      draw()
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} className="w-full h-full" style={{ width: "100%", height: "100%" }} />
}
