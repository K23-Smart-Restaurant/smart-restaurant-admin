/**
 * Standard Notification Messages
 * 
 * This file contains standardized user-facing messages for CRUD operations
 * across the application. Use these constants to ensure consistency.
 */

// Success Messages
export const MESSAGES = {
  // Category
  CATEGORY_CREATED: (name: string) => ({
    title: 'Category Created',
    message: `"${name}" has been successfully added.`
  }),
  CATEGORY_UPDATED: (name: string) => ({
    title: 'Category Updated',
    message: `"${name}" has been successfully updated.`
  }),
  CATEGORY_DELETED: (name: string) => ({
    title: 'Category Deleted',
    message: `"${name}" has been permanently removed.`
  }),

  // Menu Item
  MENU_ITEM_CREATED: (name: string) => ({
    title: 'Menu Item Created',
    message: `"${name}" has been successfully added to the menu.`
  }),
  MENU_ITEM_UPDATED: (name: string) => ({
    title: 'Menu Item Updated',
    message: `"${name}" has been successfully updated.`
  }),
  MENU_ITEM_DELETED: (name: string) => ({
    title: 'Menu Item Deleted',
    message: `"${name}" has been permanently removed from the menu.`
  }),

  // Table
  TABLE_CREATED: (tableNumber: number) => ({
    title: 'Table Created',
    message: `Table ${tableNumber} has been successfully created.`
  }),
  TABLE_UPDATED: (tableNumber: number) => ({
    title: 'Table Updated',
    message: `Table ${tableNumber} has been successfully updated.`
  }),
  TABLE_DELETED: (tableNumber: number) => ({
    title: 'Table Deleted',
    message: `Table ${tableNumber} has been permanently removed.`
  }),
  QR_CODE_REGENERATED: (tableNumber: number) => ({
    title: 'QR Code Regenerated',
    message: `QR code for Table ${tableNumber} has been updated.`
  }),

  // Staff
  STAFF_CREATED: (username: string, role: string) => ({
    title: `${role} Created`,
    message: `${username} has been successfully added to the team.`
  }),
  STAFF_UPDATED: (username: string, role: string) => ({
    title: `${role} Updated`,
    message: `${username} has been successfully updated.`
  }),
  STAFF_ACTIVATED: (username: string) => ({
    title: 'Staff Activated',
    message: `${username} has been successfully activated.`
  }),
  STAFF_DEACTIVATED: (username: string) => ({
    title: 'Staff Deactivated',
    message: `${username} has been successfully deactivated.`
  }),

  // Generic
  OPERATION_SUCCESS: (action: string) => ({
    title: 'Success',
    message: `${action} completed successfully.`
  }),
  OPERATION_FAILED: (action: string) => ({
    title: 'Operation Failed',
    message: `Failed to ${action}. Please try again.`
  }),
  
  // Exports
  EXPORT_INITIATED: {
    title: 'Export Initiated',
    message: 'PDF report generation has started. You will be notified when it\'s ready for download.'
  }
};

// Confirmation Messages
export const CONFIRMATIONS = {
  DELETE_CATEGORY: (name: string) => ({
    title: 'Delete Category',
    message: `Are you sure you want to delete "${name}"? This will permanently remove it from the system.`
  }),
  DELETE_MENU_ITEM: (name: string) => ({
    title: 'Delete Menu Item',
    message: `Are you sure you want to delete "${name}"? This will permanently remove it from the menu, including all associated photos and modifiers.`
  }),
  DELETE_TABLE: (tableNumber: number) => ({
    title: 'Delete Table',
    message: `Are you sure you want to delete Table ${tableNumber}? This will permanently remove it from the system, including any associated QR codes.`
  }),
  DEACTIVATE_STAFF: (username: string) => ({
    title: 'Deactivate Staff Member',
    message: `Are you sure you want to deactivate ${username}? They will no longer be able to access the system.`
  }),
  ACTIVATE_STAFF: (username: string) => ({
    title: 'Activate Staff Member',
    message: `Are you sure you want to activate ${username}? They will be able to access the system again.`
  }),
  REGENERATE_QR: (tableNumber: number) => ({
    title: 'Regenerate QR Code',
    message: `Are you sure you want to regenerate the QR code for Table ${tableNumber}? The old QR code will be invalidated.`
  })
};

// Error message formatter
export const formatErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
};
