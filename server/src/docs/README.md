# Smart Restaurant Admin API Documentation

This project uses **OpenAPI 3.0** specification for API documentation with Swagger UI for interactive testing.

## 📍 Access Documentation

### Development
- **Swagger UI**: http://localhost:3001/api-docs
- **OpenAPI JSON**: http://localhost:3001/api-docs.json
- **YAML Source**: `src/docs/openapi.yaml`

### Production
- **Swagger UI**: https://api.smartrestaurant.com/api-docs
- **OpenAPI JSON**: https://api.smartrestaurant.com/api-docs.json

## 🚀 Quick Start

### 1. Start the Server
```bash
npm run dev
```

### 2. Open Swagger UI
Navigate to http://localhost:3001/api-docs in your browser

### 3. Authenticate
1. Click on "Authorize" button (🔒 icon in top-right)
2. Login via `/api/auth/login` endpoint to get your JWT token
3. Copy the `token` from the response
4. Paste it in the "Value" field (Swagger auto-adds "Bearer" prefix)
5. Click "Authorize"

### 4. Test Endpoints
- All authenticated endpoints will now include your JWT token
- Click "Try it out" on any endpoint
- Fill in parameters/request body
- Click "Execute" to send the request
- View response in real-time

## 📝 Editing the OpenAPI Spec

### File Location
```
src/docs/openapi.yaml
```

### Adding a New Endpoint

1. **Add to paths section:**
```yaml
paths:
  /api/your-endpoint:
    get:
      tags:
        - Your Tag
      summary: Short description
      description: Detailed description
      security:
        - bearerAuth: []  # Require authentication
      parameters:
        - in: query
          name: paramName
          schema:
            type: string
      responses:
        '200':
          description: Success response
          content:
            application/json:
              example:
                success: true
                data: {}
```

2. **Add schemas (if needed):**
```yaml
components:
  schemas:
    YourModel:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
```

3. **Server auto-reloads** - Changes are live instantly (with nodemon)

## 🏷️ Current Tags (Categories)

- **Authentication** - User auth and token management
- **Menu Items** - Menu CRUD operations
- **Categories** - Menu categories (coming soon)
- **Orders** - Order management  (coming soon)
- **Tables** - Table management (coming soon)

## 🔐 Security

### JWT Bearer Authentication
All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Obtaining a Token
1. **Register**: POST `/api/auth/register`
2. **Login**: POST `/api/auth/login`
3. **Use** the returned `token` for subsequent requests

### Token Lifetime
- **Access Token**: 24 hours
- **Refresh Token**: 7 days

## 📚 OpenAPI Spec Structure

```
openapi.yaml
├── info              # API metadata
├── servers           # API base URLs
├── tags              # Endpoint categories
├── components
│   ├── securitySchemes  # Auth methods
│   ├── schemas          # Data models
│   └── responses        # Reusable responses
└── paths             # API endpoints
    ├── /api/auth/*
    ├── /api/menu-items/*
    └── ...
```

## 🎯 Best Practices

### 1. Use References
```yaml
# ✅ Good - Reusable
schema:
  $ref: '#/components/schemas/MenuItem'

# ❌ Bad - Duplicated
schema:
  type: object
  properties: ...
```

### 2. Provide Examples
```yaml
example:
  success: true
  data:
    id: "123e4567-e89b-12d3-a456-426614174000"
    name: "Margherita Pizza"
```

### 3. Document All Responses
```yaml
responses:
  '200':
    description: Success
  '400':
    $ref: '#/components/responses/ValidationError'
  '401':
    $ref: '#/components/responses/UnauthorizedError'
  '404':
    $ref: '#/components/responses/NotFoundError'
```

### 4. Use Enums for Fixed Values
```yaml
category:
  type: string
  enum: [APPETIZER, MAIN_COURSE, DESSERT, BEVERAGE]
```

## 🛠️ Tools & Extensions

### VS Code Extensions
- **OpenAPI (Swagger) Editor** - YAML Intellisense
- **Swagger Viewer** - Preview in VS Code
- **YAML** - Syntax highlighting

### Online Editors
- https://editor.swagger.io - Paste your YAML for validation

### Code Generation
```bash
# Generate TypeScript types
npx openapi-typescript src/docs/openapi.yaml -o src/types/api.ts

# Generate client SDK
npx openapi-generator-cli generate -i src/docs/openapi.yaml -g typescript-axios -o src/generated
```

## 📖 Resources

- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [OpenAPI Examples](https://github.com/OAI/OpenAPI-Specification/tree/main/examples)

## 🔄 Workflow

1. **Design First** - Write OpenAPI spec before coding
2. **Validate** - Use Swagger UI to test
3. **Generate** - Create types/clients from spec
4. **Implement** - Build endpoints matching spec
5. **Test** - Verify via Swagger UI
6. **Update** - Keep spec in sync with code

---

**Tip**: Keep your OpenAPI spec up to date! It's the single source of truth for your API. 🎯
