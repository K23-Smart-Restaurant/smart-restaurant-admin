# Multilingual Support Implementation Guide

## ✅ What's Already Done

1. **Dependencies Installed**

    - `i18next` - Core i18n framework
    - `react-i18next` - React integration
    - `i18next-browser-languagedetector` - Auto language detection

2. **Configuration**

    - [`src/i18n/config.ts`](src/i18n/config.ts) - Main i18n configuration
    - [`src/main.tsx`](src/main.tsx) - i18n initialized on app startup

3. **Translation Files Created**

    - `src/locales/en/` - English translations
    - `src/locales/vi/` - Vietnamese translations
    - Organized by feature: common, dashboard, menu, orders, kitchen, staff, tables, reports

4. **Components**
    - [`LanguageSwitcher`](src/components/common/LanguageSwitcher.tsx) - Language selector dropdown
    - Added to [`DashboardLayout`](src/components/layout/DashboardLayout.tsx) header

## 🎯 How to Continue Translation

### Step 1: Using Translations in Components

Import the `useTranslation` hook:

```tsx
import { useTranslation } from "react-i18next";

function MyComponent() {
    // Specify namespace(s) to use
    const { t } = useTranslation(["common", "menu"]);

    return (
        <div>
            {/* Basic translation */}
            <h1>{t("common:appName")}</h1>

            {/* If default namespace is 'common', you can omit it */}
            <button>{t("buttons.save")}</button>

            {/* Translation with interpolation */}
            <p>{t("dashboard:welcomeMessage", { name: "John" })}</p>

            {/* Translation with count (pluralization) */}
            <span>{t("orders:items", { count: 5 })}</span>
        </div>
    );
}
```

### Step 2: Adding New Translation Keys

**Example: Translating a form in MenuItemForm.tsx**

1. Open translation files:

    - `src/locales/en/menu.json`
    - `src/locales/vi/menu.json`

2. Add new keys (example for a form):

**English** (`en/menu.json`):

```json
{
    "form": {
        "itemName": "Item Name",
        "itemNamePlaceholder": "Enter menu item name",
        "description": "Description",
        "descriptionPlaceholder": "Describe this dish",
        "price": "Price",
        "pricePlaceholder": "0.00",
        "selectCategory": "Select Category",
        "addImage": "Add Image",
        "isAvailable": "Available for ordering",
        "isFeatured": "Feature this item"
    },
    "validation": {
        "nameRequired": "Item name is required",
        "priceRequired": "Price is required",
        "pricePositive": "Price must be positive",
        "categoryRequired": "Please select a category"
    }
}
```

**Vietnamese** (`vi/menu.json`):

```json
{
    "form": {
        "itemName": "Tên món ăn",
        "itemNamePlaceholder": "Nhập tên món ăn",
        "description": "Mô tả",
        "descriptionPlaceholder": "Mô tả món ăn này",
        "price": "Giá",
        "pricePlaceholder": "0.00",
        "selectCategory": "Chọn danh mục",
        "addImage": "Thêm hình ảnh",
        "isAvailable": "Còn hàng",
        "isFeatured": "Món nổi bật"
    },
    "validation": {
        "nameRequired": "Tên món ăn là bắt buộc",
        "priceRequired": "Giá là bắt buộc",
        "pricePositive": "Giá phải là số dương",
        "categoryRequired": "Vui lòng chọn danh mục"
    }
}
```

3. Use in component:

```tsx
import { useTranslation } from "react-i18next";

function MenuItemForm() {
    const { t } = useTranslation(["menu", "common"]);

    return (
        <form>
            <label>{t("menu:form.itemName")}</label>
            <input placeholder={t("menu:form.itemNamePlaceholder")} />

            <button type="submit">{t("common:buttons.save")}</button>
        </form>
    );
}
```

### Step 3: Translating Static Text

**Find and replace pattern:**

BEFORE:

```tsx
<h2>Menu Items</h2>
<button>Add New Item</button>
<p>No items found</p>
```

AFTER:

```tsx
const { t } = useTranslation(['menu', 'common']);

<h2>{t('menu:items.title')}</h2>
<button>{t('menu:items.add')}</button>
<p>{t('common:messages.noData')}</p>
```

### Step 4: Translating Toast Messages

Update toast calls to use translations:

BEFORE:

```tsx
showToast("Item created successfully", "success");
```

AFTER:

```tsx
const { t } = useTranslation("menu");
showToast(t("messages.itemCreated"), "success");
```

Add to translation files:

```json
// en/menu.json
{
  "messages": {
    "itemCreated": "Menu item created successfully",
    "itemUpdated": "Menu item updated successfully",
    "itemDeleted": "Menu item deleted successfully"
  }
}

// vi/menu.json
{
  "messages": {
    "itemCreated": "Đã tạo món ăn thành công",
    "itemUpdated": "Đã cập nhật món ăn thành công",
    "itemDeleted": "Đã xóa món ăn thành công"
  }
}
```

### Step 5: Date and Number Formatting

For Vietnamese date/time formatting:

```tsx
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";

function OrderCard({ order }) {
    const { i18n } = useTranslation();
    const locale = i18n.language === "vi" ? vi : enUS;

    const formattedDate = format(new Date(order.createdAt), "PPp", { locale });

    return <span>{formattedDate}</span>;
}
```

For currency formatting:

```tsx
function PriceDisplay({ amount }) {
    const { i18n } = useTranslation();

    const formatted = new Intl.NumberFormat(
        i18n.language === "vi" ? "vi-VN" : "en-US",
        { style: "currency", currency: i18n.language === "vi" ? "VND" : "USD" }
    ).format(amount);

    return <span>{formatted}</span>;
}
```

## 📝 Translation Workflow by Page

### Pages to Translate (in order of priority):

1. ✅ **DashboardLayout** - DONE (navigation, logout)
2. **LoginPage** - Login form, validation messages
3. **DashboardPage** - Stats cards, charts
4. **MenuManagementPage** - Menu items list, filters, actions
5. **CategoryManagementPage** - Category CRUD
6. **OrderManagementPage** - Order list, statuses, actions
7. **KitchenDisplayPage** - Kitchen orders, statuses
8. **TableManagementPage** - Table list, QR codes
9. **StaffManagementPage** - Staff list, roles
10. **ReportsPage** - Report metrics, charts
11. **WaiterDashboardPage** - Waiter interface

### Common Patterns to Translate:

-   **Form labels** → `menu:form.labelName`
-   **Buttons** → `common:buttons.actionName`
-   **Validation errors** → `common:validation.errorType` or `feature:validation.specificError`
-   **Toast messages** → `feature:messages.actionResult`
-   **Table headers** → `feature:list.headerName`
-   **Status badges** → `feature:status.statusName`
-   **Modal titles** → `feature:modal.title`

## 🔧 Utility Functions (Optional)

Create a currency formatter utility:

```tsx
// src/utils/formatters.ts
import { useTranslation } from "react-i18next";

export function useCurrencyFormatter() {
    const { i18n } = useTranslation();

    return (amount: number) => {
        return new Intl.NumberFormat(
            i18n.language === "vi" ? "vi-VN" : "en-US",
            {
                style: "currency",
                currency: i18n.language === "vi" ? "VND" : "USD",
            }
        ).format(amount);
    };
}

// Usage in component
const formatCurrency = useCurrencyFormatter();
<span>{formatCurrency(150000)}</span>;
```

## 🚀 Quick Reference

| Task                 | Code                                                 |
| -------------------- | ---------------------------------------------------- |
| Import hook          | `import { useTranslation } from 'react-i18next';`    |
| Use in component     | `const { t, i18n } = useTranslation(['namespace']);` |
| Translate text       | `{t('key.path')}`                                    |
| With interpolation   | `{t('key', { variable: value })}`                    |
| Change language      | `i18n.changeLanguage('vi')`                          |
| Get current language | `i18n.language`                                      |

## 📋 Checklist for Each Component

-   [ ] Import `useTranslation` hook
-   [ ] Add translation keys to both `en` and `vi` JSON files
-   [ ] Replace hardcoded strings with `t()` calls
-   [ ] Test language switching
-   [ ] Check text overflow/layout with both languages
-   [ ] Verify date/number formatting if applicable

## 🎨 Testing Language Support

1. Click the language switcher in the header (🇺🇸 / 🇻🇳)
2. Verify all visible text changes
3. Check forms and validation messages
4. Test toast notifications
5. Verify date/time displays correctly
6. Check currency formatting (if applicable)
7. Refresh page - language should persist (saved in localStorage)

## 🌐 Adding More Languages (Future)

To add another language:

1. Create new folder: `src/locales/[code]/`
2. Copy all JSON files from `en/` folder
3. Translate each file
4. Update `src/i18n/config.ts`:

    ```ts
    import frCommon from './locales/fr/common.json';
    // ... import all fr files

    const resources = {
      en: { ... },
      vi: { ... },
      fr: { common: frCommon, ... }
    };
    ```

5. Add language to switcher in `LanguageSwitcher.tsx`:
    ```ts
    const languages = [
        { code: "en", name: "English", flag: "🇺🇸" },
        { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
        { code: "fr", name: "Français", flag: "🇫🇷" },
    ];
    ```

## 💡 Best Practices

1. **Keep keys organized** - Use nested structure matching your component hierarchy
2. **Reuse common keys** - Put shared translations in `common.json`
3. **Be specific** - Use descriptive key names: `menu.items.add` not `menu.add`
4. **Context matters** - "Order" (noun) vs "Order" (verb) need different keys
5. **Test both languages** - Ensure layout works with longer Vietnamese text
6. **Update both files** - Never add a key to only one language file

## 🐛 Troubleshooting

**Translation not showing?**

-   Check if the key exists in the JSON file
-   Verify namespace is imported: `useTranslation(['namespace'])`
-   Check console for missing key warnings
-   Make sure JSON files are valid (no trailing commas)

**Language not switching?**

-   Clear localStorage and refresh
-   Check browser console for errors
-   Verify i18n config is imported in main.tsx

**Text showing as key path?**

-   Key doesn't exist - add it to both en and vi files
-   Wrong namespace specified
-   Typo in the translation key

---

**Start translating!** Focus on one page at a time, and remember - you've already got the full structure in place. Just add keys to the JSON files and use `t()` in your components. 🚀
