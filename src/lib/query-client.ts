import { QueryClient } from "@tanstack/react-query";

let browserQueryClient: QueryClient | null = null;

export function makeQueryClient(): QueryClient {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0, // Segera revalidasi saat invalidasi dipicu
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });

  if (typeof window !== "undefined") {
    browserQueryClient = client;
  }

  return client;
}

export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

export async function invalidateAllQueries(): Promise<void> {
  const client = getQueryClient();
  if (client) {
    await client.invalidateQueries();
    await client.refetchQueries({ type: "active" });
  }
}

export async function invalidateProducts(): Promise<void> {
  const client = getQueryClient();
  if (client) {
    await client.invalidateQueries({ queryKey: ["products"] });
    await client.invalidateQueries({ queryKey: ["product"] });
  }
}

export async function invalidateCategories(): Promise<void> {
  const client = getQueryClient();
  if (client) {
    await client.invalidateQueries({ queryKey: ["categories"] });
    await client.invalidateQueries({ queryKey: ["category"] });
  }
}

export async function invalidateVouchers(): Promise<void> {
  const client = getQueryClient();
  if (client) {
    await client.invalidateQueries({ queryKey: ["vouchers"] });
    await client.invalidateQueries({ queryKey: ["voucher"] });
  }
}

export async function invalidatePromotions(): Promise<void> {
  const client = getQueryClient();
  if (client) {
    await client.invalidateQueries({ queryKey: ["promotions"] });
  }
}

export async function invalidateContent(): Promise<void> {
  const client = getQueryClient();
  if (client) {
    await client.invalidateQueries({ queryKey: ["content"] });
    await client.invalidateQueries({ queryKey: ["engagement"] });
  }
}

export async function invalidateOrders(): Promise<void> {
  const client = getQueryClient();
  if (client) {
    await client.invalidateQueries({ queryKey: ["orders"] });
    await client.invalidateQueries({ queryKey: ["order"] });
  }
}

export async function invalidateCustomers(): Promise<void> {
  const client = getQueryClient();
  if (client) {
    await client.invalidateQueries({ queryKey: ["customers"] });
  }
}
