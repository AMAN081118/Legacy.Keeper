"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RequestTabs } from "@/components/requests/request-tabs";
import { RequestsHeader } from "@/components/requests/requests-header";
import { createClient } from "@/lib/supabase/client";

export default function RequestsPageClient({ userData, requestsReceived, requestsSent }: any) {
  const [received, setReceived] = useState(requestsReceived || []);
  const [sent, setSent] = useState(requestsSent || []);
  const router = useRouter();

  // Fetch latest requests for the current user
  const fetchRequests = useCallback(async () => {
    const supabase = createClient();
    // Get current user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return;
    const userId = authData.user.id;
    // Fetch received requests
    const { data: receivedData } = await supabase
      .from("requests")
      .select("*, sender:user_id(name, email)")
      .eq("recipient_id", userId);
    // Fetch sent requests
    const { data: sentData } = await supabase
      .from("requests")
      .select("*, recipient:recipient_id(name, email)")
      .eq("user_id", userId);
    setReceived(receivedData || []);
    setSent(sentData || []);
  }, []);

  // Optionally, keep initial SSR data in sync on mount
  useEffect(() => {
    setReceived(requestsReceived || []);
    setSent(requestsSent || []);
  }, [requestsReceived, requestsSent]);

  return (
    <div className="space-y-6">
      <RequestsHeader userData={userData} />
      <RequestTabs
        requestsReceived={received}
        requestsSent={sent}
        refreshRequests={fetchRequests}
      />
    </div>
  );
} 