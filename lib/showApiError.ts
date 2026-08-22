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
    ? "انقطع الاتصال أثناء الرفع قبل وصول رد من السيرفر. غالبًا مهلة المتصفح/Nginx/البروكسي انتهت — جرّب ملف أصغر أو ارفع المهلات."
    : "Connection dropped during upload before the server responded. Often a browser/Nginx/proxy timeout — try a smaller file or raise timeouts.";
}

function clientTimeoutMessage(lang: "ar" | "en") {
  return lang === "ar"
    ? "انتهت مهلة الرفع من المتصفح قبل اكتمال الطلب. الملف كبير أو الاتصال بطيء — أعد المحاولة أو ارفع المهلة."
    : "The browser upload timed out before the request finished. The file is large or the connection is slow — retry or raise the client timeout.";
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

  // Use warn — console.error triggers Next.js red overlay and hides toasts.
  console.warn("[API Error]", { status, payload, err });

  const backendMessages = extractBackendMessages(payload);

  let messages: string[] = [...backendMessages];
  let isTimeout = false;

  if (messages.length === 0) {
    if (status === 413) {
      messages.push(payloadTooLargeMessage(lang));
    } else {
      const code =
        payload != null && typeof payload === "object"
          ? String((payload as { code?: string }).code ?? "")
          : "";
      const msgFromPayload =
        typeof payload === "string"
          ? payload
          : payload != null &&
              typeof payload === "object" &&
              typeof (payload as { message?: unknown }).message === "string"
            ? String((payload as { message: string }).message)
            : "";

      isTimeout =
        code === "ECONNABORTED" ||
        msgFromPayload.toLowerCase().includes("timeout");

      const isNetwork =
        status == null ||
        status === 0 ||
        (typeof payload === "string" && isNetworkFailureMessage(payload)) ||
        (payload != null &&
          typeof payload === "object" &&
          (payload as { network?: boolean }).network === true);

      if (isTimeout) {
        messages.push(clientTimeoutMessage(lang));
      } else if (isNetwork) {
        messages.push(connectionDroppedMessage(lang));
      } else {
        messages.push(fallback);
      }
    }
  }

  const unique = [...new Set(messages.map((m) => m.trim()).filter(Boolean))];
  const duration = isTimeout || status == null ? 12000 : 6000;

  unique.forEach((msg, index) => {
    if (index === 0 && toastId !== undefined) {
      toast.error(msg, { id: toastId, duration });
      return;
    }
    toast.error(msg, { duration });
  });
}
