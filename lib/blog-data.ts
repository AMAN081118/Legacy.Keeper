export type BlogPost = {
  id: number;
  title: string;
  description: string;
  content: string;
  author: string;
  date: string;
  image: string;
  category: string;
  tags: string[];
};

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Understanding Legacy Planning",
    description: "A comprehensive guide to planning your legacy and ensuring your assets are protected.",
    content: `Legacy planning is more than just writing a will. It's about ensuring your wishes are carried out and your loved ones are taken care of after you're gone. This comprehensive guide will walk you through the essential steps of legacy planning.

## What is Legacy Planning?

Legacy planning involves making arrangements for the management and distribution of your assets after your death. It includes:

- Creating a will
- Setting up trusts
- Designating beneficiaries
- Planning for incapacity
- Managing digital assets

## Why is it Important?

Proper legacy planning ensures that:

1. Your assets are distributed according to your wishes
2. Your loved ones are provided for
3. Your estate avoids unnecessary taxes
4. Your family avoids probate court
5. Your digital legacy is preserved

## Getting Started

The first step in legacy planning is to take inventory of your assets. This includes:

- Real estate
- Financial accounts
- Personal property
- Digital assets
- Business interests

Once you have a clear picture of your assets, you can begin making decisions about how they should be distributed.`,
    author: "John Smith",
    date: "2024-03-15",
    image: "/blog-legacy-planning.jpg",
    category: "Legacy Planning",
    tags: ["legacy", "planning", "estate", "will", "trust"]
  },
  {
    id: 2,
    title: "Digital Asset Management",
    description: "Learn how to protect and manage your digital assets for future generations.",
    content: `In today's digital age, managing your online presence and digital assets has become an essential part of legacy planning. This guide will help you understand how to protect and pass on your digital legacy.

## What are Digital Assets?

Digital assets include:

- Social media accounts
- Email accounts
- Online banking
- Cryptocurrency
- Digital photos and videos
- Domain names
- Online subscriptions

## Protecting Your Digital Legacy

Here are key steps to protect your digital assets:

1. Create an inventory of all digital assets
2. Store passwords securely
3. Designate a digital executor
4. Document your wishes for each asset
5. Consider using a password manager

## Best Practices

- Regularly update your digital asset inventory
- Use secure password management
- Consider digital estate planning tools
- Communicate your wishes to loved ones
- Keep documentation up to date`,
    author: "Sarah Johnson",
    date: "2024-03-10",
    image: "/blog-digital-assets.jpg",
    category: "Digital Assets",
    tags: ["digital", "assets", "legacy", "online", "security"]
  }
];

export function getBlogPost(id: number): BlogPost | undefined {
  return blogPosts.find(post => post.id === id);
}

export function getAllBlogPosts(): BlogPost[] {
  return blogPosts;
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  return blogPosts.filter(post => post.category === category);
}

export function getBlogPostsByTag(tag: string): BlogPost[] {
  return blogPosts.filter(post => post.tags.includes(tag));
} 