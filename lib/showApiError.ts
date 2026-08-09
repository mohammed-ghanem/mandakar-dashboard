import { toast } from "sonner";

function isHtmlMessage(value: string) {
  const trimmed = value.trim().toLowerCase();
  return trimmed.startsWith("<!doctype") || trimmed.startsWith("<html");
}

function collectMessages(value: unknown, out: string[]) {
  if (value == null) return;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed && !isHtmlMessage(trimmed)) out.push(trimmed);
    return;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    out.push(String(value));
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectMessages(item, out));
    return;
  }

  if (typeof value === "object") {
    Object.values(value).forEach((item) => collectMessages(item, out));
  }
}

function resolveErrorPayload(err: unknown): {
  status?: number;
  payload: unknown;
} {
  const raw = err as { status?: number; data?: unknown } | null;
  return {
    status: raw?.status,
    payload: raw?.data ?? err,
  };
}

/**
 * Show backend API errors via toast (validation errors, message, network, etc.).
 * Safe when `errors` is an empty object/array or values are strings instead of arrays.
 */
export function showApiError(
  err: unknown,
  options?: {
    toastId?: string | number;
    fallback?: string;
  },
) {
  const fallback = options?.fallback?.trim() || "Something went wrong";
  const toastId = options?.toastId;
  const { status, payload } = resolveErrorPayload(err);

  const messages: string[] = [];
  const data =
    typeof payload === "string"
      ? { message: payload }
      : ((payload as Record<string, unknown> | null) ?? {});

  if (data && typeof data === "object") {
    if ("errors" in data) collectMessages(data.errors, messages);
    if (messages.length === 0 && "message" in data) {
      collectMessages(data.message, messages);
    }
    if (messages.length === 0 && "error" in data) {
      collectMessages(data.error, messages);
    }
  }

  if (messages.length === 0 && status === 413) {
    messages.push(fallback);
  }

  if (messages.length === 0) {
    messages.push(fallback);
  }

  const unique = [...new Set(messages)];

  unique.forEach((msg, index) => {
    if (index === 0 && toastId !== undefined) {
      toast.error(msg, { id: toastId });
      return;
    }
    toast.error(msg);
  });
}
