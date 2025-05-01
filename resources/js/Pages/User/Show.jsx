import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { USER_STATUS_CLASS_MAP, USER_STATUS_TEXT_MAP } from "@/constants.jsx";
import TasksTable from "../Task/TasksTable";
import { useState, useEffect } from "react";



export default function Show({ auth, user, tasks, success }) {
    const [showSuccess, setShowSuccess] = useState(!!success);

    useEffect(() => {
        if (success) {
          setShowSuccess(true);
        }
      }, [success]);

    const deleteUser = () => {
        if (!window.confirm("Are you sure you want to delete this user?")) {
          return;
        }
        router.delete(route("users.destroy", user.id), {
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
            User Details
          </h2>
          <div className="flex space-x-2">
            <div className="flex items-center gap-2">
              <Link
                href={route("users.edit", user.id)}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Edit
              </Link>
              <button
                onClick={deleteUser}
                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete
              </button>
              <Link
                href={route("users.index")}
                className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700  shadow transition-all"
              >
                Back to Users
              </Link>
            </div>
          </div>
        </div>
      }
    >
      <Head title="User Details" />
      <div className="py-2">
        {showSuccess && (
          <Alert
            message={success}
            type="success"
            onClose={() => setShowSuccess(false)}
          />
        )}
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Profile Image
                  </h4>
                  {user.image ? (
                    <img
                      src={`/storage/${user.image}`}
                      alt={user.name}
                      className="mt-2 h-32 w-32 rounded-full object-cover"
                    />
                  ) : (
                    <div className="mt-2 h-32 w-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-500 dark:text-gray-400">
                        No Image
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Basic Information
                  </h4>
                  <dl className="mt-2 grid grid-cols-1 gap-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Name
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {user.name}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Email
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {user.email}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Employee ID
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {user.employee_id || "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Designation
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {user.designation || "-"}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Contact Information
                  </h4>
                  <dl className="mt-2 grid grid-cols-1 gap-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Phone
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {user.phone || "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Location
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {user.location || "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Department
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {user.department ? user.department.name : "-"}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Additional Information
                  </h4>
                  <dl className="mt-2 grid grid-cols-1 gap-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Blood Group
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {user.blood || "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Gender
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {user.gender
                          ? user.gender.charAt(0).toUpperCase() +
                            user.gender.slice(1)
                          : "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </dt>
                      <dd className="mt-1">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            USER_STATUS_CLASS_MAP[user.status]
                          }`}
                        >
                          {USER_STATUS_TEXT_MAP[user.status]}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Dates
                  </h4>
                  <dl className="mt-2 grid grid-cols-1 gap-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Date of Join
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {user.date_of_join
                          ? new Date(user.date_of_join).toLocaleDateString()
                          : "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Date of Resign
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {user.date_of_resign
                          ? new Date(user.date_of_resign).toLocaleDateString()
                          : "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Created At
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {new Date(user.created_at).toLocaleString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Last Updated
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {new Date(user.updated_at).toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    About
                  </h4>
                  <p className="mt-2 text-sm text-gray-900 dark:text-gray-100">
                    {user.about || "No information available."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-4">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <h3 className="text-lg font-medium mb-4">User's Tasks</h3>
              <TasksTable tasks={tasks} hideUserColumn={true} />
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
