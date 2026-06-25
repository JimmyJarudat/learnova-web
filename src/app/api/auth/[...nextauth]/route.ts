import NextAuth from "next-auth";
import { getAuthOptions } from "@/lib/auth/options";
import {testEncryption} from "@/utils/encryption";

// console.log('Testing encryption:', testEncryption(""));

async function handler(request: Request, context: unknown) {
  const nextAuthHandler = NextAuth(await getAuthOptions());

  return nextAuthHandler(request, context);
}

export { handler as GET, handler as POST };

