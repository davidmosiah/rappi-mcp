export const SERVER_NAME = "rappi-mcp-server";
export const SERVER_VERSION = "0.1.0";
export const NPM_PACKAGE_NAME = "rappi-mcp-unofficial";
export const PINNED_NPM_PACKAGE = `${NPM_PACKAGE_NAME}@${SERVER_VERSION}`;

/** Default Brazil consumer surface. Override with RAPPI_API_BASE. Unofficial / unstable. */
export const DEFAULT_API_BASE = "https://services.rappi.com.br";

export const COUNTRY_BASES: Record<string, string> = {
  BR: "https://services.rappi.com.br",
  CO: "https://services.rappi.com",
  MX: "https://services.mxgrability.rappi.com",
  AR: "https://services.rappi.com.ar",
  CL: "https://services.rappi.cl",
  PE: "https://services.rappi.pe",
  UY: "https://services.rappi.com.uy",
  EC: "https://services.rappi.com.ec",
  CR: "https://services.rappi.co.cr"
};

/** Unofficial consumer paths (web/app). Not Rappi Partners restaurant OAuth. */
export const PATHS = {
  guest: "/api/rocket/v2/guest",
  search: "/api/ms/web-proxy/dynamic-list/cpgs/",
  stores: "/api/ms/web-home/v1/home",
  products: "/api/ms/search-proxy/search",
  cart: "/api/ms/cart/v1/carts/current",
  cartProducts: "/api/ms/cart/v1/carts/current/products",
  addresses: "/api/ms/user-addresses",
  orders: "/api/ms/user-orders",
  checkout: "/api/ms/checkout/v1/orders",
  paymentMethods: "/api/ms/payments/v1/payment-methods"
} as const;

export const DEFAULT_USER_AGENT = `${SERVER_NAME}/${SERVER_VERSION}`;
export const REQUEST_TIMEOUT_MS = 20_000;
export const TOKEN_DIR_NAME = ".rappi-mcp";
