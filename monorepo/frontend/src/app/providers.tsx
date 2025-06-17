"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { api } from "@/trpc/react";

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0, // Always consider data stale
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        refetchOnMount: true, // Refetch on page reload/component mount
        refetchOnReconnect: false, // Don't refetch on reconnect
        refetchOnWindowFocus: false, // Don't refetch on window focus
      },
    },
  }));
  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          // You can add headers here if needed for authentication
          // headers() {
          //   return {
          //     authorization: getAuthToken(),
          //   };
          // },
          transformer: superjson,
        }),
      ],
    })
  );

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </api.Provider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return <TRPCProvider>{children}</TRPCProvider>;
}
