"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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
          <ChevronUp className="h-5 w-5 text-blue-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
        )}
      </button>
      {isOpen && <div className="mt-4 text-gray-600">{answer}</div>}
    </div>
  )
}

export function PricingFAQ() {
  const [openIndex, setOpenIndex] = useState(0)

  const faqs = [
    {
      question: "Where do you offer? How much is the Charges for shipping?",
      answer:
        "Legacy Keeper is a digital platform, so there's no shipping involved. Our service is available worldwide and can be accessed from any device with an internet connection.",
    },
    {
      question: "Do you provide available mobile app? What about platform support?",
      answer:
        "Yes, we offer mobile apps for both iOS and Android platforms. Our service is also accessible via web browsers on desktop and laptop computers, ensuring you can access your information from any device.",
    },
    {
      question: "How can I pay for my plan?",
      answer:
        "We accept various payment methods including credit/debit cards, UPI, net banking, and popular digital wallets. All payments are processed securely through our payment gateway partners.",
    },
    {
      question: "I want to appreciate extra assistance in selecting my products. What options do I have?",
      answer:
        "We're happy to help! You can schedule a free consultation call with our customer support team who can guide you through our products and help you choose the right plan for your needs. Simply contact us through the 'Contact Us' page.",
    },
    {
      question: "Can I make a refund?",
      answer:
        "Yes, we offer a 30-day money-back guarantee if you're not satisfied with our service. Simply contact our customer support team within 30 days of your purchase to process your refund.",
    },
  ]

  return (
    <section className="w-full py-16 px-4 bg-white">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-3xl font-bold text-center text-blue-900 mb-4">
          Still have Questions About Pricing & Plans?
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
          We've compiled some of the most frequently asked questions about our pricing and plans. If you don't find the
          answer you're looking for, feel free to contact our support team.
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
          <Button className="bg-blue-900 hover:bg-blue-800 text-white px-8">Register Now</Button>
          <Link href="/faq">
            <Button variant="outline" className="border-gray-300 text-gray-700 px-8">
              More Questions?
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
