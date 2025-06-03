"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { getFAQItems, getFAQSection, type FAQItem as FAQItemType, type FAQSection as FAQSectionType } from "@/lib/landing/api"

interface FAQItemProps {
  question: string
  answer: string
  isOpen: boolean
  toggleOpen: () => void
}

function FAQItem({ question, answer, isOpen, toggleOpen }: FAQItemProps) {
  return (
    <div className="border-b py-6">
      <button
        className="flex justify-between items-center w-full text-left"
        onClick={toggleOpen}
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-medium">{question}</h3>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-red-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
        )}
      </button>
      {isOpen && <div className="mt-4 text-gray-600">{answer}</div>}
    </div>
  )
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState(0)
  const [faqItems, setFaqItems] = useState<FAQItemType[]>([])
  const [faqSection, setFaqSection] = useState<FAQSectionType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Default FAQ items in case API fails or data is not available
  const defaultFaqs = [
    {
      question:
        "I am not well-versed in technology, but I wish to use this software to provide information to my dependents. How can this be achieved?",
      answer:
        "You don't need to worry if you are not familiar with tech. You can download a form from our website, fill in the required details and you can share the same with us over email or courier. We will verify and upload the same in the platform. Also every quarter our support team will reach to you to get updates of your personal/private information and update the same in the platform as needed.",
    },
    {
      question: "Can my nominees access my information without my consent?",
      answer:
        "No. There is no way your nominees can access your information without your consent unless you let them access from my system/phone directly with/without your knowledge. Our Robust security system and the process will make sure there is no unauthorized access to your personal information. You also verify all the last few session logins with details related of the device/date/time of the access made under your Profile Settings tab.",
    },
    {
      question: "Is it permissible for my trustee to access my personal information as well?",
      answer:
        "No. As per the system design the Trustees are only authorized to provide access to your information to the nominees designated by you in the system. Apart from the Approval process they don't have any other access.",
    },
    {
      question: "I don't trust anyone in life. Whom do I appoint as a trustee?",
      answer:
        "If there is no trustworthy person to appoint as a trustee from your end we ( App Owners) can act as a trustee for you and communicate with your nominee as per need.",
    },
    {
      question: "What will happen to my information after my demise?",
      answer:
        "We will wait for a Quarter/Year and if there is no update from anyone from your side we will reach out to your Trustee and nominee and initiate proceedings as needed for them to access your details.",
    },
    {
      question: "Can I designate a religious organization or NGO to receive my information upon my demise",
      answer:
        "No. We are only allowing individuals to be appointed as trustee/nominee to avoid unnecessary legal issues.",
    },
  ]

  useEffect(() => {
    const fetchFAQData = async () => {
      try {
        setIsLoading(true)

        // Try direct fetch for FAQ items
        try {
          const directResponse = await fetch('http://localhost:1337/api/faq-items');
          const directData = await directResponse.json();
          console.log("Direct fetch response for FAQ items:", directData);

          if (directData && directData.data && directData.data.length > 0) {
            setFaqItems(directData.data);
            console.log("Setting FAQ items from direct fetch:", directData.data);
          } else {
            console.warn("No FAQ items returned from direct fetch");

            // Fall back to API service
            const items = await getFAQItems();
            if (items && items.length > 0) {
              setFaqItems(items);
              console.log("Setting FAQ items from API service:", items);
            } else {
              console.warn("No FAQ items returned from API service");
            }
          }
        } catch (directErr) {
          console.warn("Direct fetch for FAQ items failed:", directErr);

          // Fall back to API service
          const items = await getFAQItems();
          if (items && items.length > 0) {
            setFaqItems(items);
            console.log("Setting FAQ items from API service:", items);
          } else {
            console.warn("No FAQ items returned from API service");
          }
        }

        // Try direct fetch for FAQ section
        try {
          const sectionResponse = await fetch('http://localhost:1337/api/faq-sections');
          const sectionData = await sectionResponse.json();
          console.log("Direct fetch response for FAQ section:", sectionData);

          if (sectionData && sectionData.data && sectionData.data.length > 0) {
            setFaqSection(sectionData.data[0]);
            console.log("Setting FAQ section from direct fetch:", sectionData.data[0]);
          } else {
            console.warn("No FAQ section returned from direct fetch");

            // Fall back to API service
            const section = await getFAQSection();
            if (section) {
              setFaqSection(section);
              console.log("Setting FAQ section from API service:", section);
            } else {
              console.warn("No FAQ section returned from API service");
            }
          }
        } catch (sectionErr) {
          console.warn("Direct fetch for FAQ section failed:", sectionErr);

          // Fall back to API service
          const section = await getFAQSection();
          if (section) {
            setFaqSection(section);
            console.log("Setting FAQ section from API service:", section);
          } else {
            console.warn("No FAQ section returned from API service");
          }
        }
      } catch (err) {
        console.error("Error fetching FAQ data:", err);
        setError("Failed to load FAQ data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFAQData();
  }, []);

  // Use dynamic data if available, otherwise use defaults
  const faqs = faqItems.length > 0
    ? faqItems.map(item => ({ question: item.question, answer: item.answer }))
    : defaultFaqs;

  // Default section values
  const title = faqSection?.title || "Frequently Asked Questions";
  const description = faqSection?.description ||
    "The FAQs section is designed to address any questions or concerns you may have about using the Legacy Platform. Whether you're curious about how this platform works, how your data is secured, or what steps to take to appoint Trustees and Nominees, we've got you covered.";
  const primaryButtonText = faqSection?.primaryButtonText || "Register Now";
  const primaryButtonLink = faqSection?.primaryButtonLink || "/register";
  const secondaryButtonText = faqSection?.secondaryButtonText || "More Questions?";
  const secondaryButtonLink = faqSection?.secondaryButtonLink || "/faq";

  return (
    <section className="w-full py-16 px-4 bg-white">
      <div className="container mx-auto max-w-4xl">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : (
          <>
            <h2 className="text-4xl font-bold text-center text-blue-900 mb-4">{title}</h2>
            <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
              {description}
            </p>

            <div className="space-y-2">
              {faqs.map((faq, index) => (
                <FAQItem
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openIndex === index}
                  toggleOpen={() => setOpenIndex(openIndex === index ? -1 : index)}
                />
              ))}
            </div>

            <div className="flex justify-center gap-4 mt-12">
              <Link href={primaryButtonLink}>
                <Button className="bg-blue-900 hover:bg-blue-800 text-white px-8">
                  {primaryButtonText}
                </Button>
              </Link>
              <Link href={secondaryButtonLink}>
                <Button variant="outline" className="border-gray-300 text-gray-700 px-8">
                  {secondaryButtonText}
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
