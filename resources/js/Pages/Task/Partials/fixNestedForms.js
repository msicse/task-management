// This file contains a helper function to sanitize HTML from Excel paste operations
// to prevent the "validateDOMNesting(...): `<form>` cannot appear as a descendant of `<form>`" warning

/**
 * Sanitizes HTML content to ensure it doesn't contain form elements
 * that would cause nested form validation errors in React
 *
 * @param {string} html - HTML string to sanitize
 * @returns {string} - Sanitized HTML string
 */
export function sanitizeHtmlForForms(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }

  return html
    // Remove form elements
    .replace(/<form[^>]*>|<\/form>/gi, '')
    // Remove input elements
    .replace(/<input[^>]*>/gi, '')
    // Remove textarea elements
    .replace(/<textarea[^>]*>[\s\S]*?<\/textarea>/gi, '')
    // Remove button elements that could be submit buttons
    .replace(/<button[^>]*>[\s\S]*?<\/button>/gi, '')
    // Remove select elements
    .replace(/<select[^>]*>[\s\S]*?<\/select>/gi, '')
    // Remove fieldset elements
    .replace(/<fieldset[^>]*>|<\/fieldset>/gi, '')
    // Remove label elements
    .replace(/<label[^>]*>[\s\S]*?<\/label>/gi, '')
    // Remove any other form-related elements
    .replace(/<option[^>]*>[\s\S]*?<\/option>/gi, '')
    .replace(/<optgroup[^>]*>[\s\S]*?<\/optgroup>/gi, '');
}

/**
 * Process Excel HTML for better compatibility with Quill editor
 * Ensures no nested forms are created when pasting from Excel
 *
 * @param {string} html - HTML string from Excel
 * @returns {string} - Processed HTML safe for React forms
 */
export function processExcelHtml(html) {
  try {
    if (!html || typeof html !== 'string') {
      console.warn('Invalid HTML passed to processExcelHtml');
      return '';
    }

    // First, strip all form elements
    const safeHtml = sanitizeHtmlForForms(html);

    // Then extract the table parts only to avoid excess HTML
    let tableContent = safeHtml;
    const tableMatch = safeHtml.match(/<table[\s\S]*?<\/table>/gi);
    if (tableMatch && tableMatch.length) {
      tableContent = tableMatch.join('\n');
    }

    // Clean up Excel's HTML for better compatibility with Quill
    let processedHtml = tableContent
      // Remove Excel metadata tags
      .replace(/<html[^>]*>|<\/html>|<body[^>]*>|<\/body>|<head>[\s\S]*?<\/head>/gi, '')
      // Add a data attribute to mark Excel content
      .replace(/<table/gi, '<table class="excel-table" data-excel-paste="true"')
      // Fix specific Excel formatting issues
      .replace(/<!--\[if !supportLists\]-->[\s\S]*?<!--\[endif\]-->/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '') // Remove all HTML comments
      // Remove XML namespaces but preserve class data
      .replace(/xmlns:o="[^"]*"/gi, '')
      .replace(/xmlns:x="[^"]*"/gi, '')
      .replace(/xmlns:v="[^"]*"/gi, '')

      // PRESERVE MERGED CELLS - Important for Excel tables
      .replace(/colspan="([^"]*)"/gi, 'data-colspan="$1" colspan="$1"')
      .replace(/rowspan="([^"]*)"/gi, 'data-rowspan="$1" rowspan="$1"')

      // Convert Excel styling to proper HTML styling
      .replace(/<span[^>]*style="([^"]*)font-weight:\s*bold[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, '<strong>$2</strong>')
      .replace(/<span[^>]*style="([^"]*)font-style:\s*italic[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, '<em>$2</em>')
      .replace(/<span[^>]*style="([^"]*)text-decoration:\s*underline[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, '<u>$2</u>');

    return processedHtml;
  } catch (error) {
    console.error('Error processing Excel HTML:', error);
    // Return sanitized original HTML as fallback
    return sanitizeHtmlForForms(html);
  }
}
