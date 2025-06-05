import { ContactForm } from "@/components/landing/contact-form"

export const metadata = {
  title: "Contact Us - Legacy Keeper",
  description: "Get in touch with Legacy Keeper. We're here to help with any questions, support, or feedback.",
}

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <ContactForm />
    </main>
  )
}
