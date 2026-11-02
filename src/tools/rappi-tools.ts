import { assertToolInputBudget } from "../services/tool-input-budget.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  AddressCreateInputSchema,
  AddressUpdateInputSchema,
  AddressWriteInputSchema,
  CartWriteInputSchema,
  CheckoutPreviewInputSchema,
  ClearCartInputSchema,
  CouponApplyInputSchema,
  GeoInputSchema,
  LogoutInputSchema,
  OrderIdInputSchema,
  OrderWriteInputSchema,
  PaymentWriteInputSchema,
  PlaceOrderInputSchema,
  RateOrderInputSchema,
  ReadInputSchema,
  ResponseOnlyInputSchema,
  SearchInputSchema,
  StoreIdInputSchema,
  TipOrderInputSchema
} from "../schemas/common.js";
import {
  handleAddToCart,
  handleApplyCoupon,
  handleBrowseCatalog,
  handleBrowseStores,
  handleCancelOrder,
  handleCapabilities,
  handleCheckoutPreview,
  handleClearCart,
  handleConnectionStatus,
  handleCreateAddress,
  handleDeleteAddress,
  handleGeocodeAddress,
  handleGetCart,
  handleGetOrder,
  handleGetOrderEta,
  handleGetOrderInvoice,
  handleGetOrderReceipt,
  handleGetOrderStatus,
  handleGetStore,
  handleHome,
  handleHomeFeed,
  handleListActiveOrders,
  handleListAddresses,
  handleListCoupons,
  handleListOrders,
  handleListPaymentMethods,
  handleLogout,
  handleOrderChat,
  handlePlaceOrder,
  handlePrivacyAudit,
  handleRateOrder,
  handleRecentSearches,
  handleReorder,
  handleSearchProducts,
  handleSearchStores,
  handleSetActiveAddress,
  handleSetPaymentMethod,
  handleTipOrder,
  handleTrackOrder,
  handleUpdateAddress,
  handleUpdateCartItem,
  handleWebCart
} from "../services/handlers.js";
import type { ToolResponse } from "../types.js";

type CallFn = (args: Record<string, unknown>) => Promise<ToolResponse>;
const call =
  <T,>(schema: { safeParse(input: unknown): { success: true; data: T } | { success: false } }, fn: (input: T) => Promise<ToolResponse>): CallFn =>
  async (args) => {
    assertToolInputBudget(args);
    const parsed = schema.safeParse(args);
    if (!parsed.success) throw new Error("INVALID_INPUT: arguments do not match the tool schema");
    return fn(parsed.data);
  };

/** Same handlers as MCP tools — CLI `call` uses this so skill-only clients hit the identical gates. */
export const TOOL_CALLS: Record<string, CallFn> = {
  rappi_connection_status: call(ResponseOnlyInputSchema, handleConnectionStatus),
  rappi_capabilities: call(ResponseOnlyInputSchema, handleCapabilities),
  rappi_privacy_audit: call(ResponseOnlyInputSchema, handlePrivacyAudit),
  rappi_search_stores: call(SearchInputSchema, handleSearchStores),
  rappi_search_products: call(SearchInputSchema, handleSearchProducts),
  rappi_get_cart: call(ReadInputSchema, handleGetCart),
  rappi_list_addresses: call(ReadInputSchema, handleListAddresses),
  rappi_list_orders: call(ReadInputSchema, handleListOrders),
  rappi_get_order: call(OrderIdInputSchema, handleGetOrder),
  rappi_track_order: call(OrderIdInputSchema, handleTrackOrder),
  rappi_get_store: call(StoreIdInputSchema, handleGetStore),
  rappi_list_payment_methods: call(ReadInputSchema, handleListPaymentMethods),
  rappi_add_to_cart: call(CartWriteInputSchema, handleAddToCart),
  rappi_update_cart_item: call(CartWriteInputSchema, handleUpdateCartItem),
  rappi_clear_cart: call(ClearCartInputSchema, handleClearCart),
  rappi_set_active_address: call(AddressWriteInputSchema, handleSetActiveAddress),
  rappi_set_payment_method: call(PaymentWriteInputSchema, handleSetPaymentMethod),
  rappi_place_order: call(PlaceOrderInputSchema, handlePlaceOrder),
  rappi_geocode_address: call(GeoInputSchema, handleGeocodeAddress),
  rappi_create_address: call(AddressCreateInputSchema, handleCreateAddress),
  rappi_update_address: call(AddressUpdateInputSchema, handleUpdateAddress),
  rappi_delete_address: call(AddressWriteInputSchema, handleDeleteAddress),
  rappi_list_active_orders: call(ReadInputSchema, handleListActiveOrders),
  rappi_get_order_eta: call(OrderIdInputSchema, handleGetOrderEta),
  rappi_get_order_receipt: call(OrderIdInputSchema, handleGetOrderReceipt),
  rappi_get_order_invoice: call(OrderIdInputSchema, handleGetOrderInvoice),
  rappi_get_order_status: call(OrderIdInputSchema, handleGetOrderStatus),
  rappi_list_coupons: call(ReadInputSchema, handleListCoupons),
  rappi_apply_coupon: call(CouponApplyInputSchema, handleApplyCoupon),
  rappi_order_chat: call(OrderIdInputSchema, handleOrderChat),
  rappi_checkout_preview: call(CheckoutPreviewInputSchema, handleCheckoutPreview),
  rappi_home: call(ReadInputSchema, handleHome),
  rappi_home_feed: call(ReadInputSchema, handleHomeFeed),
  rappi_browse_stores: call(ReadInputSchema, handleBrowseStores),
  rappi_browse_catalog: call(SearchInputSchema, handleBrowseCatalog),
  rappi_recent_searches: call(GeoInputSchema, handleRecentSearches),
  rappi_web_cart: call(ReadInputSchema, handleWebCart),
  rappi_reorder: call(OrderWriteInputSchema, handleReorder),
  rappi_cancel_order: call(OrderWriteInputSchema, handleCancelOrder),
  rappi_rate_order: call(RateOrderInputSchema, handleRateOrder),
  rappi_tip_order: call(TipOrderInputSchema, handleTipOrder),
  rappi_logout: call(LogoutInputSchema, handleLogout)
};

const readOnly = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true } as const;
const gatedWrite = { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true } as const;

export function registerRappiTools(server: McpServer): void {
  server.registerTool(
    "rappi_connection_status",
    {
      title: "Rappi connection status",
      description: "Local doctor: token present, mutations off by default, unofficial consumer surface.",
      inputSchema: ResponseOnlyInputSchema.shape,
      annotations: { ...readOnly, openWorldHint: false }
    },
    async (args) => handleConnectionStatus(args)
  );

  server.registerTool(
    "rappi_capabilities",
    {
      title: "Rappi capabilities",
      description: "What this unofficial MCP can read and which writes stay gated.",
      inputSchema: ResponseOnlyInputSchema.shape,
      annotations: { ...readOnly, openWorldHint: false }
    },
    async (args) => handleCapabilities(args)
  );

  server.registerTool(
    "rappi_privacy_audit",
    {
      title: "Rappi privacy audit",
      description: "Shows redaction defaults, token path, and that checkout is off unless both gates are set.",
      inputSchema: ResponseOnlyInputSchema.shape,
      annotations: { ...readOnly, openWorldHint: false }
    },
    async (args) => handlePrivacyAudit(args)
  );

  server.registerTool(
    "rappi_search_stores",
    {
      title: "Search Rappi stores",
      description:
        "Browse nearby stores on the unofficial Rappi consumer surface. Optional lat/lng (or RAPPI_LAT/RAPPI_LNG). Read-only.",
      inputSchema: SearchInputSchema.shape,
      annotations: readOnly
    },
    async (args) => handleSearchStores(args)
  );

  server.registerTool(
    "rappi_search_products",
    {
      title: "Search Rappi products",
      description: "Search products near a point. Does not add to cart. Read-only.",
      inputSchema: SearchInputSchema.shape,
      annotations: readOnly
    },
    async (args) => handleSearchProducts(args)
  );

  server.registerTool(
    "rappi_get_cart",
    {
      title: "Get Rappi cart",
      description: "Inspect the current personal cart. Street/phone/email/last-four redacted by default.",
      inputSchema: ReadInputSchema.shape,
      annotations: readOnly
    },
    async (args) => handleGetCart(args)
  );

  server.registerTool(
    "rappi_list_addresses",
    {
      title: "List Rappi addresses",
      description: "List saved delivery addresses. Street, phone and email are redacted in the default privacy mode.",
      inputSchema: ReadInputSchema.shape,
      annotations: readOnly
    },
    async (args) => handleListAddresses(args)
  );

  server.registerTool(
    "rappi_list_orders",
    {
      title: "List Rappi orders",
      description: "List recent personal orders / tracking summaries. Read-only.",
      inputSchema: ReadInputSchema.shape,
      annotations: readOnly
    },
    async (args) => handleListOrders(args)
  );

  server.registerTool(
    "rappi_get_order",
    {
      title: "Get Rappi order",
      description: "Track one order by id. Read-only.",
      inputSchema: OrderIdInputSchema.shape,
      annotations: readOnly
    },
    async (args) => handleGetOrder(args)
  );

  server.registerTool(
    "rappi_track_order",
    {
      title: "Track Rappi order ETA",
      description: "Live tracking / ETA for one order (unofficial user-order-home tracking). Read-only.",
      inputSchema: OrderIdInputSchema.shape,
      annotations: readOnly
    },
    async (args) => handleTrackOrder(args)
  );

  server.registerTool(
    "rappi_get_store",
    {
      title: "Get Rappi store",
      description: "Store catalog/detail from unofficial pns-global-search stores/{id}. Read-only.",
      inputSchema: StoreIdInputSchema.shape,
      annotations: readOnly
    },
    async (args) => handleGetStore(args)
  );

  server.registerTool(
    "rappi_list_payment_methods",
    {
      title: "List Rappi payment methods",
      description: "Read saved payment methods. Last-four and identity redacted by default. Does not charge.",
      inputSchema: ReadInputSchema.shape,
      annotations: readOnly
    },
    async (args) => handleListPaymentMethods(args)
  );

  server.registerTool(
    "rappi_add_to_cart",
    {
      title: "Add to Rappi cart",
      description:
        "Gated write. Requires RAPPI_ALLOW_MUTATIONS=true AND explicit_user_intent=true. Does not checkout.",
      inputSchema: CartWriteInputSchema.shape,
      annotations: gatedWrite
    },
    async (args) => handleAddToCart(args)
  );

  server.registerTool(
    "rappi_update_cart_item",
    {
      title: "Update Rappi cart item",
      description: "Gated write. RAPPI_ALLOW_MUTATIONS + explicit_user_intent required.",
      inputSchema: CartWriteInputSchema.shape,
      annotations: gatedWrite
    },
    async (args) => handleUpdateCartItem(args)
  );

  server.registerTool(
    "rappi_clear_cart",
    {
      title: "Clear Rappi cart",
      description: "Gated write. RAPPI_ALLOW_MUTATIONS + explicit_user_intent required.",
      inputSchema: ClearCartInputSchema.shape,
      annotations: gatedWrite
    },
    async (args) => handleClearCart(args)
  );

  server.registerTool(
    "rappi_set_active_address",
    {
      title: "Select Rappi address",
      description: "Requires explicit_user_intent. Does not place an order.",
      inputSchema: AddressWriteInputSchema.shape,
      annotations: gatedWrite
    },
    async (args) => handleSetActiveAddress(args)
  );

  server.registerTool(
    "rappi_set_payment_method",
    {
      title: "Select Rappi payment method",
      description:
        "Gated payment write. RAPPI_ALLOW_MUTATIONS + explicit_user_intent. Guest tokens are rejected. Does not charge.",
      inputSchema: PaymentWriteInputSchema.shape,
      annotations: gatedWrite
    },
    async (args) => handleSetPaymentMethod(args)
  );

  server.registerTool(
    "rappi_place_order",
    {
      title: "Place Rappi order",
      description:
        "FAIL-CLOSED. Charges money. Requires RAPPI_ALLOW_MUTATIONS=true AND explicit_user_intent=true AND a personal (non-guest) token. Never runs in the default read-only config.",
      inputSchema: PlaceOrderInputSchema.shape,
      annotations: gatedWrite
    },
    async (args) => handlePlaceOrder(args)
  );

  server.registerTool(
    "rappi_geocode_address",
    {
      title: "Geocode Rappi address",
      description: "Resolve a lat/lng against unofficial users-address/address. Read-only. Street redacted by default.",
      inputSchema: GeoInputSchema.shape,
      annotations: readOnly
    },
    async (args) => handleGeocodeAddress(args)
  );

  server.registerTool(
    "rappi_create_address",
    {
      title: "Create Rappi address",
      description: "Save a delivery address. Requires explicit_user_intent. Does not place an order.",
      inputSchema: AddressCreateInputSchema.shape,
      annotations: gatedWrite
    },
    async (args) => handleCreateAddress(args)
  );

  server.registerTool(
    "rappi_update_address",
    {
      title: "Update Rappi address",
      description: "Update a saved address. Requires explicit_user_intent.",
      inputSchema: AddressUpdateInputSchema.shape,
      annotations: gatedWrite
    },
    async (args) => handleUpdateAddress(args)
  );

  server.registerTool(
    "rappi_delete_address",
    {
      title: "Delete Rappi address",
      description: "Delete a saved address. Requires explicit_user_intent.",
      inputSchema: AddressWriteInputSchema.shape,
      annotations: gatedWrite
    },
    async (args) => handleDeleteAddress(args)
  );

  server.registerTool(
    "rappi_list_active_orders",
    {
      title: "List active Rappi orders",
      description: "In-flight / active orders plus in-progress (unofficial user-order-home). Read-only.",
      inputSchema: ReadInputSchema.shape,
      annotations: readOnly
    },
    async (args) => handleListActiveOrders(args)
  );

  server.registerTool(
    "rappi_get_order_eta",
    {
      title: "Get Rappi order ETA",
      description: "ETA for one order. Read-only.",
      inputSchema: OrderIdInputSchema.shape,
      annotations: readOnly
    },
    async (args) => handleGetOrderEta(args)
  );

  server.registerTool(
    "rappi_get_order_receipt",
    {
      title: "Get Rappi order receipt",
      description: "Receipt for one order. Identity redacted by default. Read-only.",
      inputSchema: OrderIdInputSchema.shape,
      annotations: readOnly
    },
    async (args) => handleGetOrderReceipt(args)
  );

  server.registerTool(
    "rappi_get_order_invoice",
    {
      title: "Get Rappi order invoice",
      description: "Invoice for one order. Identity redacted by default. Read-only.",
      inputSchema: OrderIdInputSchema.shape,
      annotations: readOnly
    },
    async (args) => handleGetOrderInvoice(args)
  );

  server.registerTool(
    "rappi_get_order_status",
    {
      title: "Get Rappi order status",
      description: "Courier/order-status surface for one order. Read-only.",
      inputSchema: OrderIdInputSchema.shape,
      annotations: readOnly
    },
    async (args) => handleGetOrderStatus(args)
  );

  server.registerTool(
    "rappi_list_coupons",
    {
      title: "List Rappi coupons",
      description: "Wallet coupons on unofficial user-order-home. Read-only. Does not apply a coupon.",
      inputSchema: ReadInputSchema.shape,
      annotations: readOnly
    },
    async (args) => handleListCoupons(args)
  );

  server.registerTool(
    "rappi_apply_coupon",
    {
      title: "Apply Rappi coupon",
      description: "POST /api/user-order-home/coupons/apply (401 JSON no token). Dual-gated. Does not checkout.",
      inputSchema: CouponApplyInputSchema.shape,
      annotations: gatedWrite
    },
    async (args) => handleApplyCoupon(args)
  );

  server.registerTool(
    "rappi_order_chat",
    {
      title: "Read Rappi courier chat",
      description:
        "GET /api/ms/order-status/v1/orders/:id/chat (401 JSON). Generic /api/ms/chat is 403 PATH_NOT_ALLOWED. Read-only, redacted.",
      inputSchema: OrderIdInputSchema.shape,
      annotations: readOnly
    },
    async (args) => handleOrderChat(args)
  );

  server.registerTool(
    "rappi_checkout_preview",
    {
      title: "Preview Rappi checkout",
      description: "Totals preview. Does not charge. Read-only.",
      inputSchema: CheckoutPreviewInputSchema.shape,
      annotations: readOnly
    },
    async (args) => handleCheckoutPreview(args)
  );

  server.registerTool(
    "rappi_home",
    {
      title: "Rappi home",
      description: "Web home for the logged-in consumer. Read-only.",
      inputSchema: ReadInputSchema.shape,
      annotations: readOnly
    },
    async (args) => handleHome(args)
  );

  server.registerTool(
    "rappi_home_feed",
    {
      title: "Rappi home feed",
      description: "Dynamic home feed (web-gateway). Read-only.",
      inputSchema: ReadInputSchema.shape,
      annotations: readOnly
    },
    async (args) => handleHomeFeed(args)
  );

  server.registerTool(
    "rappi_browse_stores",
    {
      title: "Browse Rappi stores (web)",
      description: "Web-gateway store list. Read-only. Complements rappi_search_stores.",
      inputSchema: ReadInputSchema.shape,
      annotations: readOnly
    },
    async (args) => handleBrowseStores(args)
  );

  server.registerTool(
    "rappi_browse_catalog",
    {
      title: "Browse Rappi catalog",
      description: "Nearby store catalog (restaurant-bus). Read-only. Optional lat/lng.",
      inputSchema: SearchInputSchema.shape,
      annotations: readOnly
    },
    async (args) => handleBrowseCatalog(args)
  );

  server.registerTool(
    "rappi_recent_searches",
    {
      title: "Rappi recent searches",
      description: "Recent/top searches near a point. Read-only.",
      inputSchema: GeoInputSchema.shape,
      annotations: readOnly
    },
    async (args) => handleRecentSearches(args)
  );

  server.registerTool(
    "rappi_web_cart",
    {
      title: "Get Rappi web cart",
      description: "Alternate cart inspect via web-gateway. Street/phone/email/last-four redacted. Read-only.",
      inputSchema: ReadInputSchema.shape,
      annotations: readOnly
    },
    async (args) => handleWebCart(args)
  );

  server.registerTool(
    "rappi_reorder",
    {
      title: "Reorder a Rappi order",
      description: "Rebuilds the cart from a past order. Gated cart write. Does not checkout.",
      inputSchema: OrderWriteInputSchema.shape,
      annotations: gatedWrite
    },
    async (args) => handleReorder(args)
  );

  server.registerTool(
    "rappi_cancel_order",
    {
      title: "Cancel Rappi order",
      description:
        "Gated. May refund. Requires mutations and explicit_user_intent. Guest tokens rejected.",
      inputSchema: OrderWriteInputSchema.shape,
      annotations: gatedWrite
    },
    async (args) => handleCancelOrder(args)
  );

  server.registerTool(
    "rappi_rate_order",
    {
      title: "Rate Rappi order",
      description: "Requires explicit_user_intent. Does not charge.",
      inputSchema: RateOrderInputSchema.shape,
      annotations: gatedWrite
    },
    async (args) => handleRateOrder(args)
  );

  server.registerTool(
    "rappi_tip_order",
    {
      title: "Tip a Rappi order",
      description: "FAIL-CLOSED. Charges a tip. Requires mutations, explicit_user_intent, and a personal token.",
      inputSchema: TipOrderInputSchema.shape,
      annotations: gatedWrite
    },
    async (args) => handleTipOrder(args)
  );

  server.registerTool(
    "rappi_logout",
    {
      title: "Logout Rappi MCP",
      description: "Clears the local token file. Requires explicit_user_intent. Not gated by RAPPI_ALLOW_MUTATIONS.",
      inputSchema: LogoutInputSchema.shape,
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false }
    },
    async (args) => handleLogout(args)
  );
}
