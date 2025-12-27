# Testing Guide: Dialog & Notification Standardization

## How to Test

### Prerequisites
1. Start the development server: `npm run dev`
2. Log in to the admin panel
3. Navigate to each management page

---

## Test Scenarios

### 1. **Category Management** (`/categories`)

#### Create Category ✅
1. Click "Add Category" button
2. Fill in the form
3. Click "Save"
4. **Expected**: Green success toast appears with message "Category Created - [name] has been successfully added."

#### Update Category ✅
1. Click edit icon on a category
2. Modify the name
3. Click "Save"
4. **Expected**: Green success toast appears with message "Category Updated - [name] has been successfully updated."

#### Delete Category ✅
1. Click delete icon on a category
2. **Expected**: Custom confirmation dialog appears (not browser alert)
   - Title: "Delete Category"
   - Shows category name in red
   - Has warning message
   - Has "Cancel" and "Delete" buttons
3. Click "Delete"
4. **Expected**: 
   - Button shows loading spinner
   - Dialog closes
   - Green success toast: "Category Deleted - [name] has been permanently removed."

#### Error Handling ✅
1. Try to create/update/delete with invalid data (if validation exists)
2. **Expected**: Red error toast with user-friendly message (not browser alert)

---

### 2. **Menu Management** (`/menu`)

#### Create Menu Item ✅
1. Click "Add Menu Item"
2. Fill form, add photo
3. Click "Save"
4. **Expected**: Green success toast "Menu Item Created - [name] has been successfully added to the menu."

#### Update Menu Item ✅
1. Edit an existing item
2. Change details
3. Save
4. **Expected**: Green success toast "Menu Item Updated - [name] has been successfully updated."

#### Delete Menu Item ✅
1. Click delete icon
2. **Expected**: Custom confirmation dialog (not browser confirm)
3. Confirm deletion
4. **Expected**: Green success toast "Menu Item Deleted - [name] has been permanently removed from the menu."

---

### 3. **Table Management** (`/tables`)

#### Create Table ✅
1. Click "Add Table"
2. Fill in table number, capacity, location
3. Save
4. **Expected**: Green success toast "Table Created - Table [number] has been successfully created."

#### Update Table ✅
1. Edit a table
2. Change capacity or location
3. Save
4. **Expected**: Green success toast "Table Updated - Table [number] has been successfully updated."

#### Delete Table ✅
1. Click delete on a table
2. **Expected**: Custom confirmation dialog showing table number
3. Confirm
4. **Expected**: Green success toast "Table Deleted - Table [number] has been permanently removed."

---

### 4. **Staff Management** (`/staff`)

#### Create Waiter ✅
1. Go to Waiters tab
2. Click "Add Waiter"
3. Fill form
4. Save
5. **Expected**: Green success toast "Waiter Created - [username] has been successfully added to the team."

#### Create Kitchen Staff ✅
1. Go to Kitchen Staff tab
2. Click "Add Kitchen Staff"
3. Fill form
4. Save
5. **Expected**: Green success toast "Kitchen Staff Created - [username] has been successfully added to the team."

#### Activate/Deactivate Staff ✅
1. Click the activate/deactivate button (power icon)
2. **Expected**: Custom confirmation dialog (not browser confirm)
   - Shows action: "Activate Staff Member" or "Deactivate Staff Member"
   - Shows username
   - Appropriate message about access
3. Confirm
4. **Expected**: Green success toast "Staff Activated/Deactivated - [username] has been successfully [activated/deactivated]."

---

### 5. **Reports** (`/reports`)

#### Export PDF ✅
1. Click "Download PDF" button
2. **Expected**: Green success toast "Export Initiated - PDF report generation has started. You will be notified when it's ready for download."
3. **Note**: No browser alert popup

---

## Visual Checks

### Toast Notifications
- ✅ Appear in **top-right corner**
- ✅ **Green** for success with checkmark icon
- ✅ **Red** for errors with X icon
- ✅ **Auto-dismiss** after ~5 seconds
- ✅ **Stack** properly if multiple notifications
- ✅ Can be manually dismissed by clicking X
- ✅ Smooth slide-in animation

### Confirmation Dialogs
- ✅ **Center of screen** with backdrop overlay
- ✅ **Red-themed** for delete actions
- ✅ Shows **item name** prominently
- ✅ Has **warning icon** (triangle with exclamation)
- ✅ Shows **irreversibility warning** in amber box
- ✅ **Cancel button** (gray)
- ✅ **Delete/Confirm button** (red with trash icon)
- ✅ Loading spinner when processing
- ✅ Can close by clicking backdrop or X button

---

## What to Verify

### ❌ **NO BROWSER DIALOGS**
- No `alert()` popups
- No `confirm()` dialogs
- No `prompt()` dialogs

### ✅ **CUSTOM COMPONENTS ONLY**
- All feedback via toast notifications
- All confirmations via custom dialog
- Consistent styling across all pages

### ✅ **USER-FRIENDLY MESSAGES**
- Messages are clear and concise
- No technical jargon or stack traces shown to user
- Entity names included in messages
- Action context is clear

### ✅ **CONSISTENT BEHAVIOR**
- Same pattern on all management pages
- Delete always requires confirmation
- Success always shows green toast
- Errors always show red toast

---

## Known Issues / Future Work

### Components Not Yet Updated
Some child components still use native dialogs:
- `TableList.tsx` - QR regeneration confirmations
- `QRCodeDisplay.tsx` - Download/print alerts
- `BatchQROperations.tsx` - Batch operation alerts
- `ModifierGroupForm.tsx` - Validation alerts
- `MenuItemForm.tsx` - Validation alerts

**Note**: These should be refactored to follow the parent-handles-feedback pattern documented in `DIALOG_STANDARDIZATION.md`.

---

## Success Criteria

The implementation is successful if:

1. ✅ No native browser dialogs appear anywhere in the app
2. ✅ All CRUD operations show appropriate feedback
3. ✅ Delete actions require confirmation
4. ✅ Messages are consistent across entities
5. ✅ Visual design is polished and professional
6. ✅ No TypeScript errors
7. ✅ Toasts auto-dismiss and stack properly
8. ✅ Dialogs can be closed multiple ways

---

## Troubleshooting

### Toast Not Appearing
- Check that `ToastProvider` is in `App.tsx`
- Verify `useToastContext()` is called in component
- Check browser console for errors

### Dialog Not Closing
- Ensure `onClose` callback is wired up
- Check that state is being reset properly
- Verify backdrop click handler is working

### Messages Not Consistent
- Use constants from `utils/messages.ts`
- Follow patterns in `DIALOG_STANDARDIZATION.md`
- Check that entity names are being passed correctly
