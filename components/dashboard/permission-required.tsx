"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface PermissionRequiredProps {
  missingSections: string[];
  onRequest?: (sections: string[], message: string) => void;
}

export default function PermissionRequired({ missingSections, onRequest }: PermissionRequiredProps) {
  const hasAllAccess = missingSections.length === 0;
  const [selectedSections, setSelectedSections] = useState<string[]>(missingSections);
  const [message, setMessage] = useState("");

  const toggleSection = (section: string) => {
    setSelectedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const handleRequest = () => {
    if (onRequest && selectedSections.length > 0) {
      onRequest(selectedSections, message);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center bg-white rounded-lg shadow p-8 mt-8">
      <div className="flex-1 flex justify-center">
        <Image src="/nominee_dashboard.png" alt="Permission Required" width={250} height={200} />
      </div>
      <div className="flex-1 mt-6 md:mt-0 md:ml-8">
        <h2 className="text-2xl font-bold mb-2">Permission Required for Access</h2>
        {hasAllAccess ? (
          <p className="mb-4 text-green-700 font-semibold">You have access to all sections.</p>
        ) : (
          <>
            <p className="mb-4 text-gray-600">
              You don't have access to {missingSections.map((s, i) => (
                <span key={s} className="font-semibold text-blue-700">
                  {s}{i < missingSections.length - 1 ? ", " : ""}
                </span>
              ))}.
              Select the sections you want to request access for:
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {missingSections.map((section) => {
                const selected = selectedSections.includes(section);
                return (
                  <button
                    type="button"
                    key={section}
                    className={`flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-base font-medium mr-2 mb-2 transition-colors ${selected ? "text-gray-800" : "text-gray-400 bg-gray-100 border-gray-200"}`}
                    style={{ boxShadow: "0 1px 2px rgba(16,30,54,0.04)" }}
                    onClick={() => toggleSection(section)}
                  >
                    {section}
                    <span
                      className="ml-2 text-gray-400 hover:text-gray-600"
                      aria-label={`Toggle ${section}`}
                    >
                      &#10005;
                    </span>
                  </button>
                );
              })}
            </div>
            <label className="block mb-2 font-medium">Message (Optional)</label>
            <textarea
              className="w-full border rounded p-2 mb-4"
              rows={3}
              placeholder="Type your message here..."
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
            <Button
              className="w-full mt-2"
              onClick={handleRequest}
              disabled={selectedSections.length === 0}
            >
              Request Access
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
