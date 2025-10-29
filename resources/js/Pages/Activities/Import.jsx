import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import Alert from "@/Components/Alert";
import { useState } from "react";

export default function Import({ auth, success, error }) {
  const [alerts, setAlerts] = useState({ success: !!success, error: !!error });
  const { data, setData, post, errors, processing } = useForm({ file: null });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("activities.import.process"), { forceFormData: true });
  };

  const closeAlert = (type) => setAlerts((prev) => ({ ...prev, [type]: false }));

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Import Activities
          </h2>
          <Link
            href={route("activities.index")}
            className="bg-emerald-500 py-1 px-3 text-white rounded shadow transition-all hover:bg-emerald-700"
          >
            Back to Activities
          </Link>
        </div>
      }
    >
      <Head title="Import Activities" />

      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {alerts.success && (
            <Alert message={success} type="success" onClose={() => closeAlert('success')} />
          )}
          {alerts.error && (
            <Alert message={error} type="error" onClose={() => closeAlert('error')} />
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mt-4">
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">📁 Import File</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-3">
                      <InputLabel htmlFor="file" value="Select Import File" />
                      <input
                        id="file"
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={(e) => setData("file", e.target.files[0])}
                        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600 file:me-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-600 dark:file:text-gray-300"
                      />
                      <InputError message={errors.file} />
                      <p className="text-xs text-gray-500 dark:text-gray-400">Excel (.xlsx, .xls) or CSV only. Max: 10MB</p>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={processing || !data.file}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                      >
                        {processing ? "Importing..." : "Import Now"}
                      </button>
                    </div>
                  </form>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">📋 Notes</h3>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-blue-800 dark:text-blue-200">If a dedicated importer is available it will be executed. Otherwise the uploaded file will be stored in <code>storage/app/imports/activities</code> for manual processing.</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
