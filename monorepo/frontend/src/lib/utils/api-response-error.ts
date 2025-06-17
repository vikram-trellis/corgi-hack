import { z } from "zod";

export const apiResponseErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    param: z.string().optional(),
    type: z.string().optional(),
  }),
  request_id: z.string(),
});

export type ApiResponseError = z.infer<typeof apiResponseErrorSchema>;
