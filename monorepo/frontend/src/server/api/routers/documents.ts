import { createTRPCRouter, publicProcedure } from "@/trpc/init";
import { 
  getClaimDocumentsData, 
  getClaimDocumentsSchema,
  type GetClaimDocumentsResponse 
} from "../models/documents/get-claim-documents-data";
import { 
  uploadDocumentData, 
  uploadDocumentSchema,
  type UploadDocumentResponse 
} from "../models/documents/upload-document-data";
import { 
  deleteDocumentData, 
  deleteDocumentSchema,
  type DeleteDocumentResponse 
} from "../models/documents/delete-document-data";

export const documentsRouter = createTRPCRouter({
  getClaimDocuments: publicProcedure
    .input(getClaimDocumentsSchema)
    .query(async ({ input }): Promise<GetClaimDocumentsResponse> => {
      return await getClaimDocumentsData(input);
    }),

  uploadDocument: publicProcedure
    .input(uploadDocumentSchema)
    .mutation(async ({ input }): Promise<UploadDocumentResponse> => {
      return await uploadDocumentData(input);
    }),

  deleteDocument: publicProcedure
    .input(deleteDocumentSchema)
    .mutation(async ({ input }): Promise<DeleteDocumentResponse> => {
      return await deleteDocumentData(input);
    }),
});