import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hybrid data-access core.
 *
 * Every mutation goes through the `api` edge function, which re-validates
 * input, recomputes prices, and enforces ownership/roles in TypeScript.
 * If that server is unreachable or returns a 5xx (deploy blip, cold start,
 * traffic spike), the call transparently falls back to the direct
 * RLS-protected Supabase path so the app keeps working.
 *
 * Fallback is intentionally NOT used for 4xx responses — those are real
 * validation/permission failures and must surface to the user.
 */

export class ServiceError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status = 400, details?: unknown) {
    super(message);
    this.name = "ServiceError";
    this.status = status;
    this.details = details;
  }
}

export class ValidationError extends ServiceError {
  fieldErrors: Record<string, string[]>;
  constructor(message: string, fieldErrors: Record<string, string[]>) {
    super(message, 400, fieldErrors);
    this.name = "ValidationError";
    this.fieldErrors = fieldErrors;
  }
}

/** Validate client-side with a Zod schema, throwing a typed ValidationError. */
export function validate<S extends z.ZodTypeAny>(schema: S, input: unknown): z.output<S> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors as Record<string, string[]>;
    const first = Object.values(flat).flat()[0] ?? "Invalid input";
    throw new ValidationError(first, flat);
  }
  return parsed.data;
}

const FUNCTION_NAME = "api";

interface CallOptions<T> {
  /** Direct-Supabase path used only when the server layer is unavailable. */
  fallback?: () => Promise<T>;
  /** Set false to hard-fail instead of degrading to the fallback. */
  allowFallback?: boolean;
}

async function invokeServer<T>(action: string, payload: unknown): Promise<T> {
  const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
    body: { action, payload },
  });

  if (error) {
    // supabase-js surfaces non-2xx as FunctionsHttpError with a readable body.
    const ctx = (error as unknown as { context?: Response }).context;
    if (ctx && typeof ctx.json === "function") {
      let parsed: any = null;
      try {
        parsed = await ctx.clone().json();
      } catch {
        /* non-JSON error body */
      }
      const status = ctx.status ?? 500;
      const message = parsed?.error?.message ?? error.message ?? "Request failed";
      if (status === 400 && parsed?.error?.details) {
        throw new ValidationError(message, parsed.error.details);
      }
      if (status < 500) throw new ServiceError(message, status, parsed?.error?.details);
      throw new ServiceError(message, status);
    }
    // Network / invocation failure — treated as retryable (5xx-like).
    throw new ServiceError(error.message ?? "Server unavailable", 503);
  }

  if (!data?.ok) {
    const message = data?.error?.message ?? "Request failed";
    throw new ServiceError(message, 400, data?.error?.details);
  }
  return data.data as T;
}

export async function callApi<T>(
  action: string,
  payload: unknown,
  options: CallOptions<T> = {}
): Promise<T> {
  const { fallback, allowFallback = true } = options;
  try {
    return await invokeServer<T>(action, payload);
  } catch (err) {
    const status = err instanceof ServiceError ? err.status : 500;
    const retryable = status >= 500 || status === 0;
    if (fallback && allowFallback && retryable) {
      console.warn(`[services] "${action}" server path failed (${status}); using direct fallback.`);
      return await fallback();
    }
    throw err;
  }
}

/** Normalizes a PostgrestError (or anything) into a ServiceError. */
export function toServiceError(err: unknown): ServiceError {
  if (err instanceof ServiceError) return err;
  const anyErr = err as { message?: string; code?: string };
  const message = anyErr?.message ?? "Something went wrong";
  const status = anyErr?.code === "42501" ? 403 : 500;
  return new ServiceError(message, status);
}

/** Unwraps a Supabase query result, throwing a normalized error. */
export function unwrap<T>(res: { data: T | null; error: unknown }): T {
  if (res.error) throw toServiceError(res.error);
  return res.data as T;
}
