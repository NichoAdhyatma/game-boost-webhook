import { Agent } from "undici";

const httpsAgent = new Agent({
  keepAliveTimeout: 10_000,
  keepAliveMaxTimeout: 15_000,
  connect: {
    rejectUnauthorized: false, 
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchWithAgent(url: string, options: any = {}) {
  return fetch(url, {
    ...options,
    dispatcher: httpsAgent, 
  });
}
