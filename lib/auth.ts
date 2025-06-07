import { NextAuthOptions } from "next-auth"
import { SupabaseAdapter } from "@auth/supabase-adapter"
import { createClient } from "@/lib/supabase/client"

export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user = {
          ...session.user,
          id: token.sub!,
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
} 