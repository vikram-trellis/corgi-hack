import { z } from "zod";

const envSchema = z.object({
  BACKEND_BASE_API_URL: z.string().default("http://localhost:8000/api"),
  FRONTEND_KEY_NAME: z.string().default("x-frontend-key"),
  FRONTEND_KEY: z.string().default("corgi-frontend-key"),
});

export const env = {
  BACKEND_BASE_API_URL:
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  FRONTEND_KEY_NAME: "x-frontend-key",
  FRONTEND_KEY: process.env.FRONTEND_KEY || "corgi-frontend-key",
};

// Validate environment variables
try {
  envSchema.parse(env);
} catch (error) {
  console.error("❌ Invalid environment variables:", error);
  throw new Error("Invalid environment variables");
}
