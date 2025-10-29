import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  TimeScale,
  Filler
} from 'chart.js';
import {
  Bar,
  Line,
  Pie,
  Doughnut,
  Radar,
  PolarArea
} from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  TimeScale,
  Filler
);

const ActivityCharts = ({ summary, perDay, chart, showSummary = true }) => {
  // Color palette for consistency
  const colors = {
    primary: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'],
    background: ['rgba(99, 102, 241, 0.1)', 'rgba(139, 92, 246, 0.1)', 'rgba(6, 182, 212, 0.1)', 'rgba(16, 185, 129, 0.1)', 'rgba(245, 158, 11, 0.1)', 'rgba(239, 68, 68, 0.1)'],
    border: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']
  };

  // 1. Status Distribution Pie Chart
  const statusPieData = {
    labels: Object.keys(summary?.status_breakdown || {}),
    datasets: [
      {
        label: 'Activities by Status',
        data: Object.values(summary?.status_breakdown || {}),
        backgroundColor: colors.primary.slice(0, Object.keys(summary?.status_breakdown || {}).length),
        borderColor: colors.border.slice(0, Object.keys(summary?.status_breakdown || {}).length),
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverOffset: 10
      }
    ]
  };

  // 2. Category Distribution Doughnut Chart
  const categoryDoughnutData = {
    labels: Object.keys(summary?.category_breakdown || {}).slice(0, 8), // Top 8 categories
    datasets: [
      {
        label: 'Activities by Category',
        data: Object.values(summary?.category_breakdown || {}).slice(0, 8),
        backgroundColor: colors.primary,
        borderColor: colors.border,
        borderWidth: 2,
        cutout: '60%',
        hoverOffset: 15
      }
    ]
  };

  // 3. Department Distribution Polar Area Chart
  const departmentPolarData = {
    labels: Object.keys(summary?.department_breakdown || {}).slice(0, 6), // Top 6 departments
    datasets: [
      {
        label: 'Activities by Department',
        data: Object.values(summary?.department_breakdown || {}).slice(0, 6),
        backgroundColor: colors.background,
        borderColor: colors.border,
        borderWidth: 2
      }
    ]
  };

  // 4. Daily Activity Bar Chart
  const dailyBarData = {
    labels: chart?.labels || [],
    datasets: [
      {
        label: 'Activities Count',
        data: chart?.series?.activities || [],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: '#6366f1',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
        yAxisID: 'y'
      },
      {
        label: 'Total Minutes',
        data: chart?.series?.minutes || [],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: '#10b981',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
        yAxisID: 'y1'
      }
    ]
  };

  // 5. Daily Trend Line Chart
  const dailyLineData = {
    labels: chart?.labels || [],
    datasets: [
      {
        label: 'Daily Hours',
        data: (chart?.series?.minutes || []).map(m => Math.round(m / 60 * 100) / 100),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8
      }
    ]
  };

  // Chart options
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Activities Count'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Minutes'
        },
        grid: {
          drawOnChartArea: false
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 8
      }
    }
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Hours Worked'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return `${context.parsed.y} hours`;
          }
        }
      }
    },
    elements: {
      point: {
        hoverRadius: 8
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Chart Header */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          📊 Activity Analytics Dashboard
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive visual analysis of activity data with interactive charts and insights
        </p>
      </div>

      {/* Summary Cards Row */}
      {showSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Days</p>
                <p className="text-3xl font-bold">{summary?.total_days || 0}</p>
              </div>
              <div className="text-4xl opacity-80">📅</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Total Hours</p>
                <p className="text-3xl font-bold">{summary?.total_hours || 0}</p>
              </div>
              <div className="text-4xl opacity-80">⏰</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Activities</p>
                <p className="text-3xl font-bold">{Object.values(summary?.status_breakdown || {}).reduce((a, b) => a + b, 0)}</p>
              </div>
              <div className="text-4xl opacity-80">📋</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Avg/Day</p>
                <p className="text-3xl font-bold">
                  {summary?.total_days ? Math.round((summary.total_hours / summary.total_days) * 10) / 10 : 0}h
                </p>
              </div>
              <div className="text-4xl opacity-80">📈</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution Pie Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            🎯 Activity Status Distribution
          </h3>
          <div style={{ height: '300px' }}>
            {Object.keys(summary?.status_breakdown || {}).length > 0 ? (
              <Pie data={statusPieData} options={pieOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No status data available
              </div>
            )}
          </div>
        </div>

        {/* Category Distribution Doughnut Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            🏷️ Top Categories (Doughnut)
          </h3>
          <div style={{ height: '300px' }}>
            {Object.keys(summary?.category_breakdown || {}).length > 0 ? (
              <Doughnut data={categoryDoughnutData} options={pieOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No category data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Daily Activity Trends */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Daily Bar Chart */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            📊 Daily Activity & Time Tracking
          </h3>
          <div style={{ height: '400px' }}>
            {(chart?.labels || []).length > 0 ? (
              <Bar data={dailyBarData} options={barOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No daily data available
              </div>
            )}
          </div>
        </div>

        {/* Department Polar Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            🏢 Department Distribution
          </h3>
          <div style={{ height: '400px' }}>
            {Object.keys(summary?.department_breakdown || {}).length > 0 ? (
              <PolarArea data={departmentPolarData} options={pieOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No department data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Daily Trend Line Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          📈 Daily Hours Trend (Area Chart)
        </h3>
        <div style={{ height: '300px' }}>
          {(chart?.labels || []).length > 0 ? (
            <Line data={dailyLineData} options={lineOptions} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No trend data available
            </div>
          )}
        </div>
      </div>

      {/* Insights Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-lg border border-indigo-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          💡 Key Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-indigo-100 dark:border-gray-600">
            <div className="text-sm text-gray-600 dark:text-gray-400">Most Active Status</div>
            <div className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
              {Object.entries(summary?.status_breakdown || {}).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-indigo-100 dark:border-gray-600">
            <div className="text-sm text-gray-600 dark:text-gray-400">Top Category</div>
            <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
              {Object.entries(summary?.category_breakdown || {}).sort(([,a], [,b]) => b - a)[0]?.[0]?.slice(0, 20) || 'N/A'}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-indigo-100 dark:border-gray-600">
            <div className="text-sm text-gray-600 dark:text-gray-400">Peak Day</div>
            <div className="text-lg font-semibold text-green-600 dark:text-green-400">
              {chart?.labels?.[chart.series?.minutes?.indexOf(Math.max(...(chart.series?.minutes || [])))] || 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityCharts;
