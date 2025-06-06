import { Footer } from "@/components/landing/footer"
import { BlogsHeader } from "@/components/landing/blogs-header"
import { BlogPosts } from "@/components/landing/blog-posts"
import { NewsletterSubscribe } from "@/components/landing/newsletter-subscribe"

export const metadata = {
  title: "Blogs - Legacy Keeper",
  description:
    "Insights, Tips & Inspiration for a Better Life - Stay informed with expert advice, practical guides, and the latest trends.",
}

export default function BlogsPage() {
  return (
    <main className="min-h-screen">
      <BlogsHeader />
      <BlogPosts />
      <NewsletterSubscribe />
      <Footer />
    </main>
  )
}
