import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/16/solid";
// import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react"
export default function TableHeading({
  name,
  shortable = true,
  short_field = null,
  short_direction = null,
  shortChanged = () => {},
  children,
}) {
  return (
    <th onClick={(e) => shortChanged(name)}>
      <div className="px-3 py-3 flex items-center justify-between gap-1 cursor-pointer">
        {children}

        {shortable && (
          <div>
            <ChevronUpIcon
              className={
                "w-4" +
                (short_field === name && short_direction === "asc"
                  ? " text-white"
                  : "")
              }
            />

            <ChevronDownIcon
              className={
                "w-4 -mt-2 " +
                (short_field === name && short_direction === "desc"
                  ? "text-white"
                  : "")
              }
            />
          </div>
        )}
      </div>
    </th>
  );
}
