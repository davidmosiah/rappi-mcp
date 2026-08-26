import type { PrivacyMode, ResponseFormat } from "../types.js";
import { peekConfig } from "./config.js";
import { RappiClient, RappiClientError } from "./rappi-client.js";
import { TokenStore } from "./token-store.js";
import { applyPrivacy } from "./privacy.js";
import { bulletList, makeError, makeResponse } from "./format.js";
import {
  MutationGateError,
  assertAddressWriteAllowed,
  assertCartWriteAllowed,
  assertLogoutAllowed,
  assertNotGuestForCharge,
  assertPaymentWriteAllowed,
  assertPlaceOrderAllowed
} from "./mutation-gate.js";
import { buildConnectionStatus } from "./connection-status.js";
import { buildCapabilities } from "./capabilities.js";
import { buildPrivacyAudit } from "./audit.js";

export interface HandlerDeps {
  client?: RappiClient;
  tokens?: TokenStore;
  allowMutations?: boolean;
  fetchImpl?: typeof fetch;
}

function deps(extra: HandlerDeps = {}) {
  const config = peekConfig();
  const tokens = extra.tokens ?? new TokenStore(config.tokenPath);
  const client = extra.client ?? new RappiClient(config, tokens, extra.fetchImpl);
  const allowMutations = extra.allowMutations ?? config.allowMutations;
  return { config, tokens, client, allowMutations };
}

function gateError(error: unknown) {
  if (error instanceof MutationGateError || error instanceof RappiClientError) {
    return makeError(error.message);
  }
  return makeError((error as Error).message);
}

function wrap<T>(payload: T, format: ResponseFormat, title: string, fields: Record<string, unknown>) {
  return makeResponse(payload, format, bulletList(title, fields));
}

export async function handleConnectionStatus(input: { response_format?: ResponseFormat } = {}) {
  const status = await buildConnectionStatus();
  return wrap(status, input.response_format ?? "markdown", "Rappi MCP · connection", {
    ok: status.ok,
    mutations_enabled: status.mutations_enabled,
    unofficial: true,
    never_pays_by_default: true
  });
}

export async function handleCapabilities(input: { response_format?: ResponseFormat } = {}) {
  const caps = buildCapabilities();
  return wrap(caps, input.response_format ?? "markdown", "Rappi MCP · capabilities", {
    unofficial: caps.unofficial,
    mutations_enabled: caps.mutations_enabled,
    never_pays_by_default: true
  });
}

export async function handlePrivacyAudit(input: { response_format?: ResponseFormat } = {}) {
  const audit = buildPrivacyAudit();
  return wrap(audit, input.response_format ?? "markdown", "Rappi MCP · privacy", {
    privacy_mode: audit.privacy_mode,
    mutations_enabled: audit.mutations_enabled,
    redacts_by_default: (audit.redacts_by_default as string[]).join(", ")
  });
}

export async function handleSearchStores(
  input: {
    query?: string;
    latitude?: number;
    longitude?: number;
    limit?: number;
    privacy_mode?: PrivacyMode;
    response_format?: ResponseFormat;
  },
  extra: HandlerDeps = {}
) {
  const { config, client } = deps(extra);
  try {
    const raw = await client.searchStores({
      query: input.query,
      latitude: input.latitude ?? config.latitude,
      longitude: input.longitude ?? config.longitude,
      limit: input.limit
    });
    const payload = applyPrivacy({ unofficial: true, results: raw }, input.privacy_mode ?? config.privacyMode);
    return wrap(payload, input.response_format ?? "markdown", "Rappi stores", { query: input.query ?? "", unofficial: true });
  } catch (error) {
    return gateError(error);
  }
}

export async function handleSearchProducts(
  input: {
    query?: string;
    latitude?: number;
    longitude?: number;
    limit?: number;
    privacy_mode?: PrivacyMode;
    response_format?: ResponseFormat;
  },
  extra: HandlerDeps = {}
) {
  const { config, client } = deps(extra);
  try {
    const raw = await client.searchProducts({
      query: input.query,
      latitude: input.latitude ?? config.latitude,
      longitude: input.longitude ?? config.longitude,
      limit: input.limit
    });
    const payload = applyPrivacy({ unofficial: true, results: raw }, input.privacy_mode ?? config.privacyMode);
    return wrap(payload, input.response_format ?? "markdown", "Rappi products", { query: input.query ?? "", unofficial: true });
  } catch (error) {
    return gateError(error);
  }
}

export async function handleGetCart(
  input: { privacy_mode?: PrivacyMode; response_format?: ResponseFormat } = {},
  extra: HandlerDeps = {}
) {
  const { config, client } = deps(extra);
  try {
    const raw = await client.getCart();
    const payload = applyPrivacy({ unofficial: true, cart: raw }, input.privacy_mode ?? config.privacyMode);
    return wrap(payload, input.response_format ?? "markdown", "Rappi cart", { unofficial: true });
  } catch (error) {
    return gateError(error);
  }
}

export async function handleListAddresses(
  input: { privacy_mode?: PrivacyMode; response_format?: ResponseFormat } = {},
  extra: HandlerDeps = {}
) {
  const { config, client } = deps(extra);
  try {
    const raw = await client.listAddresses();
    const payload = applyPrivacy({ unofficial: true, addresses: raw }, input.privacy_mode ?? config.privacyMode);
    return wrap(payload, input.response_format ?? "markdown", "Rappi addresses", { unofficial: true, redacted: true });
  } catch (error) {
    return gateError(error);
  }
}

export async function handleListOrders(
  input: { privacy_mode?: PrivacyMode; response_format?: ResponseFormat } = {},
  extra: HandlerDeps = {}
) {
  const { config, client } = deps(extra);
  try {
    const raw = await client.listOrders();
    const payload = applyPrivacy({ unofficial: true, orders: raw }, input.privacy_mode ?? config.privacyMode);
    return wrap(payload, input.response_format ?? "markdown", "Rappi orders", { unofficial: true });
  } catch (error) {
    return gateError(error);
  }
}

export async function handleGetOrder(
  input: { order_id: string; privacy_mode?: PrivacyMode; response_format?: ResponseFormat },
  extra: HandlerDeps = {}
) {
  const { config, client } = deps(extra);
  try {
    const raw = await client.getOrder(input.order_id);
    const payload = applyPrivacy({ unofficial: true, order: raw }, input.privacy_mode ?? config.privacyMode);
    return wrap(payload, input.response_format ?? "markdown", "Rappi order", { order_id: input.order_id });
  } catch (error) {
    return gateError(error);
  }
}

export async function handleAddToCart(
  input: {
    product_id: string;
    store_id?: string;
    quantity?: number;
    explicit_user_intent?: boolean;
    response_format?: ResponseFormat;
  },
  extra: HandlerDeps = {}
) {
  const { allowMutations, client } = deps(extra);
  try {
    assertCartWriteAllowed({ allowMutations, explicitUserIntent: input.explicit_user_intent });
    const raw = await client.addToCart({
      product_id: input.product_id,
      store_id: input.store_id,
      quantity: input.quantity ?? 1
    });
    return wrap({ ok: true, cart: raw }, input.response_format ?? "markdown", "Rappi cart write", { ok: true });
  } catch (error) {
    return gateError(error);
  }
}

export async function handleUpdateCartItem(
  input: {
    product_id: string;
    store_id?: string;
    quantity?: number;
    explicit_user_intent?: boolean;
    response_format?: ResponseFormat;
  },
  extra: HandlerDeps = {}
) {
  const { allowMutations, client } = deps(extra);
  try {
    assertCartWriteAllowed({ allowMutations, explicitUserIntent: input.explicit_user_intent });
    const raw = await client.updateCartItem({
      product_id: input.product_id,
      store_id: input.store_id,
      quantity: input.quantity ?? 1
    });
    return wrap({ ok: true, cart: raw }, input.response_format ?? "markdown", "Rappi cart write", { ok: true });
  } catch (error) {
    return gateError(error);
  }
}

export async function handleClearCart(
  input: { explicit_user_intent?: boolean; response_format?: ResponseFormat },
  extra: HandlerDeps = {}
) {
  const { allowMutations, client } = deps(extra);
  try {
    assertCartWriteAllowed({ allowMutations, explicitUserIntent: input.explicit_user_intent });
    const raw = await client.clearCart();
    return wrap({ ok: true, cart: raw }, input.response_format ?? "markdown", "Rappi cart cleared", { ok: true });
  } catch (error) {
    return gateError(error);
  }
}

export async function handleSetActiveAddress(
  input: { address_id: string; explicit_user_intent?: boolean; response_format?: ResponseFormat },
  extra: HandlerDeps = {}
) {
  const { client } = deps(extra);
  try {
    assertAddressWriteAllowed(input.explicit_user_intent);
    const raw = await client.setActiveAddress(input.address_id);
    return wrap({ ok: true, address: raw }, input.response_format ?? "markdown", "Rappi address", { ok: true });
  } catch (error) {
    return gateError(error);
  }
}

export async function handleSetPaymentMethod(
  input: { payment_method_id: string; explicit_user_intent?: boolean; response_format?: ResponseFormat },
  extra: HandlerDeps = {}
) {
  const { allowMutations, client, tokens } = deps(extra);
  try {
    assertPaymentWriteAllowed({ allowMutations, explicitUserIntent: input.explicit_user_intent });
    const token = await tokens.read();
    assertNotGuestForCharge(token?.source ?? (process.env.RAPPI_ACCESS_TOKEN ? "user" : undefined));
    const raw = await client.setPaymentMethod(input.payment_method_id);
    return wrap({ ok: true, payment: raw }, input.response_format ?? "markdown", "Rappi payment method", { ok: true });
  } catch (error) {
    return gateError(error);
  }
}

export async function handlePlaceOrder(
  input: {
    address_id: string;
    payment_method_id: string;
    store_id?: string;
    notes?: string;
    explicit_user_intent?: boolean;
    response_format?: ResponseFormat;
  },
  extra: HandlerDeps = {}
) {
  const { allowMutations, client, tokens } = deps(extra);
  try {
    assertPlaceOrderAllowed({ allowMutations, explicitUserIntent: input.explicit_user_intent });
    const token = await tokens.read();
    assertNotGuestForCharge(token?.source ?? (process.env.RAPPI_ACCESS_TOKEN ? "user" : undefined));
    const raw = await client.placeOrder({
      address_id: input.address_id,
      payment_method_id: input.payment_method_id,
      store_id: input.store_id,
      notes: input.notes
    });
    return wrap({ ok: true, order: raw }, input.response_format ?? "markdown", "Rappi place order", { ok: true });
  } catch (error) {
    return gateError(error);
  }
}

export async function handleLogout(
  input: { explicit_user_intent?: boolean; response_format?: ResponseFormat },
  extra: HandlerDeps = {}
) {
  const { tokens } = deps(extra);
  try {
    assertLogoutAllowed(input.explicit_user_intent);
    await tokens.clear();
    return wrap({ ok: true, logged_out: true }, input.response_format ?? "markdown", "Rappi logout", {
      ok: true,
      logged_out: true
    });
  } catch (error) {
    return gateError(error);
  }
}
