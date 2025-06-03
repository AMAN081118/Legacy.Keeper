"use client"

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

interface PerformanceMetrics {
  pageLoadTime: number
  navigationTime: number
  renderTime: number
  isLoading: boolean
}

export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    navigationTime: 0,
    renderTime: 0,
    isLoading: true
  })
  
  const pathname = usePathname()
  const navigationStartTime = useRef<number>(0)
  const renderStartTime = useRef<number>(0)

  useEffect(() => {
    // Track navigation start
    navigationStartTime.current = performance.now()
    renderStartTime.current = performance.now()
    
    setMetrics(prev => ({ ...prev, isLoading: true }))

    // Track when component finishes rendering
    const renderEndTime = performance.now()
    const renderTime = renderEndTime - renderStartTime.current

    // Track page load completion
    const handleLoad = () => {
      const loadEndTime = performance.now()
      const pageLoadTime = loadEndTime - navigationStartTime.current
      const navigationTime = loadEndTime - navigationStartTime.current

      setMetrics({
        pageLoadTime,
        navigationTime,
        renderTime,
        isLoading: false
      })

      // Log performance metrics in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${pathname}:`, {
          pageLoadTime: `${pageLoadTime.toFixed(2)}ms`,
          navigationTime: `${navigationTime.toFixed(2)}ms`,
          renderTime: `${renderTime.toFixed(2)}ms`
        })
      }
    }

    // Use requestIdleCallback for better performance
    if ('requestIdleCallback' in window) {
      requestIdleCallback(handleLoad)
    } else {
      setTimeout(handleLoad, 0)
    }

    return () => {
      // Cleanup if needed
    }
  }, [pathname])

  return metrics
}

// Hook for tracking specific operations
export function useOperationTimer() {
  const [isLoading, setIsLoading] = useState(false)
  const [duration, setDuration] = useState<number>(0)
  const startTime = useRef<number>(0)

  const startTimer = () => {
    startTime.current = performance.now()
    setIsLoading(true)
    setDuration(0)
  }

  const stopTimer = () => {
    const endTime = performance.now()
    const operationDuration = endTime - startTime.current
    setDuration(operationDuration)
    setIsLoading(false)
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Operation Timer] Duration: ${operationDuration.toFixed(2)}ms`)
    }
    
    return operationDuration
  }

  return {
    isLoading,
    duration,
    startTimer,
    stopTimer
  }
}

// Hook for debouncing operations
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Hook for throttling operations
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastRan = useRef<number>(Date.now())

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value)
        lastRan.current = Date.now()
      }
    }, limit - (Date.now() - lastRan.current))

    return () => {
      clearTimeout(handler)
    }
  }, [value, limit])

  return throttledValue
}
