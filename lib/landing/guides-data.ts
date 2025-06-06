export interface GuideItem {
  id: number
  title: string
  description: string
  thumbnail: string
  category: string
  readTime: string
  slug: string
  content: string
  date: string
  image: string
  author: string
  tags: string[]
}

export const guidesData: GuideItem[] = [
  {
    id: 1,
    title: "End-of-Life Conversations with Loved Ones: A Guide to Difficult Talks",
    description:
      "Learn how to approach sensitive end-of-life discussions with family members in a compassionate and productive way. This guide provides conversation starters and strategies to ensure your wishes are understood.",
    thumbnail: `/placeholder.svg?height=300&width=400&query=${encodeURIComponent("Family having a serious conversation at home")}`,
    category: "Family Planning",
    readTime: "8 min read",
    slug: "end-of-life-conversations",
    content: "Full guide content here...",
    date: "2024-03-20",
    image: "/placeholder-guide.jpg",
    author: "Legacy Keeper Team",
    tags: ["family", "planning", "conversations"]
  },
  {
    id: 2,
    title: "Retirement Management: A Comprehensive Guide",
    description:
      "Discover strategies for effectively managing your retirement funds, including withdrawal strategies, tax considerations, and how to make your savings last throughout your retirement years.",
    thumbnail: `/placeholder.svg?height=300&width=400&query=${encodeURIComponent("Senior couple reviewing retirement documents")}`,
    category: "Retirement Planning",
    readTime: "12 min read",
    slug: "retirement-management",
    content: "Full guide content here...",
    date: "2024-03-20",
    image: "/placeholder-guide.jpg",
    author: "Legacy Keeper Team",
    tags: ["retirement", "planning", "management"]
  },
  {
    id: 3,
    title: "Sustainable and Ethical Growth: Understanding ESG's Value",
    description:
      "Learn about Environmental, Social, and Governance (ESG) investing and how incorporating these principles into your investment strategy can lead to both financial returns and positive societal impact.",
    thumbnail: `/placeholder.svg?height=300&width=400&query=${encodeURIComponent("Green sustainable investment concept with plant and coins")}`,
    category: "Ethical Investing",
    readTime: "10 min read",
    slug: "sustainable-ethical-growth",
    content: "Full guide content here...",
    date: "2024-03-20",
    image: "/placeholder-guide.jpg",
    author: "Legacy Keeper Team",
    tags: ["ethical", "investing", "sustainable"]
  },
  {
    id: 4,
    title: "Revenue Management Strategies for Different Growth Stages",
    description:
      "Explore tailored financial management approaches for businesses at various growth stages, from startups to mature companies, with practical advice on optimizing revenue streams and managing cash flow.",
    thumbnail: `/placeholder.svg?height=300&width=400&query=${encodeURIComponent("Business growth chart with upward trend")}`,
    category: "Business Finance",
    readTime: "15 min read",
    slug: "revenue-management-strategies",
    content: "Full guide content here...",
    date: "2024-03-20",
    image: "/placeholder-guide.jpg",
    author: "Legacy Keeper Team",
    tags: ["business", "finance", "revenue"]
  },
  {
    id: 5,
    title: "Getting Started with Subscription Billing",
    description:
      "A comprehensive guide to implementing subscription-based revenue models, including pricing strategies, customer retention tactics, and the technical aspects of recurring billing systems.",
    thumbnail: `/placeholder.svg?height=300&width=400&query=${encodeURIComponent("Subscription service concept with recurring payment icons")}`,
    category: "Business Models",
    readTime: "9 min read",
    slug: "subscription-billing",
    content: "Full guide content here...",
    date: "2024-03-20",
    image: "/placeholder-guide.jpg",
    author: "Legacy Keeper Team",
    tags: ["business", "models", "subscription"]
  },
  {
    id: 6,
    title: "AI Insights: A Window to Your Business's Future",
    description:
      "Discover how artificial intelligence can provide valuable insights into your business operations, customer behavior, and market trends, helping you make data-driven decisions for future growth.",
    thumbnail: `/placeholder.svg?height=300&width=400&query=${encodeURIComponent("AI business analytics dashboard with futuristic interface")}`,
    category: "Technology",
    readTime: "11 min read",
    slug: "ai-business-insights",
    content: "Full guide content here...",
    date: "2024-03-20",
    image: "/placeholder-guide.jpg",
    author: "Legacy Keeper Team",
    tags: ["technology", "ai", "business"]
  },
  {
    id: 7,
    title: "A Guide to The Ultimate Savings Techniques for Financial Freedom",
    description:
      "Master advanced saving strategies that go beyond the basics, helping you accelerate your path to financial independence through disciplined approaches and smart money management.",
    thumbnail: `/placeholder.svg?height=300&width=400&query=${encodeURIComponent("Person calculating savings with financial freedom concept")}`,
    category: "Personal Finance",
    readTime: "14 min read",
    slug: "ultimate-savings-techniques",
    content: "Full guide content here...",
    date: "2024-03-20",
    image: "/placeholder-guide.jpg",
    author: "Legacy Keeper Team",
    tags: ["personal", "finance", "savings"]
  },
  {
    id: 8,
    title: "The Effective Questions Helping Customers to Make Decisions",
    description:
      "Learn the art of asking powerful questions that guide customers through their decision-making process, building trust and increasing conversion rates for your business.",
    thumbnail: `/placeholder.svg?height=300&width=400&query=${encodeURIComponent("Business meeting with customer consultation")}`,
    category: "Sales Strategy",
    readTime: "7 min read",
    slug: "effective-customer-questions",
    content: "Full guide content here...",
    date: "2024-03-20",
    image: "/placeholder-guide.jpg",
    author: "Legacy Keeper Team",
    tags: ["sales", "strategy", "customer"]
  },
  {
    id: 9,
    title: "Revenue Receivables for Small Business",
    description:
      "A practical guide to managing accounts receivable for small businesses, including invoicing best practices, collection strategies, and cash flow optimization techniques.",
    thumbnail: `/placeholder.svg?height=300&width=400&query=${encodeURIComponent("Small business owner reviewing invoices and receivables")}`,
    category: "Small Business",
    readTime: "10 min read",
    slug: "revenue-receivables-small-business",
    content: "Full guide content here...",
    date: "2024-03-20",
    image: "/placeholder-guide.jpg",
    author: "Legacy Keeper Team",
    tags: ["small", "business", "receivables"]
  },
]
