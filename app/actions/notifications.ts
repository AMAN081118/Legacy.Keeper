"use server";

import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: "invitation_sent" | "invitation_received" | "system" | "alert";
  createdAt: string;
  read: boolean;
  data?: {
    nomineeId?: string;
    inviterId?: string;
    inviterName?: string;
    invitationToken?: string;
    onboardingUrl?: string;
    [key: string]: any;
  };
};

export async function getNotifications(): Promise<Notification[]> {
  try {
    const supabase = createServerClient();

    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user.user) {
      throw new Error("User not authenticated");
    }

    // Fetch notifications for the current user
    const { data: notifications, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }

    return notifications || [];
  } catch (error) {
    return [];
  }
}

export async function getReceivedNomineeRequests() {
  try {
    const supabase = createServerClient();
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user.user) {
      throw new Error("User not authenticated");
    }
    const email = user.user.email || "";
    // Fetch all nominee requests for the logged-in user (case-insensitive)
    const { data: receivedNominees, error } = await supabase
      .from("nominees")
      .select("*")
      .ilike("email", email);
    if (error) {
      return [];
    }
    return receivedNominees;
  } catch (error) {
    return [];
  }
}

export async function markAllNotificationsRead() {
  try {
    const supabase = createServerClient();
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user.user) return;

    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.user.id)
      .eq("read", false);
  } catch (error) {
    // handle error
  }
}

export async function deleteNotification(id: string) {
  try {
    const supabase = createServerClient();
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user.user) return { success: false };
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id)
      .eq("user_id", user.user.id);
    if (error) return { success: false };
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function markNotificationAsRead(id: string) {
  try {
    const supabase = createServerClient();
    // ... existing code ...
  } catch (error) {
    // ... existing code ...
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const supabase = createServerClient();
    // ... existing code ...
  } catch (error) {
    // ... existing code ...
  }
}

export async function getUnreadNotificationCount() {
  try {
    const supabase = createServerClient();
    // ... existing code ...
  } catch (error) {
    // ... existing code ...
  }
}
