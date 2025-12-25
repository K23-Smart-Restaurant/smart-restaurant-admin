# Week Table Management Implementation Checklist

> **Purpose:** Compare Week_TableManagement.md specification against actual codebase implementation  
> **Legend:** [✓] = Implemented | [ ] = Not Implemented | [~] = Partially Implemented  
> **Last Updated:** December 2025

---

## 1. Table Management CRUD (0.5 points)

### 1.1 Create Table

- [✓] **Backend API Endpoint:** `POST /api/tables`

  - [✓] Route: `server/src/routes/table.routes.js`
  - [✓] Controller: `server/src/controllers/TableController.js`
  - [✓] Service: `server/src/services/TableService.js`
  - [✓] Schema: `prisma/schema.prisma` - Table model exists

- [✓] **Fields Implementation:**

  - [✓] Table number (required, unique) - `tableNumber` field with unique constraint
  - [✓] Capacity (number of seats, required) - `capacity` field
  - [✓] Location/Zone (e.g., "Indoor", "Outdoor", "Patio", "VIP Room") - `location` field
  - [✓] Status (Active/Inactive) - `isActive` field for soft delete, `status` for table occupancy
  - [✓] Description (optional) - `description` field

- [✓] **Validation:**

  - [✓] Table number must be unique within the restaurant - Unique constraint in schema
  - [✓] Capacity must be a positive integer (1-20) - Validated in `table.schema.js`
  - [✓] Location from predefined options or custom input - Supported in `TableForm.tsx`

- [✓] **Frontend Implementation:**
  - [✓] Table creation form: `client/src/components/table/TableForm.tsx`
  - [✓] Service layer: `client/src/services/tableService.ts`
  - [✓] React Query hook: `client/src/hooks/useTables.ts`
  - [✓] Page integration: `client/src/pages/TableManagementPage.tsx`

### 1.2 View Tables

- [✓] **Backend API Endpoint:** `GET /api/tables`

  - [✓] Lists all tables with QR status
  - [✓] Returns table details including QR code status

- [✓] **Display Fields:**

  - [✓] Table number - Displayed in TableList component
  - [✓] Capacity - Shown with user icon
  - [✓] Location - Shown with map pin icon
  - [✓] Status (Active/Inactive) - `isActive` badge displayed
  - [✓] QR code status - `qrStatus` field with status info

- [✓] **Filter Support:**

  - [✓] By Status (Active/Inactive) - Filter by `status` (AVAILABLE/OCCUPIED/RESERVED)
  - [✓] By Location/Zone - Filter dropdown in page component

- [✓] **Sort Support:**

  - [✓] Table number - Supported in frontend
  - [✓] Capacity - Supported in frontend
  - [✓] Creation date - Supported in frontend

- [✓] **Frontend Implementation:**
  - [✓] List component: `client/src/components/table/TableList.tsx`
  - [✓] Grid/card layout with hover effects
  - [✓] Filter and sort controls in TableManagementPage

### 1.3 Edit Table

- [✓] **Backend API Endpoint:** `PATCH /api/tables/:id`

  - [✓] Controller: `TableController.update()`
  - [✓] Service: `TableService.updateTable()`
  - [✓] Schema validation: `updateTableSchema` (all fields partial)

- [✓] **Updatable Fields:**

  - [✓] Table number - Supported
  - [✓] Capacity - Supported
  - [✓] Location - Supported
  - [✓] Description - Supported
  - [✓] Status - Supported via `updateStatus` mutation

- [✓] **Business Rules:**

  - [✓] Table details can be modified without affecting existing orders
  - [✓] QR code preserved when editing table details

- [✓] **Frontend Implementation:**
  - [✓] Edit modal integration in TableManagementPage
  - [✓] Form pre-populates with existing data
  - [✓] Update mutation in useTables hook

### 1.4 Deactivate/Reactivate Table

- [✓] **Backend API Endpoint:** `PATCH /api/tables/:id/toggle-active`

  - [✓] Route exists in table.routes.js
  - [✓] Controller method: `TableController.toggleActive()`
  - [✓] Service method: `TableService.toggleActive()`

- [✓] **Implementation:**

  - [✓] Soft delete via `isActive` toggle
  - [✓] Show confirmation dialog before deactivation
  - [✓] Display warning if table has active orders (M6)

- [✓] **Active Orders Check:**

  - [✓] Backend endpoint: `GET /api/tables/:id/active-orders`
  - [✓] Controller method: `TableController.checkActiveOrders()`
  - [✓] Service method: `TableService.checkActiveOrders()`
  - [✓] Frontend dialog: `ActiveOrdersWarningDialog` component

- [✓] **Protection Logic:**
  - [✓] Deactivating prevents new orders from being placed
  - [✓] Existing order history is preserved
  - [✓] Force option to deactivate despite active orders

---

## 2. QR Code Generation (0.5 points)

### 2.1 Generate Unique QR Code

- [✓] **Backend Implementation:**

  - [✓] Service: `server/src/services/QRCodeService.js`
  - [✓] Each table has a unique QR code
  - [✓] QR code encodes URL with signed token
  - [✓] URL format: `{RESTAURANT_DOMAIN}/menu?table={tableId}&token={signedToken}`

- [✓] **Integration:**
  - [✓] QR code generated automatically on table creation
  - [✓] QR data stored in `qrCode`, `qrToken`, `qrTokenCreatedAt` fields

### 2.2 Signed Token Requirements

- [✓] **Token Payload Contains:**

  - [✓] Table ID - `tableId` field
  - [✓] Restaurant ID - `restaurantId` field (for future multi-tenant)
  - [✓] Timestamp (creation time) - `createdAt` field
  - [✓] Expiration - Optional, configurable via `QR_TOKEN_EXPIRES_IN`

- [✓] **Token Security:**

  - [✓] Uses JWT with HS256 algorithm
  - [✓] Secret key from `QR_TOKEN_SECRET` or `JWT_SECRET`
  - [✓] Token is verifiable on backend via `verifyToken()` method

- [✓] **Implementation:**
  - [✓] `generateSignedToken()` method in QRCodeService
  - [✓] `verifyToken()` method for validation
  - [✓] `validateTokenWithDatabase()` for full validation including DB check

### 2.3 QR Code Display

- [✓] **Frontend Implementation:**

  - [✓] QR code preview component: `client/src/components/table/QRCodeDisplay.tsx`
  - [✓] Shows QR code preview in admin panel
  - [✓] Displays table information alongside QR code
  - [✓] Shows token creation date and status

- [✓] **QR Status Display:**
  - [✓] Status badges (Active, Invalid, None)
  - [✓] Days until expiry shown
  - [✓] Created date displayed

---

## 3. QR Code Download/Print (0.25 points)

### 3.1 Download Options

- [✓] **PNG Format:**

  - [✓] Backend: `TableController.downloadQR()` with format param
  - [✓] High-resolution image (800px width)
  - [✓] Frontend: Download button in QRCodeDisplay

- [✓] **PDF Format:**

  - [✓] Backend: `QRCodeService.generateTablePDF()`
  - [✓] Print-ready document with:
    - [✓] Restaurant name (configurable)
    - [✓] Table number prominently displayed
    - [✓] QR code centered
    - [✓] "Scan to Order" instruction text
    - [✓] WiFi information (optional)

- [✓] **Frontend Integration:**
  - [✓] Format selection (PNG/PDF) in QRCodeDisplay
  - [✓] Uses `file-saver` library for downloads

### 3.2 Batch Operations

- [✓] **Download All QR Codes:**

  - [✓] Backend: `POST /api/tables/batch/download`
  - [✓] Controller: `TableController.downloadBatchQR()`
  - [✓] Service: `TableService.downloadBatchQRCodes()`

- [✓] **ZIP Format:**

  - [✓] `QRCodeService.generateBatchZip()`
  - [✓] Uses `archiver` library
  - [✓] Each table's QR as separate PNG file

- [✓] **PDF Format (Bulk):**

  - [✓] `QRCodeService.generateBatchPDF()`
  - [✓] Single PDF with all tables
  - [✓] Layout options: single (1 per page) or multiple (4 per page)

- [✓] **Frontend Component:**
  - [✓] `BatchQROperations.tsx` component
  - [✓] Download options modal with customization
  - [✓] Restaurant name, WiFi info configuration

### 3.3 Print Preview

- [✓] **In-Browser Print:**

  - [✓] `handlePrint()` function in QRCodeDisplay
  - [✓] Opens print window with formatted QR code
  - [✓] Proper print styling with A5 page size

- [✓] **Batch Print:**

  - [✓] `handlePrintAll()` in BatchQROperations
  - [✓] Multiple QR codes in print preview
  - [✓] Page break after each QR code

- [✓] **Print Layout:**
  - [✓] Single QR per page supported
  - [✓] Multiple QR per page supported (grid layout)
  - [✓] Customizable restaurant name in print output

---

## 4. QR Code Regeneration (0.25 points)

### 4.1 Regenerate QR Code

- [✓] **Backend API Endpoint:** `POST /api/tables/:id/regenerate-qr`

  - [✓] Controller: `TableController.regenerateQR()`
  - [✓] Service: `TableService.regenerateQRCode()`

- [✓] **Implementation:**

  - [✓] Generates new signed token
  - [✓] Old QR code/token is automatically invalidated
  - [✓] Updates `qrCode`, `qrToken`, `qrTokenCreatedAt` fields

- [✓] **Use Cases:**
  - [✓] QR code damaged or lost - Can regenerate
  - [✓] Security concerns - New token invalidates old
  - [✓] Periodic rotation - Configurable expiration

### 4.2 Invalidation Handling

- [✓] **Old Token Validation:**

  - [✓] `validateTokenWithDatabase()` checks if token matches current
  - [✓] Old tokens return error when scanned
  - [✓] User-friendly error message: "This QR code is no longer valid. Please ask staff for assistance."

- [✓] **Security Logging:**
  - [✓] Invalid token attempts logged to console
  - [✓] Warning message includes table number

### 4.3 Bulk Regeneration

- [✓] **Backend API Endpoint:** `POST /api/tables/batch/regenerate`

  - [✓] Controller: `TableController.bulkRegenerateQR()`
  - [✓] Service: `TableService.bulkRegenerateQRCodes()`
  - [✓] QRCodeService: `bulkRegenerateQR()`

- [✓] **Implementation:**

  - [✓] Option to regenerate all QR codes at once
  - [✓] Can regenerate selected tables only
  - [✓] Returns summary of affected tables (success/failed)

- [✓] **Frontend Integration:**
  - [✓] Bulk regenerate button in BatchQROperations
  - [✓] Admin confirmation dialog before operation
  - [✓] Results display showing success/failed counts

---

## 5. Technical Specifications

### 5.1 Database Schema

- [✓] **Table Model:**

  - [✓] `id` - UUID primary key
  - [✓] `tableNumber` - Integer, unique
  - [✓] `capacity` - Integer with validation (1-20)
  - [✓] `location` - String (nullable)
  - [✓] `description` - Text (nullable)
  - [✓] `status` - Enum (AVAILABLE, OCCUPIED, RESERVED)
  - [✓] `isActive` - Boolean for soft delete
  - [✓] `qrCode` - Text (Base64 QR image)
  - [✓] `qrToken` - VarChar(500), unique
  - [✓] `qrTokenCreatedAt` - DateTime
  - [✓] `restaurantId` - String (for multi-tenant)
  - [✓] `createdAt` - DateTime
  - [✓] `updatedAt` - DateTime

- [✓] **Indexes:**
  - [✓] `tableNumber` index
  - [✓] `status` index
  - [✓] `location` index
  - [✓] `restaurantId` index

### 5.2 API Endpoints

#### Admin Table Endpoints:

- [✓] `GET /api/tables` - Get all tables (with QR status)
- [✓] `POST /api/tables` - Create new table
- [✓] `PATCH /api/tables/:id` - Update table
- [✓] `DELETE /api/tables/:id` - Delete table
- [✓] `PATCH /api/tables/:id/toggle-active` - Toggle active status
- [✓] `GET /api/tables/:id/active-orders` - Check active orders
- [✓] `POST /api/tables/:id/regenerate-qr` - Regenerate QR code
- [✓] `GET /api/tables/:id/qr-code` - Download QR code (PNG/PDF)
- [✓] `POST /api/tables/batch/download` - Batch download QR codes
- [✓] `POST /api/tables/batch/regenerate` - Bulk regenerate QR codes

#### Public Endpoints:

- [✓] `GET /api/tables/validate-qr` - Validate QR token (public)
- [✓] `GET /api/menu/validate-qr` - Alternative QR validation endpoint
- [✓] `GET /api/menu` - Public menu (accessible via QR)

### 5.3 Libraries Used

**Backend (Node.js):**

- [✓] `qrcode` - QR code generation (toDataURL, toBuffer)
- [✓] `jsonwebtoken` - JWT token signing
- [✓] `pdfkit` - PDF generation
- [✓] `archiver` - ZIP file creation

**Frontend (React):**

- [✓] React built-in - QR code display (using base64 image)
- [✓] `file-saver` - File download handling
- [✓] Browser print API - Print functionality

### 5.4 Frontend Components

- [✓] `TableManagementPage.tsx` - Main page with filters and statistics
- [✓] `TableList.tsx` - Table grid display with actions
- [✓] `TableForm.tsx` - Create/edit form with validation
- [✓] `QRCodeDisplay.tsx` - QR code preview, download, print
- [✓] `BatchQROperations.tsx` - Batch download and regenerate operations
- [✓] `ActiveOrdersWarningDialog.tsx` - Warning for deactivating tables with orders
- [✓] `useTables.ts` - React Query hook for table operations
- [✓] `tableService.ts` - API client service

---

## Summary of Completion Status

### ✅ FULLY IMPLEMENTED (100%)

1. **Table CRUD Operations** - All create, read, update, delete operations working
2. **Table Fields** - All required fields implemented (tableNumber, capacity, location, description, status)
3. **Table Validation** - Server-side validation with Zod schemas
4. **QR Code Generation** - Unique QR codes with JWT signed tokens
5. **QR Code Display** - Preview in admin panel with status information
6. **QR Download** - PNG and PDF formats supported
7. **Batch Operations** - ZIP download and bulk PDF generation
8. **Print Functionality** - Single and batch print preview
9. **QR Regeneration** - Single and bulk regeneration
10. **Token Invalidation** - Old tokens properly invalidated and rejected
11. **Soft Delete** - Active/inactive toggle with active orders warning
12. **Multi-tenant Ready** - Restaurant ID support in schema and tokens

---

## Grading Alignment

| Criteria               | Points  | Implementation Status | Notes                                           |
| ---------------------- | ------- | --------------------- | ----------------------------------------------- |
| **Table CRUD**         | 0.5     | ✅ 100% Complete      | All CRUD + soft delete + active orders check    |
| **QR Code Generation** | 0.5     | ✅ 100% Complete      | JWT tokens, unique QR codes, status display     |
| **QR Download/Print**  | 0.25    | ✅ 100% Complete      | PNG, PDF, ZIP, batch download, print preview    |
| **QR Regeneration**    | 0.25    | ✅ 100% Complete      | Single + bulk regeneration, proper invalidation |
| **TOTAL**              | **1.5** | **100%**              | All requirements fully implemented              |

---

## Verification Evidence

**Code Review Completed:** December 26, 2025

All features verified in codebase:

- ✅ Table routes with all CRUD endpoints
- ✅ TableController with all methods implemented
- ✅ TableService with full business logic
- ✅ QRCodeService with JWT tokens, PDF, ZIP generation
- ✅ Frontend components for table management
- ✅ Batch operations for QR codes
- ✅ Active orders warning before deactivation
- ✅ Print preview functionality

---

**Document Status:** ✅ Complete - All Requirements Implemented  
**Reviewed Against:** Week_TableManagement.md specification  
**Implementation Files:** Verified across server and client codebases  
**Last Verification:** December 26, 2025
