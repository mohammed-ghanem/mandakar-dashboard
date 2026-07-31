/* eslint-disable @typescript-eslint/no-explicit-any */
import { Plugin } from "ckeditor5";

/**
 * PasteFromOffice (free) converts Word footnotes into CKEditor's Footnotes markup
 * (`sup.footnote`, `ol.footnotes`, `a.footnote-backlink` → "^"). That markup only
 * works with the premium Footnotes plugin. Without it, paste becomes:
 *   ^
 *   .1
 *   ([1]) text
 *
 * This plugin strips MS footnote chrome BEFORE PasteFromOffice runs (by wrapping
 * the clipboard HTML), and cleans any leftover footnote artifacts after.
 */

const UNICODE_SUPER: Record<string, string> = {
  "⁰": "0",
  "¹": "1",
  "²": "2",
  "³": "3",
  "⁴": "4",
  "⁵": "5",
  "⁶": "6",
  "⁷": "7",
  "⁸": "8",
  "⁹": "9",
};

function unicodeSuperscriptsToDigits(value: string) {
  return [...value].map((ch) => UNICODE_SUPER[ch] ?? ch).join("");
}

function stripToText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--\[if[\s\S]*?<!\[endif\]-->/gi, " ")
    .replace(/<!\[if[\s\S]*?<!\[endif\]>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractFragment(html: string) {
  const start = html.indexOf("<!--StartFragment-->");
  const end = html.indexOf("<!--EndFragment-->");
  if (start !== -1 && end !== -1 && end > start) {
    return html.slice(start + "<!--StartFragment-->".length, end);
  }

  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return body?.[1] ?? html;
}

function hasOfficeFootnotes(html: string) {
  return /mso-footnote|MsoFootnote|mso-element\s*:\s*footnote|_ftn\d|footnote-list|footnote-backlink|class=["'][^"']*footnotes/i.test(
    html,
  );
}

function looksLikeBrokenFootnotes(html: string) {
  return (
    /class=["'][^"']*footnote/i.test(html) ||
    /footnote-backlink/i.test(html) ||
    /\^\s*\.?\s*\d+/.test(html) ||
    /\(\[\d+\]\)/.test(html)
  );
}

function wrapDataTransfer(original: any, htmlOverride: string) {
  return {
    getData(type: string) {
      if (type === "text/html") return htmlOverride;
      return original.getData(type);
    },
    setData(type: string, value: string) {
      return original.setData?.(type, value);
    },
    get types() {
      return original.types;
    },
    get files() {
      return original.files;
    },
    get effectAllowed() {
      return original.effectAllowed;
    },
    set effectAllowed(value: string) {
      if (original) original.effectAllowed = value;
    },
    get dropEffect() {
      return original.dropEffect;
    },
    set dropEffect(value: string) {
      if (original) original.dropEffect = value;
    },
  };
}

function toViewFragment(editor: any, html: string) {
  const processor = editor.data.htmlProcessor ?? editor.data.processor;
  if (!processor?.toView) return null;
  return processor.toView(html);
}

function viewToHtml(editor: any, viewFragment: any) {
  const processor = editor.data.htmlProcessor ?? editor.data.processor;
  if (!processor?.toData) return null;
  return processor.toData(viewFragment);
}

/**
 * Keep a Word "shell" so PasteFromOffice still recognizes the paste after we
 * rewrite the fragment (it matches xmlns:o / Word generator meta).
 */
export function sanitizeOfficeClipboardHtml(html: string): string {
  const cleanedFragment = sanitizeWordHtml(html);
  const start = html.indexOf("<!--StartFragment-->");
  const end = html.indexOf("<!--EndFragment-->");

  if (start !== -1 && end !== -1 && end > start) {
    return (
      html.slice(0, start + "<!--StartFragment-->".length) +
      cleanedFragment +
      html.slice(end)
    );
  }

  if (/xmlns:o=|microsoft\s*word/i.test(html)) {
    return `<html xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta name="generator" content="Microsoft Word 15"></head><body>${cleanedFragment}</body></html>`;
  }

  return cleanedFragment;
}

function footnotePlainText(inner: string) {
  return stripToText(inner)
    .replace(/^\s*\^?\s*\.?\s*/, "")
    .replace(/^[\s\[\(]*\d+[\s\]\)]*/, "")
    .trim();
}

function collectMsFootnoteDefinitions(html: string) {
  const defTexts = new Map<string, string>();
  // Only real footnote blocks — not footnote-list.
  const re =
    /<div\b[^>]*mso-element\s*:\s*footnote(?!-list)[^>]*>[\s\S]*?<\/div>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const block = match[0];
    const id = block.match(/\bid=["']?(?:ftn)?(\d+)["']?/i)?.[1];
    const plain = footnotePlainText(block);
    const num = id || plain.match(/(\d+)/)?.[1];
    if (num && plain) defTexts.set(num, plain);
  }
  return defTexts;
}

function formatFootnoteDefinitions(defTexts: Map<string, string>) {
  if (!defTexts.size) return "";
  return [...defTexts.entries()]
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([n, text]) => `<p><sup>(${n})</sup> ${text}</p>`)
    .join("");
}

/**
 * Convert Word / CK footnote HTML into plain paragraphs + <sup>(n)</sup>.
 */
export function sanitizeWordHtml(html: string): string {
  let out = extractFragment(html);

  // Keep Word conditional footnote markers' inner text.
  out = out.replace(/<!--\[if !supportFootnotes\]-->/gi, "");
  out = out.replace(/<!--\[endif\]-->/gi, "");
  out = out.replace(/<!\[if !supportFootnotes\]>/gi, "");
  out = out.replace(/<!\[endif\]>/gi, "");

  // ---- Already-transformed CK Footnotes markup (from PasteFromOffice) ----
  out = convertCkFootnotesMarkup(out);

  // ---- Raw Microsoft Word footnote markup ----
  // IMPORTANT: match `footnote` with (?!-list) so we never treat footnote-list as a note.

  const defTexts = collectMsFootnoteDefinitions(out);

  // Inline reference: <span class="MsoFootnoteReference">
  out = out.replace(
    /<span\b[^>]*MsoFootnoteReference[^>]*>([\s\S]*?)<\/span>/gi,
    (_m, inner: string) => {
      const text = stripToText(inner);
      const n = text.match(/(\d+)/)?.[1];
      return n ? `<sup>(${n})</sup>` : text ? `<sup>${text}</sup>` : "";
    },
  );

  // mso-special-character:footnote
  out = out.replace(
    /<span\b[^>]*mso-special-character\s*:\s*footnote(?!-list)[^>]*>([\s\S]*?)<\/span>/gi,
    (_m, inner: string) => {
      const text = stripToText(inner);
      const n = text.match(/(\d+)/)?.[1];
      return n ? `<sup>(${n})</sup>` : text ? `<sup>${text}</sup>` : "";
    },
  );

  // Anchors with mso-footnote-id / _ftnref / #_ftn
  out = out.replace(
    /<a\b[^>]*(?:mso-footnote-id\s*:\s*ftn(\d+)|name=["']_ftnref(\d+)["']|href=["']#_ftn(\d+)["'])[^>]*>([\s\S]*?)<\/a>/gi,
    (
      _m,
      idA: string | undefined,
      idB: string | undefined,
      idC: string | undefined,
      inner: string,
    ) => {
      const n = idA || idB || idC || stripToText(inner).match(/(\d+)/)?.[1];
      return n ? `<sup>(${n})</sup>` : "";
    },
  );

  // Definition anchors (_ftn / #_ftnref) — replace with sup, content kept around them
  out = out.replace(
    /<a\b[^>]*(?:name=["']_ftn(\d+)["']|href=["']#_ftnref(\d+)["'])[^>]*>([\s\S]*?)<\/a>/gi,
    (
      _m,
      idA: string | undefined,
      idB: string | undefined,
      inner: string,
    ) => {
      const n = idA || idB || stripToText(inner).match(/(\d+)/)?.[1];
      return n ? `<sup>(${n})</sup>` : "";
    },
  );

  // Replace whole footnote-list with clean paragraphs (greedy to last closing div)
  out = out.replace(
    /<div\b[^>]*mso-element\s*:\s*footnote-list[^>]*>[\s\S]*<\/div>/i,
    () => formatFootnoteDefinitions(defTexts),
  );

  // Fallback: per-footnote divs still present (never match footnote-list)
  out = out.replace(
    /<div\b[^>]*mso-element\s*:\s*footnote(?!-list)[^>]*>[\s\S]*?<\/div>/gi,
    (block) => {
      const id = block.match(/\bid=["']?(?:ftn)?(\d+)["']?/i)?.[1];
      const plain = stripToText(block)
        .replace(/^\s*\^?\s*\.?\s*/, "")
        .replace(/^[\s\[\(]*\d+[\s\]\)]*/, "")
        .trim();
      const num = id || plain.match(/(\d+)/)?.[1] || "1";
      return plain
        ? `<p><sup>(${num})</sup> ${plain}</p>`
        : `<p><sup>(${num})</sup></p>`;
    },
  );

  // Word / CSS superscript spans
  out = out.replace(
    /<span\b[^>]*vertical-align\s*:\s*super[^>]*>([\s\S]*?)<\/span>/gi,
    (_m, inner: string) => {
      const text = stripToText(inner);
      const n = text.match(/(\d+)/)?.[1];
      if (n && text.replace(/\d+/g, "").replace(/[()\[\]\s]/g, "") === "") {
        return `<sup>(${n})</sup>`;
      }
      return text ? `<sup>${text}</sup>` : "";
    },
  );

  out = out.replace(/⁽([⁰¹²³⁴⁵⁶⁷⁸⁹]+)⁾/g, (_m, digits: string) => {
    return `<sup>(${unicodeSuperscriptsToDigits(digits)})</sup>`;
  });

  return fixBrokenFootnoteText(out);
}

/**
 * Convert PasteFromOffice → Footnotes (premium) intermediate HTML to free <sup>.
 */
export function convertCkFootnotesMarkup(html: string): string {
  let out = html;

  // Body refs: <sup class="footnote"><a id="ref-ftn1" href="#ftn1">…</a></sup>
  out = out.replace(
    /<sup\b[^>]*class=["'][^"']*footnote[^"']*["'][^>]*>\s*<a\b[^>]*(?:id=["']ref-(?:footnote-)?ftn(\d+)["']|href=["']#(?:footnote-)?ftn(\d+)["'])[^>]*>[\s\S]*?<\/a>\s*<\/sup>/gi,
    (_m, a: string | undefined, b: string | undefined) => {
      const n = a || b;
      return n ? `<sup>(${n})</sup>` : "";
    },
  );

  // Empty / number-only footnote refs
  out = out.replace(
    /<sup\b[^>]*class=["'][^"']*footnote[^"']*["'][^>]*>([\s\S]*?)<\/sup>/gi,
    (_m, inner: string) => {
      const text = stripToText(inner);
      const n =
        text.match(/(\d+)/)?.[1] ||
        inner.match(/(?:ftn|footnote-)(\d+)/i)?.[1];
      return n ? `<sup>(${n})</sup>` : text ? `<sup>${text}</sup>` : "";
    },
  );

  // Definitions list
  out = out.replace(
    /<ol\b[^>]*class=["'][^"']*footnotes[^"']*["'][^>]*>([\s\S]*?)<\/ol>/gi,
    (_m, listInner: string) => {
      const parts: string[] = [];
      const itemRe =
        /<li\b[^>]*(?:id=["'](?:footnote-)?ftn(\d+)["'])?[^>]*class=["'][^"']*footnote-definition[^"']*["'][^>]*>([\s\S]*?)<\/li>/gi;
      let match: RegExpExecArray | null;
      let index = 0;
      while ((match = itemRe.exec(listInner))) {
        index += 1;
        const n = match[1] || String(index);
        let inner = match[2];
        inner = inner.replace(
          /<a\b[^>]*class=["'][^"']*footnote-backlink[^"']*["'][^>]*>[\s\S]*?<\/a>/gi,
          "",
        );
        inner = inner.replace(
          /<div\b[^>]*class=["'][^"']*footnote-content[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi,
          "$1",
        );
        const text = stripToText(inner)
          .replace(/^\s*\^?\s*\.?\s*/, "")
          .replace(/^[\s\[\(]*\d+[\s\]\)]*/, "")
          .trim();
        parts.push(
          text
            ? `<p><sup>(${n})</sup> ${text}</p>`
            : `<p><sup>(${n})</sup></p>`,
        );
      }

      // Fallback if li markup differed
      if (!parts.length) {
        const loose = stripToText(listInner);
        if (loose) parts.push(`<p>${loose.replace(/^\^\s*/, "")}</p>`);
      }

      return parts.join("");
    },
  );

  out = out.replace(
    /<a\b[^>]*class=["'][^"']*footnote-backlink[^"']*["'][^>]*>[\s\S]*?<\/a>/gi,
    "",
  );

  return out;
}

/**
 * Fix already-broken paste artifacts like standalone "^ .1" / "([1]) text".
 */
export function fixBrokenFootnoteText(html: string): string {
  let out = html;

  // <p>^ .1</p> / <p>^.1</p> / <p>^</p>
  out = out.replace(
    /<p\b[^>]*>\s*(?:&nbsp;|\s)*\^\s*\.?\s*\d*\s*(?:&nbsp;|\s)*<\/p>/gi,
    "",
  );

  // List items that are only caret / marker
  out = out.replace(
    /<li\b[^>]*>\s*(?:&nbsp;|\s)*\^\s*\.?\s*\d*\s*(?:&nbsp;|\s)*<\/li>/gi,
    "",
  );

  // Caret + number sitting next to tags
  out = out.replace(/(^|>)\s*\^\s*\.?\s*(\d+)?\s*(?=<|$)/gm, "$1");

  // "([1]) text" or "(1) text" at paragraph start → <sup>(1)</sup>
  out = out.replace(
    /(<p\b[^>]*>)\s*(?:&nbsp;|\s)*\(\[?(\d+)\]?\)\s*/gi,
    "$1<sup>($2)</sup> ",
  );

  // Remaining caret markers in text
  out = out.replace(/\^\s*\.?\s*(\d+)/g, "");
  out = out.replace(/(^|>)\s*\^\s*(?=<|$)/gm, "$1");

  // Empty paragraphs / lists
  out = out.replace(/<p\b[^>]*>\s*(?:&nbsp;|\s)*<\/p>/gi, "");
  out = out.replace(/<ol\b[^>]*>\s*<\/ol>/gi, "");
  out = out.replace(/<ul\b[^>]*>\s*<\/ul>/gi, "");

  return out;
}

export function sanitizePlainTextFootnotes(text: string): string {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const htmlParts: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^\^\s*\.?\s*\d*$/.test(trimmed)) continue;

    const footnote = trimmed.match(/^\(\[?(\d+)\]?\)\s*(.*)$/);
    if (footnote) {
      const [, n, rest] = footnote;
      htmlParts.push(
        rest
          ? `<p><sup>(${n})</sup> ${rest}</p>`
          : `<p><sup>(${n})</sup></p>`,
      );
      continue;
    }

    const withSup = trimmed.replace(/⁽([⁰¹²³⁴⁵⁶⁷⁸⁹]+)⁾/g, (_m, d: string) => {
      return `<sup>(${unicodeSuperscriptsToDigits(d)})</sup>`;
    });

    htmlParts.push(`<p>${withSup}</p>`);
  }

  return htmlParts.join("");
}

export default class PasteWordCleanup extends Plugin {
  public static get pluginName() {
    return "PasteWordCleanup" as const;
  }

  public static get requires() {
    return ["ClipboardPipeline"] as const;
  }

  public init(): void {
    const editor = this.editor;
    const clipboardPipeline = editor.plugins.get("ClipboardPipeline") as any;

    // 1) BEFORE PasteFromOffice (priority highest > high):
    //    rewrite clipboard HTML so replaceMSFootnotes has nothing to convert.
    this.listenTo(
      clipboardPipeline,
      "inputTransformation",
      (_evt, data: any) => {
        const dataTransfer = data.dataTransfer;
        if (!dataTransfer) return;

        try {
          const html = dataTransfer.getData("text/html") || "";
          const plain = dataTransfer.getData("text/plain") || "";

          if (html && (hasOfficeFootnotes(html) || looksLikeBrokenFootnotes(html))) {
            const cleaned = sanitizeOfficeClipboardHtml(html);
            // PasteFromOffice re-reads text/html from dataTransfer — wrap it.
            data.dataTransfer = wrapDataTransfer(dataTransfer, cleaned);
            // Force re-parse with cleaned HTML on the next PFO step.
            delete data._parsedData;
            return;
          }

          if (
            plain &&
            (/^\s*\^\s*\.?\s*\d+/m.test(plain) ||
              /^\(\[?\d+\]?\)/m.test(plain) ||
              /⁽[⁰¹²³⁴⁵⁶⁷⁸⁹]+⁾/.test(plain))
          ) {
            const cleaned = sanitizePlainTextFootnotes(plain);
            const view = toViewFragment(editor, cleaned);
            if (view) {
              data.content = view;
              data._isTransformedWithPasteFromOffice = true;
            }
          }
        } catch {
          // Keep default paste pipeline.
        }
      },
      { priority: "highest" },
    );

    // 2) AFTER PasteFromOffice: flatten any Footnotes markup that still appeared.
    this.listenTo(
      clipboardPipeline,
      "inputTransformation",
      (_evt, data: any) => {
        if (!data?.content) return;

        try {
          const html = viewToHtml(editor, data.content);
          if (!html) return;
          if (!looksLikeBrokenFootnotes(html) && !hasOfficeFootnotes(html)) {
            return;
          }

          const fixed = sanitizeWordHtml(html);
          if (fixed === html) return;

          const view = toViewFragment(editor, fixed);
          if (view) data.content = view;
        } catch {
          // Ignore cleanup failures.
        }
      },
      { priority: "lowest" },
    );
  }
}
