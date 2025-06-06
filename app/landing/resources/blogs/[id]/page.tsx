import { Footer } from "@/components/landing/footer"
import { NewsletterSubscribe } from "@/components/landing/newsletter-subscribe"
import { BlogPost } from "@/components/landing/blog-post"
import { getBlogPost } from "@/lib/landing/blog-data"
import { notFound } from "next/navigation"
import { Metadata } from "next"

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const id = Number.parseInt(resolvedParams.id)
  const post = getBlogPost(id)

  if (!post) {
    return {
      title: "Blog Post Not Found",
    }
  }

  return {
    title: post.title,
    description: post.excerpt,
  }
}

export default async function BlogPostPage({ params }: Props) {
  const resolvedParams = await params
  const id = Number.parseInt(resolvedParams.id)
  const post = getBlogPost(id)

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
