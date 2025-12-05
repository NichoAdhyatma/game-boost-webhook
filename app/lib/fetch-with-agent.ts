import https from "https";

const httpsAgent = new https.Agent({
  keepAlive: true,
  rejectUnauthorized: false, 
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchWithAgent(url: string, options: any = {}) {
  return fetch(url, {
    ...options,
    dispatcher: httpsAgent, 
  });
}
