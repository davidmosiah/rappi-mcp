import { homedir } from "node:os";
import { join } from "node:path";
import { COUNTRY_BASES, DEFAULT_API_BASE, TOKEN_DIR_NAME } from "../constants.js";
import type { PrivacyMode, RappiConfig } from "../types.js";

type Env = Record<string, string | undefined>;

function env(name: string, source: Env = process.env): string | undefined {
  const value = source[name];
  return value && value.trim() ? value.trim() : undefined;
}

function parseBool(value: string | undefined, fallback = false): boolean {
  if (!value) return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function parsePrivacyMode(value: string | undefined): PrivacyMode {
  if (value === "summary" || value === "structured" || value === "raw") return value;
  return "structured";
}

function parseCoord(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function tokenDir(homeDir = homedir()): string {
  return join(homeDir, TOKEN_DIR_NAME);
}

export function peekConfig(source: Env = process.env, homeDir = homedir()): RappiConfig {
  const country = (env("RAPPI_COUNTRY", source) ?? "BR").toUpperCase();
  const apiBase = env("RAPPI_API_BASE", source) ?? COUNTRY_BASES[country] ?? DEFAULT_API_BASE;
  return {
    apiBase: apiBase.replace(/\/$/, ""),
    country,
    tokenPath: env("RAPPI_TOKEN_PATH", source) ?? join(tokenDir(homeDir), "tokens.json"),
    configPath: env("RAPPI_CONFIG_PATH", source) ?? join(tokenDir(homeDir), "config.json"),
    privacyMode: parsePrivacyMode(env("RAPPI_PRIVACY_MODE", source)),
    allowMutations: parseBool(env("RAPPI_ALLOW_MUTATIONS", source), false),
    latitude: parseCoord(env("RAPPI_LAT", source)),
    longitude: parseCoord(env("RAPPI_LNG", source))
  };
}

export function envAccessToken(source: Env = process.env): string | undefined {
  return env("RAPPI_ACCESS_TOKEN", source);
}
