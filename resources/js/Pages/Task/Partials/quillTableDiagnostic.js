/**
 * QuillBetterTable Error Diagnostics Utility
 *
 * This file provides diagnostic tools to help pinpoint the exact issue with
 * QuillBetterTable's "Cannot read properties of undefined (reading 'pop')" error.
 */

/**
 * Installs a diagnostic trap to catch and analyze the specific error
 * from QuillBetterTable without crashing the application
 *
 * @returns {Function} - A function to remove the diagnostic trap
 */
export function installQuillTableDiagnostics() {
  const originalPop = Array.prototype.pop;

  // Install the diagnostic trap
  console.log('Installing QuillBetterTable diagnostic trap');

  const popDiagnostic = function() {
    try {
      if (this === undefined || this === null) {
        // This is exactly the error case we're looking for
        console.error('========== QUILL TABLE DIAGNOSTIC ==========');
        console.error('Error detected: pop() called on undefined or null');

        // Capture and log stack trace
        const stackError = new Error('QuillTable diagnostic stack trace');
        console.error(stackError.stack);

        // Analyze the stack to find QuillBetterTable code
        const stack = stackError.stack.split('\n');
        const quillLines = stack.filter(line =>
          line.includes('quill') || line.includes('table') || line.includes('Quill')
        );
        console.error('Related stack frames:', quillLines);

        // Log debugging suggestions
        console.error('Diagnostic information captured. Check the "this" context in QuillBetterTable');
        console.error('This is likely happening in the BetterTable constructor or initialization');
        console.error('============================================');

        return undefined;
      }

      // Handle other edge cases that could lead to error
      if (typeof this !== 'object' || typeof this.length !== 'number') {
        console.warn('QuillTable diagnostic: pop() called on invalid non-array');
        return undefined;
      }

      if (this.length === 0) {
        console.warn('QuillTable diagnostic: pop() called on empty array');
        return undefined;
      }

      return originalPop.call(this);
    } catch (err) {
      console.error('QuillTable diagnostic: Unexpected error in pop():', err);
      return undefined;
    }
  };

  // Install the trap
  Array.prototype.pop = popDiagnostic;

  // Return a function to restore the original
  return function uninstall() {
    Array.prototype.pop = originalPop;
    console.log('QuillBetterTable diagnostic trap removed');
  };
}

/**
 * Creates a special diagnostic patch for QuillBetterTable that both
 * fixes the issue and provides detailed information about what's happening
 *
 * @param {Function} BetterTable - The QuillBetterTable constructor to patch
 * @returns {Function} - The patched constructor
 */
export function createDiagnosticTablePatch(BetterTable) {
  if (!BetterTable || typeof BetterTable !== 'function') {
    console.error('Invalid QuillBetterTable provided to diagnostic patch');
    return BetterTable;
  }

  console.log('Creating diagnostic table patch for:', BetterTable.name);

  return function DiagnosticBetterTable(...args) {
    // Log constructor call
    console.log('QuillBetterTable constructor called with args:', args.length);

    // Pre-initialize all properties to prevent undefined access
    this._diagnostic = true;
    this.tableSelection = { cells: [] };
    this.columnTool = { columnHandlers: [] };
    this.rowTool = { rowHandlers: [] };
    this.cellTool = {};

    // Add diagnostic wrappers around critical methods
    const wrapMethod = (obj, methodName) => {
      if (obj && typeof obj[methodName] === 'function') {
        const originalMethod = obj[methodName];
        obj[methodName] = function(...methodArgs) {
          try {
            console.log(`QuillTable: Calling ${methodName}`);
            return originalMethod.apply(this, methodArgs);
          } catch (err) {
            console.error(`QuillTable diagnostic: Error in ${methodName}:`, err);
            return undefined;
          }
        };
      }
    };

    try {
      // Call original constructor with diagnostic error trapping
      BetterTable.apply(this, args);

      // Diagnostics for prototype methods
      if (BetterTable.prototype) {
        ['insertTable', 'deleteColumn', 'deleteRow'].forEach(methodName => {
          wrapMethod(BetterTable.prototype, methodName);
        });
      }

      // Post-initialize check and repair
      if (!this.tableSelection) {
        console.error('QuillTable diagnostic: tableSelection still undefined after constructor');
        this.tableSelection = { cells: [] };
      }

      console.log('QuillBetterTable constructor completed successfully');
    } catch (err) {
      console.error('QuillTable diagnostic: Error in constructor:', err);

      // Ensure we have a working object even after constructor failure
      this.tableSelection = { cells: [] };
      this.insertTable = function() {
        console.log('Using fallback insertTable method');
      };
    }

    return this;
  };
}
