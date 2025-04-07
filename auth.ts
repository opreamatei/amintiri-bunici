import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { client } from "./sanity/lib/client";
import { writeClient } from "@/sanity/lib/write-client";
import { AUTHOR_BY_GOOGLE_ID_QUERY } from "@/sanity/lib/queries"; // You should update this query to search by Google ID

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    authorization: {
      params: {
        prompt: "consent",
        access_type: "offline",
        response_type: "code",
        scope: "openid email profile",
      },
    },
  })],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // Check if the user exists in Sanity
      const existingUser = await client.fetch(AUTHOR_BY_GOOGLE_ID_QUERY, {
        id: profile?.sub, // Google unique ID
      });

      console.log({ existingUser, profile, user });

      if (!existingUser) {
        // User not found in Sanity, create a new user document
        await writeClient.create({
          _type: "author",
          _id: profile?.sub,
          name: user?.name,
          username: profile?.email?.split("@")[0] || "", // Use local part of email as fallback username
          email: user?.email,
          image: user?.image,
          bio: "", // Google profile doesn't include bio by default
        });
      }
      console.log("signIn callback:", { user, profile, account });
      return true;
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const user = await client.fetch(AUTHOR_BY_GOOGLE_ID_QUERY, {
          id: profile?.sub,
        });

        token.id = user._id;
      }
      return token;
    },
    async session({ session, token }) {
      Object.assign(session, { id: token.id });
      return session;
    },
  },
});
