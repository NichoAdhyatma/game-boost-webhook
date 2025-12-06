import { Agent } from "undici";

const httpsAgent = new Agent({
  keepAliveTimeout: 10_000,
  keepAliveMaxTimeout: 15_000,
  connect: {
    rejectUnauthorized: false, // sama dengan https.Agent
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchWithAgent(url: string, options: any = {}) {
  return fetch(url, {
    ...options,
    dispatcher: httpsAgent, // ini valid untuk Next.js
  });
}
