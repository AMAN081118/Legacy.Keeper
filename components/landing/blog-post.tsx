import Image from "next/image"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import type { BlogPost } from "@/lib/landing/blog-data"

interface BlogPostProps {
  post: BlogPost
}

export function BlogPost({ post }: BlogPostProps) {
  return (
    <article className="w-full py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Back to Blogs Button */}
        <Link href="/resources/blogs" className="flex items-center text-blue-600 hover:text-blue-800 mb-8">
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span>Back to Blogs</span>
        </Link>

        {/* Blog Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm text-green-700 font-medium bg-green-50 px-3 py-1 rounded-full">
              {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
            </span>
            <span className="text-sm text-gray-500">{post.date}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-6">{post.title}</h1>
        </div>

        {/* Featured Image */}
        <div className="relative h-[400px] mb-8 rounded-lg overflow-hidden">
          <Image src={post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
        </div>

        {/* Blog Content */}
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 mb-6">{post.excerpt}</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Why This Matters</h2>
          <p className="text-gray-700 mb-6">
            Financial planning is a crucial aspect of family life that often gets overlooked in the hustle and bustle of
            daily responsibilities. By implementing smart budgeting strategies, families can not only meet their
            immediate needs but also build a secure foundation for their future.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Key Takeaways</h2>
          <ul className="list-disc pl-6 mb-6">
            <li className="mb-2">Create a comprehensive budget that accounts for all income sources and expenses</li>
            <li className="mb-2">Set aside an emergency fund to cover unexpected costs</li>
            <li className="mb-2">Prioritize debt repayment to reduce interest payments</li>
            <li className="mb-2">Involve all family members in financial discussions and decisions</li>
            <li className="mb-2">Regularly review and adjust your budget as circumstances change</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">Practical Steps to Implement</h2>
          <p className="text-gray-700 mb-6">
            Start by tracking all your expenses for a month to get a clear picture of where your money is going. Use
            this information to create a realistic budget that aligns with your family's goals and values. Consider
            using budgeting apps or tools to simplify the process and make it easier to stick to your plan.
          </p>
          <p className="text-gray-700 mb-6">
            Next, identify areas where you can cut back without significantly impacting your quality of life. This might
            include reducing dining out, canceling unused subscriptions, or finding more cost-effective alternatives for
            regular purchases.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Conclusion</h2>
          <p className="text-gray-700 mb-6">
            Implementing these budgeting tips can help your family build a stronger financial foundation and work toward
            your long-term goals. Remember that financial planning is not about restriction but about making intentional
            choices that align with what matters most to your family.
          </p>
        </div>

        {/* Author Info */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center">
            <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
              <Image src="/placeholder.svg?key=author" alt="Author" fill className="object-cover" />
            </div>
            <div>
              <h3 className="font-bold">Written by Financial Expert</h3>
              <p className="text-sm text-gray-600">Financial Planning Specialist at Legacy Keeper</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
