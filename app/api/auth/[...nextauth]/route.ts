import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/src/lib/db";
import { verifyPassword } from "@/src/lib/auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email/Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credentials.email },
              { phone: credentials.email },
            ],
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isValid = await verifyPassword(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileId: user.profileId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.profileId = user.profileId;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).profileId = token.profileId;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "default_nextauth_secret",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
