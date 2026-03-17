import type { YouTubeCredentials } from "./auth.js";
import { getAccessToken } from "./auth.js";

const DATA_API_BASE = "https://www.googleapis.com/youtube/v3";
const ANALYTICS_API_BASE = "https://youtubeanalytics.googleapis.com/v2";

export interface DataApiOptions {
  creds: YouTubeCredentials;
  params?: Record<string, string>;
  /** Force OAuth even when api_key is available (e.g. mine=true requires it) */
  requireOAuth?: boolean;
}

export interface AnalyticsApiOptions {
  creds: YouTubeCredentials;
  params?: Record<string, string>;
}

export async function callDataApi(
  endpoint: string,
  opts: DataApiOptions
): Promise<unknown> {
  const params = { ...opts.params };

  // Use OAuth when required (e.g. mine=true) or when no API key is available
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (opts.requireOAuth || !opts.creds.api_key) {
    const token = await getAccessToken(opts.creds);
    headers.Authorization = `Bearer ${token}`;
  } else {
    params.key = opts.creds.api_key;
  }

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  }

  const url = `${DATA_API_BASE}${endpoint}?${searchParams.toString()}`;
  const res = await fetch(url, { method: "GET", headers });
  const json = (await res.json()) as {
    error?: { message: string; code: number };
    [key: string]: unknown;
  };

  if (!res.ok || json.error) {
    throw new Error(json.error?.message ?? `HTTP ${res.status}`);
  }

  return json;
}

export async function callAnalyticsApi(
  endpoint: string,
  opts: AnalyticsApiOptions
): Promise<unknown> {
  const token = await getAccessToken(opts.creds);
  const params = opts.params ?? {};

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  }

  const url = `${ANALYTICS_API_BASE}${endpoint}?${searchParams.toString()}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const json = (await res.json()) as {
    error?: { message: string; code: number };
    [key: string]: unknown;
  };

  if (!res.ok || json.error) {
    throw new Error(json.error?.message ?? `HTTP ${res.status}`);
  }

  return json;
}
