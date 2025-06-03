"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { blogPosts } from "@/lib/landing/blog-data"

type Category = "all" | "finance" | "insurance" | "family" | "growth"

export function BlogPosts() {
  const [activeCategory, setActiveCategory] = useState<Category>("all")

  const filteredPosts =
    activeCategory === "all" ? blogPosts : blogPosts.filter((post) => post.category === activeCategory)

  return (
    <section className="w-full py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Category Filters */}
        <div className="flex justify-center mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "All" },
              { value: "finance", label: "Finance" },
              { value: "insurance", label: "Insurance" },
              { value: "family", label: "Family" },
              { value: "growth", label: "Growth" },
            ].map((category) => (
              <button
                key={category.value}
                onClick={() => setActiveCategory(category.value as Category)}
                className={cn(
                  "px-6 py-2 rounded-md text-sm font-medium transition-colors",
                  activeCategory === category.value
                    ? "bg-blue-900 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100",
                )}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Posts */}
        <div className="space-y-12">
          {filteredPosts.map((post) =>
            post.layout === "featured" ? (
              <div key={post.id} className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-6 items-center">
                <div className="relative h-64 md:h-full">
                  <Image
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-sm text-green-700 font-medium">
                      {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500">{post.date}</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-3">{post.title}</h2>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <Link href={`/resources/blogs/${post.id}`} className="text-blue-700 font-medium hover:underline">
                    Read this blog
                  </Link>
                </div>
              </div>
            ) : null,
          )}

          {/* Regular Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredPosts.map((post) =>
              post.layout === "regular" ? (
                <div key={post.id} className="flex flex-col">
                  <div className="relative h-48 mb-4">
                    <Image
                      src={post.image || "/placeholder.svg"}
                      alt={post.title}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-sm text-green-700 font-medium">
                      {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500">{post.date}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 flex-grow">{post.excerpt}</p>
                  <Link
                    href={`/resources/blogs/${post.id}`}
                    className="text-blue-700 font-medium hover:underline mt-auto"
                  >
                    Read this blog
                  </Link>
                </div>
              ) : null,
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
