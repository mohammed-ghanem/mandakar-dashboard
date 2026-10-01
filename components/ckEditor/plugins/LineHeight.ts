import { Command, Plugin } from "ckeditor5";
import { createSpacingDropdown, isArabicUi } from "./spacingDropdown";

const ATTRIBUTE = "lineHeight";
const VALUES = ["1.5", "1.8", "2", "2.2", "2.5"];

const ICON =
  '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9 4h9v1.5H9zm0 5.25h9v1.5H9zm0 5.25h9V16H9zM4.5 2 7.5 5.5h-2.25v9H7.5L4.5 18l-3-3.5h2.25v-9H1.5z"/></svg>';

class LineHeightCommand extends Command {
  declare public value: string | undefined;

  private getBlocks() {
    const { model } = this.editor;
    return Array.from(model.document.selection.getSelectedBlocks()).filter(
      (block) => model.schema.checkAttribute(block, ATTRIBUTE),
    );
  }

  public override refresh() {
    const blocks = this.getBlocks();
    this.isEnabled = blocks.length > 0;
    this.value = blocks[0]?.getAttribute(ATTRIBUTE) as string | undefined;
  }

  public override execute({ value }: { value: string | null }) {
    const blocks = this.getBlocks();
    this.editor.model.change((writer) => {
      for (const block of blocks) {
        if (value) writer.setAttribute(ATTRIBUTE, value, block);
        else writer.removeAttribute(ATTRIBUTE, block);
      }
    });
  }
}

/** Paragraph-level line height, saved as `style="line-height: …"` on the block. */
export default class LineHeight extends Plugin {
  public static get pluginName() {
    return "LineHeight" as const;
  }

  public init() {
    const editor = this.editor;

    editor.model.schema.extend("$block", { allowAttributes: ATTRIBUTE });
    editor.model.schema.setAttributeProperties(ATTRIBUTE, {
      isFormatting: true,
    });

    editor.conversion.for("downcast").attributeToAttribute({
      model: ATTRIBUTE,
      view: (value: unknown) =>
        value
          ? { key: "style", value: { "line-height": String(value) } }
          : null,
    });

    editor.conversion.for("upcast").attributeToAttribute({
      view: { key: "style", value: { "line-height": /[\s\S]+/ } },
      model: {
        key: ATTRIBUTE,
        value: (viewElement: { getStyle: (name: string) => string | undefined }) =>
          viewElement.getStyle("line-height"),
      },
    });

    editor.commands.add(ATTRIBUTE, new LineHeightCommand(editor));

    editor.ui.componentFactory.add(ATTRIBUTE, (locale) => {
      const isAr = isArabicUi(editor, locale);
      return createSpacingDropdown({
        editor,
        locale,
        commandName: ATTRIBUTE,
        label: isAr ? "ارتفاع السطر" : "Line height",
        icon: ICON,
        options: [
          { value: null, label: isAr ? "افتراضي" : "Default" },
          ...VALUES.map((value) => ({ value, label: value })),
        ],
      });
    });
  }
}
