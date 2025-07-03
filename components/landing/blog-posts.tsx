"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BlogPost {
  id: string;
  title: string;
  description?: string;
  excerpt?: string;
  content?: string;
  author?: string;
  category: string;
  date?: string;
  image?: string;
  layout?: "featured" | "regular";
  tags?: string[];
  status?: string;
  updated_at?: string;
}

type Category = "all" | "finance" | "insurance" | "family" | "growth";

export function BlogPosts() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [apiPosts, setApiPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get all unique categories from API posts
  const categories = Array.from(
    new Set(apiPosts.map((post) => post.category).filter(Boolean)),
  );

  const filteredPosts =
    activeCategory === "all"
      ? apiPosts
      : apiPosts.filter((post) => post.category === activeCategory);

  useEffect(() => {
    setLoading(true);
    fetch("/api/blogs")
      .then((res) => res.json())
      .then((data) => {
        if (data.blogs) {
          // Map API blogs to BlogPost type with fallbacks
          setApiPosts(
            data.blogs.map((blog: any) => ({
              id: blog.id,
              title: blog.title,
              description: blog.description,
              excerpt:
                blog.description ||
                blog.content?.slice(0, 120) ||
                "No excerpt available.",
              content: blog.content,
              author: blog.author,
              category: blog.category || "uncategorized",
              date: blog.date ? new Date(blog.date).toLocaleDateString() : "",
              image: blog.image || "/placeholder.svg",
              layout: blog.layout || "regular",
              tags: blog.tags,
              slug: blog.slug,
              status: blog.status,
              updated_at: blog.updated_at,
            })),
          );
        } else {
          setApiPosts([]);
        }
        setError(null);
      })
      .catch((err) => {
        setError("Failed to fetch blogs from API");
        setApiPosts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="w-full py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Category Filters */}
        <div className="flex justify-center mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              key="all"
              onClick={() => setActiveCategory("all")}
              className={cn(
                "px-6 py-2 rounded-md text-sm font-medium transition-colors",
                activeCategory === "all"
                  ? "bg-blue-900 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100",
              )}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category as Category)}
                className={cn(
                  "px-6 py-2 rounded-md text-sm font-medium transition-colors",
                  activeCategory === category
                    ? "bg-blue-900 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100",
                )}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="text-center text-gray-500">Loading blogs...</div>
        )}
        {error && <div className="text-center text-red-500">{error}</div>}
        {!loading && !error && filteredPosts.length === 0 && (
          <div className="text-center text-gray-500">No blogs found.</div>
        )}

        {/* Blog Posts */}
        <div className="space-y-12">
          {filteredPosts.map((post) =>
            post.layout === "featured" ? (
              <div
                key={post.id}
                className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-6 items-center"
              >
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
                      {post.category.charAt(0).toUpperCase() +
                        post.category.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500">{post.date}</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-3">{post.title}</h2>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <Link
                    href={`/resources/blogs/${post.id}`}
                    className="text-blue-700 font-medium hover:underline"
                  >
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
                      {post.category.charAt(0).toUpperCase() +
                        post.category.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500">{post.date}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 flex-grow">
                    {post.excerpt}
                  </p>
                  <Link
                    href={`/landing/resources/blogs/${post.id}`}
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
  );
}
