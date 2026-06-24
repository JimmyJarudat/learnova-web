import { mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { canUseLocalAvatarCache, isLocalCachedAvatarUrl } from "./avatar-url";

const avatarDirectory = path.join(process.cwd(), "public", "uploads", "avatars");
const maxAvatarBytes = 2 * 1024 * 1024;
const avatarFetchTimeoutMs = 2500;

const imageExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function getExtension(contentType: string | null) {
  if (!contentType) {
    return null;
  }

  const mimeType = contentType.split(";")[0]?.trim().toLowerCase();

  return mimeType ? imageExtensions[mimeType] ?? null : null;
}

async function removeOldAvatarFiles(userId: string, keepFilename: string) {
  const files = await readdir(avatarDirectory).catch(() => [] as string[]);

  await Promise.all(
    files
      .filter((file) => file.startsWith(`${userId}.`) && file !== keepFilename)
      .map((file) => unlink(path.join(avatarDirectory, file)).catch(() => undefined)),
  );
}

async function fetchWithTimeout(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), avatarFetchTimeoutMs);

  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": "Learnova avatar cache",
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function cacheRemoteAvatar(userId: string, remoteAvatarUrl: string | null) {
  try {
    if (!remoteAvatarUrl) {
      return null;
    }

    if (isLocalCachedAvatarUrl(remoteAvatarUrl)) {
      return remoteAvatarUrl;
    }

    if (!canUseLocalAvatarCache()) {
      return remoteAvatarUrl;
    }

    const response = await fetchWithTimeout(remoteAvatarUrl);

    if (!response.ok) {
      console.warn("Avatar cache skipped: remote returned", response.status);
      return null;
    }

    const extension = getExtension(response.headers.get("content-type"));

    if (!extension) {
      console.warn("Avatar cache skipped: unsupported content type", response.headers.get("content-type"));
      return null;
    }

    const bytes = Buffer.from(await response.arrayBuffer());

    if (bytes.byteLength === 0 || bytes.byteLength > maxAvatarBytes) {
      console.warn("Avatar cache skipped: invalid image size", bytes.byteLength);
      return null;
    }

    await mkdir(avatarDirectory, { recursive: true });

    const filename = `${userId}.${extension}`;
    await writeFile(path.join(avatarDirectory, filename), bytes);
    await removeOldAvatarFiles(userId, filename);

    return `/uploads/avatars/${filename}`;
  } catch (error) {
    console.warn("Avatar cache skipped:", error instanceof Error ? error.message : error);
    return null;
  }
}
