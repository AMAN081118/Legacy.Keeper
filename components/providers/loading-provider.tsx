"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface LoadingState {
  isLoading: boolean
  loadingText?: string
  progress?: number
}

interface LoadingContextType {
  globalLoading: LoadingState
  setGlobalLoading: (loading: LoadingState) => void
  startLoading: (text?: string) => void
  stopLoading: () => void
  setProgress: (progress: number) => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [globalLoading, setGlobalLoading] = useState<LoadingState>({
    isLoading: false,
    loadingText: undefined,
    progress: undefined
  })

  const startLoading = useCallback((text?: string) => {
    setGlobalLoading({
      isLoading: true,
      loadingText: text,
      progress: undefined
    })
  }, [])

  const stopLoading = useCallback(() => {
    setGlobalLoading({
      isLoading: false,
      loadingText: undefined,
      progress: undefined
    })
  }, [])

  const setProgress = useCallback((progress: number) => {
    setGlobalLoading(prev => ({
      ...prev,
      progress: Math.max(0, Math.min(100, progress))
    }))
  }, [])

  return (
    <LoadingContext.Provider value={{
      globalLoading,
      setGlobalLoading,
      startLoading,
      stopLoading,
      setProgress
    }}>
      {children}
      {globalLoading.isLoading && <GlobalLoadingOverlay {...globalLoading} />}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

// Global loading overlay component
function GlobalLoadingOverlay({ loadingText, progress }: LoadingState) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-4">
        <div className="flex flex-col items-center space-y-4">
          {/* Spinner */}
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          
          {/* Loading text */}
          {loadingText && (
            <p className="text-sm text-gray-600 text-center">{loadingText}</p>
          )}
          
          {/* Progress bar */}
          {progress !== undefined && (
            <div className="w-full">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Hook for managing async operations with loading states
export function useAsyncOperation() {
  const { startLoading, stopLoading, setProgress } = useLoading()
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async <T,>(
    operation: () => Promise<T>,
    loadingText?: string,
    onProgress?: (progress: number) => void
  ): Promise<T | null> => {
    try {
      setError(null)
      startLoading(loadingText)
      
      if (onProgress) {
        const progressInterval = setInterval(() => {
          // Simulate progress if no real progress is available
          setProgress(Math.random() * 30 + 10)
        }, 200)
        
        const result = await operation()
        clearInterval(progressInterval)
        setProgress(100)
        
        // Brief delay to show completion
        setTimeout(stopLoading, 300)
        return result
      } else {
        const result = await operation()
        stopLoading()
        return result
      }
    } catch (err) {
      stopLoading()
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Async operation failed:', err)
      return null
    }
  }, [startLoading, stopLoading, setProgress])

  return {
    execute,
    error,
    clearError: () => setError(null)
  }
}
