"use client";
import PermissionRequired from "./permission-required";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface PermissionRequiredClientProps {
  missingSections: string[];
  nomineeEmail?: string;
  nomineeName?: string;
}

export default function PermissionRequiredClient({ missingSections, nomineeEmail, nomineeName }: PermissionRequiredClientProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleRequestAccess = async (sections: string[], message: string) => {
    setLoading(true);
    try {
      if (!nomineeEmail) {
        toast({
          title: "Error",
          description: "Nominee email not found.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      const res = await fetch("/api/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomineeEmail,
          nomineeName,
          requestedSections: sections,
          message,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({
          title: "Request Sent",
          description: "Your access request has been sent to your trustee.",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: data?.error || "Failed to send request.",
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to send request.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PermissionRequired
      missingSections={missingSections}
      onRequest={handleRequestAccess}
    />
  );
} 