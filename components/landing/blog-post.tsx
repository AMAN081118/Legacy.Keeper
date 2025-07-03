import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { BlogPost } from "@/lib/landing/blog-data";

interface BlogPostProps {
  post: BlogPost;
}

export function BlogPost({ post }: BlogPostProps) {
  return (
    <article className="w-full py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Back to Blogs Button */}
        <Link
          href="/landing/resources/blogs"
          className="flex items-center text-blue-600 hover:text-blue-800 mb-8"
        >
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
          <Image
            src={post.image || "/placeholder.svg"}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>

        {/* Blog Content */}
        <div className="prose prose-lg max-w-none">
          {/* Show excerpt/description if available */}
          {(post.excerpt || post.description) && (
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <p className="text-gray-700 text-lg italic">
                {post.excerpt || post.description}
              </p>
            </div>
          )}

          {/* Render actual blog content */}
          {post.content ? (
            <div
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          ) : (
            <div className="text-gray-500 text-center py-12">
              <p>Content not available for this blog post.</p>
            </div>
          )}

          {/* Tags section if available */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-3">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Author Info */}
        {post.author && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center">
              <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                <Image
                  src="/placeholder.svg?key=author"
                  alt="Author"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold">Written by {post.author}</h3>
                <p className="text-sm text-gray-600">
                  {post.category} Expert at Legacy Keeper
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
