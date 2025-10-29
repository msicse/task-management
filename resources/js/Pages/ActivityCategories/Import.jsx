import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import Alert from "@/Components/Alert";
import { useState } from "react";

export default function Import({ auth, success, error, imported_count }) {
  const [alerts, setAlerts] = useState({
    success: !!success,
    error: !!error
  });

  const { data, setData, post, errors, processing } = useForm({ file: null });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("activity-categories.import"), { forceFormData: true });
  };

  const generateTemplate = () => {
    const template = [
      ['category_name', 'category_code', 'category_description', 'standard_time', 'parent_category_code', 'role_names', 'department_name'],
      ['Project Management', '', 'Managing project activities', 120, '', 'Project Manager,Team Lead', 'IT Department'],
      ['Planning', '', 'Project planning activities', 60, '', 'Project Manager,Planner', 'IT Department'],
      ['Quality Assurance', '', 'Quality control activities', 45, '', 'QA Manager,QA Specialist', 'Quality Department'],
      ['Testing', '', 'Software testing activities', 30, '', 'Tester,Automation Engineer', 'Quality Department'],
      ['Documentation', '', 'Documentation activities', 60, '', 'Technical Writer', 'Documentation Department'],
      ['Your Category Name', '', 'Your description here', 90, '', 'Your Roles', 'Your Department']
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = Object.assign(document.createElement('a'), {
      href: url,
      download: 'activity_categories_template.csv',
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
            Import Activity Categories
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
      <Head title="Import Activity Categories" />

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
                        <a
                          href={route("activity-categories.import.template")}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                        >
                        Download Template
                        </a>
                        <a
                          href={route("activity-categories.download-new-template")}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                        >
                          Download New CSV Template
                        </a>
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
                        <li>• Multiple roles: "Role1,Role2,Role3"</li>
                        <li>• Excel template includes auto-code formulas!</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h4 className="font-medium text-green-900 dark:text-green-200 mb-2">✅ Key Features</h4>
                      <ul className="space-y-1 text-green-800 dark:text-green-300">
                        <li>• Updates by category_code or creates new</li>
                        <li>• Builds parent-child hierarchies</li>
                        <li>• Auto-creates missing roles & departments</li>
                        <li>• Smart Excel formulas auto-generate codes</li>
                        <li>• Transaction-safe (rollback on error)</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <h4 className="font-medium text-amber-900 dark:text-amber-200 mb-2">📋 Required Fields</h4>
                      <div className="grid grid-cols-1 gap-1 text-amber-800 dark:text-amber-300">
                        <code className="text-xs bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded">category_name</code>
                        <small className="text-xs">Optional: category_code (use Excel formulas or leave empty), description, standard_time, parent_category_code, role_names, department_name</small>
                      </div>
                    </div>

                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <h4 className="font-medium text-purple-900 dark:text-purple-200 mb-2">✨ Excel Magic</h4>
                      <ul className="space-y-1 text-purple-800 dark:text-purple-300 text-xs">
                        <li>• Download Excel template with built-in formulas</li>
                        <li>• <strong>Parent categories:</strong> Leave parent_category_code empty → IT_PM_001</li>
                        <li>• <strong>Child categories:</strong> Enter parent code → IT_PM_001-PLN</li>
                        <li>• Formulas recognize: Project→PM, Quality→QA, Test→TST, Plan→PLN</li>
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
