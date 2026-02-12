import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ account, profile }) {
      // Allow all Google accounts (can restrict by domain later)
      return true;
    },
    async session({ session, token }) {
      return session;
    },
  },
});

export { handler as GET, handler as POST };
