import { mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const avatarDirectory = path.join(process.cwd(), "public", "uploads", "avatars");
const maxAvatarBytes = 2 * 1024 * 1024;

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

export async function cacheRemoteAvatar(userId: string, remoteAvatarUrl: string | null) {
  if (!remoteAvatarUrl) {
    return null;
  }

  if (remoteAvatarUrl.startsWith("/uploads/avatars/")) {
    return remoteAvatarUrl;
  }

  const response = await fetch(remoteAvatarUrl, {
    headers: {
      "user-agent": "Learnova avatar cache",
    },
  });

  if (!response.ok) {
    return null;
  }

  const extension = getExtension(response.headers.get("content-type"));

  if (!extension) {
    return null;
  }

  const bytes = Buffer.from(await response.arrayBuffer());

  if (bytes.byteLength === 0 || bytes.byteLength > maxAvatarBytes) {
    return null;
  }

  await mkdir(avatarDirectory, { recursive: true });

  const filename = `${userId}.${extension}`;
  await writeFile(path.join(avatarDirectory, filename), bytes);
  await removeOldAvatarFiles(userId, filename);

  return `/uploads/avatars/${filename}`;
}
