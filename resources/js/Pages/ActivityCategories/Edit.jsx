import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import TextareaInput from "@/Components/TextareaInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import Alert from "@/Components/Alert";
import SearchableDropdown from "@/Components/SearchableDropdown";
import { useState, useMemo, useRef, useEffect } from "react";
import axios from 'axios';

export default function Edit({ auth, category, parentCategories, departments, success }) {
  const [showSuccess, setShowSuccess] = useState(!!success);
  const [parentSearch, setParentSearch] = useState("");
  const [showParentDropdown, setShowParentDropdown] = useState(false);
  const parentDropdownRef = useRef(null);
  const [previewCode, setPreviewCode] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);

  const { data, setData, put, errors, processing } = useForm({
    name: category.name || "",
    code: category.code || "",
    parent_id: category.parent_id || "",
    department_id: category.department_id || "",
    standard_time: category.standard_time || "",
    definition: category.definition || "",
    reference_protocol: category.reference_protocol || "",
    objective: category.objective || "",
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (parentDropdownRef.current && !parentDropdownRef.current.contains(event.target)) {
        setShowParentDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter parent categories based on search
  const filteredParentCategories = useMemo(() => {
    if (!parentSearch) return parentCategories || [];
    return (parentCategories || []).filter(cat =>
      cat.name.toLowerCase().includes(parentSearch.toLowerCase())
    );
  }, [parentCategories, parentSearch]);

  // Get selected parent category name
  const selectedParentName = useMemo(() => {
    if (!data.parent_id) return "";
    const parent = parentCategories?.find(cat => cat.id == data.parent_id);
    return parent ? parent.name : "";
  }, [data.parent_id, parentCategories]);

  const handleParentSelect = (categoryId, categoryName) => {
    setData("parent_id", categoryId);
    setParentSearch(categoryName);
    setShowParentDropdown(false);
  };

  // Function to generate code preview
  const generateCodePreview = async (name, departmentId, parentId) => {
    if (!name || name.trim() === '') {
      setPreviewCode('');
      return;
    }

    setCodeLoading(true);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.post(route('activity-categories.preview-code'), {
        name: name,
        department_id: departmentId || null,
        parent_id: parentId || null,
      }, {
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.data.success) {
        setPreviewCode(response.data.code);
      } else {
        console.error('Code generation failed:', response.data.error);
        setPreviewCode('Unable to generate code');
      }
    } catch (error) {
      console.error('Error generating code preview:', error);
      console.log('Request data sent:', {name, department_id: departmentId, parent_id: parentId});

      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);

        if (error.response.data && error.response.data.error) {
          setPreviewCode(`Error: ${error.response.data.error}`);
        } else {
          setPreviewCode(`HTTP ${error.response.status} Error`);
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
        setPreviewCode('Network error - no response');
      } else {
        console.error('Request setup error:', error.message);
        setPreviewCode('Request error');
      }
    } finally {
      setCodeLoading(false);
    }
  };

  // Auto-generate code preview when relevant fields change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      generateCodePreview(data.name, data.department_id, data.parent_id);
    }, 300); // Debounce for 300ms

    return () => clearTimeout(timeoutId);
  }, [data.name, data.department_id, data.parent_id]);

  // Sync preview code with form data when preview code changes
  useEffect(() => {
    if (previewCode && previewCode !== data.code) {
      setData('code', previewCode);
    }
  }, [previewCode]);

  const onSubmit = (e) => {
    e.preventDefault();

    const finalData = {
      ...data,
      code: previewCode || data.code,
      parent_id: data.parent_id || null,
      department_id: data.department_id || null,
      standard_time: data.standard_time || null
    };

    console.log('Submitting update with data:', finalData);

    // Submit the form data using Inertia's put method with transform
    put(route("activity-categories.update", category.id), {
      transform: (data) => ({
        ...data,
        code: previewCode || data.code,
        parent_id: data.parent_id || null,
        department_id: data.department_id || null,
        standard_time: data.standard_time || null
      }),
      onSuccess: () => {
        console.log('Update successful');
      },
      onError: (errors) => {
        console.error('Update failed with errors:', errors);
      },
      onFinish: () => {
        console.log('Update request finished');
      }
    });
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Edit Activity Category
          </h2>
          <Link
            href={route("activity-categories.index")}
            className="bg-emerald-500 py-1 px-3 text-white rounded shadow transition-all hover:bg-emerald-700"
          >
            Back to Categories
          </Link>
        </div>
      }
    >
      <Head title="Edit Activity Category" />

      <div className="py-4">
        <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">
          {showSuccess && (
            <div className="mb-3">
              <Alert
                message={success}
                type="success"
                onClose={() => setShowSuccess(false)}
              />
            </div>
          )}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-4 text-gray-900 dark:text-gray-100">
              <form onSubmit={onSubmit} className="space-y-4">
                {/* Basic Information Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  <div className="lg:col-span-6">
                    <InputLabel htmlFor="name" value="Name" />
                    <TextInput
                      id="name"
                      type="text"
                      name="name"
                      value={data.name}
                      className="mt-1 block w-full"
                      isFocused={true}
                      onChange={(e) => setData("name", e.target.value)}
                    />
                    <InputError message={errors.name} className="mt-1" />
                  </div>

                  <div className="lg:col-span-4">
                    <InputLabel htmlFor="code" value="Code (Auto)" />
                    <div className="relative">
                      <TextInput
                        id="code"
                        type="text"
                        name="code"
                        value={previewCode || data.code}
                        className={`mt-1 block w-full text-sm transition-colors duration-200 ${
                          previewCode
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600 text-green-700 dark:text-green-300'
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}
                        placeholder="Will be generated as you type..."
                        readOnly
                      />
                      {codeLoading && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
                        </div>
                      )}
                      {previewCode && !codeLoading && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                      )}
                    </div>
                    <InputError message={errors.code} className="mt-1" />
                    {previewCode && (
                      <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                        ✓ Code preview generated based on your inputs
                      </p>
                    )}
                  </div>

                  <div className="lg:col-span-2">
                    <InputLabel htmlFor="standard_time" value="Time (min)" />
                    <TextInput
                      id="standard_time"
                      type="number"
                      name="standard_time"
                      value={data.standard_time}
                      className="mt-1 block w-full"
                      placeholder="30"
                      min="1"
                      max="1440"
                      onChange={(e) => setData("standard_time", e.target.value)}
                    />
                    <InputError message={errors.standard_time} className="mt-1" />
                  </div>
                </div>

                {/* Hierarchy & Assignment Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <InputLabel htmlFor="department_id" value="Department" />
                    <SearchableDropdown
                      options={departments}
                      value={data.department_id}
                      onChange={(value) => setData("department_id", value)}
                      placeholder="Search department..."
                      displayKey="name"
                      valueKey="id"
                      className="mt-1"
                      customOptions={[
                        {
                          value: '',
                          displayText: '',
                          label: 'No Department',
                          className: 'text-gray-600 dark:text-gray-400'
                        }
                      ]}
                      renderOption={(dept) => `${dept.name} (${dept.short_name})`}
                      renderSelected={(value, options) => {
                        if (!value) return '';
                        const dept = options?.find(d => d.id == value);
                        return dept ? `${dept.name} (${dept.short_name})` : '';
                      }}
                      emptyMessage="No departments found"
                    />
                    <InputError message={errors.department_id} className="mt-1" />
                  </div>

                  <div>
                    <InputLabel htmlFor="parent_id" value="Parent Category" />
                    <div className="relative" ref={parentDropdownRef}>
                      <TextInput
                        id="parent_id"
                        type="text"
                        name="parent_search"
                        value={parentSearch || selectedParentName}
                        className="mt-1 block w-full"
                        placeholder="Search parent..."
                        onChange={(e) => {
                          setParentSearch(e.target.value);
                          setShowParentDropdown(true);
                          if (!e.target.value) {
                            setData("parent_id", "");
                          }
                        }}
                        onFocus={() => setShowParentDropdown(true)}
                        autoComplete="off"
                      />
                      {showParentDropdown && (
                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-auto">
                          <div
                            className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-600"
                            onClick={() => {
                              setData("parent_id", "");
                              setParentSearch("");
                              setShowParentDropdown(false);
                            }}
                          >
                            <span className="text-gray-500">None (Top level)</span>
                          </div>
                          {filteredParentCategories.length > 0 ? (
                            filteredParentCategories.map((cat) => (
                              <div
                                key={cat.id}
                                className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200"
                                onClick={() => handleParentSelect(cat.id, cat.name)}
                              >
                                {cat.name}
                              </div>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                              No categories found
                            </div>
                          )}
                        </div>
                      )}
                      {/* Invisible input to hold the actual value */}
                      <input type="hidden" name="parent_id" value={data.parent_id} />
                    </div>
                    <InputError message={errors.parent_id} className="mt-1" />
                  </div>
                </div>

                {/* Description Section */}
                <div className="space-y-4">
                  <div>
                    <InputLabel htmlFor="definition" value="Definition" />
                    <TextareaInput
                      id="definition"
                      name="definition"
                      value={data.definition}
                      className="mt-1 block w-full"
                      rows={2}
                      placeholder="Brief definition of this activity category..."
                      onChange={(e) => setData("definition", e.target.value)}
                    />
                    <InputError message={errors.definition} className="mt-1" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <InputLabel htmlFor="reference_protocol" value="Reference Protocol" />
                      <TextareaInput
                        id="reference_protocol"
                        name="reference_protocol"
                        value={data.reference_protocol}
                        className="mt-1 block w-full"
                        rows={2}
                        placeholder="Standards or procedures..."
                        onChange={(e) => setData("reference_protocol", e.target.value)}
                      />
                      <InputError message={errors.reference_protocol} className="mt-1" />
                    </div>

                    <div>
                      <InputLabel htmlFor="objective" value="Objective" />
                      <TextareaInput
                        id="objective"
                        name="objective"
                        value={data.objective}
                        className="mt-1 block w-full"
                        rows={2}
                        placeholder="Main objectives and goals..."
                        onChange={(e) => setData("objective", e.target.value)}
                      />
                      <InputError message={errors.objective} className="mt-1" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {previewCode ? (
                      <span className="text-green-600 dark:text-green-400">
                        ✓ Code: {previewCode}
                      </span>
                    ) : (
                      'Code will be auto-generated based on inputs'
                    )}
                  </div>
                  <div className="flex space-x-3">
                    <Link
                      href={route("activity-categories.index")}
                      className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
                      disabled={processing}
                    >
                      {processing ? 'Updating...' : 'Update Category'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
