import crypto from "node:crypto";
import type { Account, Profile } from "next-auth";
import type { GoogleProfile } from "next-auth/providers/google";
import { db } from "@/lib/db/postgres";

type AuthUser = {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
};

type GoogleAccountInput = {
  account: Account;
  profile: Profile | GoogleProfile;
};

function getGoogleProfile(profile: Profile | GoogleProfile) {
  const googleProfile = profile as GoogleProfile;
  const email = googleProfile.email?.toLowerCase();
  const providerAccountId = googleProfile.sub;

  if (!email) {
    throw new Error("Google profile did not include an email address.");
  }

  if (!providerAccountId) {
    throw new Error("Google profile did not include a subject identifier.");
  }

  return {
    email,
    providerAccountId,
    displayName: googleProfile.name ?? email,
    avatarUrl: googleProfile.picture ?? null,
    emailVerifiedAt: googleProfile.email_verified ? new Date() : null,
  };
}

function baseUsernameFromEmail(email: string) {
  const [localPart] = email.split("@");
  const username = localPart.toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");

  return username || "user";
}

async function createAvailableUsername(email: string) {
  const baseUsername = baseUsernameFromEmail(email).slice(0, 24);
  let username = baseUsername;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const existing = await db.query('select 1 from "users" where "username" = $1 limit 1', [username]);

    if (existing.rowCount === 0) {
      return username;
    }

    username = `${baseUsername}_${crypto.randomInt(1000, 9999)}`;
  }

  return `${baseUsername}_${crypto.randomUUID().slice(0, 8)}`;
}

async function findUserBySocialAccount(providerAccountId: string) {
  const result = await db.query<AuthUser>(
    `select u."id", u."username", u."email", u."displayName", u."avatarUrl"
     from "users" u
     inner join "social_accounts" sa on sa."userId" = u."id"
     where sa."provider" = 'GOOGLE' and sa."providerAccountId" = $1 and u."deletedAt" is null
     limit 1`,
    [providerAccountId],
  );

  return result.rows[0] ?? null;
}

async function findUserByEmail(email: string) {
  const result = await db.query<AuthUser>(
    `select "id", "username", "email", "displayName", "avatarUrl"
     from "users"
     where "email" = $1 and "deletedAt" is null
     limit 1`,
    [email],
  );

  return result.rows[0] ?? null;
}

async function createUser(input: {
  email: string;
  displayName: string;
  avatarUrl: string | null;
  emailVerifiedAt: Date | null;
}) {
  const id = crypto.randomUUID();
  const username = await createAvailableUsername(input.email);
  const result = await db.query<AuthUser>(
    `insert into "users" (
       "id", "username", "email", "displayName", "avatarUrl", "emailVerifiedAt", "lastLoginAt", "updatedAt"
     ) values ($1, $2, $3, $4, $5, $6, now(), now())
     returning "id", "username", "email", "displayName", "avatarUrl"`,
    [id, username, input.email, input.displayName, input.avatarUrl, input.emailVerifiedAt],
  );

  return result.rows[0];
}

async function touchUser(userId: string, input: { displayName: string; avatarUrl: string | null }) {
  const result = await db.query<AuthUser>(
    `update "users"
     set "displayName" = coalesce("displayName", $2),
         "avatarUrl" = coalesce($3, "avatarUrl"),
         "lastLoginAt" = now(),
         "updatedAt" = now()
     where "id" = $1
     returning "id", "username", "email", "displayName", "avatarUrl"`,
    [userId, input.displayName, input.avatarUrl],
  );

  return result.rows[0];
}

async function upsertGoogleSocialAccount(userId: string, input: GoogleAccountInput) {
  const googleProfile = getGoogleProfile(input.profile);
  const expiresAt = input.account.expires_at ? new Date(input.account.expires_at * 1000) : null;

  await db.query(
    `insert into "social_accounts" (
       "id", "userId", "provider", "providerAccountId", "providerEmail",
       "accessToken", "refreshToken", "expiresAt", "tokenType", "scope", "idToken", "updatedAt"
     ) values ($1, $2, 'GOOGLE', $3, $4, $5, $6, $7, $8, $9, $10, now())
     on conflict ("userId", "provider") do update set
       "providerAccountId" = excluded."providerAccountId",
       "providerEmail" = excluded."providerEmail",
       "accessToken" = excluded."accessToken",
       "refreshToken" = coalesce(excluded."refreshToken", "social_accounts"."refreshToken"),
       "expiresAt" = excluded."expiresAt",
       "tokenType" = excluded."tokenType",
       "scope" = excluded."scope",
       "idToken" = excluded."idToken",
       "updatedAt" = now()`,
    [
      crypto.randomUUID(),
      userId,
      googleProfile.providerAccountId,
      googleProfile.email,
      input.account.access_token ?? null,
      input.account.refresh_token ?? null,
      expiresAt,
      input.account.token_type ?? null,
      input.account.scope ?? null,
      input.account.id_token ?? null,
    ],
  );
}

export async function findOrCreateGoogleUser(input: GoogleAccountInput) {
  const googleProfile = getGoogleProfile(input.profile);
  const socialUser = await findUserBySocialAccount(googleProfile.providerAccountId);

  if (socialUser) {
    const user = await touchUser(socialUser.id, googleProfile);
    await upsertGoogleSocialAccount(user.id, input);
    return user;
  }

  const existingUser = await findUserByEmail(googleProfile.email);
  const user = existingUser
    ? await touchUser(existingUser.id, googleProfile)
    : await createUser(googleProfile);

  await upsertGoogleSocialAccount(user.id, input);
  return user;
}
