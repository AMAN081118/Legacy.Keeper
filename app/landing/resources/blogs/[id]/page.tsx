import { Footer } from "@/components/footer"
import { NewsletterSubscribe } from "@/components/newsletter-subscribe"
import { BlogPost } from "@/components/blog-post"
import { blogPosts } from "@/lib/blog-data"
import { notFound } from "next/navigation"

export async function generateMetadata({ params }: { params: { id: string } }) {
  const id = Number.parseInt(params.id)
  const post = blogPosts.find((post) => post.id === id)

  if (!post) {
    return {
      title: "Blog Post Not Found - Legacy Keeper",
      description: "The requested blog post could not be found.",
    }
  }

  return {
    title: `${post.title} - Legacy Keeper Blog`,
    description: post.excerpt,
  }
}

export default function BlogPostPage({ params }: { params: { id: string } }) {
  const id = Number.parseInt(params.id)
  const post = blogPosts.find((post) => post.id === id)

  if (!post) {
    notFound()
  }

  return (
    <main className="min-h-screen">
      <BlogPost post={post} />
      <NewsletterSubscribe />
      <Footer />
    </main>
  )
}
