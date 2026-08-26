import { PATHS } from "../constants.js";

const PREFIXES = Object.values(PATHS);

export function isAllowedConsumerPath(path: string): boolean {
  if (typeof path !== "string" || !path.startsWith("/")) return false;
  if (path.includes("://") || path.includes("..") || path.includes("\\")) return false;
  return PREFIXES.some((base) => path === base || path.startsWith(`${base}/`));
}

export function assertAllowedConsumerPath(path: string): void {
  if (!isAllowedConsumerPath(path)) {
    throw new Error(`PATH_NOT_ALLOWED: refusing unofficial Rappi path ${path}`);
  }
}
