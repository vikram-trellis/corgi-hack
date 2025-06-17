import { env } from "@/env";
import { hash } from "./encrypt";
import { revalidateTag } from "next/cache";
import { apiResponseErrorSchema } from "./api-response-error";
import { handleTRPCError } from "./handle-trpc-error";

export const apiFetcher = async (args: {
  urlPath: string;
  method?: "POST" | "PATCH" | "DELETE" | "PUT" | "GET";
  body?: Record<any, any>;
  bodyType?: "form-data" | "json";
  revalidateSeconds?: number;
}) => {
  const url = new URL(`${env.BACKEND_BASE_API_URL}${args.urlPath}`);

  console.log("[API FETCHER -> URL]", url);
  // Simplified auth header logic

  const res = await fetch(url, {
    method: args.method || "GET",
    headers: {
      Accept: "application/json",
      "API-Version": "2025-03",
      ...(!args.bodyType || args.bodyType === "json"
        ? {
            "Content-type": "application/json",
          }
        : {}),
      [env.FRONTEND_KEY_NAME]: env.FRONTEND_KEY,
    },
    ...(args.body && (!args.bodyType || args.bodyType === "json")
      ? { body: JSON.stringify(args.body) }
      : args.bodyType === "form-data"
      ? { body: args.body as any }
      : {}),
    next: {
      // Seconds to cache for GET requests. Will only cache based on the url path.
      revalidate: args.revalidateSeconds,
    },
  });

  if (!res.ok) {
    let json;
    try {
      json = await res.json();
    } catch (err) {
      console.error("[API FETCHER -> Failed JSON Parsing]", err);
      throw handleTRPCError({
        statusCode: 500,
        message: "Invalid content type received. Please try again later.",
        cause: {
          error: {
            code: "internal_server_error",
            message: "Invalid content type received.",
          },
          request_id: "req_unknown",
        },
      });
    }
    console.error("[API FETCHER -> Input]", JSON.stringify(args.body, null, 2));
    console.error(
      "[API FETCHER -> Error response]",
      JSON.stringify(json, null, 2)
    );

    const parsed = apiResponseErrorSchema.safeParse(json);

    if (!parsed.success) {
      console.error(
        `Failed to fetch for ${args.urlPath}: ${res.statusText} ${res.status}`
      );
      throw handleTRPCError({
        statusCode: 500,
        message: "Failed to parse error response. Please try again later.",
        cause: {
          error: {
            code: "internal_server_error",
            message: "Failed to parse error response.",
          },
          request_id: json?.request_id ?? "req_unknown",
        },
      });
    }

    throw handleTRPCError({
      statusCode: res.status,
      message: parsed.data.error.message,
      cause: parsed.data,
    });
  }
  const resJson = await res.json();
  console.log("[API FETCHER -> Response]", resJson);
  return resJson;
};
