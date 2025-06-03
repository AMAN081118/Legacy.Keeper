export interface VideoItem {
  id: number
  title: string
  description: string
  thumbnail: string
  duration: string
  category: string
  date: string
}

export const videoData: VideoItem[] = [
  {
    id: 1,
    title: "Cash Flow Management: Keeping Your Finances Healthy",
    description:
      "Understand how to track your cash flow, forecast expenses, and maintain a healthy financial balance. Learn practical strategies to increase income and reduce unnecessary spending.",
    thumbnail: `/placeholder.svg?height=400&width=600&query=${encodeURIComponent("Cash flow management concept with financial charts")}`,
    duration: "12:45",
    category: "Financial Management",
    date: "July 15, 2024",
  },
  {
    id: 2,
    title: "Investment Basics: Growing Your Wealth",
    description:
      "Discover the fundamentals of investing, different investment vehicles, and how to build a diversified portfolio that aligns with your financial goals and risk tolerance.",
    thumbnail: `/placeholder.svg?height=400&width=600&query=${encodeURIComponent("Investment portfolio growth chart with stock market data")}`,
    duration: "15:20",
    category: "Investments",
    date: "June 28, 2024",
  },
  {
    id: 3,
    title: "Financial Planning for Entrepreneurs & Small Businesses",
    description:
      "Learn essential financial planning strategies specifically designed for entrepreneurs and small business owners, including business budgeting, tax planning, and retirement options.",
    thumbnail: `/placeholder.svg?height=400&width=600&query=${encodeURIComponent("Entrepreneur reviewing business financial documents")}`,
    duration: "18:35",
    category: "Business Finance",
    date: "June 10, 2024",
  },
  {
    id: 4,
    title: "Emergency Funds: Why You Need One & How to Build It",
    description:
      "Understand the importance of having an emergency fund, how much you should save, and practical strategies to build your safety net even on a tight budget.",
    thumbnail: `/placeholder.svg?height=400&width=600&query=${encodeURIComponent("Piggy bank with emergency fund savings concept")}`,
    duration: "10:15",
    category: "Financial Security",
    date: "May 22, 2024",
  },
  {
    id: 5,
    title: "Understanding Inflation & How It Affects Your Money",
    description:
      "Learn about inflation, its causes, and most importantly, how to protect your savings and investments from its eroding effects on your purchasing power.",
    thumbnail: `/placeholder.svg?height=400&width=600&query=${encodeURIComponent("Inflation concept with money and rising price chart")}`,
    duration: "14:50",
    category: "Economic Education",
    date: "May 5, 2024",
  },
  {
    id: 6,
    title: "How to Reduce Financial Stress & Build a Healthy Money Mindset",
    description:
      "Discover practical techniques to reduce financial anxiety, develop a positive relationship with money, and create sustainable financial habits that lead to long-term success.",
    thumbnail: `/placeholder.svg?height=400&width=600&query=${encodeURIComponent("Person with relaxed expression reviewing finances")}`,
    duration: "16:25",
    category: "Financial Wellness",
    date: "April 18, 2024",
  },
]
