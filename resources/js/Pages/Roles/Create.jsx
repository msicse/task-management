import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import Checkbox from "@/Components/Checkbox";
import Alert from "@/Components/Alert";
import { useState } from "react";

export default function Create({ auth, permissions, success }) {
  const [showSuccess, setShowSuccess] = useState(!!success);
  const { data, setData, post, processing, errors } = useForm({
    name: "",
    permissions: [],
  });

  const submit = (e) => {
    e.preventDefault();
    post(route("roles.store"));
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Create Role
          </h2>
          <Link
            href={route("roles.index")}
            className="bg-emerald-500 py-1 px-3 text-white rounded shadow transition-all hover:bg-emerald-700"
          >
            Back to Roles
          </Link>
        </div>
      }
    >
      <Head title="Create Role" />

      <div className="py-2">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {showSuccess && (
            <Alert
              message={success}
              type="success"
              onClose={() => setShowSuccess(false)}
            />
          )}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <form onSubmit={submit} className="space-y-6">
                <div>
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
                  <InputError message={errors.name} className="mt-2" />
                </div>

                <div>
                  <InputLabel value="Permissions" />
                  {errors.permissions && (
                    <div className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.permissions}
                    </div>
                  )}
                  <div className={`mt-2 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-2 ${errors.permissions ? 'border border-red-500 p-2 rounded' : ''}`}>
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center">
                        <Checkbox
                          id={`permission-${permission.id}`}
                          name="permissions"
                          value={permission.id}
                          checked={data.permissions.includes(permission.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setData("permissions", [
                                ...data.permissions,
                                permission.id,
                              ]);
                            } else {
                              setData(
                                "permissions",
                                data.permissions.filter(
                                  (id) => id !== permission.id
                                )
                              );
                            }
                          }}
                        />
                        <label
                          htmlFor={`permission-${permission.id}`}
                          className="ml-2 text-sm text-gray-600 dark:text-gray-400"
                        >
                          {permission.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end mt-4">
                  <Link
                    href={route("roles.index")}
                    className="bg-gray-100 py-1 px-3 text-gray-800 rounded shadow transition-all hover:bg-gray-200 mr-2"
                  >
                    Cancel
                  </Link>
                  <button
                    className="bg-emerald-500 py-1 px-3 text-white rounded shadow transition-all hover:bg-emerald-600"
                    disabled={processing}
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
