export function isLocalCachedAvatarUrl(avatarUrl: string | null | undefined) {
  return avatarUrl?.startsWith("/uploads/avatars/") ?? false;
}

export function canUseLocalAvatarCache() {
  return process.env.NODE_ENV !== "production";
}

export function getUsableAvatarUrl(avatarUrl: string | null | undefined) {
  if (!avatarUrl) {
    return null;
  }

  if (isLocalCachedAvatarUrl(avatarUrl) && !canUseLocalAvatarCache()) {
    return null;
  }

  return avatarUrl;
}
