import Image from "next/image"
import { CreditCard, ShieldCheck, RefreshCcw } from "lucide-react"

export function PaymentFeatures() {
  return (
    <section className="w-full py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Accepted Payment Options */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-48">
              <Image src="/diverse-payment-methods.png" alt="Payment options" fill className="object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end p-6">
                <h3 className="text-white text-xl font-bold">Accepted payment options</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-start mb-4">
                <CreditCard className="h-6 w-6 text-blue-600 mr-2 flex-shrink-0 mt-1" />
                <p className="text-gray-700">
                  We accept all major credit cards, UPI, and net banking options for your convenience.
                </p>
              </div>
            </div>
          </div>

          {/* Safe Payments */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-48">
              <Image src="/digital-lock-payment.png" alt="Secure payment" fill className="object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end p-6">
                <h3 className="text-white text-xl font-bold">Safe payments</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-start mb-4">
                <ShieldCheck className="h-6 w-6 text-green-600 mr-2 flex-shrink-0 mt-1" />
                <p className="text-gray-700">
                  Your payment information is encrypted and securely processed. We never store your card details.
                </p>
              </div>
            </div>
          </div>

          {/* Easy Cancellation */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-48">
              <Image src="/sad-tablet.png" alt="Easy cancellation" fill className="object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end p-6">
                <h3 className="text-white text-xl font-bold">Easy cancellation</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-start mb-4">
                <RefreshCcw className="h-6 w-6 text-purple-600 mr-2 flex-shrink-0 mt-1" />
                <p className="text-gray-700">
                  Cancel your subscription anytime with no questions asked. We provide a hassle-free experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
