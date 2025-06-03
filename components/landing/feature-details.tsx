import { DollarSign, FileText, FilePlus, File, Handshake, Heart } from "lucide-react"

export function FeatureDetails() {
  return (
    <section className="w-full py-16 px-4 bg-blue-50/50">
      <div className="container mx-auto max-w-5xl">
        {/* Features Header */}
        <div className="flex flex-col items-center justify-center mb-12">
          <div className="inline-block rounded-full border border-gray-300 px-6 py-2 mb-6">
            <span className="text-gray-600">Features</span>
          </div>
          <h1 className="text-4xl font-bold text-center text-blue-900 mb-4">
            Simplify Family Life with Smart Features
          </h1>
          <p className="text-center text-gray-600 max-w-3xl">
            Stay organized, set secure permissions, and get peace of mind. With Legacy Keeper's rich functionality to
            protect you, we've got everything you need to keep your family life running smoothly.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Transactions */}
          <div className="bg-green-50 rounded-lg p-8">
            <div className="w-12 h-12 mb-6">
              <DollarSign className="w-full h-full text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-4">Transactions:</h3>
            <p className="text-gray-700">
              Monitor and manage all your <span className="text-green-600 font-medium">financial transactions</span>{" "}
              with ease, receiving status updates in one centralized location.
            </p>
          </div>

          {/* Health Records */}
          <div className="bg-purple-50 rounded-lg p-8">
            <div className="w-12 h-12 mb-6 flex justify-end">
              <FilePlus className="w-full h-full text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-right">Health Records</h3>
            <p className="text-gray-700 text-right">
              Organize <span className="text-purple-600 font-medium">health records</span> for you and your family,
              facilitating better coordination during difficult times.
            </p>
          </div>

          {/* Will and Succession Plan */}
          <div className="bg-teal-50 rounded-lg p-8">
            <div className="w-12 h-12 mb-6">
              <FileText className="w-full h-full text-teal-600" />
            </div>
            <h3 className="text-xl font-bold mb-4">Will and Succession Plan</h3>
            <p className="text-gray-700">
              <span className="text-teal-600 font-medium">Develop a clear plan</span> for seamlessly transitioning your
              personal and professional assets to your successors
            </p>
          </div>

          {/* Document Store */}
          <div className="bg-amber-50 rounded-lg p-8">
            <div className="w-12 h-12 mb-6 flex justify-end">
              <File className="w-full h-full text-amber-700" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-right">Document Store</h3>
            <p className="text-gray-700 text-right">
              Safely store and share your vital{" "}
              <span className="text-amber-700 font-medium">government and educational documents</span> with the
              appropriate parties when necessary.
            </p>
          </div>

          {/* Nominees */}
          <div className="bg-blue-50 rounded-lg p-8">
            <div className="w-12 h-12 mb-6">
              <Handshake className="w-full h-full text-blue-700" />
            </div>
            <h3 className="text-xl font-bold mb-4">Nominees</h3>
            <p className="text-gray-700">
              Thoughtfully plan the{" "}
              <span className="text-blue-700 font-medium">distribution of your assets among your loved ones</span>{" "}
              according to your wishes, sharing them only when you desire.
            </p>
          </div>

          {/* Trustee */}
          <div className="bg-yellow-50 rounded-lg p-8">
            <div className="w-12 h-12 mb-6 flex justify-end">
              <Heart className="w-full h-full text-olive-600" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-right">Trustee</h3>
            <p className="text-gray-700 text-right">
              Designate a <span className="text-olive-600 font-medium">trustee to share essential information</span>{" "}
              with your family members during emergencies, ensuring complete privacy and robust protection mechanisms.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
