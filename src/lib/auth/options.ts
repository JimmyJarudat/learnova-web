import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from "next-auth/providers/facebook";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import LineProvider from "next-auth/providers/line";
import { getUsableAvatarUrl } from "@/server/auth/avatar-url";
import { authorizePasswordUser } from "@/server/auth/credentials-user";
import { findOrCreateFacebookUser, findOrCreateGitHubUser, findOrCreateGoogleUser, findOrCreateLineUser } from "@/server/auth/google-user";
import { getAuthRuntimeConfig, resolveAuthRuntimeConfig } from "./oauth-config";

type ProviderConfig = {
  clientId: string;
  clientSecret: string;
};

type AuthRuntimeConfig = {
  authUrl: string;
  authSecret: string;
  providers: {
    facebook: ProviderConfig;
    github: ProviderConfig;
    google: ProviderConfig;
    line: ProviderConfig;
  };
};

function toHttpsUrl(host: string | undefined) {
  if (!host) {
    return undefined;
  }

  return host.startsWith("http") ? host : `https://${host}`;
}

function getFallbackAuthUrl() {
  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }

  return (
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    toHttpsUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    toHttpsUrl(process.env.VERCEL_URL) ??
    ""
  );
}

function applyNextAuthEnvironment(config: Pick<AuthRuntimeConfig, "authSecret" | "authUrl">) {
  const authUrl = process.env.NODE_ENV !== "production" ? "http://localhost:3000" : config.authUrl || getFallbackAuthUrl();
  const authSecret = config.authSecret || process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || process.env.ENCRYPTION_SECRET;

  if (authUrl) {
    process.env.NEXTAUTH_URL = authUrl;
  }

  if (authSecret) {
    process.env.NEXTAUTH_SECRET = authSecret;
  }
}

function hasProviderConfig(provider: string, config: ProviderConfig, logMissingProvider: boolean) {
  const isReady = Boolean(config.clientId && config.clientSecret);

  if (!isReady && logMissingProvider) {
    console.error(`[next-auth] ${provider} provider is missing clientId or clientSecret.`);
  }

  return isReady;
}

function buildProviders(config: AuthRuntimeConfig, logMissingProvider: boolean): AuthOptions["providers"] {
  const providers: AuthOptions["providers"] = [
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
  ];

  if (hasProviderConfig("facebook", config.providers.facebook, logMissingProvider)) {
    providers.push(
      FacebookProvider({
        clientId: config.providers.facebook.clientId,
        clientSecret: config.providers.facebook.clientSecret,
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
    );
  }

  if (hasProviderConfig("google", config.providers.google, logMissingProvider)) {
    providers.push(
      GoogleProvider({
        clientId: config.providers.google.clientId,
        clientSecret: config.providers.google.clientSecret,
        authorization: {
          params: {
            scope: "openid email profile",
            prompt: "select_account",
          },
        },
      }),
    );
  }

  if (hasProviderConfig("line", config.providers.line, logMissingProvider)) {
    providers.push(
      LineProvider({
        clientId: config.providers.line.clientId,
        clientSecret: config.providers.line.clientSecret,
        authorization: {
          params: {
            scope: "openid profile email",
          },
        },
      }),
    );
  }

  if (hasProviderConfig("github", config.providers.github, logMissingProvider)) {
    providers.push(
      GitHubProvider({
        clientId: config.providers.github.clientId,
        clientSecret: config.providers.github.clientSecret,
        authorization: {
          params: {
            scope: "read:user user:email",
          },
        },
      }),
    );
  }

  return providers;
}

function buildAuthOptions(config: AuthRuntimeConfig, options: { logMissingProvider?: boolean } = {}): AuthOptions {
  applyNextAuthEnvironment(config);

  return {
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET ?? process.env.ENCRYPTION_SECRET,
    session: {
      strategy: "jwt",
    },
    pages: {
      signIn: "/login",
    },
    debug: process.env.NODE_ENV !== "production",
    logger: {
      error(code) {
        console.error("[next-auth]", code);
      },
    },
    providers: buildProviders(config, options.logMissingProvider ?? true),
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

export const authOptions: AuthOptions = buildAuthOptions(resolveAuthRuntimeConfig([], process.env), { logMissingProvider: false });

export async function getAuthOptions() {
  return buildAuthOptions(await getAuthRuntimeConfig());
}

