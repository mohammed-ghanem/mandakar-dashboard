import { Command, Plugin } from "ckeditor5";
import { createSpacingDropdown, isArabicUi } from "./spacingDropdown";

const ATTRIBUTE = "wordSpacing";
const VALUES = ["0.1em", "0.15em", "0.2em", "0.25em", "0.3em"];

const ICON =
  '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M1 3h2.5v14H1zm15.5 0H19v14h-2.5zM5 10l3-3v2h4V7l3 3-3 3v-2H8v2z"/></svg>';

class WordSpacingCommand extends Command {
  declare public value: string | undefined;

  public override refresh() {
    const { model } = this.editor;
    const selection = model.document.selection;
    this.value = selection.getAttribute(ATTRIBUTE) as string | undefined;
    this.isEnabled = model.schema.checkAttributeInSelection(
      selection,
      ATTRIBUTE,
    );
  }

  public override execute({ value }: { value: string | null }) {
    const { model } = this.editor;
    const selection = model.document.selection;

    model.change((writer) => {
      if (selection.isCollapsed) {
        if (value) writer.setSelectionAttribute(ATTRIBUTE, value);
        else writer.removeSelectionAttribute(ATTRIBUTE);
        return;
      }

      const ranges = model.schema.getValidRanges(
        selection.getRanges(),
        ATTRIBUTE,
      );
      for (const range of ranges) {
        if (value) writer.setAttribute(ATTRIBUTE, value, range);
        else writer.removeAttribute(ATTRIBUTE, range);
      }
    });
  }
}

/**
 * Inline word spacing, saved as `style="word-spacing: …"` on a span.
 * Same span priority as the Font plugins so styles merge onto one span,
 * letting this inline value override the Scheherazade fallback in style.css.
 */
export default class WordSpacing extends Plugin {
  public static get pluginName() {
    return "WordSpacing" as const;
  }

  public init() {
    const editor = this.editor;

    editor.model.schema.extend("$text", { allowAttributes: ATTRIBUTE });
    editor.model.schema.setAttributeProperties(ATTRIBUTE, {
      isFormatting: true,
      copyOnEnter: true,
    });

    editor.conversion.for("downcast").attributeToElement({
      model: ATTRIBUTE,
      view: (value, { writer }) =>
        writer.createAttributeElement(
          "span",
          { style: `word-spacing:${value}` },
          { priority: 7 },
        ),
    });

    editor.conversion.for("upcast").elementToAttribute({
      view: { name: "span", styles: { "word-spacing": /[\s\S]+/ } },
      model: {
        key: ATTRIBUTE,
        value: (viewElement: { getStyle: (name: string) => string | undefined }) =>
          viewElement.getStyle("word-spacing"),
      },
    });

    editor.commands.add(ATTRIBUTE, new WordSpacingCommand(editor));

    editor.ui.componentFactory.add(ATTRIBUTE, (locale) => {
      const isAr = isArabicUi(editor, locale);
      return createSpacingDropdown({
        editor,
        locale,
        commandName: ATTRIBUTE,
        label: isAr ? "تباعد الكلمات" : "Word spacing",
        icon: ICON,
        options: [
          { value: null, label: isAr ? "عادي" : "Normal" },
          ...VALUES.map((value) => ({ value, label: value })),
        ],
      });
    });
  }
}
