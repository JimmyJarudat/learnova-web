export function getGropApiKeys(env: NodeJS.ProcessEnv = process.env) {
  return [env.GROP_API_KEY1, env.GROP_API_KEY2, env.GROP_API_KEY3, env.GROP_API_KEY4, env.GROP_API_KEY5]
    .map((key) => key?.trim())
    .filter((key): key is string => Boolean(key));
}

export function isRetryableGropStatus(status: number) {
  return status === 408 || status === 409 || status === 429 || status >= 500;
}
