export interface BlogPost {
  id: number
  title: string
  excerpt: string
  category: "finance" | "insurance" | "family" | "growth"
  date: string
  image: string
  layout: "featured" | "regular"
}

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "5 Smart Budgeting Tips for Families to Save More Money",
    excerpt:
      "Managing family finances can be challenging, but with the right budgeting strategies, you can save more and secure a better future. Here are five practical tips to help your family stay on track financially.",
    category: "finance",
    date: "25 July 2024",
    image: "/budgeting-tips.jpg",
    layout: "featured",
  },
  {
    id: 2,
    title: "Investing for Beginners",
    excerpt:
      "Lorem ipsum dolor sit amet consectetur. Amet id diam quis dictum quis eget malesuada tellus. Viverra sagittis consectetur sed at. Ut nulla.",
    category: "family",
    date: "20 July 2024",
    image: "/investing-beginners.jpg",
    layout: "regular",
  },
  {
    id: 3,
    title: "Home Finance Guide",
    excerpt:
      "Lorem ipsum dolor sit amet consectetur. Amet id diam quis dictum quis eget malesuada tellus. Viverra sagittis consectetur sed at. Ut nulla.",
    category: "family",
    date: "25 July 2024",
    image: "/home-finance.jpg",
    layout: "regular",
  },
  {
    id: 4,
    title: "Car Loans & Auto Expenses",
    excerpt:
      "Lorem ipsum dolor sit amet consectetur. Amet id diam quis dictum quis eget malesuada tellus. Viverra sagittis consectetur sed at. Ut nulla.",
    category: "family",
    date: "20 July 2024",
    image: "/car-loans.jpg",
    layout: "regular",
  },
  {
    id: 5,
    title: "How to Cut Monthly Expenses Without Sacrificing Comfort",
    excerpt:
      "Managing family finances can be challenging, but with the right budgeting strategies, you can save more and secure a better future. Here are five practical tips to help your family stay on track financially.",
    category: "finance",
    date: "22 July 2024",
    image: "/cut-expenses.jpg",
    layout: "featured",
  },
  {
    id: 6,
    title: "Frugal Living",
    excerpt:
      "Lorem ipsum dolor sit amet consectetur. Amet id diam quis dictum quis eget malesuada tellus. Viverra sagittis consectetur sed at. Ut nulla.",
    category: "family",
    date: "20 July 2024",
    image: "/frugal-living.jpg",
    layout: "regular",
  },
  {
    id: 7,
    title: "10 Practical Ways to Save Money on Groceries",
    excerpt:
      "Lorem ipsum dolor sit amet consectetur. Amet id diam quis dictum quis eget malesuada tellus. Viverra sagittis consectetur sed at. Ut nulla.",
    category: "family",
    date: "25 July 2024",
    image: "/save-groceries.jpg",
    layout: "regular",
  },
  {
    id: 8,
    title: "Stocks vs. Real Estate",
    excerpt:
      "Lorem ipsum dolor sit amet consectetur. Amet id diam quis dictum quis eget malesuada tellus. Viverra sagittis consectetur sed at. Ut nulla.",
    category: "family",
    date: "20 July 2024",
    image: "/stocks-realestate.jpg",
    layout: "regular",
  },
  {
    id: 9,
    title: "Best Financial Planning Tips for Stay-at-Home Parents",
    excerpt:
      "Managing family finances can be challenging, but with the right budgeting strategies, you can save more and secure a better future. Here are five practical tips to help your family stay on track financially.",
    category: "finance",
    date: "22 July 2024",
    image: "/stay-home-parents.jpg",
    layout: "featured",
  },
]
