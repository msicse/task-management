import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
import { useState } from "react";

export default function Edit({ auth, workRole, categories, departments }) {
  const [categorySearch, setCategorySearch] = useState("");

  const { data, setData, put, processing, errors } = useForm({
    name: workRole.name || "",
    description: workRole.description || "",
    department_id: workRole.department_id || "",
    categories: workRole.activity_categories?.map(cat => cat.id) || [],
    is_active: workRole.is_active ?? true,
  });

  const submit = (e) => {
    e.preventDefault();
    put(route("work-roles.update", workRole.id));
  };

  const handleCategoryChange = (categoryId) => {
    const currentCategories = [...data.categories];
    if (currentCategories.includes(categoryId)) {
      setData("categories", currentCategories.filter(id => id !== categoryId));
    } else {
      setData("categories", [...currentCategories, categoryId]);
    }
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(categorySearch.toLowerCase()))
  );

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Edit Work Role: {workRole.name}
          </h2>
          <div className="flex space-x-2">
            <Link
              href={route("work-roles.show", workRole.id)}
              className="bg-blue-500 py-1 px-3 text-white rounded shadow transition-all hover:bg-blue-700"
            >
              View Details
            </Link>
            <Link
              href={route("work-roles.index")}
              className="bg-emerald-500 py-1 px-3 text-white rounded shadow transition-all hover:bg-emerald-700"
            >
              Back to Work Roles
            </Link>
          </div>
        </div>
      }
    >
      <Head title={`Edit Work Role: ${workRole.name}`} />

      <div className="py-4">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <form onSubmit={submit} className="h-screen max-h-[calc(100vh-6rem)]">
            {/* Two Column Layout */}
            <div className="flex h-full bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
              {/* Left Side - Fixed Basic Information (40% width) */}
              <div className="w-2/5 p-4 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                      <div className="w-1 h-4 bg-emerald-500 rounded-full mr-2"></div>
                      Basic Information
                    </h3>
                  </div>

                  {/* Work Role Name */}
                  <div>
                    <InputLabel htmlFor="work_role_name" value="Work Role Name" className="text-xs font-medium" />
                    <TextInput
                      id="work_role_name"
                      type="text"
                      name="name"
                      value={data.name}
                      className="mt-1 block w-full text-sm"
                      isFocused={true}
                      onChange={(e) => setData("name", e.target.value)}
                      placeholder="Enter work role name..."
                    />
                    <InputError message={errors.name} className="mt-1" />
                  </div>

                  {/* Description */}
                  <div>
                    <InputLabel htmlFor="work_role_description" value="Description" className="text-xs font-medium" />
                    <textarea
                      id="work_role_description"
                      name="description"
                      value={data.description}
                      className="mt-1 block w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-500 dark:focus:ring-emerald-400 rounded-md shadow-sm"
                      rows="2"
                      onChange={(e) => setData("description", e.target.value)}
                      placeholder="Brief description..."
                    />
                    <InputError message={errors.description} className="mt-1" />
                  </div>

                  {/* Department */}
                  <div>
                    <InputLabel htmlFor="work_role_department" value="Department" className="text-xs font-medium" />
                    <SelectInput
                      name="department_id"
                      id="work_role_department"
                      className="mt-1 block w-full text-sm"
                      value={data.department_id}
                      onChange={(e) => setData("department_id", e.target.value)}
                    >
                      <option value="">Select Department</option>
                      {departments.map((department) => (
                        <option value={department.id} key={department.id}>
                          {department.name}
                        </option>
                      ))}
                    </SelectInput>
                    <InputError message={errors.department_id} className="mt-1" />
                  </div>

                  {/* Active Status */}
                  <div className="bg-white dark:bg-gray-800 p-2 rounded-md border border-gray-200 dark:border-gray-600">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-emerald-600 shadow-sm focus:ring-emerald-500 dark:focus:ring-emerald-400 dark:focus:ring-offset-gray-800"
                        checked={data.is_active}
                        onChange={(e) => setData("is_active", e.target.checked)}
                      />
                      <span className="ml-2 text-xs text-gray-700 dark:text-gray-300">
                        Active (can be assigned to users)
                      </span>
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <Link
                      href={route("work-roles.show", workRole.id)}
                      className="flex-1 bg-gray-100 py-2 px-3 text-sm text-gray-800 rounded shadow transition-all hover:bg-gray-200 text-center"
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      className="flex-1 bg-emerald-500 py-2 px-3 text-sm text-white rounded shadow transition-all hover:bg-emerald-700"
                      disabled={processing}
                    >
                      Update Work Role
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Side - Scrollable Activity Categories (60% width) */}
              <div className="w-3/5 flex flex-col bg-white dark:bg-gray-800">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 flex items-center">
                      <div className="w-1 h-4 bg-emerald-500 rounded-full mr-2"></div>
                      Activity Categories
                      <span className="ml-2 bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs px-2 py-0.5 rounded-full">
                        {data.categories.length}
                      </span>
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <TextInput
                        type="text"
                        placeholder="Search categories..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        className="w-full text-sm"
                      />
                    </div>
                    {/* {categorySearch && (
                      <button
                        type="button"
                        onClick={() => setCategorySearch("")}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs px-2 py-1 rounded"
                      >
                        Clear
                      </button>
                    )} */}
                  </div>
                  {categorySearch && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Showing {filteredCategories.length} of {categories.length} categories
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-3">
                  {filteredCategories.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-500 dark:text-gray-400 text-sm">
                        {categorySearch ? 'No categories found matching your search.' : 'No categories available.'}
                      </div>
                      {categorySearch && (
                        <button
                          type="button"
                          onClick={() => setCategorySearch("")}
                          className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 text-sm mt-2"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                      {filteredCategories.map((category) => (
                      <label
                        key={category.id}
                        className={`relative flex items-start p-3 border rounded-lg cursor-pointer transition-all ${
                          data.categories.includes(category.id)
                            ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 dark:border-emerald-500'
                            : 'border-gray-200 dark:border-gray-600 hover:border-emerald-300 dark:hover:border-emerald-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="mt-0.5 rounded border-gray-300 text-emerald-600 shadow-sm focus:ring-emerald-500 dark:focus:ring-emerald-400 dark:focus:ring-offset-gray-800"
                          checked={data.categories.includes(category.id)}
                          onChange={() => handleCategoryChange(category.id)}
                        />
                        <div className="ml-3 flex-1">
                          <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                            {category.name}
                          </div>
                          {category.description && (
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {category.description}
                            </div>
                          )}
                        </div>
                        {data.categories.includes(category.id) && (
                          <div className="absolute top-2 right-2">
                            <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}
                        </label>
                      ))}
                    </div>
                  )}
                  <InputError message={errors.categories} className="mt-3" />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
