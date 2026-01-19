# API Reference

## Overview

The Smart Restaurant Admin API provides RESTful endpoints for managing restaurant operations including menu items, orders, tables, staff, and analytics.

## Interactive Documentation

**Access the full API documentation via Swagger UI:**

```
http://localhost:3001/api-docs
```

## OpenAPI Specification

The complete API specification is available in OpenAPI 3.0 format:

📄 [`server/src/docs/openapi.yaml`](../server/src/docs/openapi.yaml)

## Quick Start

1. **Authentication**: All endpoints (except `/api/auth/login` and `/api/auth/register`) require JWT bearer token
2. **Get Token**: `POST /api/auth/login` with credentials
3. **Use Token**: Include in request header: `Authorization: Bearer <token>`

## Main Endpoints

| Category       | Base Path         | Description                      |
| -------------- | ----------------- | -------------------------------- |
| Authentication | `/api/auth`       | Login, register, token refresh   |
| Staff          | `/api/staff`      | Manage waiters and kitchen staff |
| Menu Items     | `/api/menu-items` | CRUD operations for menu         |
| Categories     | `/api/categories` | Menu category management         |
| Tables         | `/api/tables`     | Table and QR code management     |
| Orders         | `/api/orders`     | Order tracking and management    |
| Kitchen        | `/api/kitchen`    | Kitchen display system endpoints |
| Waiter         | `/api/waiter`     | Waiter-specific operations       |
| Reports        | `/api/reports`    | Analytics and business reports   |

## For Detailed Information

Visit the **Swagger UI** at `/api-docs` for:

- Complete endpoint documentation
- Request/response schemas
- Interactive API testing
- Authentication examples
- Error codes and responses
