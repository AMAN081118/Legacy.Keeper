/**
 * API service for fetching data from Strapi CMS
 */

// Define the base URL for Strapi API
const STRAPI_API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

// For debugging
console.log('Using Strapi API URL:', STRAPI_API_URL);

/**
 * Helper function to fetch data from Strapi API
 */
async function fetchAPI(endpoint: string, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
  };

  try {
    const res = await fetch(`${STRAPI_API_URL}/api/${endpoint}`, mergedOptions);

    if (!res.ok) {
      console.error('API Error:', await res.text());
      throw new Error(`API error: ${res.status}`);
    }

    const json = await res.json();
    return json;
  } catch (error) {
    console.error('Error fetching from Strapi:', error);
    throw error;
  }
}

/**
 * Get hero section data from Strapi
 */
export async function getHeroSection() {
  try {
    const response = await fetchAPI('hero-sections?populate=*');
    console.log('Full Strapi response for hero section:', response);

    if (response && response.data && response.data.length > 0) {
      // The data is already in the format we need, no need to access attributes
      return response.data[0];
    } else {
      console.warn('No hero sections found in Strapi response');
      return null;
    }
  } catch (error) {
    console.error('Error getting hero section:', error);
    return null;
  }
}

/**
 * Get FAQ items from Strapi
 */
export async function getFAQItems() {
  try {
    const response = await fetchAPI('faq-items');
    console.log('Full Strapi response for FAQ items:', response);

    if (response && response.data && response.data.length > 0) {
      return response.data;
    } else {
      console.warn('No FAQ items found in Strapi response');
      return [];
    }
  } catch (error) {
    console.error('Error getting FAQ items:', error);
    return [];
  }
}

/**
 * Get FAQ section data from Strapi
 */
export async function getFAQSection() {
  try {
    const response = await fetchAPI('faq-sections');
    console.log('Full Strapi response for FAQ section:', response);

    if (response && response.data && response.data.length > 0) {
      return response.data[0];
    } else {
      console.warn('No FAQ section found in Strapi response');
      return null;
    }
  } catch (error) {
    console.error('Error getting FAQ section:', error);
    return null;
  }
}

/**
 * Get FAQ categories from Strapi
 */
export async function getFAQCategories() {
  try {
    const response = await fetchAPI('faq-categories');
    console.log('Full Strapi response for FAQ categories:', response);

    if (response && response.data && response.data.length > 0) {
      return response.data;
    } else {
      console.warn('No FAQ categories found in Strapi response');
      return [];
    }
  } catch (error) {
    console.error('Error getting FAQ categories:', error);
    return [];
  }
}

/**
 * Get FAQ category questions from Strapi
 */
export async function getFAQCategoryQuestions(categoryId: string) {
  try {
    const response = await fetchAPI(`faq-category-questions?filters[category][categoryId][$eq]=${categoryId}`);
    console.log(`Full Strapi response for FAQ category questions (${categoryId}):`, response);

    if (response && response.data && response.data.length > 0) {
      return response.data;
    } else {
      console.warn(`No FAQ questions found for category ${categoryId} in Strapi response`);
      return [];
    }
  } catch (error) {
    console.error(`Error getting FAQ questions for category ${categoryId}:`, error);
    return [];
  }
}

/**
 * Get all FAQ categories with their questions from Strapi
 */
export async function getAllFAQCategoriesWithQuestions() {
  try {
    // First get all categories
    const categories = await getFAQCategories();

    // Then get questions for each category
    const categoriesWithQuestions = await Promise.all(
      categories.map(async (category: FAQCategory) => {
        const questions = await getFAQCategoryQuestions(category.categoryId);
        return {
          ...category,
          questions
        };
      })
    );

    return categoriesWithQuestions;
  } catch (error) {
    console.error('Error getting all FAQ categories with questions:', error);
    return [];
  }
}

/**
 * Get URL for Strapi media
 */
export function getStrapiMedia(media: any) {
  if (!media) return null;

  console.log('Media object received:', media);

  try {
    // Based on the actual response structure
    if (media.url) {
      return `${STRAPI_API_URL}${media.url}`;
    }

    // Handle different possible structures of the media object
    if (media.data && media.data.attributes && media.data.attributes.url) {
      return `${STRAPI_API_URL}${media.data.attributes.url}`;
    }

    // If media is already the data object
    if (media.attributes && media.attributes.url) {
      return `${STRAPI_API_URL}${media.attributes.url}`;
    }

    // If media is just the URL string
    if (typeof media === 'string') {
      return media.startsWith('http') ? media : `${STRAPI_API_URL}${media}`;
    }

    console.warn('Unexpected media structure:', media);
    return null;
  } catch (error) {
    console.error('Error processing media URL:', error);
    return null;
  }
}

/**
 * Types for Strapi API responses
 */
export interface StrapiResponse<T> {
  data: StrapiData<T>[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiData<T> {
  id: number;
  attributes: T;
}

export interface StrapiMedia {
  data: {
    id: number;
    attributes: {
      name: string;
      alternativeText: string | null;
      caption: string | null;
      width: number;
      height: number;
      formats: any;
      hash: string;
      ext: string;
      mime: string;
      size: number;
      url: string;
      previewUrl: string | null;
      provider: string;
      provider_metadata: any;
      createdAt: string;
      updatedAt: string;
    };
  };
}

export interface HeroSection {
  id: number;
  documentId: string;
  Title: string;
  Subtitle: string;
  ButtonText: string;
  ButtonLink: string;
  SecondaryButtonText: string;
  SecondaryButtonLink: string;
  BackgroundImage: {
    id: number;
    documentId: string;
    name: string;
    alternativeText: string | null;
    caption: string | null;
    width: number;
    height: number;
    formats: {
      thumbnail: {
        url: string;
        [key: string]: any;
      };
      medium: {
        url: string;
        [key: string]: any;
      };
      small: {
        url: string;
        [key: string]: any;
      };
      large: {
        url: string;
        [key: string]: any;
      };
    };
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    previewUrl: string | null;
    provider: string;
    provider_metadata: any;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface FAQItem {
  id: number;
  documentId: string;
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface FAQSection {
  id: number;
  documentId: string;
  title: string;
  description: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface FAQCategory {
  id: number;
  documentId: string;
  label: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  questions?: FAQCategoryQuestion[];
}

export interface FAQCategoryQuestion {
  id: number;
  documentId: string;
  question: string;
  answer: string;
  category: {
    id: number;
    documentId: string;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
