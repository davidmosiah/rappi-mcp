import { DEFAULT_USER_AGENT, PATHS, REQUEST_TIMEOUT_MS } from "../constants.js";
import type { FetchLike, RappiConfig, RappiTokenSet } from "../types.js";
import { TokenStore } from "./token-store.js";

export class RappiClientError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly code?: string
  ) {
    super(message);
    this.name = "RappiClientError";
  }
}

export interface SearchInput {
  query?: string;
  latitude?: number;
  longitude?: number;
  limit?: number;
}

export interface CartItemInput {
  product_id: string;
  store_id?: string;
  quantity: number;
}

export interface PlaceOrderInput {
  address_id: string;
  payment_method_id: string;
  store_id?: string;
  notes?: string;
}

export class RappiClient {
  constructor(
    private readonly config: RappiConfig,
    private readonly tokens: TokenStore,
    private readonly fetchImpl: FetchLike = fetch
  ) {}

  async guestToken(): Promise<RappiTokenSet> {
    const payload = await this.requestJson("POST", PATHS.guest, { auth: false, body: {} });
    const access = pickToken(payload);
    if (!access) {
      throw new RappiClientError("Guest token response had no access_token", undefined, "RAPPI_UPSTREAM_UNAVAILABLE");
    }
    const set: RappiTokenSet = {
      access_token: access,
      token_type: "Bearer",
      source: "guest",
      expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000
    };
    await this.tokens.write(set);
    return set;
  }

  async resolveToken(): Promise<RappiTokenSet | null> {
    return this.tokens.read();
  }

  async searchStores(input: SearchInput): Promise<unknown> {
    return this.requestJson("POST", PATHS.search, {
      auth: "optional",
      body: {
        lat: input.latitude,
        lng: input.longitude,
        limit: input.limit ?? 20,
        query: input.query ?? ""
      }
    });
  }

  async searchProducts(input: SearchInput): Promise<unknown> {
    return this.requestJson("POST", PATHS.products, {
      auth: "optional",
      body: {
        query: input.query ?? "",
        lat: input.latitude,
        lng: input.longitude,
        size: input.limit ?? 20
      }
    });
  }

  async getCart(): Promise<unknown> {
    return this.requestJson("GET", PATHS.cart, { auth: true });
  }

  async addToCart(item: CartItemInput): Promise<unknown> {
    return this.requestJson("POST", PATHS.cartProducts, { auth: true, body: item });
  }

  async updateCartItem(item: CartItemInput): Promise<unknown> {
    return this.requestJson("PUT", `${PATHS.cartProducts}/${encodeURIComponent(item.product_id)}`, {
      auth: true,
      body: { quantity: item.quantity, store_id: item.store_id }
    });
  }

  async clearCart(): Promise<unknown> {
    return this.requestJson("DELETE", PATHS.cart, { auth: true });
  }

  async listAddresses(): Promise<unknown> {
    return this.requestJson("GET", PATHS.addresses, { auth: true });
  }

  async setActiveAddress(addressId: string): Promise<unknown> {
    return this.requestJson("PUT", `${PATHS.addresses}/${encodeURIComponent(addressId)}/select`, {
      auth: true,
      body: { address_id: addressId }
    });
  }

  async listOrders(): Promise<unknown> {
    return this.requestJson("GET", PATHS.orders, { auth: true });
  }

  async getOrder(orderId: string): Promise<unknown> {
    return this.requestJson("GET", `${PATHS.orders}/${encodeURIComponent(orderId)}`, { auth: true });
  }

  async listPaymentMethods(): Promise<unknown> {
    return this.requestJson("GET", PATHS.paymentMethods, { auth: true });
  }

  async setPaymentMethod(paymentMethodId: string): Promise<unknown> {
    return this.requestJson("PUT", PATHS.paymentMethods, {
      auth: true,
      body: { payment_method_id: paymentMethodId }
    });
  }

  async placeOrder(input: PlaceOrderInput): Promise<unknown> {
    return this.requestJson("POST", PATHS.checkout, { auth: true, body: input });
  }

  private async requestJson(
    method: string,
    path: string,
    options: { auth: boolean | "optional"; body?: unknown }
  ): Promise<unknown> {
    const headers: Record<string, string> = {
      accept: "application/json",
      "content-type": "application/json",
      "user-agent": DEFAULT_USER_AGENT
    };
    if (options.auth) {
      const token = await this.tokens.read();
      const envToken = process.env.RAPPI_ACCESS_TOKEN?.trim();
      const access = token?.access_token || envToken;
      if (!access) {
        if (options.auth === "optional") {
          try {
            const guest = await this.guestToken();
            headers.authorization = `Bearer ${guest.access_token}`;
          } catch {
            // browse may still work without a token on some surfaces
          }
        } else {
          throw new RappiClientError(
            "No Rappi access token. Run `rappi-mcp-unofficial auth --token <token>` or set RAPPI_ACCESS_TOKEN.",
            undefined,
            "AUTH_REQUIRED"
          );
        }
      } else {
        headers.authorization = `Bearer ${access}`;
      }
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await this.fetchImpl(this.config.apiBase + path, {
        method,
        headers,
        body: options.body === undefined || method === "GET" || method === "DELETE" ? undefined : JSON.stringify(options.body),
        signal: controller.signal
      });
      const text = await response.text();
      let parsed: unknown = text;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch {
        parsed = { raw: text.slice(0, 400) };
      }
      if (!response.ok) {
        throw new RappiClientError(
          `Unofficial Rappi surface returned HTTP ${response.status} for ${method} ${path}. The consumer API is undocumented and may change.`,
          response.status,
          "RAPPI_UPSTREAM_UNAVAILABLE"
        );
      }
      return parsed;
    } catch (error) {
      if (error instanceof RappiClientError) throw error;
      throw new RappiClientError(
        `Rappi request failed: ${(error as Error).message}`,
        undefined,
        "RAPPI_UPSTREAM_UNAVAILABLE"
      );
    } finally {
      clearTimeout(timer);
    }
  }
}

function pickToken(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const record = payload as Record<string, unknown>;
  if (typeof record.access_token === "string") return record.access_token;
  const nested = record.data;
  if (nested && typeof nested === "object" && typeof (nested as Record<string, unknown>).access_token === "string") {
    return (nested as Record<string, unknown>).access_token as string;
  }
  return undefined;
}
