/**
 * Shared Q&A HTML template for CKEditor.
 * Edit `qaTemplate.ts` + `qa-block.css` once — all editors and the public site
 * should reuse the same classes/styles.
 *
 * Classes:
 *   .qa-block
 *   .qa-title.qa-title--question | .qa-title--answer
 *   .qa-text.qa-text--question   | .qa-text--answer
 */

export const QA_BLOCK_CLASS = "qa-block";

export function buildQaTemplateHtml(lang: "ar" | "en" = "ar") {
  const question = lang === "ar" ? "السؤال" : "Question";
  const answer = lang === "ar" ? "الجواب" : "Answer";
  const questionHint =
    lang === "ar" ? "اكتب نص السؤال هنا..." : "Write the question here...";
  const answerHint =
    lang === "ar" ? "اكتب نص الجواب هنا..." : "Write the answer here...";

  return [
    `<div class="${QA_BLOCK_CLASS}">`,
    `  <h3 class="qa-title qa-title--question">${question}</h3>`,
    `  <p class="qa-text qa-text--question">${questionHint}</p>`,
    `  <h3 class="qa-title qa-title--answer">${answer}</h3>`,
    `  <p class="qa-text qa-text--answer">${answerHint}</p>`,
    `</div>`,
    `<p>&nbsp;</p>`,
  ].join("");
}
