/**
 * Dynamically resolves the API Base URL based on the current window location
 * or environment variables, allowing seamless local development and production deployments.
 */
export const getApiBaseUrl = (): string => {
  // 1. If running on the server side (Next.js SSR/Static Generation), use env variable or dev fallback
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  }

  // 2. Browser Environment: check hostname
  const hostname = window.location.hostname;
  
  if (
    hostname === "localhost" || 
    hostname === "127.0.0.1" || 
    hostname.startsWith("192.168.") || 
    hostname.startsWith("10.") || 
    hostname.endsWith(".local")
  ) {
    return "http://localhost:5000";
  }

  // 3. Live Production fallback
  return process.env.NEXT_PUBLIC_API_URL || "";
};

export const API_BASE_URL = getApiBaseUrl();
