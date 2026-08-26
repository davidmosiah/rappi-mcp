export const USER_ACTION_REQUIRED = "USER_ACTION_REQUIRED";

export class MutationGateError extends Error {
  readonly code = USER_ACTION_REQUIRED;

  constructor(message: string) {
    super(message);
    this.name = "MutationGateError";
  }
}

export interface GateInput {
  allowMutations: boolean;
  explicitUserIntent?: boolean;
}

function intentOn(value: boolean | undefined): boolean {
  return value === true;
}

export function assertExplicitIntent(explicitUserIntent: boolean | undefined, action: string): void {
  if (!intentOn(explicitUserIntent)) {
    throw new MutationGateError(
      `${USER_ACTION_REQUIRED}: explicit_user_intent must be true to ${action}. Confirm with the user first.`
    );
  }
}

export function assertMutationsEnabled(allowMutations: boolean, action: string): void {
  if (!allowMutations) {
    throw new MutationGateError(
      `${USER_ACTION_REQUIRED}: RAPPI_ALLOW_MUTATIONS=true is required to ${action}. Default is read-only and never pays.`
    );
  }
}

export function assertCartWriteAllowed(input: GateInput): void {
  assertMutationsEnabled(input.allowMutations, "change the Rappi cart");
  assertExplicitIntent(input.explicitUserIntent, "change the Rappi cart");
}

export function assertPlaceOrderAllowed(input: GateInput): void {
  assertMutationsEnabled(input.allowMutations, "place an order or charge money on Rappi");
  assertExplicitIntent(input.explicitUserIntent, "place an order or charge money on Rappi");
}

export function assertPaymentWriteAllowed(input: GateInput): void {
  assertMutationsEnabled(input.allowMutations, "change Rappi payment methods");
  assertExplicitIntent(input.explicitUserIntent, "change Rappi payment methods");
}

export function assertAddressWriteAllowed(explicitUserIntent: boolean | undefined): void {
  assertExplicitIntent(explicitUserIntent, "change Rappi delivery addresses");
}

export function assertLogoutAllowed(explicitUserIntent: boolean | undefined): void {
  assertExplicitIntent(explicitUserIntent, "clear the local Rappi token");
}

export function assertNotGuestForCharge(source: string | undefined): void {
  if (source === "guest") {
    throw new MutationGateError(
      `${USER_ACTION_REQUIRED}: a guest token cannot place orders or change payment. Auth with a personal Rappi access token first.`
    );
  }
}

export function assertCancelOrderAllowed(input: GateInput): void {
  assertMutationsEnabled(input.allowMutations, "cancel a Rappi order");
  assertExplicitIntent(input.explicitUserIntent, "cancel a Rappi order");
}

export function assertTipAllowed(input: GateInput): void {
  assertMutationsEnabled(input.allowMutations, "add a tip on Rappi");
  assertExplicitIntent(input.explicitUserIntent, "add a tip on Rappi");
}

export function assertReorderAllowed(input: GateInput): void {
  assertCartWriteAllowed(input);
}
