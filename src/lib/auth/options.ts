import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from "next-auth/providers/facebook";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import LineProvider from "next-auth/providers/line";
import { getUsableAvatarUrl } from "@/server/auth/avatar-url";
import { authorizePasswordUser } from "@/server/auth/credentials-user";
import { findOrCreateFacebookUser, findOrCreateGitHubUser, findOrCreateGoogleUser, findOrCreateLineUser } from "@/server/auth/google-user";
import { getOAuthProviderConfig } from "./oauth-config";

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

function buildAuthOptions(googleConfig: { clientId: string; clientSecret: string }): AuthOptions {
  return {
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
      CredentialsProvider({
        name: "Email or username",
        credentials: {
          identifier: { label: "Email or username", type: "text" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          return authorizePasswordUser(credentials?.identifier, credentials?.password);
        },
      }),
      FacebookProvider({
        clientId: process.env.FACEBOOK_CLIENT_ID!,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
        authorization: {
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
        clientId: googleConfig.clientId,
        clientSecret: googleConfig.clientSecret,
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
        if (account?.provider === "credentials") {
          return true;
        }

        return (
          (account?.provider === "facebook" ||
            account?.provider === "google" ||
            account?.provider === "line" ||
            account?.provider === "github") &&
          Boolean(profile)
        );
      },
      async jwt({ token, account, profile, user }) {
        if (account?.provider === "credentials" && user) {
          const credentialsUser = user as typeof user & { username?: string | null };
          token.userId = credentialsUser.id;
          token.username = credentialsUser.username ?? null;
          token.picture = credentialsUser.image ?? null;
        }

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
}

export const authOptions: AuthOptions = buildAuthOptions({
  clientId: process.env.GOOGLE_CLIENT_ID ?? "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
});

export async function getAuthOptions() {
  return buildAuthOptions(await getOAuthProviderConfig("google"));
}

