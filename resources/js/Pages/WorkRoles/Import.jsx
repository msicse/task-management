import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import Alert from "@/Components/Alert";
import { useState } from "react";

export default function WorkRoleImport({ auth, success, error, imported_count }) {
  const [alerts, setAlerts] = useState({
    success: !!success,
    error: !!error
  });

  const { data, setData, post, errors, processing } = useForm({ file: null });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("work-roles.import"), { forceFormData: true });
  };

  const generateTemplate = () => {
    const template = [
      ["role_name", "description"],
      ["Project Manager", "Manages project activities and team"],
      ["QA Specialist", "Ensures quality standards are met"],
      ["Developer", "Develops and maintains software"],
      ["Technical Writer", "Prepares documentation"],
      ["Your Role Name", "Your description here"]
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([template], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = Object.assign(document.createElement('a'), {
      href: url,
      download: 'work_roles_template.csv',
      style: { display: 'none' }
    });

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const closeAlert = (type) => setAlerts(prev => ({ ...prev, [type]: false }));

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Import Work Roles
          </h2>
          <Link
            href={route("work-roles.index")}
            className="bg-emerald-500 py-1 px-3 text-white rounded shadow transition-all hover:bg-emerald-700"
          >
            Back to Roles
          </Link>
        </div>
      }
    >
      <Head title="Import Work Roles" />

      <div className="py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Alerts */}
          {alerts.success && (
            <Alert message={success} type="success" onClose={() => closeAlert('success')} />
          )}
          {alerts.error && (
            <Alert message={error} type="error" onClose={() => closeAlert('error')}>
              {imported_count && (
                <div className="mt-2 text-sm">Successfully imported: {imported_count} items</div>
              )}
            </Alert>
          )}

          {/* Main Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-8">

                {/* Upload Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    📁 Import File
                  </h3>

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
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Excel (.xlsx, .xls) or CSV files only. Max: 10MB
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex gap-2 flex-1">
                        <button
                          type="button"
                          onClick={generateTemplate}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                        >
                          Generate CSV
                        </button>
                      </div>
                      <button
                        type="submit"
                        disabled={processing || !data.file}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                      >
                        {processing ? " Importing..." : " Import Now"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Instructions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    📋 Quick Guide
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">📁 File Requirements</h4>
                      <ul className="space-y-1 text-blue-800 dark:text-blue-300">
                        <li>• Excel (.xlsx, .xls) or CSV format</li>
                        <li>• Headers in first row</li>
                        <li>• role_name, description required</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h4 className="font-medium text-green-900 dark:text-green-200 mb-2">✅ Key Features</h4>
                      <ul className="space-y-1 text-green-800 dark:text-green-300">
                        <li>• Updates by role_name or creates new</li>
                        <li>• Transaction-safe (rollback on error)</li>
                      </ul>
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
