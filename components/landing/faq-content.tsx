"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { getAllFAQCategoriesWithQuestions, type FAQCategory } from "@/lib/landing/api"

// Define a type for the default FAQ categories
type DefaultFAQCategory = {
  id: string;
  categoryId: string;
  label: string;
  questions: {
    question: string;
    answer: string;
  }[];
}

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

// Default FAQ categories in case API fails or data is not available
const defaultFaqCategories: DefaultFAQCategory[] = [
  {
    id: "general",
    categoryId: "general",
    label: "General",
    questions: [
      {
        question: "Where do you ship? How much is the Charges for shipping?",
        answer:
          "Legacy Keeper is a digital platform, so there's no shipping involved. Our service is available worldwide and can be accessed from any device with an internet connection.",
      },
      {
        question: "Do the prices on website include taxes? What about custom duty?",
        answer:
          "Yes, all prices displayed on our website are inclusive of applicable taxes. Since we're a digital service, there are no custom duties involved.",
      },
      {
        question: "How can I pay for my order?",
        answer:
          "We accept various payment methods including credit/debit cards, UPI, net banking, and popular digital wallets. All payments are processed securely through our payment gateway partners.",
      },
      {
        question: "I would appreciate some assistance in selecting my products. What options do I have?",
        answer:
          "We're happy to help! You can schedule a free consultation call with our customer support team who can guide you through our products and help you choose the right plan for your needs. Simply contact us through the 'Contact Us' page.",
      },
      {
        question: "Is the website accessible on mobile devices?",
        answer:
          "Yes, Legacy Keeper is fully responsive and works seamlessly on smartphones, tablets, and desktop computers. We also offer dedicated mobile apps for iOS and Android for an enhanced experience.",
      },
      {
        question: "What features does the platform offer?",
        answer:
          "Our platform offers a comprehensive suite of features including financial management, document storage, health record management, succession planning, trustee and nominee facilitation, and digital account security. Visit our Features page for more details.",
      },
    ],
  },
  {
    id: "pricing",
    categoryId: "pricing",
    label: "Pricing",
    questions: [
      {
        question: "What are the different pricing plans available?",
        answer:
          "We offer three plans: a Free Trial (15 days), Basic Plan (₹600/year), and Premium Plan (₹1500/year). Each plan offers different features and benefits to suit your needs.",
      },
      {
        question: "Can I upgrade or downgrade my plan later?",
        answer:
          "Yes, you can upgrade your plan at any time. Downgrading is available at the end of your current billing cycle.",
      },
      {
        question: "Do you offer refunds?",
        answer:
          "Yes, we offer a 30-day money-back guarantee if you're not satisfied with our service. Contact our support team within 30 days of purchase to process your refund.",
      },
      {
        question: "Are there any hidden fees?",
        answer:
          "No, there are no hidden fees. The price you see is the price you pay, with all features clearly listed for each plan.",
      },
    ],
  },
  {
    id: "policy",
    categoryId: "policy",
    label: "Policy",
    questions: [
      {
        question: "How is my data protected?",
        answer:
          "We use industry-standard encryption and security measures to protect your data. Our platform is built with privacy and security as top priorities, and we never share your information with third parties without your explicit consent.",
      },
      {
        question: "What is your privacy policy?",
        answer:
          "Our privacy policy outlines how we collect, use, and protect your personal information. You can view our complete privacy policy on our website.",
      },
      {
        question: "Can I delete my account and all my data?",
        answer:
          "Yes, you have complete control over your data. You can delete your account and all associated data at any time through your account settings.",
      },
    ],
  },
  {
    id: "nominee",
    categoryId: "nominee",
    label: "Nominee",
    questions: [
      {
        question: "Can I create different roles for family members?",
        answer:
          "Yes, you can assign different roles and access levels to family members, such as viewers, contributors, or administrators, depending on what information you want them to see or manage.",
      },
      {
        question: "How do I add nominees to my account?",
        answer:
          "You can add nominees through your account dashboard. Navigate to the 'Nominees' section, click 'Add Nominee', and enter their details. You can specify what information they can access and under what conditions.",
      },
      {
        question: "Can nominees access my information without my consent?",
        answer:
          "No, nominees cannot access your information without your consent. You control exactly what information is shared and when it becomes accessible to them.",
      },
    ],
  },
  {
    id: "trustee",
    categoryId: "trustee",
    label: "Trustee",
    questions: [
      {
        question: "Can I control who sees what information?",
        answer:
          "Absolutely. Our platform gives you granular control over who can see what information. You can set specific permissions for each trustee and nominee.",
      },
      {
        question: "What should I do if I encounter a technical issue?",
        answer:
          "If you encounter any technical issues, please contact our support team through the Help Center, email, or live chat. We're available to assist you promptly.",
      },
      {
        question: "Do you offer customer support?",
        answer:
          "Yes, we offer comprehensive customer support through multiple channels including email, live chat, and phone. Our support team is available Monday through Friday from 9am to 5pm.",
      },
      {
        question: "Can we set reminders and notifications?",
        answer:
          "Yes, you can set up reminders and notifications for important dates, document renewals, payment due dates, and more. These can be delivered via email, SMS, or push notifications through our mobile app.",
      },
      {
        question: "Does the platform support shared expenses and budgeting?",
        answer:
          "Yes, our Premium plan includes features for tracking shared family expenses and creating budgets that can be accessed by designated family members.",
      },
    ],
  },
]

export function FAQContent() {
  const [activeCategory, setActiveCategory] = useState("general")
  const [openQuestionIndex, setOpenQuestionIndex] = useState(0)
  const [faqCategories, setFaqCategories] = useState<(FAQCategory | DefaultFAQCategory)[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFAQData = async () => {
      try {
        setIsLoading(true)

        // Try direct fetch first
        try {
          const directResponse = await fetch('http://localhost:1337/api/faq-categories?populate=*');
          const directData = await directResponse.json();
          console.log("Direct fetch response for FAQ categories:", directData);

          if (directData && directData.data && directData.data.length > 0) {
            // Get questions for each category
            const categoriesWithQuestions = await Promise.all(
              directData.data.map(async (category: FAQCategory) => {
                try {
                  const questionsResponse = await fetch(
                    `http://localhost:1337/api/faq-category-questions?filters[category][categoryId][$eq]=${category.categoryId}`
                  );
                  const questionsData = await questionsResponse.json();
                  console.log(`Questions for category ${category.categoryId}:`, questionsData);

                  return {
                    ...category,
                    questions: questionsData.data || []
                  };
                } catch (err) {
                  console.warn(`Error fetching questions for category ${category.categoryId}:`, err);
                  return {
                    ...category,
                    questions: []
                  };
                }
              })
            );

            setFaqCategories(categoriesWithQuestions);
            console.log("Setting FAQ categories with questions:", categoriesWithQuestions);
          } else {
            console.warn("No FAQ categories found in direct fetch");

            // Fall back to API service
            const categories = await getAllFAQCategoriesWithQuestions();
            if (categories && categories.length > 0) {
              setFaqCategories(categories);
              console.log("Setting FAQ categories from API service:", categories);
            } else {
              console.warn("No FAQ categories returned from API service, using defaults");
              setFaqCategories(defaultFaqCategories);
            }
          }
        } catch (directErr) {
          console.warn("Direct fetch for FAQ categories failed:", directErr);

          // Fall back to API service
          const categories = await getAllFAQCategoriesWithQuestions();
          if (categories && categories.length > 0) {
            setFaqCategories(categories);
            console.log("Setting FAQ categories from API service:", categories);
          } else {
            console.warn("No FAQ categories returned from API service, using defaults");
            setFaqCategories(defaultFaqCategories);
          }
        }
      } catch (err) {
        console.error("Error fetching FAQ data:", err);
        setError("Failed to load FAQ data");
        setFaqCategories(defaultFaqCategories);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFAQData();
  }, []);

  // If no categories are loaded yet, use the default ones
  const displayCategories = faqCategories.length > 0 ? faqCategories : defaultFaqCategories;

  // Find the active category and its questions
  const activeQuestions = displayCategories.find((category) => category.categoryId === activeCategory)?.questions || [];

  // Format questions for display
  const formattedQuestions = activeQuestions.map((question: any) => ({
    question: question.question,
    answer: question.answer
  }));

  return (
    <div>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : (
        <>
          {/* Category Tabs */}
          <div className="flex overflow-x-auto mb-8 bg-white rounded-lg">
            {displayCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setActiveCategory(category.categoryId)
                  setOpenQuestionIndex(0)
                }}
                className={cn(
                  "px-6 py-3 text-sm font-medium whitespace-nowrap",
                  activeCategory === category.categoryId ? "bg-blue-900 text-white" : "text-gray-700 hover:bg-gray-100",
                )}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            {formattedQuestions.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openQuestionIndex === index}
                toggleOpen={() => setOpenQuestionIndex(openQuestionIndex === index ? -1 : index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
