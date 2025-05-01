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

// Register the image resize module
ReactQuill.Quill.register("modules/imageResize", ImageResize);

export default function TaskForm3({
  data,
  setData,
  errors,
  onSubmit,
  users,
  categories,
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
      minHeight: "34px", // Increased from 24px
      fontSize: "0.875rem", // Increased from 0.75rem
      boxShadow: "none !important",
      outline: "none !important",
      padding: "0",
    }),
    input: (provided) => ({
      ...provided,
      margin: "0",
      fontSize: "0.875rem", // Increased
      minHeight: "34px", // Increased
      padding: "0",
    }),
    option: (provided, state) => ({
      ...provided,
      fontSize: "0.875rem", // Increased
      padding: "4px 8px", // Increased from 2px 6px
      backgroundColor: state.isSelected ? "#4F46E5" : "white",
      color: state.isSelected ? "white" : "black",
    }),
    menu: (provided) => ({
      ...provided,
      marginTop: "2px", // Increased
      fontSize: "0.875rem", // Increased
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "0 6px", // Increased from 0 4px
      minHeight: "34px", // Increased
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      padding: "3px", // Increased from 2px
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
  };

  // Quill editor modules and formats
  const modules = useMemo(
    () => ({
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
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3"> {/* Increased gap from 2 to 3 */}
      <style jsx global>{`
        .editor-container {
          display: flex;
          flex-direction: column;
          height: 210px !important; // Increased from 150px
        }
        .editor-container .ql-container {
          flex: 1;
          overflow-y: auto;
          font-size: 0.875rem; // Increased
        }
        .editor-container .ql-toolbar {
          padding: 3px; // Increased
          font-size: 0.875rem; // Increased
        }
        .editor-container .ql-toolbar button {
          height: 24px; // Increased from 18px
          width: 24px; // Increased from 18px
          padding: 0;
        }
        .editor-container .ql-toolbar .ql-picker {
          height: 24px; // Increased from 18px
          line-height: 24px; // Increased from 18px
        }
        .editor-container .ql-editor {
          min-height: 100%;
          padding: 6px; // Increased from 4px
          font-size: 0.875rem; // Increased
        }
        .ql-snow .ql-picker {
          font-size: 0.875rem; // Increased
        }
        /* Adjust input field heights */
        input[type="text"],
        input[type="date"],
        input[type="file"] {
          height: 34px; // Increased from 24px
          font-size: 0.875rem; // Increased
          padding: 3px 6px; // Increased
        }
        /* Style the calendar icon for date inputs */
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
        /* Adjust label sizes */
        label {
          font-size: 0.875rem; // Increased
          margin-bottom: 2px; // Increased
          line-height: 1.25; // Increased
        }
        /* Adjust error message size */
        .text-sm {
          font-size: 0.8rem; // Increased
        }
        /* Adjust margins */
        .mt-1 {
          margin-top: 0.25rem; // Increased
        }
        .mt-2 {
          margin-top: 0.35rem; // Increased
        }
      `}</style>

      <div>
        <InputLabel htmlFor="task_factory_id" value="Factory ID" />
        <TextInput
          id="task_factory_id"
          type="text"
          name="factory_id"
          value={data.factory_id}
          className="mt-1 block w-full"
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
          className="mt-1 block w-full"
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
          value={data.due_date}
          className="mt-1 block w-full"
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
        <InputLabel htmlFor="task_assigned_user" value="Category" />
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
        <InputError message={errors.assigned_user_id} className="mt-2" />
      </div>

      <div>
        <InputLabel htmlFor="task_status" value="Status" />
        <Select
          id="task_status"
          options={statusOptions}
          value={
            statusOptions.find((option) => option.value === data.status) || null
          }
          onChange={(option) => setData("status", option ? option.value : "")}
          className="mt-1 no-focus-border"
          classNamePrefix="select"
          styles={customStyles}
          isSearchable={false}
        />
        <InputError message={errors.status} className="mt-2" />
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
              height: "calc(210px - 42px)", // Increased height
              display: "flex",
              flexDirection: "column",
            }}
          />
        </div>
        <InputError message={errors.description} className="mt-1" /> {/* Adjusted margin */}
      </div>

      <div className="flex items-center justify-end mt-3 col-span-2 space-x-2"> {/* Increased spacing */}
        <Link
          href={route("tasks.index")}
          className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50" // Increased text and padding
          disabled={isSubmitting}
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 inline-flex items-center" // Increased text and padding
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </>
          ) : (
            'Create Task'
          )}
        </button>
      </div>
    </form>
  );
}
