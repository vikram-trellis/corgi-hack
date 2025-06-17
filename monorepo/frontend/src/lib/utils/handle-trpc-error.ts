import { TRPCError } from "@trpc/server";
import { ApiResponseError } from "./api-response-error";

type ErrorOptions = {
  statusCode: number;
  message: string;
  cause: ApiResponseError;
};

type TRPCErrorCode = 
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "TIMEOUT"
  | "CONFLICT"
  | "PRECONDITION_FAILED"
  | "PAYLOAD_TOO_LARGE"
  | "TOO_MANY_REQUESTS"
  | "METHOD_NOT_SUPPORTED"
  | "INTERNAL_SERVER_ERROR"
  | "NOT_IMPLEMENTED"
  | "BAD_GATEWAY"
  | "SERVICE_UNAVAILABLE"
  | "GATEWAY_TIMEOUT"
  | "PARSE_ERROR"
  | "CLIENT_CLOSED_REQUEST";

export function handleTRPCError(options: ErrorOptions): TRPCError {
  const { statusCode, message, cause } = options;
  
  // Map HTTP status codes to TRPC error codes
  const codeMap: Record<number, TRPCErrorCode> = {
    400: "BAD_REQUEST",
    401: "UNAUTHORIZED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    409: "CONFLICT",
    429: "TOO_MANY_REQUESTS",
    500: "INTERNAL_SERVER_ERROR",
  };
  
  const code = codeMap[statusCode] || "INTERNAL_SERVER_ERROR" as TRPCErrorCode;
  
  return new TRPCError({
    code,
    message,
    cause,
  });
}
