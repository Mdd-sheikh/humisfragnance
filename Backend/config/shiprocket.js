import axios from "axios";

// Shiprocket API base URL
const SHIPROCKET_BASE_URL = "https://apiv2.shiprocket.in/v1/external";

// In-memory token cache (per server process).
// Shiprocket tokens are valid for ~10 days, so we cache and reuse until near-expiry.
let cachedToken = null;
let tokenExpiresAt = 0; // epoch ms

const shiprocket = axios.create({
  baseURL: SHIPROCKET_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Logs in to Shiprocket using email/password and returns a bearer token.
 * Caches the token in memory and reuses it until it's close to expiring.
 */
async function getShiprocketToken() {
  const now = Date.now();

  // Reuse cached token if it still has more than 1 hour of validity left
  if (cachedToken && now < tokenExpiresAt - 60 * 60 * 1000) {
    return cachedToken;
  }

  const { data } = await axios.post(
    `${SHIPROCKET_BASE_URL}/auth/login`,
    {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    },
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!data?.token) {
    throw new Error("Shiprocket login failed: no token returned");
  }

  cachedToken = data.token;
  // Shiprocket tokens last ~10 days; we conservatively cache for 9 days
  tokenExpiresAt = now + 9 * 24 * 60 * 60 * 1000;

  return cachedToken;
}

// Request interceptor: attach a fresh/cached bearer token to every call
shiprocket.interceptors.request.use(async (config) => {
  const token = await getShiprocketToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: if token expired/invalid mid-flight, refresh once and retry
shiprocket.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      cachedToken = null; // force refresh
      const token = await getShiprocketToken();
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return shiprocket(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default shiprocket;