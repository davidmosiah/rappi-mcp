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
      "rappi_get_cart",
      "rappi_list_addresses",
      "rappi_list_orders",
      "rappi_get_order"
    ],
    gated_cart_writes: ["rappi_add_to_cart", "rappi_update_cart_item", "rappi_clear_cart"],
    gated_pay: ["rappi_place_order", "rappi_set_payment_method"],
    gated_intent_only: ["rappi_logout", "rappi_set_active_address"],
    recommended_agent_flow: [
      "rappi_connection_status",
      "rappi_search_stores / rappi_search_products",
      "rappi_get_cart / rappi_list_orders (read, redacted)",
      "Never call rappi_place_order unless the user explicitly asked AND RAPPI_ALLOW_MUTATIONS=true"
    ]
  };
}
