# Outstanding Tasks - Smart Restaurant Admin

**Review Date:** December 22, 2024  
**Specification Files:** `Week_MenuManagement.md`, `Week_TableManagement.md`

---

## Task Checklist

### 🔴 HIGH PRIORITY (6 tasks)

- [✓] **H1** - Implement Public Guest Menu API Endpoint
- [✓] **H2** - Create Multi-Photo Support for Menu Items
- [✓] **H3** - Add Primary Photo Selection Feature
- [✓] **H4** - Implement Real File Upload for Menu Item Photos
- [✓] **H5** - Create Proper ModifierGroup Model with Constraints
- [✓] **H6** - Add Filter UI for Table Management Page

### 🟡 MEDIUM PRIORITY (8 tasks)

- [✓] **M1** - Add Pagination Controls to Menu Item List
- [✓] **M2** - Implement True Popularity Sorting
- [✓] **M3** - Add Sort Options to Category List
- [✓] **M4** - Add Validation to Prevent Category Deletion with Active Items
- [✓] **M5** - Add Active/Inactive Status for Tables
- [✓] **M6** - Add Warning for Active Orders When Deactivating Table
- [✓] **M7** - Update Modifier Form for Selection Type Support
- [✓] **M8** - Add MIME Type and File Size Validation for Photo Uploads

### 🟢 LOW PRIORITY (6 tasks)

- [✓] **L1** - Update Menu Item Name Validation Length
- [✓] **L2** - Add Preparation Time Max Validation
- [✓] **L3** - Add Sort Options UI for Table List
- [✓] **L4** - Add Restaurant Logo Configuration for QR PDFs
- [✓] **L5** - Add Active/Inactive Status to Modifier Options
- [✓] **L6** - Improve Validation Error Messages

---

## Progress Tracker

**Overall Completion: 20/20 tasks (100%)**

| Priority | Completed | Total | Progress |
|----------|-----------|-------|----------|
| High     | 6         | 6     | 100%     |
| Medium   | 8         | 8     | 100%     |
| Low      | 6         | 6     | 100%     |



## Missing & Incomplete Tasks

### 🔴 HIGH PRIORITY

#### H1: Implement Public Guest Menu API Endpoint
- **Description:** Create a public `/api/menu` endpoint that allows guests to browse the menu after scanning a QR code. Must support search by item name, filter by category, sort by popularity, filter chef recommendations, and pagination. Must be restaurant-scoped via QR token.
- **Spec Reference:** `Week_MenuManagement.md` - Section 5 (Guest Menu Consumption)
- **Priority:** **High**
- **Dependencies:** None
- **Current State:** Only QR validation exists; no public menu data endpoint

#### H2: Create Multi-Photo Support for Menu Items
- **Description:** Modify database schema to support multiple photos per menu item. Add `menu_item_photos` table with fields: `id`, `menu_item_id`, `url`, `is_primary`, `created_at`. Migrate existing `imageUrl` data.
- **Spec Reference:** `Week_MenuManagement.md` - Section 3.1 (Upload Photos)
- **Priority:** **High**
- **Dependencies:** None
- **Current State:** Single `imageUrl` field on MenuItem model

#### H3: Add Primary Photo Selection Feature
- **Description:** Implement API endpoint `PATCH /api/admin/menu/items/:id/photos/:photoId/primary` to set a photo as primary. Update frontend to allow setting primary photo from the image list.
- **Spec Reference:** `Week_MenuManagement.md` - Section 3.2 (Set a primary photo)
- **Priority:** **High**
- **Dependencies:** H2 (Photo table must exist)
- **Current State:** No `isPrimary` field or selection mechanism exists

#### H4: Implement Real File Upload for Menu Item Photos
- **Description:** Replace URL-only input with actual file upload. Use multer middleware already available. Validate MIME types (JPG/PNG/WebP), file size (max 2-5MB), randomize filenames for security. Store file path in database.
- **Spec Reference:** `Week_MenuManagement.md` - Sections 3.1, 3.3 (Upload Photos, Security & Validation)
- **Priority:** **High**
- **Dependencies:** H2, H3, M8
- **Current State:** Frontend only accepts URL input; multer exists but not integrated in frontend

#### H5: Create Proper ModifierGroup Model with Constraints
- **Description:** Create new `ModifierGroup` model with fields: `name`, `selection_type` (single/multiple), `is_required`, `min_selections`, `max_selections`, `display_order`, `status`. Update `Modifier` to reference `ModifierGroup`. Create CRUD endpoints for modifier groups.
- **Spec Reference:** `Week_MenuManagement.md` - Section 4.1 (Create Modifier Groups)
- **Priority:** **High**
- **Dependencies:** None
- **Current State:** Only flat `Modifier` model with `groupName` string; no selection constraints

#### H6: Add Filter UI for Table Management Page
- **Description:** Add filter controls to TableManagementPage for filtering tables by status (Available/Occupied/Reserved) and by location. Backend already supports filtering.
- **Spec Reference:** `Week_TableManagement.md` - Section 1.2 (Filter tables by Status, Location/Zone)
- **Priority:** **High**
- **Dependencies:** None
- **Current State:** No filter UI exists; tables listed without filtering options

---

### 🟡 MEDIUM PRIORITY

#### M1: Add Pagination Controls to Menu Item List
- **Description:** Add pagination UI (page numbers, prev/next buttons, items per page selector) to MenuItemList component. Backend already supports `limit` and `offset` parameters.
- **Spec Reference:** `Week_MenuManagement.md` - Section 2.2 (Pagination page/limit)
- **Priority:** **Medium**
- **Dependencies:** None
- **Current State:** Backend supports pagination; frontend fetches all items without pagination controls

#### M2: Implement True Popularity Sorting
- **Description:** Add `popularity` field to MenuItem (cached counter) or compute from OrderItem aggregation. Update sort by popularity to use actual order data instead of chef recommendation flag.
- **Spec Reference:** `Week_MenuManagement.md` - Section 6 (Popularity sorting)
- **Priority:** **Medium**
- **Dependencies:** None
- **Current State:** Popularity sort uses `isChefRecommendation` as mock proxy

#### M3: Add Sort Options to Category List
- **Description:** Add sort dropdown to CategoryList component allowing sort by display order (default), name, or creation date. Currently only sorts by displayOrder.
- **Spec Reference:** `Week_MenuManagement.md` - Section 1.2 (Sort categories by display order, name, creation date)
- **Priority:** **Medium**
- **Dependencies:** None
- **Current State:** Only sorted by displayOrder; no UI for other sort options

#### M4: Add Validation to Prevent Category Deletion with Active Items
- **Description:** Before deleting/deactivating a category, check if it contains active menu items. If so, prevent deletion and return validation error, or show warning in UI.
- **Spec Reference:** `Week_MenuManagement.md` - Section 1.4 (Must prevent deletion if category still contains active items)
- **Priority:** **Medium**
- **Dependencies:** None
- **Current State:** No validation; category can be deactivated regardless of items

#### M5: Add Active/Inactive Status for Tables
- **Description:** The spec requires Active/Inactive status for tables (soft delete). Current implementation uses AVAILABLE/OCCUPIED/RESERVED. Either add INACTIVE to enum or add separate `isActive` boolean field.
- **Spec Reference:** `Week_TableManagement.md` - Sections 1.1, 1.4 (Status Active/Inactive, Soft delete implementation)
- **Priority:** **Medium**
- **Dependencies:** None
- **Current State:** Status only has operational states, not active/inactive

#### M6: Add Warning for Active Orders When Deactivating Table
- **Description:** When admin attempts to deactivate a table, check for active orders and display warning dialog. Allow proceeding with confirmation or canceling.
- **Spec Reference:** `Week_TableManagement.md` - Section 1.4 (Display warning if table has active orders)
- **Priority:** **Medium**
- **Dependencies:** M5 (isActive field must exist)
- **Current State:** No check for active orders before deactivation

#### M7: Update Modifier Form for Selection Type Support
- **Description:** Update ModifierGroupForm to include selection type (single-select/multi-select), required flag, min/max selections inputs. These fields will apply to the modifier group.
- **Spec Reference:** `Week_MenuManagement.md` - Section 4.1 (Selection type, Required, Min/max selections)
- **Priority:** **Medium**
- **Dependencies:** H5 (ModifierGroup model must exist)
- **Current State:** Form only captures name, price, groupName; no selection constraints

#### M8: Add MIME Type and File Size Validation for Photo Uploads
- **Description:** In upload middleware, validate that uploaded files are JPG/PNG/WebP format and under max file size (2-5MB). Return descriptive error if validation fails.
- **Spec Reference:** `Week_MenuManagement.md` - Section 3.3 (Validate MIME type and file extension)
- **Priority:** **Medium**
- **Dependencies:** None
- **Current State:** Multer configured but no specific MIME/size validation

---

### 🟢 LOW PRIORITY

#### L1: Update Menu Item Name Validation Length
- **Description:** Change menu item name validation from current 1-100 characters to 2-80 characters as specified.
- **Spec Reference:** `Week_MenuManagement.md` - Section 2.1 (Name 2-80 characters)
- **Priority:** **Low**
- **Dependencies:** None
- **Current State:** Frontend schema allows 1-100 characters

#### L2: Add Preparation Time Max Validation
- **Description:** Add max validation for preparation time field (0-240 minutes as suggested in spec).
- **Spec Reference:** `Week_MenuManagement.md` - Section 2.1 (Preparation time 0-240 suggested)
- **Priority:** **Low**
- **Dependencies:** None
- **Current State:** No max limit in frontend schema

#### L3: Add Sort Options UI for Table List
- **Description:** Add sort dropdown to TableManagementPage for sorting by table number, capacity, or creation date.
- **Spec Reference:** `Week_TableManagement.md` - Section 1.2 (Sort tables by table number, capacity, creation date)
- **Priority:** **Low**
- **Dependencies:** None
- **Current State:** Only sorted by tableNumber; no UI controls

#### L4: Add Restaurant Logo Configuration for QR PDFs
- **Description:** Allow admin to upload/configure restaurant logo that appears on QR code PDFs. Currently hardcoded.
- **Spec Reference:** `Week_TableManagement.md` - Section 3.1 (Restaurant logo optional)
- **Priority:** **Low**
- **Dependencies:** None
- **Current State:** Logo path exists in code but not configurable from UI

#### L5: Add Active/Inactive Status to Modifier Options
- **Description:** Add `status` field (active/inactive) to Modifier model. Allow toggling modifier availability from UI.
- **Spec Reference:** `Week_MenuManagement.md` - Section 4.2 (Status Active/Inactive)
- **Priority:** **Low**
- **Dependencies:** H5 (ModifierGroup model)
- **Current State:** No status field on Modifier model

#### L6: Improve Validation Error Messages
- **Description:** Enhance API validation responses to include field-level error messages. Return consistent 400 responses with detailed field errors.
- **Spec Reference:** `Week_MenuManagement.md` - Section 6 (Return consistent validation errors with field-level messages)
- **Priority:** **Low**
- **Dependencies:** None
- **Current State:** Basic validation exists; error messages not field-specific

---

## Team Workflow & Execution Order

### Team Member Roles

| Member | Focus Area | Primary Skills |
|--------|-----------|----------------|
| **Member 1** | Backend Configuration & Setup | Prisma, Database schema, File handling (multer), Backend foundation |
| **Member 2** | Backend API Development | Node.js, Express, API endpoints, Business logic |
| **Member 3** | Frontend UI Development | React, TypeScript, TailwindCSS, UI/UX |

---

### Member 1: Step-by-Step Execution (Configuration & Setup)

```
┌─────────────────────────────────────────────────────────────────────┐
│            MEMBER 1 - CONFIGURATION & SETUP WORKFLOW                │
└─────────────────────────────────────────────────────────────────────┘

STEP 1: H2 - Multi-Photo Schema (3h)
  ├── Create MenuItemPhoto model in Prisma
  │     - id, menuItemId, url, isPrimary, createdAt
  ├── Add relation to MenuItem
  ├── Create migration
  ├── Migrate existing imageUrl data to new table
  └── ✅ UNBLOCKS: H3 (Member 1), H4 (Member 1)

         ⬇ (Start immediately - foundation work)

STEP 2: H5 - Create ModifierGroup Model (4h)
  ├── Create Prisma schema for ModifierGroup
  ├── Update Modifier to reference ModifierGroup
  ├── Run migration
  ├── Data migration for existing modifiers
  └── ✅ UNBLOCKS: M7 (Member 3), L5 (Member 1)

         ⬇ (Parallel with Step 1 if time allows)

STEP 3: M8 - Upload Validation Middleware (1h)
  ├── Configure multer fileFilter for JPG/PNG/WebP
  ├── Set limits.fileSize to 5MB
  ├── Return descriptive error on rejection
  ├── Setup upload directory structure
  └── ✅ UNBLOCKS: H4 (Member 1)

         ⬇

STEP 4: M5 - Table Active/Inactive Status (2h)
  ├── Add isActive: Boolean to Table model
  ├── Run migration
  ├── Update TableService for isActive logic
  └── ✅ UNBLOCKS: M6 (Member 1)

         ⬇

STEP 5: H3 - Primary Photo API (2h)
  ├── Create photo CRUD endpoints
  │     - POST /menu-items/:id/photos
  │     - DELETE /menu-items/:id/photos/:photoId
  │     - PATCH /menu-items/:id/photos/:photoId/primary
  ├── Update MenuItemService for photo operations
  └── ✅ ASSISTS: H4 (Member 1)

         ⬇

STEP 6: M6 - Active Orders Warning (1h)
  ├── Create checkActiveOrders query
  ├── Add endpoint for checking active orders
  ├── Return warning data to frontend
  └── Log deactivation with active orders

         ⬇

STEP 7: L5 - Modifier Status (1h)
  ├── Add status field to Modifier model
  ├── Update API to support status toggle
  └── Migration for existing modifiers

         ⬇

STEP 8: L4 - Logo Configuration (1h)
  ├── Add logoUrl to Restaurant/Settings
  ├── Update QRCodeService to use custom logo
  └── Create upload endpoint for logo
```

**Member 1 Total: ~15 hours**

---

### Member 2: Step-by-Step Execution (Backend API Development)

```
┌─────────────────────────────────────────────────────────────────────┐
│                MEMBER 2 - BACKEND API WORKFLOW                      │
└─────────────────────────────────────────────────────────────────────┘

🚧 WAIT FOR MEMBER 1 TO COMPLETE SCHEMA SETUP (H2, H5, M5) 🚧

STEP 1: H4 - File Upload Integration (Backend) (2h)
  ├── Update photo endpoint for multipart
  ├── Use Member 1's multer configuration
  ├── Save files to /uploads/menu-items
  ├── Return file URL in response
  └── Test upload with validation

         ⬇ (Requires H2, H3, M8 from Member 1)

STEP 2: H1 - Public Guest Menu API (4h)
  ├── Create GET /api/menu endpoint
  ├── Add search, filter, sort, pagination
  ├── Integrate with QR token validation
  ├── Return active items with primary photos
  └── Use Member 1's schema changes

         ⬇

STEP 3: M4 - Category Deletion Validation (1h)
  ├── Check for active items in CategoryService.deleteCategory
  ├── Return 400 with error if items exist
  └── Unit test the validation

         ⬇

STEP 4: M2 - Popularity Sorting (3h)
  ├── Add popularityScore field to MenuItem
  ├── Create aggregation query from OrderItems
  ├── Update getMenuItems to sort by popularity
  └── Consider caching strategy

         ⬇

STEP 5: L6 - Improved Validation Errors (2h)
  ├── Update Zod schemas for field-level errors
  ├── Modify error middleware for consistent 400 format
  └── Test all validation endpoints

         ⬇

STEP 6: Assist with API Integration (2h)
  ├── Help test all endpoints
  ├── Document API changes
  ├── Fix any backend issues
  └── Support frontend integration
```

**Member 2 Total: ~14 hours**

---

### Member 3: Step-by-Step Execution (Frontend Development)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MEMBER 3 - FRONTEND WORKFLOW                     │
└─────────────────────────────────────────────────────────────────────┘

🚧 WAIT FOR MEMBER 1 & 2 TO COMPLETE BACKEND SETUP 🚧

STEP 1: H6 - Table Filter UI (2h)
  ├── Add status dropdown filter
  ├── Add location text input filter
  ├── Connect to useTables hook
  └── Update TableList filtering logic

         ⬇ (Can start early - basic functionality)

STEP 2: L1 + L2 - Quick Validations (1h)
  ├── Update menuItemFormSchema name: 2-80 chars
  ├── Add preparationTime max: 240
  └── Test form validation

         ⬇ (Quick wins, do early)

STEP 3: M1 - Menu Item Pagination (2h)
  ├── Add Pagination component
  ├── Add page state to useMenuItems
  ├── Update API calls with limit/offset
  └── Show page controls in MenuItemList

         ⬇

STEP 4: M3 - Category Sort Options (1h)
  ├── Add sort dropdown to CategoryManagementPage
  ├── Update useCategories with sort logic
  └── Options: displayOrder, name, createdAt

         ⬇

STEP 5: L3 - Table Sort Options (1h)
  ├── Add sort dropdown to TableManagementPage
  ├── Options: tableNumber, capacity, createdAt
  └── Update sorting logic in useTables

         ⬇

STEP 6: H4 - File Upload Integration (Frontend) (2h)
  ├── Use Member 1's upload endpoint
  ├── Replace URL input with file input
  ├── Show upload progress
  ├── Handle multiple file selection
  └── Display uploaded photos with primary selection

         ⬇ (Requires H3, H4 backend from Member 1)

🚧 WAIT FOR MEMBER 1 TO COMPLETE H5 🚧

STEP 7: M7 - Modifier Form Update (2h)
  ├── Add selectionType dropdown (single/multiple)
  ├── Add isRequired checkbox
  ├── Add min/max selection inputs
  └── Update form submission

         ⬇

STEP 8: Final UI Polish (2h)
  ├── Integrate M6 warning modal for table deactivation
  ├── Add modifier status toggle (L5)
  ├── Test all user flows
  └── Responsive design checks
```

**Member 3 Total: ~13 hours**



### Team Coordination

**Critical Rules:**
- Member 1 owns all Prisma schema changes (H2, H5, M5, L5)
- Member 2 starts after Member 1 completes H2, H5
- Member 3 starts after Member 2 completes core APIs
- Run `npx prisma migrate dev` after each schema change

**Work Handoffs:**
- Member 1 → Member 2: After completing H2, H5, M8
- Member 2 → Member 3: After completing H1, H4 backend
