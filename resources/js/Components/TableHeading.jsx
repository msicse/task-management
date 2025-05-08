import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
// import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react"
export default function TableHeading({
  name,
  sortable = true,
  sort_field = null,
  sort_direction = null,
  sortChanged = () => {},
  children,
}) {
  return (
    <th onClick={(e) => sortable && sortChanged(name)}>
      <div className="px-3 py-3 flex items-center justify-between gap-1 cursor-pointer">
        {children}

        {sortable && (
          <div>
            <ChevronUpIcon
              className={
                "w-4 " +
                (sort_field === name && sort_direction === "asc"
                  ? "text-blue-500"
                  : "text-gray-400")
              }
            />

            <ChevronDownIcon
              className={
                "w-4 -mt-2 " +
                (sort_field === name && sort_direction === "desc"
                  ? "text-blue-500"
                  : "text-gray-400")
              }
            />
          </div>
        )}
      </div>
    </th>
  );
}
