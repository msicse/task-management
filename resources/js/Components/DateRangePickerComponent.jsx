import React, { useState, useEffect } from 'react';
import TextInput from '@/Components/TextInput';

const DateRangePickerComponent = ({ value = '', onChange }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Parse the combined value when it changes externally
  useEffect(() => {
    if (value && value.includes('|')) {
      const [start, end] = value.split('|');
      setStartDate(start);
      setEndDate(end);
    } else {
      setStartDate('');
      setEndDate('');
    }
  }, [value]);

  // Update the combined value when either date changes
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    onChange(newStartDate && endDate ? `${newStartDate}|${endDate}` : '');
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);
    onChange(startDate && newEndDate ? `${startDate}|${newEndDate}` : '');
  };

  return (
    <div className="flex space-x-2">
      <div className="w-1/2">
        <TextInput
          type="date"
          value={startDate}
          onChange={handleStartDateChange}
          className="mt-1 block w-full"
          placeholder="Start Date"
        />
      </div>
      <div className="w-1/2">
        <TextInput
          type="date"
          value={endDate}
          onChange={handleEndDateChange}
          className="mt-1 block w-full"
          placeholder="End Date"
        />
      </div>
    </div>
  );
};

export default DateRangePickerComponent;
