import { Link } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";

export default function Pagination({ links, meta = null, routeName = null, queryParams = {} }) {

  // Default to 10 if perPage is not provided in meta
  const currentPerPage = meta?.per_page || 10;
  const [perPage, setPerPage] = useState(currentPerPage);

  // Available per page options
  const perPageOptions = [10, 25, 50, 100, 'All'];

  // Handle per page change
  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage);

    // If route name is provided, use it to navigate with the new per_page parameter
    if (routeName) {
      const params = { ...queryParams, per_page: newPerPage };

      // If 'All' is selected, pass a large number to show all records
      if (newPerPage === 'All') {
        params.per_page = 10000;
      }

      router.get(route(routeName), params, {
        preserveState: true,
        preserveScroll: true,
      });
    }
  };

  // Ensure perPage state is updated if meta.per_page changes
  useEffect(() => {
    if (meta?.per_page) {
      // Check if current per_page is one of our standard options or should be displayed as 'All'
      const standardOptions = [10, 25, 50, 100];
      const currentOption = standardOptions.includes(meta.per_page)
        ? meta.per_page
        : meta.per_page >= 1000 ? 'All' : meta.per_page;

      setPerPage(currentOption);
    }
  }, [meta?.per_page]);

  // Find prev and next URLs from links
  const prevUrl = links?.find?.(link => link.label === "&laquo; Previous")?.url;
  const nextUrl = links?.find?.(link => link.label === "Next &raquo;")?.url;

  // Only show page links (exclude prev/next)
  const pageLinks = links?.filter?.(link =>
    link.label !== "&laquo; Previous" &&
    link.label !== "Next &raquo;"
  );

  // Get first and last page URLs
  const firstPageUrl = pageLinks?.[0]?.url;
  const lastPageUrl = pageLinks?.[pageLinks?.length - 1]?.url;

  if (!links || !Array.isArray(links) || links.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col lg:flex-row justify-between items-center mt-6 text-sm bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm">
      {/* Results info with pagination controls */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-4 lg:mb-0">
        {/* Display meta data if available */}
        {meta && (
          <div className="text-gray-600 dark:text-gray-400 font-medium flex flex-wrap items-center">
            <span>
              Showing <span className="font-semibold text-gray-800 dark:text-gray-200">{meta.from || 0}</span> to{" "}
              <span className="font-semibold text-gray-800 dark:text-gray-200">{meta.to || 0}</span> of{" "}
              <span className="font-semibold text-gray-800 dark:text-gray-200">{meta.total || 0}</span> results
            </span>
          </div>
        )}

        {/* Per page selector */}
        {routeName && (
          <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-md px-3 py-1.5 border border-gray-300 dark:border-gray-600 ml-4">
            <label htmlFor="perPage" className="mr-2 text-gray-600 dark:text-gray-400 whitespace-nowrap text-xs">
              Per page:
            </label>
            <select
              id="perPage"
              value={perPage}
              onChange={(e) => handlePerPageChange(e.target.value === 'All' ? 'All' : Number(e.target.value))}
              className="border-0 bg-transparent text-gray-700 dark:text-gray-300 focus:ring-0 focus:outline-none text-xs font-medium"
            >
              {perPageOptions.map((option) => (
                <option key={option} value={option} className="text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800">
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center">
        <nav className="flex items-center" aria-label="Pagination">
          {/* First page button */}
          <Link
            preserveScroll
            href={firstPageUrl || "#"}
            className={`relative inline-flex items-center justify-center h-8 w-8 rounded-l-md border-y border-l ${
              meta?.current_page === 1
                ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-50 border-gray-300 dark:border-gray-600'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            disabled={meta?.current_page === 1}
            title="First page"
          >
            <FaAngleDoubleLeft className="h-3.5 w-3.5" />
          </Link>

          {/* Previous page button */}
          <Link
            preserveScroll
            href={prevUrl || "#"}
            className={`relative inline-flex items-center justify-center h-8 w-8 border-y ${
              !prevUrl
                ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-50 border-gray-300 dark:border-gray-600'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            disabled={!prevUrl}
            title="Previous page"
          >
            <FaChevronLeft className="h-3.5 w-3.5" />
          </Link>

          {/* Page number links */}
          <div className="hidden md:flex">
            {pageLinks?.map?.((link, index) => (
              <Link
                preserveScroll
                href={link.url || "#"}
                key={index}
                className={`relative inline-flex items-center justify-center h-8 w-8 border-y ${
                  link.active
                    ? 'z-10 bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 dark:border-indigo-600 text-indigo-600 dark:text-indigo-300 font-medium'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                dangerouslySetInnerHTML={{ __html: link.label }}
                title={`Page ${link.label}`}
              ></Link>
            ))}
          </div>

          {/* Mobile current page indicator */}
          <span className="md:hidden relative inline-flex items-center justify-center h-8 px-3 border-y bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs">
            Page {meta?.current_page} of {meta?.last_page}
          </span>

          {/* Next page button */}
          <Link
            preserveScroll
            href={nextUrl || "#"}
            className={`relative inline-flex items-center justify-center h-8 w-8 border-y ${
              !nextUrl
                ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-50 border-gray-300 dark:border-gray-600'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            disabled={!nextUrl}
            title="Next page"
          >
            <FaChevronRight className="h-3.5 w-3.5" />
          </Link>

          {/* Last page button */}
          <Link
            preserveScroll
            href={lastPageUrl || "#"}
            className={`relative inline-flex items-center justify-center h-8 w-8 rounded-r-md border-y border-r ${
              meta?.current_page === meta?.last_page
                ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-50 border-gray-300 dark:border-gray-600'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            disabled={meta?.current_page === meta?.last_page}
            title="Last page"
          >
            <FaAngleDoubleRight className="h-3.5 w-3.5" />
          </Link>
        </nav>
      </div>
    </div>
  );
}

