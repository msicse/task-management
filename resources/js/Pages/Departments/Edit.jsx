import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import Alert from "@/Components/Alert";
import { useState, useEffect } from "react";

export default function Edit({ auth, department, success }) {
  const [showSuccess, setShowSuccess] = useState(!!success);

  useEffect(() => {
    if (success) {
      setShowSuccess(true);
    }
  }, [success]);

  const { data, setData, put, processing, errors } = useForm({
    name: department.name,
    short_name: department.short_name,
  });

  const submit = (e) => {
    e.preventDefault();
    put(route("departments.update", department.id));
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
          Edit Department
          </h2>

        </div>
      }
    >
      <Head title="Edit Department" />

      <div className="py-2">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {showSuccess && success && (
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
                    onChange={(e) => setData("name", e.target.value)}
                    required
                  />
                  <InputError message={errors.name} className="mt-2" />
                </div>

                <div>
                  <InputLabel htmlFor="short_name" value="Short Name" />
                  <TextInput
                    id="short_name"
                    type="text"
                    name="short_name"
                    value={data.short_name}
                    className="mt-1 block w-full"
                    onChange={(e) => setData("short_name", e.target.value)}
                    required
                  />
                  <InputError message={errors.short_name} className="mt-2" />
                </div>

                <div className="flex items-center justify-end mt-4">
                  <Link
                    href={route("departments.index")}
                    className="bg-red-600 py-1 px-3 text-white rounded shadow transition-all hover:bg-red-700 mr-2"
                  >
                    Cancel
                  </Link>
                  <button
                    className="bg-emerald-600 py-1 px-3 text-white rounded shadow transition-all hover:bg-emerald-700"
                    disabled={processing}
                  >
                    Update
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
