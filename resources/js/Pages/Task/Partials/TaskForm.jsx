import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import TextInput from "@/Components/TextInput";
import { Link } from "@inertiajs/react";
import { Editor } from "@tinymce/tinymce-react";

export default function TaskForm({
  data,
  setData,
  errors,
  onSubmit,
  users,
  categories,
  searchTerm,
  handleCategorySearch,
  filteredCategories,
}) {
  return (
    <form onSubmit={onSubmit} className="grid grid-cols-2 gap-6">
      <div>
        <InputLabel htmlFor="task_image_path" value="Task Image" />
        <TextInput
          id="task_image_path"
          type="file"
          name="image"
          className="mt-1 block w-full"
          onChange={(e) => setData("image", e.target.files[0])}
        />
        <InputError message={errors.image} className="mt-2" />
      </div>

      <div>
        <InputLabel htmlFor="task_name" value="Task Name" />
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
        <InputLabel htmlFor="task_description" value="Task Description" />
        <Editor
          id="task_description"
          value={data.description}
          onEditorChange={(content) => setData("description", content)}
          apiKey="q6co5gho8spbnbofvr5l6m40ubiqjf2cysvyguspv36tsbm0"
          init={{
            height: 300,
            menubar: true,
            plugins: [
              "advlist autolink lists link image charmap print preview anchor",
              "searchreplace visualblocks code fullscreen",
              "insertdatetime media table paste code help wordcount",
            ],
            toolbar:
              "undo redo | formatselect | bold italic backcolor | \
              alignleft aligncenter alignright alignjustify | \
              bullist numlist outdent indent | removeformat | help",
          }}
        />
        <InputError message={errors.description} className="mt-2" />
      </div>

      <div>
        <InputLabel htmlFor="task_due_date" value="Task Due Date" />
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
        <InputLabel htmlFor="task_status" value="Task Status" />
        <SelectInput
          name="status"
          id="task_status"
          className="mt-1 block w-full"
          onChange={(e) => setData("status", e.target.value)}
        >
          <option value="">Select Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </SelectInput>
        <InputError message={errors.status} className="mt-2" />
      </div>

      <div>
        <InputLabel htmlFor="task_priority" value="Task Priority" />
        <SelectInput
          name="priority"
          id="task_priority"
          className="mt-1 block w-full"
          onChange={(e) => setData("priority", e.target.value)}
        >
          <option value="">Select Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </SelectInput>
        <InputError message={errors.priority} className="mt-2" />
      </div>

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
        <InputLabel htmlFor="task_category" value="Category" />
        <div className="relative">
          <TextInput
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            className="mt-1 block w-full mb-2"
            onChange={(e) => handleCategorySearch(e.target.value)}
          />
          <SelectInput
            name="category_id"
            id="task_category"
            className="mt-1 block w-full"
            value={data.category_id}
            onChange={(e) => setData("category_id", e.target.value)}
          >
            <option value="">Select Category</option>
            {filteredCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </SelectInput>
        </div>
        <InputError message={errors.category_id} className="mt-2" />
      </div>

      <div>
        <InputLabel htmlFor="task_assigned_user_id" value="Assigned User" />
        <SelectInput
          name="assigned_user_id"
          id="task_assigned_user_id"
          className="mt-1 block w-full"
          onChange={(e) => setData("assigned_user_id", e.target.value)}
        >
          <option value="">Select User</option>
          {users.data.map((user) => (
            <option value={user.id} key={user.id}>
              {user.name}
            </option>
          ))}
        </SelectInput>
        <InputError message={errors.assigned_user_id} className="mt-2" />
      </div>

      <div className="flex items-center justify-end mt-4 col-span-2">
        <Link
          href={route("tasks.index")}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 mr-2"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Create Task
        </button>
      </div>
    </form>
  );
}
