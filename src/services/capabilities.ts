import { PATHS, SERVER_VERSION } from "../constants.js";
import { peekConfig } from "./config.js";

export function buildCapabilities() {
  const config = peekConfig();
  return {
    unofficial: true as const,
    version: SERVER_VERSION,
    surface: "Rappi consumer web/app APIs — not Rappi Partners restaurant OAuth",
    api_base: config.apiBase,
    documented_paths: PATHS,
    mutations_enabled: config.allowMutations,
    never_pays_by_default: true,
    read_tools: [
      "rappi_search_stores",
      "rappi_search_products",
      "rappi_get_store",
      "rappi_browse_stores",
      "rappi_browse_catalog",
      "rappi_home",
      "rappi_home_feed",
      "rappi_recent_searches",
      "rappi_get_cart",
      "rappi_web_cart",
      "rappi_list_addresses",
      "rappi_geocode_address",
      "rappi_list_orders",
      "rappi_list_active_orders",
      "rappi_get_order",
      "rappi_track_order",
      "rappi_get_order_eta",
      "rappi_get_order_receipt",
      "rappi_get_order_invoice",
      "rappi_get_order_status",
      "rappi_list_payment_methods",
      "rappi_list_coupons",
      "rappi_checkout_preview"
    ],
    gated_cart_writes: ["rappi_add_to_cart", "rappi_update_cart_item", "rappi_clear_cart", "rappi_reorder"],
    gated_pay: ["rappi_place_order", "rappi_set_payment_method", "rappi_cancel_order", "rappi_tip_order"],
    gated_intent_only: [
      "rappi_logout",
      "rappi_set_active_address",
      "rappi_create_address",
      "rappi_update_address",
      "rappi_delete_address",
      "rappi_rate_order"
    ],
    recommended_agent_flow: [
      "rappi_connection_status",
      "rappi_search_stores / rappi_search_products",
      "rappi_get_cart / rappi_list_orders (read, redacted)",
      "Never call rappi_place_order unless the user explicitly asked AND RAPPI_ALLOW_MUTATIONS=true"
    ]
  };
}
