import type { AuthOptions } from "next-auth";
import FacebookProvider from "next-auth/providers/facebook";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import LineProvider from "next-auth/providers/line";
import { getUsableAvatarUrl } from "@/server/auth/avatar-url";
import { findOrCreateFacebookUser, findOrCreateGitHubUser, findOrCreateGoogleUser, findOrCreateLineUser } from "@/server/auth/google-user";

function toHttpsUrl(host: string | undefined) {
  if (!host) {
    return undefined;
  }

  return host.startsWith("http") ? host : `https://${host}`;
}

function getAuthUrl() {
  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }

  return (
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    toHttpsUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    toHttpsUrl(process.env.VERCEL_URL)
  );
}

const authUrl = getAuthUrl();

if (authUrl) {
  process.env.NEXTAUTH_URL = authUrl;
}

if (!process.env.NEXTAUTH_SECRET && process.env.AUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = process.env.AUTH_SECRET;
}

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV !== "production",
  logger: {
    error(code, ...message) {
      console.error("[next-auth]", code, ...message);
    },
  },
  providers: [
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID ?? "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? "",
      authorization: {
        url: "https://www.facebook.com/v11.0/dialog/oauth",
        params: {
          scope: "public_profile",
        },
      },
      userinfo: {
        url: "https://graph.facebook.com/me",
        params: {
          fields: "id,name,picture",
        },
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          scope: "openid email profile",
          prompt: "select_account",
        },
      },
    }),
    LineProvider({
      clientId: process.env.LINE_CLIENT_ID ?? "",
      clientSecret: process.env.LINE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          scope: "read:user user:email",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      return (
        (account?.provider === "facebook" ||
          account?.provider === "google" ||
          account?.provider === "line" ||
          account?.provider === "github") &&
        Boolean(profile)
      );
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === "facebook" && profile) {
        const user = await findOrCreateFacebookUser({ account, profile });
        token.userId = user.id;
        token.username = user.username;
        token.picture = getUsableAvatarUrl(user.avatarUrl);
      }

      if (account?.provider === "google" && profile) {
        const user = await findOrCreateGoogleUser({ account, profile });
        token.userId = user.id;
        token.username = user.username;
        token.picture = getUsableAvatarUrl(user.avatarUrl);
      }

      if (account?.provider === "line" && profile) {
        const user = await findOrCreateLineUser({ account, profile });
        token.userId = user.id;
        token.username = user.username;
        token.picture = getUsableAvatarUrl(user.avatarUrl);
      }

      if (account?.provider === "github" && profile) {
        const user = await findOrCreateGitHubUser({ account, profile });
        token.userId = user.id;
        token.username = user.username;
        token.picture = getUsableAvatarUrl(user.avatarUrl);
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId ?? "";
        session.user.username = token.username ?? null;
        session.user.image = getUsableAvatarUrl(token.picture);
      }

      return session;
    },
  },
};




