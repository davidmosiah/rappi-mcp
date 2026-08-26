import { promises as fs } from "node:fs";
import { homedir } from "node:os";
import { envAccessToken, peekConfig } from "./config.js";
import { TokenStore } from "./token-store.js";

type Env = Record<string, string | undefined>;

export interface ConnectionStatus extends Record<string, unknown> {
  ok: boolean;
  unofficial: true;
  mutations_enabled: boolean;
  privacy_mode: string;
  country: string;
  api_base: string;
  missing_env: string[];
  token: {
    path: string;
    exists: boolean;
    source?: string;
    guest?: boolean;
  };
  next_steps: string[];
  never_pays_by_default: true;
}

export async function buildConnectionStatus(options: { env?: Env; homeDir?: string } = {}): Promise<ConnectionStatus> {
  const env = options.env ?? process.env;
  const homeDir = options.homeDir ?? homedir();
  const config = peekConfig(env, homeDir);
  const store = new TokenStore(config.tokenPath);
  const fileToken = await store.read();
  const envToken = Boolean(envAccessToken(env));
  let exists = Boolean(fileToken?.access_token) || envToken;
  if (!exists) {
    try {
      await fs.access(config.tokenPath);
      exists = true;
    } catch {
      exists = false;
    }
  }
  const guest = fileToken?.source === "guest";
  const missing: string[] = [];
  if (!exists) missing.push("RAPPI_ACCESS_TOKEN");
  const next: string[] = [];
  if (!exists) {
    next.push("Open https://www.rappi.com.br logged in → DevTools Network → copy Authorization.");
    next.push("Then rappi-mcp-unofficial auth --from-header \"Bearer …\" or auth --token <jwt> (never commit it).");
  }
  if (!config.allowMutations) {
    next.push("Reads only. Checkout stays blocked until RAPPI_ALLOW_MUTATIONS is enabled AND explicit_user_intent.");
  }
  if (guest) next.push("Guest token cannot place orders. Replace with a personal token.");

  return {
    ok: exists && Number(process.versions.node.split(".")[0] ?? 0) >= 20,
    unofficial: true,
    mutations_enabled: config.allowMutations,
    privacy_mode: config.privacyMode,
    country: config.country,
    api_base: config.apiBase,
    missing_env: missing,
    token: {
      path: config.tokenPath,
      exists,
      source: fileToken?.source,
      guest
    },
    next_steps: next,
    never_pays_by_default: true
  };
}
