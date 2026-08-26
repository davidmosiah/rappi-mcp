import { z } from "zod";

export const ResponseFormatSchema = z.enum(["markdown", "json"]).default("markdown");
export const PrivacyModeSchema = z.enum(["summary", "structured", "raw"]).optional();

const Intent = z
  .boolean()
  .default(false)
  .describe("Must be true after the user explicitly asked for this write.");

export const ResponseOnlyInputSchema = z.object({
  response_format: ResponseFormatSchema
}).strict();

export const ReadInputSchema = z.object({
  privacy_mode: PrivacyModeSchema,
  response_format: ResponseFormatSchema
}).strict();

export const SearchInputSchema = z.object({
  query: z.string().max(200).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  limit: z.number().int().min(1).max(50).optional(),
  privacy_mode: PrivacyModeSchema,
  response_format: ResponseFormatSchema
}).strict();

export const OrderIdInputSchema = z.object({
  order_id: z.string().min(1),
  privacy_mode: PrivacyModeSchema,
  response_format: ResponseFormatSchema
}).strict();

export const LogoutInputSchema = z.object({
  explicit_user_intent: Intent,
  response_format: ResponseFormatSchema
}).strict();

export const CartWriteInputSchema = z.object({
  product_id: z.string().min(1),
  store_id: z.string().min(1).optional(),
  quantity: z.number().int().min(1).max(99).default(1),
  explicit_user_intent: Intent,
  response_format: ResponseFormatSchema
}).strict();

export const ClearCartInputSchema = z.object({
  explicit_user_intent: Intent,
  response_format: ResponseFormatSchema
}).strict();

export const AddressWriteInputSchema = z.object({
  address_id: z.string().min(1),
  explicit_user_intent: Intent,
  response_format: ResponseFormatSchema
}).strict();

export const PaymentWriteInputSchema = z.object({
  payment_method_id: z.string().min(1),
  explicit_user_intent: Intent,
  response_format: ResponseFormatSchema
}).strict();

export const PlaceOrderInputSchema = z.object({
  address_id: z.string().min(1),
  payment_method_id: z.string().min(1),
  store_id: z.string().min(1).optional(),
  notes: z.string().max(280).optional(),
  explicit_user_intent: Intent,
  response_format: ResponseFormatSchema
}).strict();
