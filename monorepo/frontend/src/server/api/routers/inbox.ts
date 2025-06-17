import { createTRPCRouter, publicProcedure } from "@/trpc/init";
import { 
  getInboxListData, 
  getInboxListSchema,
  type GetInboxListResponse 
} from "../models/inbox/get-inbox-list-data";
import { 
  getInboxData, 
  getInboxItemSchema,
  type GetInboxItemResponse 
} from "../models/inbox/get-inbox-data";
import { 
  updateInboxStatusData, 
  updateInboxStatusSchema,
  type UpdateInboxStatusResponse 
} from "../models/inbox/update-inbox-status-data";
import { 
  convertToClaimData, 
  convertToClaimSchema,
  type ConvertToClaimResponse 
} from "../models/inbox/convert-to-claim-data";

export const inboxRouter = createTRPCRouter({
  getList: publicProcedure
    .input(getInboxListSchema)
    .query(async ({ input }): Promise<GetInboxListResponse> => {
      return await getInboxListData(input);
    }),

  getById: publicProcedure
    .input(getInboxItemSchema)
    .query(async ({ input }): Promise<GetInboxItemResponse> => {
      return await getInboxData(input);
    }),

  updateStatus: publicProcedure
    .input(updateInboxStatusSchema)
    .mutation(async ({ input }): Promise<UpdateInboxStatusResponse> => {
      return await updateInboxStatusData(input);
    }),

  convertToClaim: publicProcedure
    .input(convertToClaimSchema)
    .mutation(async ({ input }): Promise<ConvertToClaimResponse> => {
      return await convertToClaimData(input);
    }),
});