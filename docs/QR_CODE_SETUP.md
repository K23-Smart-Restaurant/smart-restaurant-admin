# QR Code Configuration

## Overview
The QR codes generated for tables now direct users to the customer app where their table session is automatically set up.

## Environment Variables

Add the following to your `.env` file:

```env
# Customer app URL for QR code generation (where users will be redirected)
CUSTOMER_APP_DOMAIN=http://localhost:5173
```

For production:
```env
CUSTOMER_APP_DOMAIN=https://your-customer-app-domain.com
```

## How It Works

1. **QR Code Generation**: When a table QR code is generated, it contains a URL pointing to the customer app at `/qr-table?table={tableId}&token={token}`

2. **User Scans QR**: User scans the QR code with any QR scanner app (camera app, third-party scanner, etc.)

3. **Automatic Redirect**: User is automatically directed to the customer app

4. **Session Setup**: The app validates the token and automatically sets up the table session

5. **Navigation**: After successful validation, user is redirected to the menu page

## Benefits

- **No in-app scanner needed**: Users can use any QR scanner
- **Seamless experience**: Automatic session setup without manual input
- **Better UX**: One-step process instead of multiple steps
- **Universal compatibility**: Works with any device's native camera app

## Migration Notes

If you have existing QR codes, you should regenerate them to use the new URL format. You can do this through the admin panel's table management interface.
