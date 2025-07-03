import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useUserProfile() {
  const [profile, setProfile] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    subscription_status?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("users")
        .select("name,email,phone,subscription_status")
        .eq("id", user.id)
        .single();
      if (error) setError(error.message);
      setProfile(data);
      setLoading(false);
    };
    fetchProfile();
  }, []);

  return { profile, loading, error };
}
