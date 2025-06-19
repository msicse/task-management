import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import ImageResize from "quill-image-resize-module-react";
import MagicUrl from "quill-magic-url";

// Register the magic-url module
ReactQuill.Quill.register("modules/magicUrl", MagicUrl);

// Register the image resize module
ReactQuill.Quill.register("modules/imageResize", ImageResize);

export default function RichText({ value, onChange, error }) {
  // Quill editor modules and formats
  const modules = {
    magicUrl: {
      urlRegularExpression: /(https?:\/\/[^\s]+)/g, // Auto-detect URLs
      globalRegularExpression: /(https?:\/\/[^\s]+)/g, // Apply globally
    },
    toolbar: {
      container: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ align: [] }], // Add alignment options
        [{ list: "ordered" }, { list: "bullet" }],
        [{ color: [] }, { background: [] }],
        ["link", "image"],
        ["clean"],
      ],
    },
    imageResize: {
      modules: ["Resize", "DisplaySize"],
    },
    clipboard: {
      matchVisual: false,
    },
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "align", // Add align format
    "color",
    "background",
    "link",
    "image",
  ];
  return (
    <>
      <div className="mt-1 editor-container">
        <style>
          {`
        .editor-container {
          display: flex;
          flex-direction: column;
          height: ${compactHeight ? "250px" : "400px"} !important;
        }
        .editor-container .ql-container {
          flex: 1;
          overflow-y: auto;
          font-size: ${compactHeight ? "0.8125rem" : "0.875rem"};
        }
        .editor-container .ql-toolbar {
          padding: ${compactHeight ? "2px" : "3px"};
          font-size: ${compactHeight ? "0.8125rem" : "0.875rem"};
        }
        .editor-container .ql-toolbar button {
          height: ${compactHeight ? "22px" : "24px"};
          width: ${compactHeight ? "22px" : "24px"};
          padding: 0;
        }
        .editor-container .ql-toolbar .ql-picker {
          height: ${compactHeight ? "22px" : "24px"};
          line-height: ${compactHeight ? "22px" : "24px"};
        }
        .editor-container .ql-editor {
          min-height: 100%;
          padding: ${compactHeight ? "4px" : "6px"};
          font-size: ${compactHeight ? "0.8125rem" : "0.875rem"};
        }
        .ql-snow .ql-picker {
          font-size: ${compactHeight ? "0.8125rem" : "0.875rem"};
        }`}
        </style>
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          // onChange={(content) => setData("description", content)}
          modules={modules}
          formats={formats}
          className="bg-white text-black h-full"
          style={{
            height: compactHeight ? "calc(250px - 42px)" : "calc(450px - 42px)",
            display: "flex",
            flexDirection: "column",
          }}
        />
      </div>
      <InputError message={error} className="mt-1" />
    </>
  );
}
