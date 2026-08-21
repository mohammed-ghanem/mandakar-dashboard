import { toast } from "sonner";

function isHtmlMessage(value: string) {
  const trimmed = value.trim().toLowerCase();
  return trimmed.startsWith("<!doctype") || trimmed.startsWith("<html");
}

function isNetworkFailureMessage(value: string) {
  const lower = value.trim().toLowerCase();
  return (
    lower === "network error" ||
    lower.includes("err_network") ||
    lower.includes("failed to fetch") ||
    lower.includes("networkerror") ||
    lower.includes("err_connection") ||
    lower.includes("econnaborted") ||
    lower.includes("timeout")
  );
}

function connectionDroppedMessage(lang: "ar" | "en") {
  return lang === "ar"
    ? "انقطع الاتصال أثناء الرفع قبل وصول رد من السيرفر. غالباً الحد ما زال عند Nginx/البروكسي أو مهلة الاتصال (مش Laravel فقط) — راجع client_max_body_size و proxy_read_timeout."
    : "Connection dropped during upload before the server responded. A proxy/Nginx body limit or timeout is likely still in place (not only Laravel) — check client_max_body_size and proxy_read_timeout.";
}

function payloadTooLargeMessage(lang: "ar" | "en") {
  return lang === "ar"
    ? "حجم الملف أكبر من الحد المسموح على السيرفر (413)."
    : "The file exceeds the server upload limit (413).";
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

function extractBackendMessages(payload: unknown): string[] {
  const messages: string[] = [];

  if (typeof payload === "string") {
    if (!isHtmlMessage(payload) && !isNetworkFailureMessage(payload)) {
      messages.push(payload.trim());
    }
    return messages;
  }

  if (!payload || typeof payload !== "object") return messages;

  const data = payload as Record<string, unknown>;

  // Skip synthetic axios network wrapper — not a Laravel body.
  if (data.network === true) return messages;

  if ("errors" in data) collectMessages(data.errors, messages);
  if (messages.length === 0 && "message" in data) {
    collectMessages(data.message, messages);
  }
  if (messages.length === 0 && "error" in data) {
    collectMessages(data.error, messages);
  }

  // Drop pure network strings if they slipped into message.
  return messages.filter((msg) => !isNetworkFailureMessage(msg));
}

/**
 * Show API errors via toast.
 * Prefers real backend `message` / `errors` whenever an HTTP response body exists.
 */
export function showApiError(
  err: unknown,
  options?: {
    toastId?: string | number;
    fallback?: string;
    lang?: "ar" | "en";
  },
) {
  const lang = options?.lang ?? "ar";
  const fallback = options?.fallback?.trim() || "Something went wrong";
  const toastId = options?.toastId;
  const { status, payload } = resolveErrorPayload(err);

  // Helpful for Network tab debugging.
  console.error("[API Error]", { status, payload, err });

  const backendMessages = extractBackendMessages(payload);

  let messages: string[] = [...backendMessages];

  if (messages.length === 0) {
    if (status === 413) {
      messages.push(payloadTooLargeMessage(lang));
    } else {
      const isNetwork =
        status == null ||
        status === 0 ||
        (typeof payload === "string" && isNetworkFailureMessage(payload)) ||
        (payload != null &&
          typeof payload === "object" &&
          (payload as { network?: boolean }).network === true);

      if (isNetwork) {
        messages.push(connectionDroppedMessage(lang));
      } else {
        messages.push(fallback);
      }
    }
  }

  const unique = [...new Set(messages.map((m) => m.trim()).filter(Boolean))];

  unique.forEach((msg, index) => {
    if (index === 0 && toastId !== undefined) {
      toast.error(msg, { id: toastId });
      return;
    }
    toast.error(msg);
  });
}
