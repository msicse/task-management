import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import {
  ArrowLeftIcon,
  FunnelIcon,
  ChartBarIcon,
  CalendarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import MultipleSearchableSelect from "@/Components/MultipleSearchableSelect";

export default function UserActivityVisualization({
  auth,
  filters,
  users,
  canViewAll,
  dailyData,
  categoryBreakdown,
  hourlyHeatmap,
  summary,
  selectedUserName,
  sessionTimeline,
}) {
  const [startDate, setStartDate] = useState(filters.start_date);
  const [endDate, setEndDate] = useState(filters.end_date);
  const [userId, setUserId] = useState(filters.user_id || "");
  const [viewType, setViewType] = useState(filters.view_type || "daily");

  const handleFilter = (e) => {
    e.preventDefault();
    router.get(
      route("activities.reports.user-visualization"),
      {
        start_date: startDate,
        end_date: endDate,
        user_id: userId,
        view_type: viewType,
      },
      {
        preserveState: true,
        preserveScroll: false,
      }
    );
  };

  // Format minutes to hours
  const formatHours = (minutes) => {
    if (!minutes) return "0 min";
    if (minutes < 1) return `${minutes.toFixed(2)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {label}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatHours(entry.value)}
            </p>
          ))}
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1 pt-1 border-t border-gray-200 dark:border-gray-700">
            Total: {formatHours(payload.reduce((sum, item) => sum + item.value, 0))}
          </p>
        </div>
      );
    }
    return null;
  };

  // Colors for categories
  const categoryColors = [
    "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
    "#EC4899", "#14B8A6", "#F97316", "#6366F1", "#84CC16"
  ];

  // Get intensity color for heatmap
  const getIntensityColor = (minutes) => {
    if (minutes === 0) return "bg-gray-100 dark:bg-gray-800";
    if (minutes < 30) return "bg-blue-100 dark:bg-blue-900/30";
    if (minutes < 60) return "bg-blue-200 dark:bg-blue-800/40";
    if (minutes < 90) return "bg-blue-300 dark:bg-blue-700/50";
    if (minutes < 120) return "bg-blue-400 dark:bg-blue-600/60";
    return "bg-blue-500 dark:bg-blue-500/70";
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
              User Activity Visualization
            </h2>
          </div>
        </div>
      }
    >
      <Head title="User Activity Visualization" />

      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8 space-y-6">
          {/* Reports Navigation Bar */}
          <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg mb-4 overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex -mb-px">
                <Link
                  href={route("activities.reports")}
                  className="group inline-flex items-center px-4 py-3 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Activity Summary
                </Link>
                <Link
                  href={route("activities.reports.category-performance")}
                  className="group inline-flex items-center px-4 py-3 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  <span className="mr-1.5">📊</span>
                  Category Performance
                </Link>
                <Link
                  href={route("activities.reports.user-visualization")}
                  className="group inline-flex items-center px-4 py-3 border-b-2 border-indigo-500 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                >
                  <span className="mr-1.5">📈</span>
                  User Visualization
                </Link>
              </nav>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white dark:bg-gray-800 overflow-visible shadow-sm sm:rounded-lg">
            <div className="p-6 overflow-visible">
              <div className="flex items-center mb-4">
                <FunnelIcon className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Filters
                </h3>
              </div>

              <form onSubmit={handleFilter} className="space-y-4 overflow-visible">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Date Filters */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-200 text-sm"
                    />
                  </div>

                  {/* User Filter */}
                  {canViewAll && (
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        User
                      </label>
                      <div className="relative z-50">
                        <MultipleSearchableSelect
                          options={users.map((user) => ({
                            value: String(user.id),
                            label: user.employee_id
                              ? `${user.name} (${user.employee_id})`
                              : user.name,
                          }))}
                          value={userId}
                          onChange={(value) => setUserId(value)}
                          placeholder="Select user..."
                          searchPlaceholder="Search users..."
                          searchable={true}
                          multiSelect={false}
                          closeOnSelect={true}
                          allowClear={false}
                        />
                      </div>
                    </div>
                  )}

                  {/* View Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      View Type
                    </label>
                    <select
                      value={viewType}
                      onChange={(e) => setViewType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-200 text-sm"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                  >
                    Apply Filters
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                  <ClockIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Time</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatHours(summary?.total_minutes || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                  <ChartBarIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Activities</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {summary?.total_activities || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">
                  <CalendarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Days</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {summary?.active_days || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/20">
                  <ChartBarIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg/Day</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatHours(summary?.avg_per_day || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Selected User Info */}
          {selectedUserName && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
              <p className="text-sm text-indigo-800 dark:text-indigo-200">
                <span className="font-semibold">Viewing data for:</span> {selectedUserName}
              </p>
            </div>
          )}

          {/* Daily Trend Chart */}
          {dailyData && dailyData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Activity Duration Over Time
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="date"
                    stroke="#9CA3AF"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    style={{ fontSize: "12px" }}
                    tickFormatter={(value) => `${Math.round(value / 60)}h`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total_minutes"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="Total Duration"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Category Breakdown - Stacked Bar Chart */}
          {categoryBreakdown && categoryBreakdown.length > 0 && (
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Activity Breakdown by Category
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Each bar represents one day. Different colors show different activity categories stacked together.
                  </p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={categoryBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="date"
                    stroke="#9CA3AF"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    style={{ fontSize: "12px" }}
                    tickFormatter={(value) => `${Math.round(value / 60)}h`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  {categoryBreakdown[0] &&
                    Object.keys(categoryBreakdown[0])
                      .filter((key) => key !== "date")
                      .map((category, index) => (
                        <Bar
                          key={category}
                          dataKey={category}
                          stackId="a"
                          fill={categoryColors[index % categoryColors.length]}
                          name={category}
                        />
                      ))}
                </BarChart>
              </ResponsiveContainer>

              {/* Category Summary Table */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Category Totals
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {categoryBreakdown[0] &&
                    Object.keys(categoryBreakdown[0])
                      .filter((key) => key !== "date")
                      .map((category, index) => {
                        const totalMinutes = categoryBreakdown.reduce(
                          (sum, day) => sum + (day[category] || 0),
                          0
                        );
                        return (
                          <div
                            key={category}
                            className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div
                              className="w-4 h-4 rounded"
                              style={{
                                backgroundColor:
                                  categoryColors[index % categoryColors.length],
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                {category}
                              </p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {formatHours(totalMinutes)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                </div>
              </div>
            </div>
          )}

          {/* Session Timeline - Detailed View */}
          {sessionTimeline && sessionTimeline.length > 0 && (
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Daily Session Timeline
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                24-hour view showing when sessions were active (colored) vs idle (empty)
              </p>

              {/* Timeline Graph Visualization - Single bar per day */}
              <div className="space-y-6">
                {Object.entries(
                  sessionTimeline.reduce((acc, session) => {
                    const date = session.date;
                    if (!acc[date]) acc[date] = [];
                    acc[date].push(session);
                    return acc;
                  }, {})
                ).map(([date, sessions]) => {
                  const parseTime = (timeStr) => {
                    const [time, period] = timeStr.split(' ');
                    const [hours, minutes] = time.split(':').map(Number);
                    let hour24 = hours;
                    if (period === 'PM' && hours !== 12) hour24 += 12;
                    if (period === 'AM' && hours === 12) hour24 = 0;
                    return hour24 * 60 + minutes; // Total minutes from midnight
                  };

                  return (
                    <div key={date} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      {/* Date label */}
                      <div className="flex items-center mb-3">
                        <CalendarIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {date}
                        </span>
                      </div>

                      {/* 24-hour timeline bar */}
                      <div className="relative">
                        {/* Hour labels */}
                        <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 mb-1 px-1">
                          {Array.from({ length: 25 }, (_, i) => (
                            <span key={i} className={i % 3 === 0 ? '' : 'opacity-0'}>
                              {i}h
                            </span>
                          ))}
                        </div>

                        {/* Timeline container */}
                        <div className="relative h-16 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
                          {/* Session blocks */}
                          {sessions.map((session, index) => {
                            const startMin = parseTime(session.start_time);
                            const endMin = session.end_time !== 'Ongoing'
                              ? parseTime(session.end_time)
                              : startMin + 30;

                            // Calculate position as percentage of 24 hours (1440 minutes)
                            const leftPercent = (startMin / 1440) * 100;
                            const widthPercent = ((endMin - startMin) / 1440) * 100;

                            // Category colors
                            const colors = [
                              'bg-blue-500', 'bg-green-500', 'bg-purple-500',
                              'bg-orange-500', 'bg-pink-500', 'bg-teal-500',
                              'bg-indigo-500', 'bg-red-500', 'bg-yellow-500'
                            ];
                            const colorClass = colors[index % colors.length];

                            return (
                              <div
                                key={index}
                                className={`absolute top-0 h-full ${colorClass} hover:opacity-80 transition-opacity cursor-pointer group`}
                                style={{
                                  left: `${leftPercent}%`,
                                  width: `${widthPercent}%`,
                                }}
                              >
                                {/* Tooltip on hover */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                                  <div className="bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap shadow-lg">
                                    <div className="font-semibold">{session.category}</div>
                                    {session.sub_category && (
                                      <div className="text-gray-300">→ {session.sub_category}</div>
                                    )}
                                    <div className="text-gray-400 mt-1">
                                      {session.start_time} - {session.end_time}
                                    </div>
                                    <div className="text-gray-400">Duration: {session.duration}</div>
                                    {/* Arrow */}
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                      <div className="border-4 border-transparent border-t-gray-900"></div>
                                    </div>
                                  </div>
                                </div>

                                {/* Session label inside bar if wide enough */}
                                {widthPercent > 5 && (
                                  <div className="h-full flex items-center justify-center px-1">
                                    <span className="text-white text-[10px] font-medium truncate">
                                      {session.category}
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {/* Hour grid lines */}
                          {Array.from({ length: 24 }, (_, i) => (
                            <div
                              key={i}
                              className="absolute top-0 bottom-0 border-l border-gray-200 dark:border-gray-700"
                              style={{ left: `${(i / 24) * 100}%` }}
                            />
                          ))}
                        </div>

                        {/* Legend showing sessions */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {sessions.map((session, index) => {
                            const colors = [
                              'bg-blue-500', 'bg-green-500', 'bg-purple-500',
                              'bg-orange-500', 'bg-pink-500', 'bg-teal-500',
                              'bg-indigo-500', 'bg-red-500', 'bg-yellow-500'
                            ];
                            const colorClass = colors[index % colors.length];

                            return (
                              <div key={index} className="flex items-center text-xs">
                                <div className={`w-3 h-3 ${colorClass} rounded mr-1`}></div>
                                <span className="text-gray-700 dark:text-gray-300">
                                  {session.start_time}: {session.category}
                                  {session.sub_category && ` → ${session.sub_category}`}
                                  {' '}({session.duration})
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Note about visualization */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <span className="font-semibold">How to read:</span> Each colored block represents an active work session.
                  Empty/white spaces show idle time when no session was running. Hover over blocks to see details.
                </p>
              </div>
            </div>
          )}

          {/* Hourly Heatmap */}
          {hourlyHeatmap && Object.keys(hourlyHeatmap).length > 0 && (
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Activity Heatmap - Time of Day
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Intensity based on total minutes spent per hour
              </p>
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                  <div className="flex">
                    {/* Day labels */}
                    <div className="flex flex-col justify-around py-2 pr-2">
                      {days.map((day) => (
                        <div
                          key={day}
                          className="h-8 flex items-center text-xs font-medium text-gray-700 dark:text-gray-300"
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                    {/* Heatmap grid */}
                    <div className="flex-1">
                      {/* Hour labels */}
                      <div className="flex mb-1">
                        {hours.map((hour) => (
                          <div
                            key={hour}
                            className="flex-1 text-center text-xs text-gray-600 dark:text-gray-400"
                          >
                            {hour % 3 === 0 ? `${hour}h` : ""}
                          </div>
                        ))}
                      </div>
                      {/* Grid cells */}
                      {days.map((day, dayIndex) => (
                        <div key={day} className="flex gap-1 mb-1">
                          {hours.map((hour) => {
                            const minutes =
                              hourlyHeatmap[dayIndex]?.[hour] || 0;
                            return (
                              <div
                                key={hour}
                                className={`flex-1 h-8 rounded ${getIntensityColor(
                                  minutes
                                )} border border-gray-200 dark:border-gray-700 cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all`}
                                title={`${day} ${hour}:00 - ${formatHours(minutes)}`}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Legend */}
                  <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-600 dark:text-gray-400">
                    <span>Less</span>
                    <div className="flex gap-1">
                      <div className="w-4 h-4 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded" />
                      <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/30 border border-gray-300 dark:border-gray-700 rounded" />
                      <div className="w-4 h-4 bg-blue-200 dark:bg-blue-800/40 border border-gray-300 dark:border-gray-700 rounded" />
                      <div className="w-4 h-4 bg-blue-300 dark:bg-blue-700/50 border border-gray-300 dark:border-gray-700 rounded" />
                      <div className="w-4 h-4 bg-blue-400 dark:bg-blue-600/60 border border-gray-300 dark:border-gray-700 rounded" />
                      <div className="w-4 h-4 bg-blue-500 dark:bg-blue-500/70 border border-gray-300 dark:border-gray-700 rounded" />
                    </div>
                    <span>More</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* No Data Message */}
          {(!dailyData || dailyData.length === 0) && (
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-12">
              <div className="text-center">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                  No activity data
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  No activities found for the selected filters.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
