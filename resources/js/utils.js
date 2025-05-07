/**
 * Convert a date string from DD-MM-YYYY format to YYYY-MM-DD format (for form submission)
 * @param {string} dateStr - Date string in DD-MM-YYYY format
 * @returns {string} Date string in YYYY-MM-DD format, or original string if not in expected format
 */
export const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';

  // If the date is already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // Check if date is in DD-MM-YYYY format
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
    // Split by dash and reverse the array to get YYYY-MM-DD
    return dateStr.split('-').reverse().join('-');
  }

  // Return original string if not in expected format
  return dateStr;
};

/**
 * Format a date as DD-MM-YYYY for display
 * @param {string} dateStr - Date string in any format
 * @returns {string} Date string in DD-MM-YYYY format or empty string if invalid
 */
export const formatDateForDisplay = (dateStr) => {
  if (!dateStr) return '';

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  } catch (e) {
    return '';
  }
};
