import { Skeleton } from "@/components/ui/skeleton"

// Generic page loading skeleton
export function PageLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  )
}

// Table loading skeleton
export function TableLoadingSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="rounded-lg border bg-white">
      <div className="flex items-center justify-between border-b p-4">
        <Skeleton className="h-6 w-48" />
        <div className="flex space-x-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, j) => (
                <Skeleton key={j} className="h-10 w-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Card grid loading skeleton
export function CardGridLoadingSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24 mt-1" />
              </div>
            </div>
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Form loading skeleton
export function FormLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="flex justify-end space-x-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
}

// Chart loading skeleton
export function ChartLoadingSkeleton() {
  return (
    <div className="rounded-lg border bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-8 w-32" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

// Navigation loading skeleton
export function NavigationLoadingSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>
  )
}

// Inline loading spinner
export function InlineSpinner({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  }

  return (
    <div className={`${sizeClasses[size]} border-2 border-blue-600 border-t-transparent rounded-full animate-spin`} />
  )
}

// Full page loading spinner
export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// Button loading state
export function ButtonLoading({ children, loading, ...props }: { 
  children: React.ReactNode
  loading: boolean
  [key: string]: any 
}) {
  return (
    <button disabled={loading} {...props}>
      {loading ? (
        <div className="flex items-center space-x-2">
          <InlineSpinner size="sm" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}

// List loading skeleton
export function ListLoadingSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24 mt-1" />
            </div>
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  )
}
