import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, useForm } from "@inertiajs/react";
import TextInput from "@/Components/TextInput";
import DateInput from "@/Components/DateInput";
import SelectInput from "@/Components/SelectInput";
import MultipleSearchableSelect from "@/Components/MultipleSearchableSelect";
import ActivityCharts from "@/Components/ActivityCharts";
import Alert from "@/Components/Alert";
import { useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { formatMinutesDisplay, exactTooltip } from '@/utils/timeFormat';

export default function Reports({
  auth,
  filters,
  users,
  categories,
  departments = [],
  roles = [],
  summary,
  perDay,
  perDayActivities = {},
  pagination,
  chart,
  success,
}) {
  const [showSuccess, setShowSuccess] = useState(!!success);
  const [showCharts, setShowCharts] = useState(true); // Show charts by default
  const [exporting, setExporting] = useState(false);

  const exportAllToPDF = () => {
    // Simply export current data - users can adjust per_page manually if needed
    exportToPDF();
  };

  const formatDateForPDF = (dateString) => {
    if (!dateString) return "Unknown";
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (error) {
      return dateString;
    }
  };

  const exportToPDF = async () => {
    setExporting(true);
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      let yPosition = 15;

      // Add title
      pdf.setFontSize(16);
      pdf.text("Activity Report", 10, yPosition);
      yPosition += 12;

      // Add date range
      if (data.start_date || data.end_date) {
        pdf.setFontSize(10);
        const startDateFormatted = data.start_date
          ? formatDateForPDF(data.start_date)
          : "Start";
        const endDateFormatted = data.end_date
          ? formatDateForPDF(data.end_date)
          : "End";
        pdf.text(
          `Period: ${startDateFormatted} to ${endDateFormatted}`,
          10,
          yPosition
        );
        yPosition += 8;
      }

      // Add summary statistics
      if (summary) {
        pdf.setFontSize(12);
        pdf.text("Summary Statistics:", 10, yPosition);
        yPosition += 8;

        pdf.setFontSize(9);
        pdf.text(
          `Total Activities: ${summary.total_activities || 0}`,
          15,
          yPosition
        );
        yPosition += 4;
        pdf.text(
          `Total Duration: ${summary.total_duration || "0 hours"}`,
          15,
          yPosition
        );
        yPosition += 4;
        pdf.text(
          `Average Duration: ${summary.average_duration || "0 minutes"}`,
          15,
          yPosition
        );
        yPosition += 6;

        yPosition += 8;
      }

      // Capture charts if they're visible
      if (showCharts) {
        const chartsElement = document.querySelector(".charts-container");
        if (chartsElement) {
          const canvas = await html2canvas(chartsElement, {
            scale: 1,
            logging: false,
            useCORS: true,
            backgroundColor: "#ffffff",
          });

          const imgData = canvas.toDataURL("image/png");
          const imgWidth = 170; // A4 width - margins
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          // Check if we need a new page
          if (yPosition + imgHeight > 285) {
            pdf.addPage();
            yPosition = 15;
          }

          pdf.addImage(imgData, "PNG", 10, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 10;
        }
      }

      // Add activities table
      if (perDayActivities && Object.keys(perDayActivities).length > 0) {
        // Check if we need a new page for the table
        if (yPosition > 200) {
          pdf.addPage();
          yPosition = 15;
        }

        pdf.setFontSize(14);
        pdf.text("Activities by Date", 10, yPosition);
        yPosition += 8;

        const currentPageCount = Object.values(perDayActivities).reduce(
          (sum, dayActivities) => sum + dayActivities.length,
          0
        );
        pdf.setFontSize(9);
        pdf.text(
          `Activities in this export: ${currentPageCount}`,
          10,
          yPosition
        );
        yPosition += 4;

        // Add helpful note if there are more activities
        if (pagination && pagination.total > currentPageCount) {
          pdf.setFontSize(8);
          pdf.text(
            `Note: ${
              pagination.total - currentPageCount
            } more activities available. Select "All activities" from dropdown to export more.`,
            10,
            yPosition
          );
          yPosition += 4;
        }
        yPosition += 4;

        pdf.setFontSize(7);

        // Table headers - Updated with standard time and better spacing
        const headers = [
          "Date",
          "Description",
          "Category",
          "User",
          "Count",
          "Actual (min)",
          "Standard (min)",
          "Status",
        ];
        // xPositions for each column (mm) - tuned to fit A4 width with margins
        let xPositions = [10, 40, 85, 125, 150, 165, 180, 195];

        // Draw header
        headers.forEach((header, index) => {
          pdf.text(header, xPositions[index], yPosition);
        });
        yPosition += 5;

        // Draw line under header
        pdf.line(10, yPosition, 200, yPosition);
        yPosition += 5;

        // Add activity rows - organized by date with better formatting
        const sortedDates = Object.keys(perDayActivities).sort();
        let activityCount = 0;

        sortedDates.forEach((date) => {
          const activities = perDayActivities[date];

          activities.forEach((activity) => {
            if (yPosition > 280) {
              pdf.addPage();
              yPosition = 15;

              // Repeat headers on new page
              pdf.setFontSize(7);
              headers.forEach((header, index) => {
                pdf.text(header, xPositions[index], yPosition);
              });
              yPosition += 5;
              pdf.line(10, yPosition, 200, yPosition);
              yPosition += 5;
            }

            activityCount++;

            // Prepare data with text wrapping for category
            const categoryText = activity?.category || "No Category";
            const categoryLines = pdf.splitTextToSize(categoryText, 35); // 35mm width for category column

            const row = [
              formatDateForPDF(date), // Format as "day month year"
              (activity?.description || "").substring(0, 15) ||
                "No Description", // Reduced for better fit
              categoryLines[0] || "No Category", // First line of category
              (activity?.user || "").substring(0, 8) || "No User",
              activity?.count ?? 0,
              activity?.minutes
                ? `${activity.minutes}`
                : activity?.hours
                ? `${Math.round(activity.hours * 60)}`
                : "0",
              activity?.category_standard_time
                ? `${activity.category_standard_time}`
                : "N/A",
              (activity?.status || "").substring(0, 6) || "N/A",
            ];

            pdf.setFontSize(6);
            row.forEach((cell, index) => {
              pdf.text(String(cell), xPositions[index], yPosition);
            });

            // Add additional lines for category if wrapped
            if (categoryLines.length > 1) {
              for (let i = 1; i < Math.min(categoryLines.length, 2); i++) {
                // Max 2 lines
                pdf.text(
                  String(categoryLines[i]),
                  xPositions[2],
                  yPosition + i * 3
                );
              }
            }

            yPosition += categoryLines.length > 1 ? 6 : 4;
          });
        });
      } else {
        // No activities data
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 15;
        }

        pdf.setFontSize(14);
        pdf.text("Activities by Date", 10, yPosition);
        yPosition += 12;

        pdf.setFontSize(10);
        pdf.text(
          "No activities found for the selected filters and date range.",
          10,
          yPosition
        );
        yPosition += 5;
        pdf.text(
          "Try adjusting your filters or date range to see more data.",
          10,
          yPosition
        );
        yPosition += 8;
      }

      // Save the PDF
      const fileName = `activity-report-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(
        `Error generating PDF: ${
          error.message || "Please check your data and try again."
        }`
      );
    } finally {
      setExporting(false);
    }
  };

  const { data, setData, get } = useForm({
    start_date: filters?.start_date || "",
    end_date: filters?.end_date || "",
    user_id: filters?.user_id || "",
    category_id: filters?.category_id || "",
    department_id: filters?.department_id || "",
    role_id: filters?.role_id || "",
    filter: filters?.filter || "my",
  });

  // Check if user has permission to see all activities
  const hasPermission = (permission) => {
    const hasRolePermission =
      auth.user?.roles?.some((role) =>
        role.permissions?.some((p) => p.name === permission)
      ) ?? false;
    return hasRolePermission;
  };

  const canSeeAllActivities = hasPermission("activity-list-all");

  // Prepare options for MultipleSearchableSelect
  const userOptions =
    users?.map((user) => ({
      value: String(user.id),
      label: user.name,
    })) || [];

  const categoryOptions =
    categories?.map((category) => ({
      value: String(category.id),
      label: category.name,
    })) || [];

  const departmentOptions =
    departments?.map((department) => ({
      value: String(department.id),
      label: department.name,
    })) || [];

  const roleOptions =
    roles?.map((role) => ({
      value: String(role.id),
      label: role.name,
    })) || [];

  const applyFilters = (e) => {
    e.preventDefault();
    // useForm.get automatically sends current form data as query params
    get(route("activities.reports", { filter: data.filter }), {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const clearFilters = () => {
    // Reset all form data to empty values but preserve the current filter
    setData({
      start_date: "",
      end_date: "",
      user_id: "",
      category_id: "",
      department_id: "",
      role_id: "",
      filter: data.filter, // Preserve current filter (my/all)
    });

    // Navigate to reports page without any filters except the current filter type
    router.get(
      route("activities.reports"),
      { filter: data.filter },
      {
        preserveState: false,
        preserveScroll: true,
        onSuccess: () => {
          // Form data will be updated when page reloads with new props
        },
      }
    );
  };
  const exportToExcel = () => {
    const queryParams = new URLSearchParams({
      start_date: data.start_date,
      end_date: data.end_date,
      user_id: data.user_id || "",
      category_id: data.category_id || "",
      department_id: data.department_id || "",
      role_id: data.role_id || "",
      filter: data.filter,
      per_page: 9999, // Export all data
    }).toString();

    const url = `/activities/export/excel?${queryParams}`;
    window.open(url, "_blank");
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
              Activity Reports
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {data.filter === "all" && canSeeAllActivities
                ? "Viewing all team activities"
                : "Viewing your activities"}
            </p>
            {/* Removed 'Showing: Today (default)' hint per request */}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCharts(!showCharts)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                showCharts
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
              }`}
            >
              {showCharts ? "📊 Hide Charts" : "📈 Show Charts"}
            </button>
            <button
              onClick={exportToExcel}
              className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1.5 rounded transition-colors duration-200"
            >
              📁 Export Excel
            </button>
            <button
              onClick={exportAllToPDF}
              disabled={exporting}
              className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1.5 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export current page activities to PDF"
            >
              {exporting ? "⏳ Generating PDF..." : "📄 Export PDF"}
            </button>
          </div>
          {pagination && pagination.total > 20 && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              💡 Tip: To export all {pagination.total} activities, select "All
              activities" from the per-page dropdown below, then click Export
              PDF.
            </div>
          )}
        </div>
      }
    >
      <Head title="Activity Reports" />
      <div className="py-2">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          {showSuccess && (
            <Alert
              message={success}
              type="success"
              onClose={() => setShowSuccess(false)}
            />
          )}

          {/* Quick Links to Other Reports */}
          <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg mb-6">
            <div className="p-4 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Other Reports
              </h3>
              <Link
                href={route("activities.reports.category-performance")}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
              >
                📊 Category Performance Report
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg mb-6">
            <div className="p-6">
              {/* View Toggle - Only show if user can see all activities */}
              {canSeeAllActivities && (
                <div className="mb-6 flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Reports View
                  </h3>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="filter"
                        value="my"
                        checked={data.filter === "my"}
                        onChange={(e) => {
                          const newFilter = e.target.value;
                          setData("filter", newFilter);
                          // Navigate with just the filter parameter - backend will handle defaults
                          router.get(
                            route("activities.reports"),
                            { filter: newFilter },
                            {
                              preserveState: true,
                              preserveScroll: true,
                            }
                          );
                        }}
                        className="mr-2 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        My Activities
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="filter"
                        value="all"
                        checked={data.filter === "all"}
                        onChange={(e) => {
                          const newFilter = e.target.value;
                          setData("filter", newFilter);
                          // Navigate with just the filter parameter - backend will handle defaults
                          router.get(
                            route("activities.reports"),
                            { filter: newFilter },
                            {
                              preserveState: true,
                              preserveScroll: true,
                            }
                          );
                        }}
                        className="mr-2 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        All Team Activities
                      </span>
                    </label>
                  </div>
                </div>
              )}

              <form
                onSubmit={applyFilters}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
              >
                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                    Start Date
                  </label>
                  <DateInput
                    value={data.start_date}
                    onChange={(e) => setData("start_date", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                    End Date
                  </label>
                  <DateInput
                    value={data.end_date}
                    onChange={(e) => setData("end_date", e.target.value)}
                  />
                </div>
                {canSeeAllActivities && data.filter === "all" && (
                  <div>
                    <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                      User
                    </label>
                    <MultipleSearchableSelect
                      options={userOptions}
                      value={data.user_id}
                      onChange={(value) => setData("user_id", value)}
                      placeholder="All Users"
                      searchPlaceholder="Search users..."
                      searchable={true}
                      multiSelect={false}
                      closeOnSelect={true}
                      allowClear={true}
                      className="w-full"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                    Activity Category
                  </label>
                  <MultipleSearchableSelect
                    options={categoryOptions}
                    value={data.category_id}
                    onChange={(value) => setData("category_id", value)}
                    placeholder="All Categories"
                    searchPlaceholder="Search categories..."
                    searchable={true}
                    multiSelect={false}
                    closeOnSelect={true}
                    allowClear={true}
                    className="w-full"
                  />
                </div>
                {canSeeAllActivities && data.filter === "all" && (
                  <div>
                    <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                      Department
                    </label>
                    <MultipleSearchableSelect
                      options={departmentOptions}
                      value={data.department_id}
                      onChange={(value) => setData("department_id", value)}
                      placeholder="All Departments"
                      searchPlaceholder="Search departments..."
                      searchable={true}
                      multiSelect={false}
                      closeOnSelect={true}
                      allowClear={true}
                      className="w-full"
                    />
                  </div>
                )}
                {canSeeAllActivities && data.filter === "all" && (
                  <div>
                    <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                      User Role
                    </label>
                    <MultipleSearchableSelect
                      options={roleOptions}
                      value={data.role_id}
                      onChange={(value) => setData("role_id", value)}
                      placeholder="All Roles"
                      searchPlaceholder="Search roles..."
                      searchable={true}
                      multiSelect={false}
                      closeOnSelect={true}
                      allowClear={true}
                      className="w-full"
                    />
                  </div>
                )}
                <div className="md:col-span-2 lg:col-span-3 xl:col-span-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors duration-200"
                  >
                    Clear Filters
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition-colors duration-200"
                  >
                    Apply
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-4 mb-6">
            {/* Total Activities card + other summary cards — placed after Activity Analytics Dashboard */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Activities
              </div>
              <div className="text-2xl font-semibold text-blue-600">
                {summary?.total_activities ?? 0}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Duration
              </div>
              <div className="text-2xl font-semibold text-green-600">
                {summary?.total_duration ?? "0 hours"}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Avg Duration
              </div>
              <div className="text-2xl font-semibold text-purple-600">
                {summary?.average_duration ?? "0 minutes"}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Avg/Day (per person)
                </div>
                {summary?.avg_per_person_per_day_tooltip && (
                  <div
                    title={summary.avg_per_person_per_day_tooltip}
                    className="text-xs text-gray-400 dark:text-gray-300"
                  >
                    ℹ️
                  </div>
                )}
              </div>
              <div
                className="text-2xl font-semibold text-teal-600"
                title={summary?.avg_per_person_per_day_tooltip ?? ""}
              >
                {summary?.avg_per_person_per_day_display ??
                  (typeof summary?.avg_per_person_per_day !== "undefined"
                    ? `${summary.avg_per_person_per_day} h`
                    : "0 h")}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Days
              </div>
              <div className="text-2xl font-semibold text-orange-600">
                {summary?.total_days ?? 0}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Active Users
              </div>
              <div className="text-2xl font-semibold text-indigo-600">
                {summary?.total_users ?? 0}
              </div>
            </div>
          </div>
          {/* Enhanced Charts Section */}
          {showCharts && (
            <div className="mb-8 animate-in slide-in-from-top duration-300 charts-container">
              <ActivityCharts
                summary={summary}
                perDay={perDay}
                chart={chart}
                showSummary={false}
              />
              {/* compact total removed — Total Activities will appear as a card in the summary grid below */}
            </div>
          )}{" "}
          {/* Summary Cards */}
          {/* Category and Status Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {summary?.category_breakdown && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
                <h3 className="font-medium mb-3 text-gray-900 dark:text-gray-100">
                  Top 5 Categories
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                    by activity count
                  </span>
                </h3>
                <div className="space-y-2">
                  {Object.entries(summary.category_breakdown).map(
                    ([name, count], index) => {
                      const percentage =
                        summary.total_activities > 0
                          ? ((count / summary.total_activities) * 100).toFixed(
                              1
                            )
                          : 0;
                      return (
                        <div
                          key={name}
                          className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 py-2"
                        >
                          <div className="flex items-center">
                            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full mr-2">
                              #{index + 1}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {name}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {count}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {percentage}%
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}
            {summary?.status_breakdown && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
                <h3 className="font-medium mb-3 text-gray-900 dark:text-gray-100">
                  Status Breakdown
                </h3>
                <div className="space-y-2">
                  {Object.entries(summary.status_breakdown).map(
                    ([status, count]) => (
                      <div
                        key={status}
                        className="flex justify-between border-b border-gray-100 dark:border-gray-700 py-1"
                      >
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {status || "unknown"}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {count}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
          {/* Department Breakdown */}
          {summary?.department_breakdown &&
            Object.keys(summary.department_breakdown).length > 0 && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm mb-6">
                <h3 className="font-medium mb-3 text-gray-900 dark:text-gray-100">
                  Department Breakdown
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Object.entries(summary.department_breakdown).map(
                    ([name, count]) => (
                      <div
                        key={name}
                        className="border border-gray-200 dark:border-gray-700 rounded p-3"
                      >
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {name}
                        </div>
                        <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                          {count}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          {/* Per-day Table */}
          <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Daily Activity Summary
                </h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Detailed breakdown by date
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left bg-gray-50 dark:bg-gray-700">
                      <th className="px-4 py-2 text-gray-900 dark:text-gray-100 font-medium">
                        Date
                      </th>
                      <th className="px-4 py-2 text-gray-900 dark:text-gray-100 font-medium">
                        Activities
                      </th>
                      <th className="px-4 py-2 text-gray-900 dark:text-gray-100 font-medium">
                        Hours
                      </th>
                      <th className="px-4 py-2 text-gray-900 dark:text-gray-100 font-medium">
                        Minutes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {perDay?.length ? (
                      perDay.map((r, i) => (
                        <tr
                          key={i}
                          className="border-t border-gray-200 dark:border-gray-700"
                        >
                          <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                            {r.day}
                          </td>
                          <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                            {r.activities_count}
                          </td>
                          <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                            {r.hours}
                          </td>
                          <td className="px-4 py-2 text-gray-900 dark:text-gray-100" title={exactTooltip(r.minutes)}>
                            {formatMinutesDisplay(r.minutes)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          className="px-4 py-4 text-center text-gray-500 dark:text-gray-400"
                          colSpan={4}
                        >
                          No data for selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* Every task per day */}
          <div className="mt-6 bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-medium dark:text-gray-100">
                  Activity Details
                </h3>
                <div className="flex items-center space-x-4">
                  {pagination && (
                    <>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {pagination.from} to {pagination.to} of{" "}
                        {pagination.total} activities
                      </div>
                      <select
                        value={
                          new URLSearchParams(window.location.search).get(
                            "per_page"
                          ) || 20
                        }
                        onChange={(e) => {
                          const params = new URLSearchParams(
                            window.location.search
                          );
                          params.set("per_page", e.target.value);
                          params.set("page", 1); // Reset to first page
                          router.get(
                            route("activities.reports"),
                            Object.fromEntries(params),
                            {
                              preserveState: true,
                              preserveScroll: false,
                            }
                          );
                        }}
                        className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      >
                        <option value="10">10 per page</option>
                        <option value="20">20 per page</option>
                        <option value="50">50 per page</option>
                        <option value="100">100 per page</option>
                        <option value="500">500 per page</option>
                        <option value="1000">1000 per page</option>
                        <option value="9999">All activities</option>
                      </select>
                    </>
                  )}
                </div>
              </div>
              {Object.keys(perDayActivities).length ? (
                Object.keys(perDayActivities)
                  .sort()
                  .map((day) => (
                    <div key={day} className="mb-4">
                      <div className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
                        {day}
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left bg-gray-50 dark:bg-gray-700">
                              <th className="px-4 py-2 text-gray-900 dark:text-gray-100 font-medium">
                                Activity ID
                              </th>
                              <th className="px-4 py-2 text-gray-900 dark:text-gray-100 font-medium">
                                User
                              </th>
                              <th className="px-4 py-2 text-gray-900 dark:text-gray-100 font-medium">
                                Category
                              </th>
                              <th className="px-4 py-2 text-gray-900 dark:text-gray-100 font-medium">
                                Count
                              </th>
                              <th className="px-4 py-2 text-gray-900 dark:text-gray-100 font-medium">
                                Status
                              </th>
                              <th className="px-4 py-2 text-gray-900 dark:text-gray-100 font-medium">
                                Description
                              </th>
                              <th className="px-4 py-2 text-gray-900 dark:text-gray-100 font-medium">
                                Minutes
                              </th>
                              <th className="px-4 py-2 text-gray-900 dark:text-gray-100 font-medium">
                                Hours
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {perDayActivities[day].map((a, idx) => (
                              <tr
                                key={idx}
                                className="border-t border-gray-200 dark:border-gray-700"
                              >
                                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                  {a.activity_id}
                                </td>
                                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                  {a.user}
                                </td>
                                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                  {a.category}
                                </td>
                                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                  {typeof a.count !== 'undefined' ? a.count : 0}
                                </td>
                                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                  {a.status}
                                </td>
                                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                  {a.description}
                                </td>
                                <td className="px-4 py-2 text-gray-900 dark:text-gray-100" title={exactTooltip(a.minutes)}>
                                  {formatMinutesDisplay(a.minutes)}
                                </td>
                                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                  {a.hours}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-gray-500 dark:text-gray-400">
                  No per-day activity breakdown available.
                </div>
              )}

              {/* Pagination Navigation */}
              {pagination && pagination.last_page > 1 && (
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        const params = new URLSearchParams(
                          window.location.search
                        );
                        params.set("page", 1);
                        router.get(
                          route("activities.reports"),
                          Object.fromEntries(params),
                          {
                            preserveState: true,
                            preserveScroll: false,
                          }
                        );
                      }}
                      disabled={pagination.current_page <= 1}
                      className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      title="First Page"
                    >
                      First
                    </button>

                    <button
                      onClick={() => {
                        const params = new URLSearchParams(
                          window.location.search
                        );
                        params.set(
                          "page",
                          Math.max(1, pagination.current_page - 1)
                        );
                        router.get(
                          route("activities.reports"),
                          Object.fromEntries(params),
                          {
                            preserveState: true,
                            preserveScroll: false,
                          }
                        );
                      }}
                      disabled={pagination.current_page <= 1}
                      className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      title="Previous Page"
                    >
                      Previous
                    </button>

                    <div className="flex items-center space-x-1">
                      {(() => {
                        const current = pagination.current_page;
                        const total = pagination.last_page;

                        // Don't show pagination if only 1 page
                        if (total <= 1) return null;

                        // Simple logic: Always show max 5 consecutive pages centered around current
                        const maxVisible = 5;
                        let startPage, endPage;

                        if (total <= maxVisible) {
                          // If total pages is small, show all
                          startPage = 1;
                          endPage = total;
                        } else {
                          // Center around current page
                          const half = Math.floor(maxVisible / 2);
                          startPage = Math.max(1, current - half);
                          endPage = Math.min(total, startPage + maxVisible - 1);

                          // Adjust if we're near the end
                          if (
                            endPage === total &&
                            endPage - startPage < maxVisible - 1
                          ) {
                            startPage = Math.max(1, total - maxVisible + 1);
                          }
                        }

                        const pages = [];
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(i);
                        }

                        return pages.map((pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => {
                              const params = new URLSearchParams(
                                window.location.search
                              );
                              params.set("page", pageNum);
                              router.get(
                                route("activities.reports"),
                                Object.fromEntries(params),
                                {
                                  preserveState: true,
                                  preserveScroll: false,
                                }
                              );
                            }}
                            className={`px-3 py-1 text-sm border rounded ${
                              pagination.current_page === pageNum
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {pageNum}
                          </button>
                        ));
                      })()}
                    </div>

                    <button
                      onClick={() => {
                        const params = new URLSearchParams(
                          window.location.search
                        );
                        params.set(
                          "page",
                          Math.min(
                            pagination.last_page,
                            pagination.current_page + 1
                          )
                        );
                        router.get(
                          route("activities.reports"),
                          Object.fromEntries(params),
                          {
                            preserveState: true,
                            preserveScroll: false,
                          }
                        );
                      }}
                      disabled={pagination.current_page >= pagination.last_page}
                      className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      title="Next Page"
                    >
                      Next
                    </button>

                    <button
                      onClick={() => {
                        const params = new URLSearchParams(
                          window.location.search
                        );
                        params.set("page", pagination.last_page);
                        router.get(
                          route("activities.reports"),
                          Object.fromEntries(params),
                          {
                            preserveState: true,
                            preserveScroll: false,
                          }
                        );
                      }}
                      disabled={pagination.current_page >= pagination.last_page}
                      className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      title="Last Page"
                    >
                      Last
                    </button>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Page {pagination.current_page} of {pagination.last_page}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
