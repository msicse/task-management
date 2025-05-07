import { useState, useEffect } from "react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import NavLink from "@/Components/NavLink";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Link } from "@inertiajs/react";
import LoadingIndicator from "@/Components/LoadingIndicator";
// Import React Icons
import { FaSun, FaMoon, FaChevronDown, FaBars, FaTimes } from "react-icons/fa";

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
      className="px-3 py-2 mr-2 text-sm font-medium rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition ease-in-out duration-150"
      aria-label="Toggle dark mode"
    >
      {isDarkMode ? (
        <FaSun className="w-5 h-5" />
      ) : (
        <FaMoon className="w-5 h-5" />
      )}
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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-16">
      <LoadingIndicator />
      <nav className="border-b border-gray-100 bg-white dark:bg-gray-800 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

              {hasPermission("role-list") && (
                <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                  <NavLink
                    href={route("roles.index")}
                    active={route().current("roles.*")}
                  >
                    Roles
                  </NavLink>
                </div>
              )}

              {hasPermission("user-list") && (
                <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                  <NavLink
                    href={route("users.index")}
                    active={route().current("users.*")}
                  >
                    Users
                  </NavLink>
                </div>
              )}

              {hasPermission("category-list") && (
                <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                  <NavLink
                    href={route("categories.index")}
                    active={route().current("categories.*")}
                  >
                    All Categories
                  </NavLink>
                </div>
              )}
              {hasPermission("task-list") && (
                <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                  <NavLink
                    href={route("tasks.index")}
                    active={route().current("tasks.*")}
                  >
                    {user.roles?.some((role) => role.name === "Admin")
                      ? "All Tasks"
                      : "Created Tasks"}
                  </NavLink>
                </div>
              )}

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

              {hasPermission("task-view-own") && (
                <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                  <NavLink
                    href={route("task.mytasks")}
                    active={route().current("task.mytasks")}
                  >
                    My Tasks
                  </NavLink>
                </div>
              )}
            </div>

            <div className="hidden sm:flex sm:items-center sm:ms-6">
              {/* Theme Toggle Button */}
              <ThemeToggle />

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
              {/* Theme toggle for mobile */}
              <div className="py-2 flex items-center">
                <span className="text-gray-600 dark:text-gray-300 text-sm mr-2">
                  Theme:
                </span>
                <button
                  onClick={() => {
                    const isDarkMode = !document.documentElement.classList.contains(
                      "dark"
                    );
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
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {header}
          </div>
        </header>
      )}

      <main>{children}</main>
    </div>
  );
}
