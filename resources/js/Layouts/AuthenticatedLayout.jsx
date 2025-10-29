import { useState, useEffect } from "react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import NavLink from "@/Components/NavLink";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Link } from "@inertiajs/react";
import LoadingIndicator from "@/Components/LoadingIndicator";
// Import React Icons
import { FaSun, FaMoon, FaChevronDown, FaBars, FaTimes } from "react-icons/fa";
import NotificationDropdown from "@/Components/Notifications/NotificationDropdown";

// Theme toggle component for light/dark mode
function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  return (
    <button
      onClick={() => setIsDarkMode(!isDarkMode)}
      type="button"
      className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none transition duration-150 ease-in-out"
      aria-label="Toggle dark mode"
    >
      <div className="relative">
        {isDarkMode ? (
          <FaSun className="text-gray-400 dark:text-gray-400 text-lg" />
        ) : (
          <FaMoon className="text-gray-400 dark:text-gray-400 text-lg" />
        )}
      </div>
    </button>
  );
}

export default function AuthenticatedLayout({ user, header, children }) {
  const [showingNavigationDropdown, setShowingNavigationDropdown] =
    useState(false);

  // Helper function to check if user has permission
  const hasPermission = (permission) => {
    // Check direct permissions
    const hasDirectPermission =
      user?.permissions?.includes(permission) ?? false;

    // Check role-based permissions
    const hasRolePermission =
      user?.roles?.some((role) =>
        role.permissions?.some((p) => p.name === permission)
      ) ?? false;

    return hasRolePermission; //hasDirectPermission || hasRolePermission;
  };

  const taskTabs = [];

  if (hasPermission("task-list")) {
    const isAdminOrLeader = user.roles?.some((role) =>
      ["Admin", "Team Leader"].includes(role.name)
    );

    if (isAdminOrLeader) {
      taskTabs.push({ label: "All Tasks", filter: "all" });
    }

    taskTabs.push(
      { label: "My Tasks", filter: "assigned" },
      { label: "Created Tasks", filter: "created" }
    );
  }

  // Show Activities if user has explicit activity permission or generic task permission
  const canSeeActivities =
    hasPermission("activity-list") || hasPermission("task-list");
  // Show Activity Monitor for users who can see all activities
  const canSeeActivityMonitor = hasPermission("activity-list-all");

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-16">
      <LoadingIndicator />
      <nav className="border-b border-gray-100 bg-white dark:bg-gray-800 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="shrink-0 flex items-center">
                <Link href="/">
                  <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800 dark:text-gray-200" />
                </Link>
              </div>

              <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                <NavLink
                  href={route("dashboard")}
                  active={route().current("dashboard")}
                >
                  Dashboard
                </NavLink>
              </div>

              {canSeeActivities && (
                <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                  <NavLink
                    href={route("activities.index")}
                    active={route().current("activities.*")}
                  >
                    Activities
                  </NavLink>
                </div>
              )}

              {canSeeActivityMonitor && (
                <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                  <NavLink
                    href={route("activity-monitor.index")}
                    active={route().current("activity-monitor.*")}
                  >
                    Activity Monitor
                  </NavLink>
                </div>
              )}

              {/* Task-related links stay as top-level items */}
              {taskTabs.map(({ label, filter }) => (
                <div
                  key={filter}
                  className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex"
                >
                  <NavLink
                    href={route("tasks.index", { filter })}
                    active={
                      route().current("tasks.index") &&
                      route().params.filter === filter
                    }
                  >
                    {label}
                  </NavLink>
                </div>
              ))}

              {hasPermission("task-create") && (
                <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                  <NavLink
                    href={route("tasks.create")}
                    active={route().current("tasks.create")}
                  >
                    Add Task
                  </NavLink>
                </div>
              )}

              {/* Reports dropdown */}
              {hasPermission("task-list") && (
                <div className="hidden sm:flex sm:items-center sm:ms-10">
                  <Dropdown>
                    <Dropdown.Trigger>
                      <span className="inline-flex items-center rounded-md">
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none transition ease-in-out duration-150"
                        >
                          Reports
                          <FaChevronDown className="ms-2 -me-0.5 h-4 w-4" />
                        </button>
                      </span>
                    </Dropdown.Trigger>
                    <Dropdown.Content>
                      <div className="px-3 py-1 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Tasks
                      </div>
                      <Dropdown.Link href={route("tasks.reports")}>
                        Task Reports
                      </Dropdown.Link>
                      <Dropdown.Link href={route("tasks.export.excel")}>
                        Export Excel
                      </Dropdown.Link>
                      <Dropdown.Link href={route("tasks.export.pdf")}>
                        Export PDF
                      </Dropdown.Link>
                      {canSeeActivities && (
                        <>
                          <div className="mt-2 px-3 py-1 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Activities
                          </div>
                          {hasPermission("activity-list-all") && (
                            <Dropdown.Link
                              href={route("activities.reports", {
                                filter: "all",
                              })}
                            >
                              All Activities
                            </Dropdown.Link>
                          )}
                          <Dropdown.Link
                            href={route("activities.reports", { filter: "my" })}
                          >
                            My Activities
                          </Dropdown.Link>
                          <Dropdown.Link
                            href={route("activities.export.excel")}
                          >
                            Export Excel
                          </Dropdown.Link>
                        </>
                      )}
                    </Dropdown.Content>
                  </Dropdown>
                </div>
              )}

              {/* Management dropdown groups admin/management items */}
              <div className="hidden sm:flex sm:items-center sm:ms-10">
                <Dropdown>
                  <Dropdown.Trigger>
                    <span className="inline-flex items-center rounded-md">
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none transition ease-in-out duration-150"
                      >
                        Management
                        <FaChevronDown className="ms-2 -me-0.5 h-4 w-4" />
                      </button>
                    </span>
                  </Dropdown.Trigger>
                  <Dropdown.Content>
                    <div className="px-3 py-1 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      User Management
                    </div>
                    {hasPermission("role-list") && (
                      <Dropdown.Link href={route("roles.index")}>
                        Site Roles & Permissions
                      </Dropdown.Link>
                    )}
                    {hasPermission("role-list") && (
                      <Dropdown.Link href={route("work-roles.index")}>
                        Work Roles & Assignments
                      </Dropdown.Link>
                    )}
                    {hasPermission("user-list") && (
                      <Dropdown.Link href={route("users.index")}>
                        Users
                      </Dropdown.Link>
                    )}

                    <div className="mt-2 px-3 py-1 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Categories
                    </div>
                    {hasPermission("category-list") && (
                      <Dropdown.Link href={route("categories.index")}>
                        Categories
                      </Dropdown.Link>
                    )}
                    {hasPermission("category-list") && (
                      <Dropdown.Link href={route("activity-categories.index")}>
                        Activity Categories
                      </Dropdown.Link>
                    )}

                    <div className="mt-2 px-3 py-1 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Import Management
                    </div>
                    {/* {hasPermission("work-role-import") && (

                    )} */}

                    <Dropdown.Link href={route("activity-categories.import")}>
                      Import Activity Categories
                    </Dropdown.Link>

                    <Dropdown.Link href={route("work-roles.import")}>
                      Import Work Roles
                    </Dropdown.Link>

                    {/* {hasPermission("activity-category-import") && (

                    )} */}
                  </Dropdown.Content>
                </Dropdown>
              </div>

              {/* {hasPermission("task-view-own") && (
                <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                  <NavLink
                    href={route("task.mytasks")}
                    active={route().current("task.mytasks")}f
                  >
                    My Tasksf
                  </NavLink>
                </div>
              )} */}
            </div>

            <div className="hidden sm:flex sm:items-center sm:ms-6">
              {/* Notifications Dropdown */}
              <NotificationDropdown />

              {/* Theme Toggle Button */}
              <div className="mx-4">
                <ThemeToggle />
              </div>

              <div className="ms-1 relative">
                <Dropdown>
                  <Dropdown.Trigger>
                    <span className="inline-flex items-center rounded-md">
                      {/* User Avatar */}
                      <div className="mr-3 flex-shrink-0">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name}
                            className="h-8 w-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none transition ease-in-out duration-150"
                      >
                        {user.name}

                        <FaChevronDown className="ms-2 -me-0.5 h-4 w-4" />
                      </button>
                    </span>
                  </Dropdown.Trigger>

                  <Dropdown.Content>
                    <Dropdown.Link href={route("profile.edit")}>
                      Profile
                    </Dropdown.Link>
                    <Dropdown.Link
                      href={route("logout")}
                      method="post"
                      as="button"
                    >
                      Log Out
                    </Dropdown.Link>
                  </Dropdown.Content>
                </Dropdown>
              </div>
            </div>

            <div className="-me-2 flex items-center sm:hidden">
              <button
                onClick={() =>
                  setShowingNavigationDropdown(
                    (previousState) => !previousState
                  )
                }
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-900 focus:text-gray-500 dark:focus:text-gray-400 transition duration-150 ease-in-out"
              >
                {!showingNavigationDropdown ? (
                  <FaBars className="h-6 w-6" />
                ) : (
                  <FaTimes className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div
          className={
            (showingNavigationDropdown ? "block" : "hidden") + " sm:hidden"
          }
        >
          <div className="pt-2 pb-3 space-y-1">
            <ResponsiveNavLink
              href={route("dashboard")}
              active={route().current("dashboard")}
            >
              Dashboard
            </ResponsiveNavLink>

            {hasPermission("role-list") && (
              <>
                <ResponsiveNavLink
                  href={route("roles.index")}
                  active={route().current("roles.*")}
                >
                  Site Roles & Permissions
                </ResponsiveNavLink>
                <ResponsiveNavLink
                  href={route("work-roles.index")}
                  active={route().current("work-roles.*")}
                >
                  Work Roles & Assignments
                </ResponsiveNavLink>
              </>
            )}

            {hasPermission("user-list") && (
              <ResponsiveNavLink
                href={route("users.index")}
                active={route().current("users.*")}
              >
                Users
              </ResponsiveNavLink>
            )}

            {hasPermission("category-list") && (
              <>
                <ResponsiveNavLink
                  href={route("categories.index")}
                  active={route().current("categories.*")}
                >
                  Task Categories
                </ResponsiveNavLink>
                <ResponsiveNavLink
                  href={route("activity-categories.index")}
                  active={route().current("activity-categories.*")}
                >
                  Activity Categories
                </ResponsiveNavLink>
              </>
            )}

            {canSeeActivities && (
              <ResponsiveNavLink
                href={route("activities.index")}
                active={route().current("activities.*")}
              >
                Activities
              </ResponsiveNavLink>
            )}

            {canSeeActivityMonitor && (
              <ResponsiveNavLink
                href={route("activity-monitor.index")}
                active={route().current("activity-monitor.*")}
              >
                Activity Monitor
              </ResponsiveNavLink>
            )}
          </div>

          <div className="pt-4 pb-1 border-t border-gray-200 dark:border-gray-600">
            <div className="px-4 flex items-center">
              {/* User Avatar for mobile */}
              <div className="mr-3 flex-shrink-0">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <div className="font-medium text-base text-gray-800 dark:text-gray-200">
                  {user.name}
                </div>
                <div className="font-medium text-sm text-gray-500">
                  {user.email}
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-1 px-4">
              {/* Notifications Link for Mobile */}
              <ResponsiveNavLink href={route("notifications.show-all")}>
                Notifications
              </ResponsiveNavLink>

              {/* Theme toggle for mobile */}
              <div className="py-2 flex items-center">
                <span className="text-gray-600 dark:text-gray-300 text-sm mr-2">
                  Theme:
                </span>
                <button
                  onClick={() => {
                    const isDarkMode =
                      !document.documentElement.classList.contains("dark");
                    if (isDarkMode) {
                      document.documentElement.classList.add("dark");
                      localStorage.setItem("theme", "dark");
                    } else {
                      document.documentElement.classList.remove("dark");
                      localStorage.setItem("theme", "light");
                    }
                  }}
                  className="flex items-center px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700"
                >
                  <span className="mr-2 text-sm">
                    {document.documentElement.classList.contains("dark")
                      ? "Light"
                      : "Dark"}
                  </span>
                  {document.documentElement.classList.contains("dark") ? (
                    <FaSun className="w-4 h-4" />
                  ) : (
                    <FaMoon className="w-4 h-4" />
                  )}
                </button>
              </div>

              <ResponsiveNavLink href={route("profile.edit")}>
                Profile
              </ResponsiveNavLink>
              <ResponsiveNavLink
                method="post"
                href={route("logout")}
                as="button"
              >
                Log Out
              </ResponsiveNavLink>
            </div>
          </div>
        </div>
      </nav>

      {header && (
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {header}
          </div>
        </header>
      )}

      <main className="max-w-full">{children}</main>
    </div>
  );
}
