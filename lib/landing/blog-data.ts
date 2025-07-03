export interface BlogPost {
  id: string;
  title: string;
  excerpt?: string;
  description?: string;
  content?: string;
  author?: string;
  category: string;
  date?: string;
  image?: string;
  layout?: "featured" | "regular";
  tags?: string[];
  status?: string;
  updated_at?: string;
  slug?: string;
}

// Cache for blog posts to avoid repeated API calls
let blogPostsCache: BlogPost[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchBlogPosts(): Promise<BlogPost[]> {
  try {
    // Use absolute URL for server-side rendering
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/blogs`);

    if (!response.ok) {
      throw new Error(`Failed to fetch blogs: ${response.status}`);
    }

    const data = await response.json();
    console.log("API Response:", data);

    if (!data.blogs) {
      return [];
    }

    // Map API blogs to BlogPost type with fallbacks
    return data.blogs.map((blog: any) => ({
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
    }));
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const now = Date.now();

  // Return cached data if it's still valid
  if (blogPostsCache && now - cacheTimestamp < CACHE_DURATION) {
    return blogPostsCache;
  }

  // Fetch fresh data
  const posts = await fetchBlogPosts();

  // Update cache
  blogPostsCache = posts;
  cacheTimestamp = now;

  return posts;
}

export async function getBlogPost(id: string): Promise<BlogPost | undefined> {
  // Validate UUID format (basic check)
  if (!id || typeof id !== "string" || id.trim() === "") {
    console.warn("Invalid blog post ID provided:", id);
    return undefined;
  }

  try {
    // Fetch individual blog post directly
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/blogs/${id.trim()}`);

    if (!response.ok) {
      console.error(`Failed to fetch blog post: ${response.status}`);
      return undefined;
    }

    const data = await response.json();
    console.log("Individual blog API Response:", data);

    if (!data.blog) {
      console.error("No blog data in response");
      return undefined;
    }

    const blog = data.blog;

    // Map API blog to BlogPost type with fallbacks
    return {
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
    };
  } catch (error) {
    console.error("Error fetching individual blog post:", error);
    return undefined;
  }
}

// For backward compatibility, export an empty array as blogPosts
// This maintains compatibility with existing code that might import blogPosts directly
export const blogPosts: BlogPost[] = [];
