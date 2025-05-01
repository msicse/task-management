import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import Alert from "@/Components/Alert";
import { useState, useEffect } from "react";

export default function Show({ auth, role, success }) {
  const [showSuccess, setShowSuccess] = useState(!!success);

  useEffect(() => {
    if (success) {
      setShowSuccess(true);
    }
  }, [success]);

  const deleteRole = () => {
    if (!window.confirm("Are you sure you want to delete this role?")) {
      return;
    }
    router.delete(route("roles.destroy", role.id), {
      onSuccess: () => {
        setShowSuccess(true);
      },
    });
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Role Details
          </h2>
          <div className="flex space-x-2">
            <div className="flex items-center gap-2">
              <Link
                href={route("roles.edit", role.id)}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Edit
              </Link>
              <button
                onClick={deleteRole}
                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete
              </button>
              <Link
                href={route("roles.index")}
                className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700  shadow transition-all"
              >
                Back to Roles
              </Link>
            </div>
          </div>
        </div>
      }
    >
      <Head title="Role Details" />

      <div className="py-12">
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
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Role Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Name</p>
                    <p className="font-medium">{role.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Created At
                    </p>
                    <p className="font-medium">
                      {new Date(role.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Permissions</h3>
                <div className="grid grid-cols-4 gap-4">
                  {role.permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg"
                    >
                      {permission.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
