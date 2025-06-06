export interface GuideItem {
  id: string
  title: string
  description: string
  content: string
  category: string
  date: string
  image: string
  author: string
  tags: string[]
  thumbnail?: string
  readTime: string
}

export const guides: GuideItem[] = [
  {
    id: "1",
    title: "Getting Started with Legacy Keeper",
    description: "Learn the basics of using Legacy Keeper to manage your digital legacy",
    content: "Full guide content here...",
    category: "Basics",
    date: "2024-03-20",
    image: "/placeholder-guide.jpg",
    author: "Legacy Keeper Team",
    tags: ["basics", "getting-started", "tutorial"],
    thumbnail: "/placeholder-guide.jpg",
    readTime: "5 min read"
  }
  // Add more guides as needed
] 