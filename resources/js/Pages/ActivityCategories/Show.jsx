import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import Alert from "@/Components/Alert";
import { useState, useEffect } from "react";
import { formatMinutesDisplay } from '@/utils/timeFormat';

export default function Show({ auth, category, success }) {
  const [showSuccess, setShowSuccess] = useState(!!success);

  useEffect(() => {
    if (success) {
      setShowSuccess(true);
    }
  }, [success]);

  const deleteCategory = () => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }
    router.delete(route("activity-categories.destroy", category.id), {
      onSuccess: () => {
        setShowSuccess(true);
      }
    });
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Activity Category Details
          </h2>
          <div className="flex space-x-2">
            <Link
              href={route("activity-categories.edit", category.id)}
              className="bg-blue-500 py-1 px-3 text-white rounded shadow transition-all hover:bg-blue-600"
            >
              Edit
            </Link>
            <button
              onClick={deleteCategory}
              className="bg-red-500 py-1 px-3 text-white rounded shadow transition-all hover:bg-red-600"
            >
              Delete
            </button>
            <Link
              href={route("activity-categories.index")}
              className="bg-indigo-600 py-1 px-3 text-white rounded shadow transition-all hover:bg-indigo-700"
            >
              Back to Categories
            </Link>
          </div>
        </div>
      }
    >
      <Head title="Activity Category Details" />

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
                <h3 className="text-lg font-semibold mb-2">Category Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Name</p>
                    <p className="font-medium">{category.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Created At</p>
                    <p className="font-medium">{new Date(category.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Standard Time</p>
                    <p className="font-medium">
                      {category.standard_time ? formatMinutesDisplay(category.standard_time) : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Updated At</p>
                    <p className="font-medium">{new Date(category.updated_at).toLocaleDateString()}</p>
                  </div>
                  {category.description && (
                    <div className="col-span-2">
                      <p className="text-gray-600 dark:text-gray-400">Description</p>
                      <p className="font-medium whitespace-pre-wrap">{category.description}</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
