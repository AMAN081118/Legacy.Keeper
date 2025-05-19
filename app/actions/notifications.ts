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
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);

    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user.user) {
      throw new Error("User not authenticated");
    }

    await getReceivedNomineeRequests();

    const notifications: Notification[] = [];

    // 1. Get pending nominees where the current user is the inviter (sent invitations)
    const { data: sentNominees, error: sentNomineesError } = await supabase
      .from("nominees")
      .select("*")
      .eq("user_id", user.user.id)
      .eq("status", "pending")
      .order("invitation_sent_at", { ascending: false });

    if (!sentNomineesError && sentNominees) {
      // Format sent nominees as notifications
      const sentNotifications: Notification[] = sentNominees.map((nominee) => ({
        id: `sent_${nominee.id}`,
        title: "Pending Invitation",
        message: `Invitation to ${nominee.name} (${nominee.email}) is pending a response.`,
        type: "invitation_sent",
        createdAt: nominee.invitation_sent_at || nominee.created_at,
        read: false,
        data: {
          nomineeId: nominee.id,
        },
      }));

      notifications.push(...sentNotifications);
    }

    // 2. Get pending nominees where the current user is the nominee (received invitations)
    const email = user.user.email || "";
    const { data: receivedNominees, error: receivedNomineesError } = await supabase
      .from("nominees")
      .select("*");
    const { data: allNominees } = await supabase
      .from("nominees")
      .select("*");

    if (!receivedNomineesError && receivedNominees && receivedNominees.length > 0) {
      // Fetch user details for each inviter
      const inviterIds = receivedNominees.map((nominee) => nominee.user_id);
      const { data: inviters } = await supabase
        .from("users")
        .select("id, name, email")
        .in("id", inviterIds);

      // Create a map of inviter details for quick lookup
      const inviterMap = new Map();
      if (inviters) {
        inviters.forEach((inviter) => {
          inviterMap.set(inviter.id, inviter);
        });
      }

      // Format received nominees as notifications
      const receivedNotifications: Notification[] = receivedNominees.map((nominee) => {
        const inviter = inviterMap.get(nominee.user_id);

        return {
          id: `received_${nominee.id}`,
          title: "Nominee Request",
          message: `You have been nominated by ${inviter?.name || inviter?.email || "a user"}.`,
          type: "invitation_received",
          createdAt: nominee.invitation_sent_at || nominee.created_at,
          read: false,
          data: {
            nomineeId: nominee.id,
            inviterId: nominee.user_id,
            inviterName: inviter?.name || inviter?.email,
            invitationToken: nominee.invitation_token,
            onboardingUrl: `/nominee-onboarding/status?token=${encodeURIComponent(nominee.invitation_token)}`,
          },
        };
      });

      notifications.push(...receivedNotifications);
    }

    // Sort all notifications by date (newest first)
    return notifications.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
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
