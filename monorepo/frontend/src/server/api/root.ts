import { createTRPCRouter, createCallerFactory } from "@/trpc/init";
import { claimsRouter } from "./routers/claims";
import { policyholdersRouter } from "./routers/policyholders";
import { inboxRouter } from "./routers/inbox";
import { documentsRouter } from "./routers/documents";

export const appRouter = createTRPCRouter({
  claims: claimsRouter,
  policyholders: policyholdersRouter,
  inbox: inboxRouter,
  documents: documentsRouter,
  // Add other routers here as you develop them
});

// Export type definition of API
export type AppRouter = typeof appRouter;

// Create server-side caller
export const createCaller = createCallerFactory(appRouter);
