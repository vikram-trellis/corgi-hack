import superjson from "superjson";
import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError } from "zod";

// Create the context - this runs for every request
export const createTRPCContext = async () => {
  // You can add authentication here later if needed
  return {
    user: null,
  };
};

// Initialize tRPC
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// Export utilities for creating routers and procedures
export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;

// Create middleware (optional)
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();
  const result = await next();
  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);
  return result;
});

// Define procedures
export const publicProcedure = t.procedure.use(timingMiddleware);
export const protectedProcedure = t.procedure.use(timingMiddleware);
