import React from "react";

export default function ThankYouModal() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-green-100 bg-opacity-80 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center animate-fade-in-up border border-blue-200 relative">
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 border-4 border-green-200 shadow">
            <svg
              className="w-10 h-10 text-green-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="white"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M8 12l2.5 2.5L16 9"
              />
            </svg>
          </span>
        </div>
        <h2 className="text-3xl font-extrabold text-green-700 mb-2 tracking-tight">
          Thank You!
        </h2>
        <p className="text-gray-700 text-lg mb-4">
          Your subscription is now active.
        </p>
        <div className="flex items-center justify-center gap-2 text-blue-700 text-sm font-medium animate-pulse">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
          Redirecting to dashboard...
        </div>
      </div>
      <style jsx>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
