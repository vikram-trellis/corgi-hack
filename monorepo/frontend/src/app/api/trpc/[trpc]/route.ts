import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import { createTRPCContext } from "@/trpc/init";
import { appRouter } from "@/server/api/root";

// Optional: Set maximum duration for the API route
export const maxDuration = 30;

// Create context for HTTP requests
const createContext = async (req: NextRequest) => {
  return createTRPCContext();
};

// Request handler
const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
            );
          }
        : undefined,
  });

export { handler as GET, handler as POST };
