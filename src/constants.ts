export const SERVER_NAME = "rappi-mcp-server";
export const SERVER_VERSION = "0.1.4";
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

/**
 * Unofficial consumer paths verified against services.rappi.com.br (edgen).
 * Invented `/api/ms/cart|user-addresses|user-orders|search-proxy` return 403 PATH_NOT_ALLOWED.
 * These return 200/400/401 (path exists), not PATH_NOT_ALLOWED.
 */
export const PATHS = {
  guestPassport: "/api/rocket/v2/guest/passport/",
  guest: "/api/rocket/v2/guest",
  search: "/api/pns-global-search-api/v1/unified-search",
  products: "/api/pns-global-search-api/v1/unified-search",
  recentSearches: "/api/pns-global-search-api/v1/unified-recent-top-searches",
  cart: "/api/ms/shopping-cart/v1/all/get",
  cartAdd: "/api/ms/shopping-cart/v1/add",
  cartProducts: "/api/ms/shopping-cart/v1/products",
  cartClear: "/api/ms/shopping-cart/v1/all",
  addresses: "/api/ms/users-address/addresses",
  address: "/api/ms/users-address/address",
  orders: "/api/user-order-home/orders",
  ordersInProgress: "/api/user-order-home/in-progress",
  checkout: "/api/user-order-home/checkout",
  checkoutPreview: "/api/user-order-home/checkout/preview",
  coupons: "/api/user-order-home/coupons",
  paymentMethods: "/api/ms/payment-method/v1/methods",
  storeDetail: "/api/pns-global-search-api/v1/stores",
  orderStatus: "/api/ms/order-status/v1/orders",
  home: "/api/web-gateway/web/home",
  homeFeed: "/api/web-gateway/web/dynamic/context/content",
  webStores: "/api/web-gateway/web/stores",
  webCart: "/api/web-gateway/web/cart",
  catalog: "/api/restaurant-bus/stores/catalog"
} as const;

export const WEB_ORIGIN_BY_COUNTRY: Record<string, string> = {
  BR: "https://www.rappi.com.br",
  CO: "https://www.rappi.com",
  MX: "https://www.rappi.com.mx",
  AR: "https://www.rappi.com.ar",
  CL: "https://www.rappi.cl",
  PE: "https://www.rappi.pe",
  UY: "https://www.rappi.com.uy",
  EC: "https://www.rappi.com.ec",
  CR: "https://www.rappi.com.cr"
};

export const WEB_APPLICATION_ID = "rappi-home-web/1.0.0";
export const WEB_VENDOR = "web";
export const WEB_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

export const DEFAULT_USER_AGENT = WEB_USER_AGENT;
export const REQUEST_TIMEOUT_MS = 20_000;
export const TOKEN_DIR_NAME = ".rappi-mcp";
