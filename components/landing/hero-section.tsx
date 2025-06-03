"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getHeroSection, getStrapiMedia, type HeroSection as HeroSectionType } from "@/lib/landing/api"
import Image from "next/image"

export function HeroSection() {
  const [heroData, setHeroData] = useState<HeroSectionType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        setIsLoading(true)

        // Try direct fetch first
        try {
          const directResponse = await fetch('http://localhost:1337/api/hero-sections?populate=*');
          const directData = await directResponse.json();
          console.log("Direct fetch response:", directData);

          if (directData && directData.data && directData.data.length > 0) {
            // The data is directly in the data array, not in attributes
            setHeroData(directData.data[0]);
            console.log("Setting hero data from direct fetch:", directData.data[0]);
            setIsLoading(false);
            return;
          }
        } catch (directErr) {
          console.warn("Direct fetch failed, falling back to API service:", directErr);
        }

        // Fall back to our API service
        const data = await getHeroSection();
        console.log("Hero section data from API service:", data);

        if (data) {
          // The data is already in the format we need
          setHeroData(data);
          console.log("Setting hero data from API service:", data);
        } else {
          console.warn("No hero section data returned from API");
        }
      } catch (err) {
        console.error("Error fetching hero data:", err);
        setError("Failed to load hero section data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeroData();
  }, [])

  // Log the hero data for debugging
  console.log("Current heroData state:", heroData);

  // Default values in case API fails or data is not available
  let backgroundImage = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-KyzkMCDxz4fiVuzHUwkIUoD5RyngQq.png';

  if (heroData?.BackgroundImage) {
    const mediaUrl = getStrapiMedia(heroData.BackgroundImage);
    console.log("Background image URL from Strapi:", mediaUrl);
    if (mediaUrl) {
      backgroundImage = mediaUrl;
    }
  }

  const primaryButtonText = heroData?.ButtonText || "Get Free Trial Now"
  const primaryButtonLink = heroData?.ButtonLink || "/register"
  const secondaryButtonText = heroData?.SecondaryButtonText || "Get info on whatsapp"
  const secondaryButtonLink = heroData?.SecondaryButtonLink || "/contact"

  console.log("Using values:", {
    backgroundImage,
    primaryButtonText,
    primaryButtonLink,
    secondaryButtonText,
    secondaryButtonLink
  });

  return (
    <section className="w-full py-12 md:py-16 bg-blue-50/50 rounded-3xl overflow-hidden">
      <div className="container px-4 md:px-6 relative">
        <div
          className="w-full h-full bg-cover bg-center rounded-3xl p-8 md:p-12 lg:p-16"
          style={{
            backgroundImage: `url('${backgroundImage}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: "600px",
          }}
        >
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <>
              {heroData?.Title && (
                <div className="max-w-2xl mb-8">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-md">
                    {heroData.Title}
                  </h1>
                  {heroData.Subtitle && (
                    <p className="mt-4 text-lg text-white drop-shadow-md">
                      {heroData.Subtitle}
                    </p>
                  )}
                </div>
              )}
              <div className="absolute bottom-12 left-12 md:left-16 flex flex-col sm:flex-row gap-4 z-10">
                <Link href={primaryButtonLink}>
                  <Button className="bg-blue-900 hover:bg-blue-800 text-white rounded-md px-6 py-6 text-base font-medium">
                    {primaryButtonText}
                  </Button>
                </Link>
                <Link href={secondaryButtonLink}>
                  <Button
                    variant="outline"
                    className="bg-white border-gray-300 text-gray-700 rounded-md px-6 py-6 text-base font-medium"
                  >
                    {secondaryButtonText}
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
