/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { FC, useMemo, useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";

import {
  ClassicEditor,
  Autoformat,
  Bold,
  Italic,
  Underline,
  BlockQuote,
  Base64UploadAdapter,
  CloudServices,
  Essentials,
  Heading,
  Image,
  ImageCaption,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  PictureEditing,
  Indent,
  IndentBlock,
  Link,
  List,
  Font,
  Alignment,
  Paragraph,
  PasteFromOffice,
  Table,
  TableColumnResize,
  TableToolbar,
  TextTransformation,
  SourceEditing,
  Code,
  CodeBlock,
  Highlight,
  HorizontalLine,
  MediaEmbed,
  RemoveFormat,
  SpecialCharacters,
  Strikethrough,
  Subscript,
  Superscript,
  WordCount,
} from "ckeditor5";

import translationsAr from "ckeditor5/translations/ar.js";
import translationsEn from "ckeditor5/translations/en.js";

import "ckeditor5/ckeditor5.css";
import "./style.css";

interface CkEditorProps {
  editorData: string;
  handleOnUpdate: (value: string) => void;
  config?: {
    language?: string;
    direction?: "rtl" | "ltr";
    placeholder?: string;
  };
}

const CkEditor: FC<CkEditorProps> = ({
  editorData,
  handleOnUpdate,
  config,
}) => {
  // Keep initial HTML stable so React does not keep calling setData and
  // fighting the user while typing / clicking the toolbar.
  const initialDataRef = useRef(editorData);

  const editorConfig = useMemo<any>(
    () => ({
      licenseKey: "GPL",
      language: config?.language ?? "en",
      placeholder: config?.placeholder ?? "",
      initialData: initialDataRef.current,
      translations: [translationsAr, translationsEn],
      plugins: [
        Autoformat,
        BlockQuote,
        Bold,
        CloudServices,
        Essentials,
        Heading,
        Image,
        ImageCaption,
        ImageResize,
        ImageStyle,
        ImageToolbar,
        ImageUpload,
        Base64UploadAdapter,
        Indent,
        IndentBlock,
        Italic,
        Link,
        Font,
        Alignment,
        List,
        Paragraph,
        PasteFromOffice,
        PictureEditing,
        Table,
        TableColumnResize,
        TableToolbar,
        TextTransformation,
        Underline,
        SourceEditing,
        Code,
        CodeBlock,
        Highlight,
        HorizontalLine,
        MediaEmbed,
        RemoveFormat,
        SpecialCharacters,
        Strikethrough,
        Subscript,
        Superscript,
        WordCount,
      ],
      toolbar: [
        "undo",
        "redo",
        "|",
        "heading",
        "|",
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "|",
        "link",
        "uploadImage",
        "insertTable",
        "blockQuote",
        "code",
        "codeBlock",
        "mediaEmbed",
        "horizontalLine",
        "|",
        "fontSize",
        "fontFamily",
        "fontColor",
        "fontBackgroundColor",
        "highlight",
        "|",
        "alignment",
        "|",
        "bulletedList",
        "numberedList",
        "|",
        "outdent",
        "indent",
        "|",
        "removeFormat",
        "specialCharacters",
        "subscript",
        "superscript",
        "sourceEditing",
      ],
      fontSize: {
        options: [10, 12, 14, "default", 18, 20, 24 , 32 , 36 , 40 , 48 , 56 , 64 ,],
      },
      fontFamily: {
        options: [
          "default",
          "Arial, Helvetica, sans-serif",
          "Courier New, Courier, monospace",
          "Georgia, serif",
          "Times New Roman, Times, serif",
          "Verdana, Geneva, sans-serif",
          "Comic Sans MS, cursive",
          "Cairo, sans-serif",
          "Amiri, serif",
          "Almarai, sans-serif",
          "El Messiri, sans-serif",
          "Reem Kufi, sans-serif",
          "Scheherazade New, serif",
        ],
      },
      alignment: {
        options: ["left", "center", "right", "justify"],
      },
      image: {
        toolbar: [
          "imageTextAlternative",
          "toggleImageCaption",
          "|",
          "imageStyle:inline",
          "imageStyle:wrapText",
          "imageStyle:breakText",
          "|",
          "resizeImage",
        ],
      },
      link: {
        addTargetToExternalLinks: true,
        defaultProtocol: "https://",
      },
      table: {
        contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
      },
    }),
    [config?.language, config?.placeholder],
  );

  return (
    <div className="ckeditor-container" dir={config?.direction ?? "ltr"}>
      <CKEditor
        editor={ClassicEditor}
        config={editorConfig}
        onReady={(editor) => {
          if (editor.isReadOnly) {
            console.warn("[CKEditor] started in read-only mode", {
              language: config?.language,
            });
          }
        }}
        onError={(error, details) => {
          console.error("[CKEditor] error", error, details);
        }}
        onChange={(_, editor) => {
          handleOnUpdate(editor.getData());
        }}
      />
    </div>
  );
};

export default CkEditor;
