# 🚀 Quick Start - Multilingual Support

## Test It Right Now!

1. **Start the dev server:**

    ```bash
    npm run dev
    ```

2. **Look for the language switcher** in the header (top-right corner):

    - You'll see: 🇺🇸 English dropdown
    - Click it and select 🇻🇳 Tiếng Việt

3. **Watch the magic happen:**

    - Navigation menu changes to Vietnamese
    - "Dashboard" → "Bảng điều khiển"
    - "Orders" → "Đơn hàng"
    - "Logout" → "Đăng xuất"
    - All buttons in ConfirmDeleteDialog are translated

4. **Language persists:**
    - Refresh the page - it stays in Vietnamese!
    - Stored in localStorage

## Your First Translation Task

Let's translate the **Login Page** together as an example:

### Step 1: Add translation keys

**File:** `src/locales/en/common.json`

```json
{
    "login": {
        "title": "Welcome Back",
        "subtitle": "Sign in to your account",
        "emailLabel": "Email Address",
        "emailPlaceholder": "Enter your email",
        "passwordLabel": "Password",
        "passwordPlaceholder": "Enter your password",
        "loginButton": "Sign In",
        "loggingIn": "Signing in...",
        "forgotPassword": "Forgot password?",
        "noAccount": "Don't have an account?",
        "signUp": "Sign up"
    }
}
```

**File:** `src/locales/vi/common.json`

```json
{
    "login": {
        "title": "Chào mừng trở lại",
        "subtitle": "Đăng nhập vào tài khoản của bạn",
        "emailLabel": "Địa chỉ Email",
        "emailPlaceholder": "Nhập email của bạn",
        "passwordLabel": "Mật khẩu",
        "passwordPlaceholder": "Nhập mật khẩu",
        "loginButton": "Đăng nhập",
        "loggingIn": "Đang đăng nhập...",
        "forgotPassword": "Quên mật khẩu?",
        "noAccount": "Chưa có tài khoản?",
        "signUp": "Đăng ký"
    }
}
```

### Step 2: Update LoginPage component

**File:** `src/pages/LoginPage.tsx`

**Add at the top:**

```tsx
import { useTranslation } from "react-i18next";
```

**In the component:**

```tsx
function LoginPage() {
    const { t } = useTranslation("common");

    return (
        <div>
            <h1>{t("login.title")}</h1>
            <p>{t("login.subtitle")}</p>

            <form>
                <label>{t("login.emailLabel")}</label>
                <input placeholder={t("login.emailPlaceholder")} />

                <label>{t("login.passwordLabel")}</label>
                <input placeholder={t("login.passwordPlaceholder")} />

                <button>
                    {isLoading ? t("login.loggingIn") : t("login.loginButton")}
                </button>
            </form>
        </div>
    );
}
```

### Step 3: Test!

1. Go to login page
2. Switch language using the switcher
3. Watch form labels change!

## Next Pages to Translate

1. ✅ DashboardLayout (DONE)
2. ✅ ConfirmDeleteDialog (DONE)
3. ⬜ LoginPage (DO THIS FIRST)
4. ⬜ DashboardPage
5. ⬜ MenuManagementPage
6. ⬜ OrderManagementPage

## Translation Cheat Sheet

```tsx
// Import
import { useTranslation } from "react-i18next";

// Use in component
const { t, i18n } = useTranslation(["namespace1", "namespace2"]);

// Basic translation
{
    t("buttons.save");
}

// With namespace
{
    t("menu:items.title");
}

// With variable
{
    t("welcome", { name: "John" });
}

// Get current language
{
    i18n.language;
} // 'en' or 'vi'

// Change language programmatically
i18n.changeLanguage("vi");
```

## Common Translation Keys Already Available

### Buttons (common:buttons.\*)

-   save, cancel, delete, edit, add
-   search, filter, export, import
-   close, confirm, back, next
-   submit, reset, clear

### Messages (common:messages.\*)

-   success, error
-   deleteConfirm, deleteWarning
-   unsavedChanges, noData
-   searchPlaceholder

### Navigation (common:navigation.\*)

-   dashboard, menu, orders, kitchen
-   tables, staff, reports
-   settings, logout

### Status (common:status.\*)

-   active, inactive
-   pending, completed, cancelled

Just use them! No need to add again.

## Tips for Success

1. **Always translate BOTH files** (en and vi) at the same time
2. **Test immediately** - Switch languages after each change
3. **Use existing keys** - Check common.json first
4. **Keep it simple** - Start with visible text, do forms later
5. **One page at a time** - Don't try to translate everything at once

## Need Help?

Check the full guide: [MULTILINGUAL_GUIDE.md](MULTILINGUAL_GUIDE.md)

---

**You're all set! Start with LoginPage and work your way through the app. Happy translating! 🎉**
