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
      const [datePart, timePart] = dateString.split(" ");
      const [day, month, year] = datePart.split("-");
      const [hour, minute] = timePart.split(":");
      const date = new Date(year, month - 1, day, hour, minute);

      if (isNaN(date.getTime())) {
        return dateString; // Return original if parsing failed
      }

      return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      // Regular date parsing for ISO format or other formats
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date format received: ${dateString}`);
        return dateString; // Return the original string if we can't parse it
      }

      return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
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
    const isBackendFormat = /^\d{2}-\d{2}-\d{4}( \d{2}:\d{2})?$/.test(
      dateString
    );
    let date;

    if (isBackendFormat) {
      // Parse the backend format (dd-mm-yyyy H:i or dd-mm-yyyy)
      const parts = dateString.split(" ");
      const datePart = parts[0];
      const [day, month, year] = datePart.split("-");

      if (parts.length > 1) {
        // Has time component
        const timePart = parts[1];
        const [hour, minute] = timePart.split(":");
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

/*
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
      date = new Date(year, month - 1, day, hour, minute);
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

*/

export const makeIsoDateFormat = (dateString) => {
  //   return /^\d{2}-\d{2}-\d{4}( \d{2}:\d{2})?$/.test(dateString);
  const isBackendFormat = /^\d{2}-\d{2}-\d{4} \d{2}:\d{2}$/.test(dateString);
  let date;

  if (isBackendFormat) {
    const [datePart] = dateString.split(" ");
    const [day, month, year] = datePart.split("-");
    date = new Date(year, month - 1, day);
  } else {
    const parsed = new Date(dateString);
    if (isNaN(parsed.getTime())) return false;
    // Strip time by constructing date with Y-M-D only
    date = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }
  return date;
};

export const isPastDue = (dateString, completedAt = null) => {
  if (!dateString) return false;

  try {
    // Check for Laravel backend format: dd-mm-yyyy HH:MM
    let dueDate = makeIsoDateFormat(dateString);

    if (completedAt) {
      // If task is completed, we consider it past due
      const completedDate = makeIsoDateFormat(completedAt);
      return dueDate < completedDate;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Set time to midnight for today to compare only dates
    return dueDate < today;
  } catch (error) {
    console.error("Error checking if date is past due:", error);
    return false;
  }
};

export const isPastDueWithTime = (dateString) => {
  if (!dateString) return false;

  try {
    // Check for Laravel backend format: dd-mm-yyyy HH:MM
    const isBackendFormat = /^\d{2}-\d{2}-\d{4} \d{2}:\d{2}$/.test(dateString);
    let date;

    if (isBackendFormat) {
      const [datePart, timePart] = dateString.split(" ");
      const [day, month, year] = datePart.split("-");
      const [hour, minute] = timePart.split(":");
      date = new Date(year, month - 1, day, hour, minute);
    } else {
      // Default ISO string or other formats
      date = new Date(dateString);
    }

    if (isNaN(date.getTime())) {
      return false;
    }

    const now = new Date();

    // Return true only if the date is strictly in the past (including time)
    return date < now;
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
  if (!dateString) return "";

  try {
    // Check if dateString is in the Laravel backend format (dd-mm-yyyy H:i)
    const isBackendFormat = /^\d{2}-\d{2}-\d{4} \d{2}:\d{2}$/.test(dateString);
    let date;

    if (isBackendFormat) {
      // Parse the backend format (dd-mm-yyyy H:i)
      const [datePart, timePart] = dateString.split(" ");
      const [day, month, year] = datePart.split("-");
      const [hour, minute] = timePart.split(":");
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

export const formatDateD = (dateString) => {
  if (!dateString) return null;

  try {
    // Check if dateString is in the Laravel backend format (dd-mm-yyyy)
    const isBackendFormat = /^\d{2}-\d{2}-\d{4}/.test(dateString);

    if (isBackendFormat) {
      // Already in correct format, just return the date part
      return dateString.split(" ")[0];
    }

    // For other formats, convert to DD-MM-YYYY
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return original if parsing failed
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};
