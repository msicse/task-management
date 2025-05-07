import React from "react";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
import SearchableSelect from "@/Components/SearchableSelect";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import DateRangePickerComponent from "../DateRangePickerComponent";

const TaskFilters = ({
  data,
  onChange,
  onReset,
  users,
  categories,
  statusOptions,
  priorityOptions,
  showDateRange = true,
}) => {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <InputLabel htmlFor="name" value="Task Name" />
          <TextInput
            id="name"
            type="text"
            name="name"
            value={data.name}
            className="mt-1 block w-full"
            onChange={(e) => onChange("name", e.target.value)}
          />
        </div>

        <div>
          <InputLabel htmlFor="status" value="Status" />
          <SelectInput
            id="status"
            name="status"
            value={data.status}
            className="mt-1 block w-full"
            onChange={(e) => onChange("status", e.target.value)}
            options={statusOptions}
          />
        </div>

        <div>
          <InputLabel htmlFor="priority" value="Priority" />
          <SelectInput
            id="priority"
            name="priority"
            value={data.priority}
            className="mt-1 block w-full"
            onChange={(e) => onChange("priority", e.target.value)}
            options={priorityOptions}
          />
        </div>

        <div>
          <InputLabel htmlFor="category" value="Category" />
          <SearchableSelect
            id="category"
            name="category"
            value={data.category}
            onChange={(e) => onChange("category", e.target.value)}
            placeholder="Select category..."
            isClearable
            options={[
              { label: "All Categories", value: "" },
              ...(categories?.map((category) => ({
                label: category.name,
                value: category.id,
              })) || []),
            ]}
          />
        </div>

        <div>
          <InputLabel htmlFor="assigned_to" value="Assigned To" />
          <SearchableSelect
            id="assigned_to"
            name="assigned_to"
            value={data.assigned_to}
            onChange={(e) => onChange("assigned_to", e.target.value)}
            placeholder="Select assignee..."
            isClearable
            options={[
              { label: "All Users", value: "" },
              ...(users?.map((user) => ({
                label: user.name,
                value: user.id,
              })) || []),
            ]}
          />
        </div>

        {showDateRange && (
          <div>
            <InputLabel htmlFor="date_range" value="Date Range" />
            <DateRangePickerComponent
              value={data.date_range}
              onChange={(value) => onChange("date_range", value)}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <SecondaryButton onClick={onReset} type="button">
          Reset
        </SecondaryButton>
      </div>
    </div>
  );
};

export default TaskFilters;
