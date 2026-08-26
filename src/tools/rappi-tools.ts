import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  AddressWriteInputSchema,
  CartWriteInputSchema,
  ClearCartInputSchema,
  LogoutInputSchema,
  OrderIdInputSchema,
  PaymentWriteInputSchema,
  PlaceOrderInputSchema,
  ReadInputSchema,
  ResponseOnlyInputSchema,
  SearchInputSchema
} from "../schemas/common.js";
import {
  handleAddToCart,
  handleCapabilities,
  handleClearCart,
  handleConnectionStatus,
  handleGetCart,
  handleGetOrder,
  handleListAddresses,
  handleListOrders,
  handleLogout,
  handlePlaceOrder,
  handlePrivacyAudit,
  handleSearchProducts,
  handleSearchStores,
  handleSetActiveAddress,
  handleSetPaymentMethod,
  handleUpdateCartItem
} from "../services/handlers.js";

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
