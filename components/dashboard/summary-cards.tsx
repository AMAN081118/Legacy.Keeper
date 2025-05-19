import { Users, UserCheck, UserCog } from "lucide-react"
import Link from "next/link"

interface SummaryCardsProps {
  summaryData: {
    requests: number
    trustees: number
    nominees: number
  }
}

export function SummaryCards({ summaryData }: SummaryCardsProps) {
  const cards = [
    {
      title: "Requests",
      count: summaryData.requests.toString().padStart(2, "0"),
      icon: Users,
      color: "bg-blue-50",
      iconColor: "text-blue-500",
      href: "/dashboard/requests",
    },
    {
      title: "Trustees",
      count: summaryData.trustees.toString().padStart(2, "0"),
      icon: UserCheck,
      color: "bg-green-50",
      iconColor: "text-green-500",
      href: "/dashboard/trustees",
    },
    {
      title: "Nominees",
      count: summaryData.nominees.toString().padStart(2, "0"),
      icon: UserCog,
      color: "bg-indigo-50",
      iconColor: "text-indigo-500",
      href: "/dashboard/nominees",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card, i) => (
        <div key={i} className="rounded-lg border bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <h3 className="text-3xl font-bold">{card.count}</h3>
            </div>
            <div className={`rounded-full p-3 ${card.color}`}>
              <card.icon className={`h-6 w-6 ${card.iconColor}`} />
            </div>
          </div>
          <Link
            href={card.href}
            className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:underline"
          >
            View Details
            <svg
              className="ml-1 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      ))}
    </div>
  )
}
