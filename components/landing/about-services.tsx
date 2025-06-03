import { DollarSign, FileText, FilePlus, File, Handshake, Shield } from "lucide-react"


export function AboutServices() {
  return (
    <section className="w-full py-16 px-4 bg-white">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl font-bold text-center text-blue-900 mb-4">What We Offer</h2>
        <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
          Legacy Keeper provides a comprehensive suite of tools designed to help families organize, secure, and share
          their most important information when it matters most.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Organized Financial Management */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Organized Financial Management</h3>
            <p className="text-gray-600">Track recurring payments, loans, debts, and investments efficiently.</p>
          </div>

          {/* Centralized Document Storage */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <File className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Centralized Document Storage</h3>
            <p className="text-gray-600">Securely store important family documents for quick access in emergencies.</p>
          </div>

          {/* Health Record Management */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <FilePlus className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Health Record Management</h3>
            <p className="text-gray-600">Maintain health records for better care during difficult times.</p>
          </div>

          {/* Succession Planning Made Simple */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Succession Planning Made Simple</h3>
            <p className="text-gray-600">
              Track recurring payments, loans, debts, and investments for worry-free legacy planning.
            </p>
          </div>

          {/* Trustee and Nominee Facilitation */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <Handshake className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Trustee and Nominee Facilitation</h3>
            <p className="text-gray-600">Appoint trusted individuals to access information in emergencies.</p>
          </div>

          {/* Digital Account Security */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Digital Account Security</h3>
            <p className="text-gray-600">
              Safeguard login credentials for banking, subscriptions, and more in one secure location.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
