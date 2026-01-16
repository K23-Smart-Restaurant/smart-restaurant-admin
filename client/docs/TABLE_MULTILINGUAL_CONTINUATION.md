# Table Management Multilingual Implementation - Continuation Guide

## ✅ Completed

### Translation Files

- ✅ `src/locales/en/tables.json` - Created comprehensive English translations (180+ keys)
- ✅ `src/locales/vi/tables.json` - Created comprehensive Vietnamese translations (180+ keys)

### Pages

- ✅ `TableManagementPage.tsx` - Partially translated:
  - ✅ useTranslation hook added
  - ✅ Page header (title, subtitle)
  - ✅ Statistics cards labels
  - ✅ Toast messages (created, updated, deleted)
  - ✅ Error messages
  - ✅ Loading states
  - ✅ Status options array
  - ✅ Sort options array

## 🔄 TODO - Continue Translation

### 1. TableManagementPage.tsx - Remaining Sections

Continue translating these sections in `src/pages/TableManagementPage.tsx`:

#### Filters Section (lines ~304-377)

```tsx
// Search label and placeholder
<label htmlFor="search" className="block mb-2 text-sm font-medium text-charcoal">
  <SearchIcon className="inline w-4 h-4 mr-1" />
  {t('tables:search.label')}
</label>
<input
  placeholder={t('tables:search.placeholder')}
  // ... rest of props
/>

// Status filter label
<label htmlFor="status" className="block mb-2 text-sm font-medium text-charcoal">
  <FilterIcon className="inline w-4 h-4 mr-1" />
  {t('tables:filters.status')}
</label>

// Location filter label
<label htmlFor="location" className="block mb-2 text-sm font-medium text-charcoal">
  <FilterIcon className="inline w-4 h-4 mr-1" />
  {t('tables:filters.location')}
</label>

// "All Locations" option
<option value="ALL">{t('tables:locations.all')}</option>

// Sort By label
<label htmlFor="sort" className="block mb-2 text-sm font-medium text-charcoal">
  <ArrowUpDownIcon className="inline w-4 h-4 mr-1" />
  {t('tables:filters.sortBy')}
</label>

// Sort order button title
title={t(`tables:filters.sort${sortOrder === 'asc' ? 'Asc' : 'Desc'}`)}
```

#### Results Count (lines ~394-399)

```tsx
<p className="text-sm text-gray-600">
  {t('tables:results.showing')} <span className="font-semibold text-charcoal">{tables.length}</span>{' '}
  {t(`tables:results.table${tables.length !== 1 ? '_plural' : ''}`)}
</p>
```

#### Modal Titles (lines ~412-425)

```tsx
<Modal
  isOpen={isTableModalOpen}
  onClose={closeTableModal}
  title={editingTable ? t('tables:modals.edit') : t('tables:modals.create')}
>

<ConfirmDeleteDialog
  isOpen={tableToDelete !== null}
  onClose={cancelDelete}
  onConfirm={confirmDelete}
  title={t('tables:modals.delete')}
  itemName={tableToDelete ? t('tables:list.table', { number: tableToDelete.tableNumber }) : undefined}
  message={t('tables:modals.deleteMessage')}
  isLoading={isDeleting}
/>
```

### 2. TableForm.tsx

**File:** `src/components/table/TableForm.tsx`

#### Steps:

1. Add useTranslation hook at the top
2. Move Zod schema INSIDE component (after useTranslation)
3. Translate all form fields

```tsx
import { useTranslation } from 'react-i18next';

const TableForm: React.FC<TableFormProps> = ({ ... }) => {
  const { t } = useTranslation(['tables', 'common']);

  // Move schema here and translate validation messages
  const formSchema = z.object({
    tableNumber: z
      .number({ required_error: t('tables:form.validation.tableNumberRequired') })
      .min(1, t('tables:form.validation.tableNumberMin')),
    capacity: z
      .number({ required_error: t('tables:form.validation.capacityRequired') })
      .min(1, t('tables:form.validation.capacityMin'))
      .max(50, t('tables:form.validation.capacityMax')),
    location: z
      .string({ required_error: t('tables:form.validation.locationRequired') })
      .min(1, t('tables:form.validation.locationRequired'))
      .max(100, t('tables:form.validation.locationMax')),
    description: z.string().max(500, t('tables:form.validation.descriptionMax')).optional(),
    status: z.enum(['AVAILABLE', 'OCCUPIED', 'RESERVED'], {
      required_error: t('tables:form.validation.statusRequired'),
    }),
  });

  // Translate location suggestions
  const locationSuggestions = [
    t('tables:locations.mainFloor'),
    t('tables:locations.patio'),
    t('tables:locations.privateRoomA'),
    t('tables:locations.privateRoomB'),
    t('tables:locations.bar'),
    t('tables:locations.terrace'),
    t('tables:locations.vip'),
  ];

  // Translate status options
  const statusOptions = [
    { value: 'AVAILABLE', label: t('tables:status.available') },
    { value: 'OCCUPIED', label: t('tables:status.occupied') },
    { value: 'RESERVED', label: t('tables:status.reserved') },
  ];
```

#### Form Field Labels (translate all):

- Table Number label: `t('tables:form.tableNumber')`
- Table Number placeholder: `t('tables:form.tableNumberPlaceholder')`
- Table Number help: `t('tables:form.tableNumberHelp')`
- Capacity label: `t('tables:form.capacity')`
- Capacity placeholder: `t('tables:form.capacityPlaceholder')`
- Capacity help: `t('tables:form.capacityHelp')`
- Location label: `t('tables:form.location')`
- Location placeholder: `t('tables:form.locationPlaceholder')`
- Location help: `t('tables:form.locationHelp')`
- Description label: `t('tables:form.description')`
- Description placeholder: `t('tables:form.descriptionPlaceholder')`
- Status label: `t('tables:form.status')`
- Status help: `t('tables:form.statusHelp')`
- Quick Capacity label: `t('tables:form.quickCapacity')`
- Seats preset button: `t('tables:form.seatsPreset', { count: preset })`
- New table note: `t('tables:form.newTableNote')` and `t('tables:form.newTableInfo')`
- Cancel button: `t('tables:form.cancel')`
- Submit button: `{isSubmitting ? t('tables:form.saving') : isEditMode ? t('tables:form.updateTable') : t('tables:form.createTable')}`
- Required asterisk: `t('tables:form.required')`

### 3. TableList.tsx

**File:** `src/components/table/TableList.tsx`

#### Key Elements to Translate:

```tsx
import { useTranslation } from 'react-i18next';

const TableList: React.FC<TableListProps> = ({ ... }) => {
  const { t } = useTranslation(['tables', 'common']);

  // Status label function
  const getStatusLabel = (status: TableStatus) => {
    return t(`tables:status.${status.toLowerCase()}`);
  };

  // Translate card elements:
  // - "Inactive" badge: t('tables:card.inactive')
  // - "seats": t('tables:card.seats')
  // - "Quick Status:": t('tables:card.quickStatus')
  // - Status buttons: t('tables:card.avail'), t('tables:card.occup'), t('tables:card.reserv')
  // - Button tooltips: t('tables:card.tooltipQR'), t('tables:card.tooltipEdit'), etc.
  // - "Updated:": t('tables:card.updated')
  // - Empty state: t('tables:list.noTables'), t('tables:list.noTablesDescription')
  // - Modal title: t('tables:qr.title', { number: selectedTableForQR.tableNumber })
```

### 4. BatchQROperations.tsx

**File:** `src/components/table/BatchQROperations.tsx`

#### Key Elements:

```tsx
import { useTranslation } from 'react-i18next';

const BatchQROperations: React.FC<BatchQROperationsProps> = ({ ... }) => {
  const { t } = useTranslation(['tables', 'common']);

  // Translate:
  // - Title: t('tables:batch.title')
  // - Selected count: t(`tables:batch.selectedCount${selectedTableIds.length > 1 ? '_plural' : ''}`, { count: selectedTableIds.length })
  // - All tables: t('tables:batch.allTables', { count: tables.length })
  // - With QR: t('tables:batch.withQR', { count: tablesWithQR.length })
  // - Button labels: t('tables:batch.actions.downloadAll'), etc.
  // - Download Options Modal title: t('tables:batch.downloadOptions.title')
  // - Format options: t('tables:batch.downloadOptions.zip'), t('tables:batch.downloadOptions.pdf')
  // - All other modal content using tables:batch.downloadOptions.* keys
  // - Regenerate modal: tables:batch.regenerate.* keys
  // - Results modal: tables:batch.results.* keys
```

### 5. QRCodeDisplay.tsx

**File:** `src/components/table/QRCodeDisplay.tsx`

#### Key Elements:

```tsx
import { useTranslation } from 'react-i18next';

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ ... }) => {
  const { t } = useTranslation(['tables', 'common']);

  // Translate:
  // - No QR state: t('tables:qr.noCode'), t('tables:qr.noCodeDescription'), t('tables:qr.generateCode')
  // - Status labels: t('tables:qr.status.active'), t('tables:qr.status.invalid'), etc.
  // - Expires in: t('tables:qr.status.expiresIn', { days: qrStatus.daysUntilExpiry })
  // - Table info: t('tables:qr.info.capacity', { capacity: table.capacity })
  // - Created: t('tables:qr.info.created')
  // - Download format: t('tables:qr.download.format')
  // - Format labels: t('tables:qr.download.png'), t('tables:qr.download.pdf')
  // - Button labels: t('tables:qr.download.button', { format: downloadFormat.toUpperCase() })
  // - Actions: t('tables:qr.actions.print'), t('tables:qr.actions.regenerate')
  // - How it works section: t('tables:qr.howItWorks.title'), t('tables:qr.howItWorks.point1'), etc.
  // - Enlarged modal: t('tables:qr.enlarged.close'), t('tables:qr.enlarged.scanToOrder')
```

## Translation Keys Structure

All translation keys are organized in `tables.json` with these sections:

- `title`, `subtitle` - Page header
- `statistics.*` - Statistics cards
- `search.*` - Search input
- `filters.*` - Filter labels and options
- `status.*` - Table status values
- `sort.*` - Sort options
- `locations.*` - Location suggestions
- `actions.*` - Action button labels
- `card.*` - Table card elements
- `list.*` - List display
- `results.*` - Results count
- `form.*` - Form fields and validation
- `qr.*` - QR code display and operations
- `batch.*` - Batch operations
- `messages.*` - Toast messages
- `modals.*` - Modal titles and messages
- `activeOrders.*` - Active orders warning
- `loading.*` - Loading states
- `errors.*` - Error messages

## Testing Checklist

After implementation, test:

- [ ] Page loads with correct language
- [ ] Language switcher changes all text
- [ ] Toast messages display with interpolation
- [ ] Form validation messages in correct language
- [ ] Status labels translate correctly
- [ ] Empty states show translated text
- [ ] Modals have translated titles
- [ ] QR code operations have translated buttons
- [ ] Batch operations modal fully translated
- [ ] All tooltips translated
- [ ] Pluralization works correctly

## Notes

- Use interpolation for dynamic values: `{{ variable }}`
- Use pluralization suffix `_plural` for counts
- Always use namespace prefix: `tables:key` or `common:key`
- Form schemas must be inside component to access `t()` function
