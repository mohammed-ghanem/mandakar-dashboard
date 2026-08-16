/* eslint-disable @typescript-eslint/no-explicit-any */
import { Plugin, ButtonView } from "ckeditor5";
import { buildQaTemplateHtml } from "../qaTemplate";

/**
 * Toolbar button that inserts the shared Q&A HTML template.
 * Change the template in `qaTemplate.ts` only — all editors pick it up.
 */
export default class InsertQaTemplate extends Plugin {
  public static get pluginName() {
    return "InsertQaTemplate" as const;
  }

  public init() {
    const editor = this.editor;

    editor.ui.componentFactory.add("insertQaTemplate", (locale) => {
      const view = new ButtonView(locale);
      const isAr =
        (editor.config.get("language") as string | undefined) === "ar" ||
        locale.uiLanguage === "ar";

      view.set({
        label: isAr ? "سؤال وجواب" : "Q & A",
        withText: true,
        tooltip: isAr
          ? "إدراج قالب السؤال والجواب"
          : "Insert question & answer template",
      });

      view.on("execute", () => {
        const html = buildQaTemplateHtml(isAr ? "ar" : "en");
        const viewFragment = editor.data.processor.toView(html);
        const modelFragment = editor.data.toModel(viewFragment);

        editor.model.change(() => {
          editor.model.insertContent(modelFragment);
        });

        editor.editing.view.focus();
      });

      return view;
    });
  }
}
