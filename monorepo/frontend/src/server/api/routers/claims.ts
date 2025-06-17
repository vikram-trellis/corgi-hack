import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/trpc/init";

// Import your model functions (to be implemented)
import { getClaimData } from "../models/claims/get-claim-data";
import { createClaimData } from "../models/claims/create-claim-data";
import { updateClaimStatusData } from "../models/claims/update-claim-status-data";
import { getClaimsListData } from "../models/claims/get-claims-list-data";
import { deleteClaimData } from "../models/claims/delete-claim-data";

export const claimsRouter = createTRPCRouter({
  // Get list of claims
  getClaims: protectedProcedure
    .input(
      z.object({
        skip: z.number().default(0),
        limit: z.number().default(100),
        status: z.string().optional(),
        eventType: z.string().optional(),
        nameSearch: z.string().optional(),
      })
    )
    .query(({ input }) => {
      return getClaimsListData({
        skip: input.skip,
        limit: input.limit,
        status: input.status,
        eventType: input.eventType,
        nameSearch: input.nameSearch,
      });
    }),

  // Public query example - get basic claim info
  getPublicClaimInfo: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(({ input }) => {
      // Implementation would connect to your backend API
      return {
        id: input.id,
        status: "Processing",
        type: "Auto Insurance",
      };
    }),

  // Protected query example - get detailed claim data
  getClaimDetails: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(({ input }) => {
      // This would call your backend API
      return getClaimData({
        claimId: input.id,
      });
    }),

  // Mutation to create a new claim
  createClaim: protectedProcedure
    .input(
      z.object({
        first_name: z.string(),
        last_name: z.string(),
        date_of_birth: z.string(),
        event_type: z.string(),
        event_date: z.string(),
        event_location: z.string().optional(),
        damage_description: z.string(),
        contact_email: z.string().email(),
        vehicle_vin: z.string().optional(),
        photos: z.array(z.string()).optional(),
        policyholder_id: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      return createClaimData({
        ...input,
      });
    }),

  // Mutation to update claim status
  updateClaimStatus: protectedProcedure
    .input(
      z.object({
        claimId: z.string(),
        status: z.enum([
          "draft",
          "submitted",
          "pending_review",
          "under_investigation",
          "approved",
          "partially_approved",
          "denied",
          "closed",
          "reopened",
        ]),
        metadata: z.record(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      // This will call the backend API to update claim status
      return updateClaimStatusData({
        claimId: input.claimId,
        status: input.status,
        claim_metadata: input.metadata,
      });
    }),

  // Mutation to delete a claim
  deleteClaim: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return deleteClaimData({
        id: input.id,
      });
    }),
});
