/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  addListToDropdown,
  Collection,
  createDropdown,
  UIModel,
  type Command,
  type Editor,
  type ListDropdownItemDefinition,
  type Locale,
} from "ckeditor5";

export type SpacingOption = {
  /** `null` removes the attribute (back to default). */
  value: string | null;
  label: string;
};

type SpacingDropdownConfig = {
  editor: Editor;
  locale: Locale;
  commandName: string;
  label: string;
  icon: string;
  options: SpacingOption[];
};

export function createSpacingDropdown({
  editor,
  locale,
  commandName,
  label,
  icon,
  options,
}: SpacingDropdownConfig) {
  const command = editor.commands.get(commandName) as Command;
  const dropdownView = createDropdown(locale);

  const items = new Collection<ListDropdownItemDefinition>();
  for (const option of options) {
    const model = new UIModel({
      commandParam: option.value,
      label: option.label,
      withText: true,
      role: "menuitemradio",
      isToggleable: true,
    });
    model.bind("isOn").to(command, "value", (value: unknown) =>
      option.value === null ? !value : value === option.value,
    );
    items.add({ type: "button", model });
  }

  addListToDropdown(dropdownView, items, { role: "menu", ariaLabel: label });

  dropdownView.buttonView.set({ label, icon, tooltip: true });
  dropdownView.bind("isEnabled").to(command, "isEnabled");

  dropdownView.on("execute", (evt: any) => {
    editor.execute(commandName, { value: evt.source.commandParam });
    editor.editing.view.focus();
  });

  return dropdownView;
}

export function isArabicUi(editor: Editor, locale: Locale) {
  return (
    (editor.config.get("language") as string | undefined) === "ar" ||
    locale.uiLanguage === "ar"
  );
}
