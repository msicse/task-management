import { useEffect, useState } from "react";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import { Link, useForm } from "@inertiajs/react";
import Select from "react-select";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useMemo } from "react";
import ImageResize from "quill-image-resize-module-react";
import { formatDateForInput } from "@/utils";
import { FaSpinner } from "react-icons/fa";
import MagicUrl from "quill-magic-url";

// Register the magic-url module
ReactQuill.Quill.register("modules/magicUrl", MagicUrl);

// Register the image resize module
ReactQuill.Quill.register("modules/imageResize", ImageResize);

export default function TaskForm3({
  data,
  setData,
  errors,
  onSubmit,
  users,
  categories,
  formType = "Create",
  hideSubmitButton = false,
  compactHeight = false,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(e);
    setIsSubmitting(false);
  };

  // Convert users and categories to react-select format
  const userOptions = users.data.map((user) => ({
    value: user.id,
    label: user.name,
  }));

  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ];

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
  ];

  // Custom styles for react-select
  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "white",
      border: "1px solid #D1D5DB !important",
      borderRadius: "0.375rem",
      minHeight: compactHeight ? "30px" : "34px",
      fontSize: compactHeight ? "0.8125rem" : "0.875rem",
      boxShadow: "none !important",
      outline: "none !important",
      padding: "0",
    }),
    input: (provided) => ({
      ...provided,
      margin: "0",
      fontSize: compactHeight ? "0.8125rem" : "0.875rem",
      minHeight: compactHeight ? "30px" : "34px",
      padding: "0",
    }),
    option: (provided, state) => ({
      ...provided,
      fontSize: compactHeight ? "0.8125rem" : "0.875rem",
      padding: compactHeight ? "3px 8px" : "4px 8px",
      backgroundColor: state.isSelected ? "#4F46E5" : "white",
      color: state.isSelected ? "white" : "black",
    }),
    menu: (provided) => ({
      ...provided,
      marginTop: "2px",
      fontSize: compactHeight ? "0.8125rem" : "0.875rem",
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "0 6px",
      minHeight: compactHeight ? "30px" : "34px",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      padding: compactHeight ? "2px" : "3px",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
  };

  // Quill editor modules and formats
  const modules = useMemo(
    () => ({
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
        handlers: {
          image: function () {
            const input = document.createElement("input");
            input.setAttribute("type", "file");
            input.setAttribute("accept", "image/*");
            input.click();

            input.onchange = async () => {
              const file = input.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                  const range = this.quill.getSelection(true);
                  this.quill.insertEmbed(range.index, "image", e.target.result);
                };
                reader.readAsDataURL(file);
              }
            };
          },
        },
      },
      imageResize: {
        modules: ["Resize", "DisplaySize"],
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

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
    <form
      onSubmit={handleSubmit}
      className={`grid grid-cols-2 gap-${compactHeight ? "2" : "3"}`}
    >
      <style>{`
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
        }
        /* Adjust input field heights */
        input[type="text"],
        input[type="date"],
        input[type="file"] {
          height: ${compactHeight ? "30px" : "34px"};
          font-size: ${compactHeight ? "0.8125rem" : "0.875rem"};
          padding: ${compactHeight ? "2px 5px" : "3px 6px"};
        }
        /* Style the calendar icon for date inputs */
        input[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
        }
        /* Adjust label sizes */
        label {
          font-size: ${compactHeight ? "0.8125rem" : "0.875rem"};
          margin-bottom: ${compactHeight ? "1px" : "2px"};
          line-height: 1.25;
        }
        /* Adjust error message size */
        .text-sm {
          font-size: ${compactHeight ? "0.75rem" : "0.8rem"};
        }
        /* Adjust margins */
        .mt-1 {
          margin-top: ${compactHeight ? "0.2rem" : "0.25rem"};
        }
        .mt-2 {
          margin-top: ${compactHeight ? "0.3rem" : "0.35rem"};
        }
      `}</style>
      <div>
        <InputLabel htmlFor="task_factory_id" value="Factory ID" />
        <TextInput
          id="task_factory_id"
          type="text"
          name="factory_id"
          value={data.factory_id}
          className="mt-1 block w-full dark:bg-gray-50 dark:text-gray-900"
          onChange={(e) => setData("factory_id", e.target.value)}
        />
        <InputError message={errors.factory_id} className="mt-2" />
      </div>
      <div>
        <InputLabel htmlFor="task_name" value="Subject" />
        <TextInput
          id="task_name"
          type="text"
          name="name"
          value={data.name}
          className="mt-1 block w-full dark:bg-gray-50 dark:text-gray-900"
          isFocused={true}
          onChange={(e) => setData("name", e.target.value)}
        />
        <InputError message={errors.name} className="mt-2" />
      </div>
      <div>
        <InputLabel htmlFor="task_due_date" value="Delivery Date" />
        <TextInput
          id="task_due_date"
          type="date"
          name="due_date"
          value={formatDateForInput(data.due_date)}
          className="mt-1 block w-full dark:bg-gray-50 dark:text-gray-900"
          onChange={(e) => setData("due_date", e.target.value)}
        />
        <InputError message={errors.due_date} className="mt-2" />
      </div>
      <div>
        <InputLabel htmlFor="task_assigned_user" value="Assigned User" />
        <Select
          id="task_assigned_user"
          options={userOptions}
          value={
            userOptions.find(
              (option) => option.value === data.assigned_user_id
            ) || null
          }
          onChange={(option) =>
            setData("assigned_user_id", option ? option.value : "")
          }
          className="mt-1 no-focus-border"
          classNamePrefix="select"
          styles={customStyles}
        />
        <InputError message={errors.assigned_user_id} className="mt-2" />
      </div>
      <div>
        <InputLabel htmlFor="category_id" value="Category" />
        <Select
          id="category_id"
          options={categoryOptions}
          value={
            categoryOptions.find(
              (option) => option.value === data.category_id
            ) || null
          }
          onChange={(option) =>
            setData("category_id", option ? option.value : "")
          }
          className="mt-1 no-focus-border"
          classNamePrefix="select"
          styles={customStyles}
        />
        <InputError message={errors.category_id} className="mt-2" />
      </div>
      <div>
        <InputLabel htmlFor="task_priority" value="Priority" />
        <Select
          id="task_priority"
          options={priorityOptions}
          value={
            priorityOptions.find((option) => option.value === data.priority) ||
            null
          }
          onChange={(option) => setData("priority", option ? option.value : "")}
          className="mt-1 no-focus-border"
          classNamePrefix="select"
          styles={customStyles}
          isSearchable={false}
        />
        <InputError message={errors.priority} className="mt-2" />
      </div>
      <div className="col-span-2">
        <InputLabel htmlFor="task_description" value="Task Description" />
        <div className="mt-1 editor-container">
          <ReactQuill
            theme="snow"
            value={data.description || ""}
            onChange={(content) => setData("description", content)}
            modules={modules}
            formats={formats}
            className="bg-white text-black h-full"
            style={{
              height: compactHeight
                ? "calc(250px - 42px)"
                : "calc(450px - 42px)",
              display: "flex",
              flexDirection: "column",
            }}
          />
        </div>
        <InputError message={errors.description} className="mt-1" />
      </div>
      <div className="col-span-2">
        <InputLabel htmlFor="task_description" value="Task Links" />
        <div className="mt-1 editor-container">
          <ReactQuill
            theme="snow"
            value={data.links || ""}
            onChange={(content) => setData("links", content)}
            modules={modules}
            formats={formats}
            className="bg-white text-black h-full"
            style={{
              height: compactHeight
                ? "calc(250px - 42px)"
                : "calc(450px - 42px)",
              display: "flex",
              flexDirection: "column",
            }}
          />
        </div>
        <InputError message={errors.description} className="mt-1" />
      </div>
      {!hideSubmitButton && (
        <div className="flex items-center justify-end mt-3 col-span-2 space-x-2">
          <Link
            href={route("tasks.index")}
            className={`px-3 py-${
              compactHeight ? "1" : "1.5"
            } text-sm bg-red-600 text-white rounded hover:bg-red-700 mr-2 disabled:opacity-50`}
            disabled={isSubmitting}
          >
            Cancel
          </Link>

          <button
            type="submit"
            className={`px-3 py-${
              compactHeight ? "1" : "1.5"
            } text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 inline-flex items-center`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin h-5 w-5 mr-2" />
                Processing...
              </>
            ) : (
              `${formType} Task`
            )}
          </button>
        </div>
      )}
    </form>
  );
}
