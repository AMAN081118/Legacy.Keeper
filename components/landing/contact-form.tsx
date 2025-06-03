"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Phone, MapPin } from "lucide-react"

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      setSubmitMessage("Thank you for your message! We'll get back to you soon.")
      setFormData({ name: "", email: "", phone: "", message: "" })
      setIsSubmitting(false)
    }, 1500)
  }

  return (
    <section className="w-full py-16 px-4 bg-blue-50/50">
      <div className="container mx-auto max-w-5xl">
        {/* Contact Header */}
        <div className="flex flex-col items-center justify-center mb-12">
          <div className="inline-block rounded-full border border-gray-300 px-6 py-2 mb-6 bg-white">
            <span className="text-gray-600">Contact</span>
          </div>
          <h1 className="text-4xl font-bold text-center text-blue-900 mb-4">
            Stay connected with us. Let's talk about what matters to you!
          </h1>
          <p className="text-center text-gray-600 max-w-3xl">
            Have questions, need assistance, or want to collaborate? We're here to help! Reach out to us for any
            inquiries, support, or feedback—we'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter Your Name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Id
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter Your Email"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter Your Phone Number"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Enter Your Message"
                    rows={5}
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-blue-900 hover:bg-blue-800" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>

                {submitMessage && (
                  <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">{submitMessage}</div>
                )}
              </form>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            {/* Chat With Us */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Chat With Us</h3>
              <p className="text-gray-600 mb-4">Speak to our friendly team via live chat</p>
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 text-blue-600 mr-2" />
                <a href="#" className="text-blue-600 hover:underline">
                  Start a chat
                </a>
              </div>
              <div className="flex items-center mt-2">
                <MessageSquare className="h-5 w-5 text-blue-600 mr-2" />
                <a href="#" className="text-blue-600 hover:underline">
                  Raise an email
                </a>
              </div>
              <div className="flex items-center mt-2">
                <MessageSquare className="h-5 w-5 text-blue-600 mr-2" />
                <a href="#" className="text-blue-600 hover:underline">
                  Message on our X
                </a>
              </div>
            </div>

            {/* Call Us */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Call Us</h3>
              <p className="text-gray-600 mb-4">Call our team Mon-Fri from 9am to 5pm</p>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-blue-600 mr-2" />
                <a href="tel:+911234567890" className="text-blue-600 hover:underline">
                  +91 1234567890
                </a>
              </div>
            </div>

            {/* Visit Us */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Visit Us</h3>
              <p className="text-gray-600 mb-4">If you want to meet us come to office</p>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-1" />
                <address className="not-italic text-gray-600">
                  Vinayagar Tech Street,
                  <br />
                  Koramangala, Chennai
                </address>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
