export function baseUsernameFromEmail(email: string) {
  const [localPart] = email.split("@");
  const username = localPart
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

  return username || "user";
}
