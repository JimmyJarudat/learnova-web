import prisma from "@/lib/db/postgres";
import { getUsableAvatarUrl } from "./avatar-url";
import { verifyPassword } from "./password";

export async function authorizePasswordUser(identifier: string | undefined, password: string | undefined) {
  const normalizedIdentifier = identifier?.trim().toLowerCase();

  if (!normalizedIdentifier || !password) {
    return null;
  }

  const user = await prisma.user.findFirst({
    where: {
      deletedAt: null,
      OR: [
        { email: normalizedIdentifier },
        { username: normalizedIdentifier },
      ],
    },
    select: {
      id: true,
      username: true,
      email: true,
      displayName: true,
      avatarUrl: true,
      passwordHash: true,
    },
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return null;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
    select: { id: true },
  });

  return {
    id: user.id,
    name: user.displayName ?? user.username,
    email: user.email,
    image: getUsableAvatarUrl(user.avatarUrl),
    username: user.username,
  };
}
