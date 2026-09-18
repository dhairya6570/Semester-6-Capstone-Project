const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error("Missing NEXT_PUBLIC_API_URL environment variable");
}

export const API_URL = apiUrl;