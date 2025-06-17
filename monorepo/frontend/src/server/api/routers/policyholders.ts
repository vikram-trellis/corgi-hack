import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/trpc/init";

// Import model functions
import { getPolicyholderData } from "../models/policyholders/get-policyholder-data";
import { getPolicyholdersList } from "../models/policyholders/get-policyholders-list";
import { createPolicyholderData } from "../models/policyholders/create-policyholder-data";
import { deletePolicyholderData } from "../models/policyholders/delete-policyholder";

export const policyholdersRouter = createTRPCRouter({
  // Get a list of policyholders
  getPolicyholders: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        skip: z.number().default(0),
      })
    )
    .query(({ ctx, input }) => {
      return getPolicyholdersList({
        limit: input.limit,
        skip: input.skip,
      });
    }),

  // Get a single policyholder by ID
  getPolicyholder: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      return getPolicyholderData({
        policyHolderId: input.id,
      });
    }),

  // Create a new policyholder
  createPolicyholder: protectedProcedure
    .input(
      z.object({
        first_name: z.string().optional(),
        last_name: z.string(),
        date_of_birth: z.string(), // ISO date string
        email: z.string().email(),
        phone: z.string(),
        address: z.object({
          street: z.string(),
          city: z.string(),
          state: z.string(),
          zip: z.string(),
        }),
        policies: z
          .array(
            z.object({
              policy_number: z.string(),
              type: z.string(),
              start_date: z.string(),
              end_date: z.string(),
            })
          )
          .optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      return createPolicyholderData({
        ...input,
      });
    }),

  // Delete a policyholder
  deletePolicyholder: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return deletePolicyholderData({
        policyHolderId: input.id,
      });
    }),
});
