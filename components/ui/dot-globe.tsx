import { Globe } from "lucide-react"
import { cn } from "@/utils"

interface DotGlobeProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DotGlobe({ className, ...props }: DotGlobeProps) {
  return (
    <div className={cn("relative", className)} {...props}>
      <Globe className="w-full h-full text-gray-300" />
      <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-red-500 rounded-full" />
    </div>
  )
} 