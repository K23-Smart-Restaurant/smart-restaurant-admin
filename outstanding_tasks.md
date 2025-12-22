# Outstanding Tasks - Smart Restaurant Admin

**Review Date:** December 22, 2024  
**Specification Files:** `Week_MenuManagement.md`, `Week_TableManagement.md`

---

## Overview

### Overall Completion Assessment

| Module | Completeness | Status |
|--------|--------------|--------|
| Menu Categories CRUD | ~85% | ⚠️ Mostly Complete |
| Menu Item CRUD | ~75% | ⚠️ Mostly Complete |
| Menu Item Photos | ~40% | 🔴 Incomplete |
| Menu Item Modifiers | ~60% | ⚠️ Partially Complete |
| Guest Menu Consumption | ~10% | 🔴 Missing |
| Table Management CRUD | ~90% | ✅ Mostly Complete |
| QR Code Generation | ~95% | ✅ Complete |
| QR Download/Print | ~95% | ✅ Complete |
| QR Regeneration | ~95% | ✅ Complete |

**Overall Project Completion: ~70%**

The Table Management module is nearly complete with excellent QR code functionality. The Menu Management module requires significant work, particularly for photo management, modifier groups, and the public guest menu endpoint.

### Key Risks & Dependencies

| Risk | Impact | Mitigation |
|------|--------|------------|
| Schema changes (H2, H5, M5) require migrations | Could break existing data | Run migrations in dev first, create rollback scripts |
| Photo upload (H4) spans frontend + backend | Coordination needed | Member C owns end-to-end |
| M7 blocked by H5 | Member B idle if A delayed | B works on non-blocked tasks first |
| Multiple Prisma schema changes | Migration conflicts | Coordinate schema changes, run sequentially |

---

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
| **Member A** | Backend API Development | Node.js, Express, Prisma, PostgreSQL |
| **Member B** | Frontend UI Development | React, TypeScript, TailwindCSS |
| **Member C** | Data Models & File Handling | Database schema, File uploads, Full-stack integration |

---

### Member A: Step-by-Step Execution

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MEMBER A - BACKEND WORKFLOW                      │
└─────────────────────────────────────────────────────────────────────┘

STEP 1: H5 - Create ModifierGroup Model (4h)
  ├── Create Prisma schema for ModifierGroup
  ├── Update Modifier to reference ModifierGroup
  ├── Run migration
  ├── Create CRUD API endpoints
  └── ✅ UNBLOCKS: M7 (Member B), L5 (Member C)

         ⬇ (Can start immediately - no dependencies)

STEP 2: H1 - Public Guest Menu API (4h)
  ├── Create GET /api/menu endpoint
  ├── Add search, filter, sort, pagination
  ├── Integrate with QR token validation
  └── Return active items with primary photos

         ⬇ (Parallel with Step 1 if time allows)

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
```

**Member A Total: ~14 hours**

---

### Member B: Step-by-Step Execution

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MEMBER B - FRONTEND WORKFLOW                     │
└─────────────────────────────────────────────────────────────────────┘

STEP 1: H6 - Table Filter UI (2h)
  ├── Add status dropdown filter
  ├── Add location text input filter
  ├── Connect to useTables hook
  └── Update TableList filtering logic

         ⬇ (Can start immediately - no dependencies)

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

🚧 WAIT FOR MEMBER A TO COMPLETE H5 🚧

STEP 5: M7 - Modifier Form Update (2h)
  ├── Add selectionType dropdown (single/multiple)
  ├── Add isRequired checkbox
  ├── Add min/max selection inputs
  └── Update form submission

         ⬇

STEP 6: L3 - Table Sort Options (1h)
  ├── Add sort dropdown to TableManagementPage
  ├── Options: tableNumber, capacity, createdAt
  └── Update sorting logic in useTables
```

**Member B Total: ~9 hours**

---

### Member C: Step-by-Step Execution

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MEMBER C - DATA & FILES WORKFLOW                 │
└─────────────────────────────────────────────────────────────────────┘

STEP 1: H2 - Multi-Photo Schema (3h)
  ├── Create MenuItemPhoto model in Prisma
  │     - id, menuItemId, url, isPrimary, createdAt
  ├── Add relation to MenuItem
  ├── Create migration
  ├── Migrate existing imageUrl data to new table
  └── ✅ UNBLOCKS: H3

         ⬇ (Start immediately)

STEP 2: M8 - Upload Validation (1h)
  ├── Configure multer fileFilter for JPG/PNG/WebP
  ├── Set limits.fileSize to 5MB
  ├── Return descriptive error on rejection
  └── ✅ UNBLOCKS: H4

         ⬇ (Can parallel with H2)

STEP 3: H3 - Primary Photo API (2h)
  ├── Create photo CRUD endpoints
  │     - POST /menu-items/:id/photos
  │     - DELETE /menu-items/:id/photos/:photoId
  │     - PATCH /menu-items/:id/photos/:photoId/primary
  ├── Update MenuItemService for photo operations
  └── ✅ UNBLOCKS: H4

         ⬇ (Requires H2 complete)

STEP 4: H4 - File Upload Integration (4h)
  ├── Backend: Update photo endpoint for multipart
  ├── Backend: Save files to /uploads/menu-items
  ├── Backend: Return file URL in response
  ├── Frontend: Replace URL input with file input
  ├── Frontend: Show upload progress
  ├── Frontend: Handle multiple file selection
  └── ✅ Photo management complete!

         ⬇ (Requires H2, H3, M8 complete)

STEP 5: M5 - Table Active/Inactive Status (2h)
  ├── Add isActive: Boolean to Table model
  ├── Run migration
  ├── Update TableService for isActive logic
  ├── Update frontend table display
  └── ✅ UNBLOCKS: M6

         ⬇

STEP 6: M6 - Active Orders Warning (1h)
  ├── Create checkActiveOrders query
  ├── Show warning modal before deactivation
  ├── Allow confirm or cancel
  └── Log deactivation with active orders

         ⬇ (Requires M5 complete)

STEP 7: L4 - Logo Configuration (1h)
  ├── Add logoUrl to Restaurant/Settings
  ├── Update QRCodeService to use custom logo
  └── Add logo upload in admin settings

         ⬇

🚧 WAIT FOR MEMBER A TO COMPLETE H5 🚧

STEP 8: L5 - Modifier Status (1h)
  ├── Add status field to Modifier model
  ├── Update API to support status toggle
  └── Add toggle switch in UI
```

**Member C Total: ~15 hours**

---

## Parallelization Strategy

### Visual Timeline

```
═══════════════════════════════════════════════════════════════════════
                           WEEK 1 (Days 1-5)
═══════════════════════════════════════════════════════════════════════

DAY 1    │ DAY 2    │ DAY 3    │ DAY 4    │ DAY 5
─────────┼──────────┼──────────┼──────────┼──────────
         │          │          │          │
 A: H5 (ModifierGroup schema + API) ─────►│ H1 (Guest Menu API)
         │          │          │          │
─────────┼──────────┼──────────┼──────────┼──────────
         │          │          │          │
 B: H6 ──►│ L1,L2 ──►│ M1 (Pagination) ────►│ M3
         │          │          │          │
─────────┼──────────┼──────────┼──────────┼──────────
         │          │          │          │
 C: H2 (Photo table) + M8 ────►│ H3 ──────►│ H4 (File upload)
         │          │          │          │
═══════════════════════════════════════════════════════════════════════
                           WEEK 2 (Days 6-10)
═══════════════════════════════════════════════════════════════════════

DAY 6    │ DAY 7    │ DAY 8    │ DAY 9    │ DAY 10
─────────┼──────────┼──────────┼──────────┼──────────
         │          │          │          │
 A: M4 ──►│ M2 (Popularity) ───►│ L6 ─────►│ Review
         │          │          │          │
─────────┼──────────┼──────────┼──────────┼──────────
         │          │          │          │
 B: ⏳M7 (waiting)─►│ M7 ──────►│ L3 ─────►│ Review
         │          │          │          │
─────────┼──────────┼──────────┼──────────┼──────────
         │          │          │          │
 C: H4 cont'd ─────►│ M5 ──────►│ M6, L4 ─►│ L5 + Review
         │          │          │          │
═══════════════════════════════════════════════════════════════════════
```

---

### Parallel Work Zones

These modules are **independent** and can be worked on simultaneously:

| Zone | Members | Tasks | Files Touched |
|------|---------|-------|---------------|
| **Zone 1: Modifiers** | A → B → C | H5 → M7 → L5 | `schema.prisma`, `ModifierGroupForm.tsx`, modifier routes |
| **Zone 2: Photos** | C only | H2 → H3 → H4, M8 | `schema.prisma`, `MenuItemForm.tsx`, upload middleware |
| **Zone 3: Tables** | B + C | H6, M5, M6, L3, L4 | `TableManagementPage.tsx`, `TableService.js` |
| **Zone 4: Menu/Category** | A + B | H1, M1, M2, M3, M4 | Menu routes, `MenuItemList.tsx`, `CategoryList.tsx` |
| **Zone 5: Validations** | A + B | L1, L2, L6 | Schemas, form components |

---

### Blocking Dependencies (Critical Path)

```
┌─────────────────────────────────────────────────────────────────────┐
│                      DEPENDENCY CHAIN 1                             │
│    H2 (Photo schema) ──► H3 (Primary photo) ──► H4 (File upload)   │
│         ↑                                                           │
│         └── M8 (Validation) ─────────────────────┘                  │
│                                                                     │
│    Owner: Member C (self-contained chain)                           │
│    Duration: ~10 hours                                              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      DEPENDENCY CHAIN 2                             │
│              H5 (ModifierGroup) ──► M7 (Modifier form)              │
│                       │                                             │
│                       └──────────► L5 (Modifier status)             │
│                                                                     │
│    Owner: Member A (H5) → Member B (M7) → Member C (L5)            │
│    Duration: ~7 hours across team                                   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      DEPENDENCY CHAIN 3                             │
│              M5 (Table isActive) ──► M6 (Active orders warning)    │
│                                                                     │
│    Owner: Member C (self-contained)                                │
│    Duration: ~3 hours                                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Conflict Prevention Rules

1. **Schema Changes**
   - Only ONE person modifies `schema.prisma` at a time
   - Announce in team chat before starting schema work
   - Run `npx prisma migrate dev` immediately after changes
   - Push migration files before others pull

2. **Shared Files**
   - `MenuItemForm.tsx`: B does validation (L1, L2), C does photo upload (H4) - coordinate
   - `TableManagementPage.tsx`: B does filters (H6) in Week 1, C does status (M5) in Week 2

3. **API Routes**
   - Member A owns `/api/menu*` and `/api/categories/*`
   - Member C owns `/api/tables/*` (for M5, M6)
   - Communicate if touching same route file

---

### Daily Sync Points

| Time | Activity | Purpose |
|------|----------|---------|
| 9:00 AM | Standup | Share blockers, coordinate schema changes |
| 12:00 PM | Code review | Catch conflicts early |
| 5:00 PM | Push checkpoint | Everyone pushes work-in-progress |

---

## Open Questions / Ambiguities

### 1. Multi-Tenant Restaurant Scope
**Question:** The spec mentions "restaurant-scoped" and "multi-tenant support" but current implementation uses a single restaurant. Is full multi-restaurant support required now, or is single-restaurant sufficient?

**Impact:** Affects H1 (public menu endpoint) and overall data scoping.

**Recommendation:** Clarify with stakeholders. For now, assume single-restaurant with `restaurantId` as optional field for future use.

---

### 2. Photo Storage Location
**Question:** Spec says "Store file path/URL in DB" - should photos be stored locally, on cloud storage (S3, Cloudinary), or is URL reference to external images acceptable?

**Impact:** Affects H4 (file upload implementation).

**Recommendation:** Start with local storage (`/uploads/menu-items/`) with abstraction layer for future cloud migration.

---

### 3. Menu Item Status Model
**Question:** Spec defines status as single enum `Available/Unavailable/Sold out`, but current implementation uses two booleans: `isAvailable` + `isSoldOut`. Should we migrate to single enum?

**Impact:** Database migration required if changing.

**Recommendation:** Keep current boolean approach as it's already working and provides same functionality. Document the mapping:
- Available = `isAvailable=true, isSoldOut=false`
- Sold out = `isSoldOut=true`
- Unavailable = `isAvailable=false, isSoldOut=false`

---

### 4. Table Status vs Active/Inactive
**Question:** Spec shows both operational status (Available/Occupied/Reserved) and administrative status (Active/Inactive). Should these be separate fields?

**Impact:** Affects M5 implementation.

**Recommendation:** Add `isActive: Boolean` field separate from operational `status` enum. A table can be Active but Reserved, or Inactive (not accepting orders).

---

### 5. Modifier Group vs Flat Modifiers
**Question:** Current implementation uses flat `groupName` string on modifiers. Spec requires full `ModifierGroup` entity with selection constraints. Is backward compatibility needed?

**Impact:** Significant database restructuring for H5.

**Recommendation:** Create new `ModifierGroup` model. Migrate existing modifiers by:
1. Create ModifierGroup for each unique `groupName`
2. Update Modifier to reference ModifierGroup
3. Default `selectionType` to 'single', `isRequired` to false

---

### 6. Popularity Calculation Method
**Question:** Spec mentions popularity can be "stored as a cached counter on menu_items or computed from order_items (trade-off: speed vs accuracy)". Which approach is preferred?

**Impact:** Affects M2 implementation complexity.

**Recommendation:** Use hybrid approach:
- Add `popularityScore: Int` field to MenuItem
- Update score via background job or on order completion
- Refresh periodically (daily or on-demand)

---

## Summary

### Key Metrics

| Metric | Value |
|--------|-------|
| Total Tasks | 20 |
| High Priority | 6 |
| Medium Priority | 8 |
| Low Priority | 6 |
| Blocking Dependencies | 5 |
| Estimated Total Effort | ~38 hours |
| Recommended Timeline | 2 weeks |

### Critical Path

The longest dependency chain is:
```
H2 (Photo schema) → H3 (Primary photo) → H4 (File upload)
```
This chain is **10 hours** and is owned entirely by Member C.

### Success Criteria

All tasks are complete when:
1. ✅ Guest can scan QR and browse menu (H1)
2. ✅ Admin can upload multiple photos with primary selection (H2, H3, H4)
3. ✅ Modifier groups have selection constraints (H5, M7)
4. ✅ Tables can be filtered, sorted, and soft-deleted (H6, M5, M6, L3)
5. ✅ Menu items support pagination and popularity sorting (M1, M2)
6. ✅ All validation rules match specification (L1, L2, M4, M8, L6)

---

## Notes

- All tasks are scoped to requirements in `Week_MenuManagement.md` and `Week_TableManagement.md`
- No new features beyond specification are included
- Effort estimates assume familiarity with codebase
- Testing time not included in estimates (add ~30% for tests)
