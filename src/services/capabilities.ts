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
      "rappi_checkout_preview",
      "rappi_order_chat"
    ],
    gated_cart_writes: [
      "rappi_add_to_cart",
      "rappi_update_cart_item",
      "rappi_clear_cart",
      "rappi_reorder",
      "rappi_apply_coupon"
    ],
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
    ],
    country_bases: ["BR", "CO", "MX", "AR", "CL", "PE", "UY", "EC", "CR"],
    scorecard_top5: false,
    honest_gaps: [
      {
        wanted: "rappi_auth OTP start (iFood-style)",
        probe: "POST /api/rocket/v2/otp 404 JSON; /api/ms/auth/otp 403 JSON; guest POST 400 invalid_deviceid (guest already shipped)"
      },
      {
        wanted: "live home-token proof of tip/cancel/rate",
        probe: "POST .../orders/:id/tip|cancel|rate KEEP 401 JSON without token; no personal Rappi token in this environment"
      },
      {
        wanted: "generic /api/ms/chat",
        probe: "GET /api/ms/chat and /support-chat → 403 JSON PATH_NOT_ALLOWED; order-status chat KEEP 401"
      }
    ]
  };
}
