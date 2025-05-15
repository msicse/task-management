/**
 * Utility functions for date formatting
 */

/**
 * Format a date string to a human-readable date and time format
 * @param {string} dateString - The date string to format
 * @returns {string|null} Formatted date string or null if input is invalid
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return null;

  try {
    // Check if dateString is already in the Laravel backend format (dd-mm-yyyy H:i)
    const isBackendFormat = /^\d{2}-\d{2}-\d{4} \d{2}:\d{2}$/.test(dateString);

    if (isBackendFormat) {
      // Parse the backend format (dd-mm-yyyy H:i)
      const [datePart, timePart] = dateString.split(' ');
      const [day, month, year] = datePart.split('-');
      const [hour, minute] = timePart.split(':');
      const date = new Date(year, month - 1, day, hour, minute);

      if (isNaN(date.getTime())) {
        return dateString; // Return original if parsing failed
      }

      return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    } else {
      // Regular date parsing for ISO format or other formats
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date format received: ${dateString}`);
        return dateString; // Return the original string if we can't parse it
      }

      return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    }
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString; // Return the original string if any error occurs
  }
};

/**
 * Format a date string to show just the date (no time)
 * @param {string} dateString - The date string to format
 * @returns {string|null} Formatted date string or null if input is invalid
 */
export const formatDate = (dateString) => {
  if (!dateString) return null;

  try {
    // Check if dateString is in the Laravel backend format (dd-mm-yyyy H:i)
    const isBackendFormat = /^\d{2}-\d{2}-\d{4}( \d{2}:\d{2})?$/.test(dateString);
    let date;

    if (isBackendFormat) {
      // Parse the backend format (dd-mm-yyyy H:i or dd-mm-yyyy)
      const parts = dateString.split(' ');
      const datePart = parts[0];
      const [day, month, year] = datePart.split('-');

      if (parts.length > 1) {
        // Has time component
        const timePart = parts[1];
        const [hour, minute] = timePart.split(':');
        date = new Date(year, month - 1, day, hour, minute);
      } else {
        // Date only
        date = new Date(year, month - 1, day);
      }
    } else {
      // Regular date parsing for ISO format or other formats
      date = new Date(dateString);
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date format received: ${dateString}`);
      return dateString; // Return the original string if we can't parse it
    }

    return date.toLocaleDateString();
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString; // Return the original string if any error occurs
  }
};

/**
 * Determine if a date is in the past or is today
 * @param {string} dateString - The date string to check
 * @param {boolean} includeToday - Whether to consider today as past due (default: true)
 * @returns {boolean} True if date is in the past or is today (if includeToday is true)
 */
export const isPastDue = (dateString, includeToday = true) => {
  if (!dateString) return false;

  try {
    // Check if dateString is in the Laravel backend format (dd-mm-yyyy H:i)
    const isBackendFormat = /^\d{2}-\d{2}-\d{4} \d{2}:\d{2}$/.test(dateString);
    let date;

    if (isBackendFormat) {
      // Parse the backend format (dd-mm-yyyy H:i)
      const [datePart, timePart] = dateString.split(' ');
      const [day, month, year] = datePart.split('-');
      const [hour, minute] = timePart.split(':');
      date = new Date(year, month - 1, day + 1, hour, minute);
    } else {
      // Regular date parsing for ISO format or other formats
      date = new Date(dateString);
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return false;
    }

    const now = new Date();

    if (includeToday) {
      // Check if the date is today or in the past
      const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

      return date < now || isToday;
    } else {
      // Just check if date is in the past
      return date < now;
    }
  } catch (error) {
    console.error("Error checking if date is past due:", error);
    return false;
  }
};

/**
 * Format a date to a human-readable time difference (e.g., "2 hours ago", "in 3 days")
 * @param {string} dateString - The date string to format
 * @returns {string} Human-readable time difference
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';

  try {
    // Check if dateString is in the Laravel backend format (dd-mm-yyyy H:i)
    const isBackendFormat = /^\d{2}-\d{2}-\d{4} \d{2}:\d{2}$/.test(dateString);
    let date;

    if (isBackendFormat) {
      // Parse the backend format (dd-mm-yyyy H:i)
      const [datePart, timePart] = dateString.split(' ');
      const [day, month, year] = datePart.split('-');
      const [hour, minute] = timePart.split(':');
      date = new Date(year, month - 1, day, hour, minute);
    } else {
      // Regular date parsing for ISO format or other formats
      date = new Date(dateString);
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString;
    }

    const now = new Date();
    const diffMs = date - now;
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    if (diffSec < 0) {
      // Past
      if (diffSec > -60) return `${Math.abs(diffSec)} seconds ago`;
      if (diffMin > -60) return `${Math.abs(diffMin)} minutes ago`;
      if (diffHour > -24) return `${Math.abs(diffHour)} hours ago`;
      if (diffDay > -7) return `${Math.abs(diffDay)} days ago`;
      return formatDateTime(dateString);
    } else {
      // Future
      if (diffSec < 60) return `in ${diffSec} seconds`;
      if (diffMin < 60) return `in ${diffMin} minutes`;
      if (diffHour < 24) return `in ${diffHour} hours`;
      if (diffDay < 7) return `in ${diffDay} days`;
      return formatDateTime(dateString);
    }
  } catch (error) {
    console.error("Error formatting relative time:", error);
    return dateString;
  }
};
