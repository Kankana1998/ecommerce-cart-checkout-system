# Ecommerce Cart & Checkout API Documentation

## Overview

This is a Next.js-based ecommerce system with cart management, checkout processing, and an intelligent discount code generation system. Every 3rd order automatically generates a discount code that can be used on subsequent orders.

## System Architecture

### Discount Code Logic

The system generates a new discount code after every **N**th order (currently N=3).

**Example Flow:**
- Order 1: No discount code generated
- Order 2: No discount code generated
- Order 3: **DISCOUNT CODE GENERATED** → `DISC10_3` (10% discount)
  - This code can now be used by any customer
  - Once used, it becomes unavailable
- Order 4: No discount code generated
- Order 5: No discount code generated
- Order 6: **NEXT DISCOUNT CODE GENERATED** → `DISC10_6`
  - The previous code is no longer available (already used)
  - This new code can be used by customers

### Key Principles

- A discount code is generated **after** every nth order completes
- Each discount code can be used **only once** before the next one becomes available
- A discount applies to the **entire order** (not individual items)
- Discount percentage is fixed at **10%**

## API Endpoints

### User Endpoints

#### GET `/api/cart`
Retrieves the current shopping cart for the user.

**Headers:**
- `x-user-id`: User identifier (optional, defaults to 'demo-user')

**Response:**
```json
{
  "items": [
    {
      "productId": "prod_123",
      "name": "Product Name",
      "price": 29.99,
      "quantity": 2
    }
  ],
  "appliedDiscountCode": "DISC10_3"
}
```

---

#### POST `/api/cart/add`
Adds an item to the user's shopping cart. If the item already exists, increases its quantity.

**Headers:**
- `x-user-id`: User identifier (optional, defaults to 'demo-user')

**Request Body:**
```json
{
  "productId": "prod_123",
  "name": "Product Name",
  "price": 29.99,
  "quantity": 2
}
```

**Response:**
```json
{
  "items": [
    {
      "productId": "prod_123",
      "name": "Product Name",
      "price": 29.99,
      "quantity": 2
    }
  ]
}
```

**Error Responses:**
- `400 Bad Request`: Invalid payload (missing required fields or wrong types)
- `500 Internal Server Error`: Server error

---

#### POST `/api/cart/apply-discount`
Applies a discount code to the user's cart. The discount will be applied during checkout if the code is valid.

**Headers:**
- `x-user-id`: User identifier (optional, defaults to 'demo-user')

**Request Body:**
```json
{
  "code": "DISC10_3"
}
```

**Response:**
```json
{
  "items": [
    {
      "productId": "prod_123",
      "name": "Product Name",
      "price": 29.99,
      "quantity": 2
    }
  ],
  "appliedDiscountCode": "DISC10_3"
}
```

**Error Responses:**
- `400 Bad Request`: Code is required or invalid/already used
- `500 Internal Server Error`: Server error

---

#### POST `/api/checkout`
Completes the checkout process. Validates any applied discount code and creates an order.

**Headers:**
- `x-user-id`: User identifier (optional, defaults to 'demo-user')

**Request Body (optional):**
```json
{
  "code": "DISC10_3"
}
```

**Response:**
```json
{
  "order": {
    "id": "order_1642345600000",
    "items": [
      {
        "productId": "prod_123",
        "name": "Product Name",
        "price": 29.99,
        "quantity": 2
      }
    ],
    "totalAmount": 59.98,
    "discountCode": "DISC10_3",
    "discountAmount": 5.998,
    "finalAmount": 53.982,
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "discountCodeGeneratedForNextOrder": null
}
```

If a discount code is generated after this order:
```json
{
  "order": { ... },
  "discountCodeGeneratedForNextOrder": {
    "code": "DISC10_3",
    "discountPercent": 10,
    "isUsed": false
  }
}
```

**Error Responses:**
- `400 Bad Request`: Cart is empty or discount code is invalid/already used

---

### Admin Endpoints

#### POST `/api/admin/discount/generate`
Attempts to generate a new discount code. Only succeeds after every nth order.

**Response (Success - Status 200):**
```json
{
  "currentOrderCount": 3,
  "shouldGenerate": true,
  "code": {
    "code": "DISC10_3",
    "discountPercent": 10,
    "isUsed": false
  }
}
```

**Response (Not Due Yet - Status 400):**
```json
{
  "currentOrderCount": 2,
  "shouldGenerate": false,
  "code": null,
  "error": "No discount code due yet"
}
```

---

#### GET `/api/admin/stats`
Retrieves comprehensive store statistics.

**Response:**
```json
{
  "totalItemsPurchased": 15,
  "totalPurchaseAmount": 499.97,
  "totalDiscountAmount": 50.00,
  "discountCodes": [
    {
      "code": "DISC10_3",
      "discountPercent": 10,
      "isUsed": true
    },
    {
      "code": "DISC10_6",
      "discountPercent": 10,
      "isUsed": false
    }
  ]
}
```

---

## Testing the APIs

### Using cURL

**Add item to cart:**
```bash
curl -X POST http://localhost:3000/api/cart/add \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-123" \
  -d '{
    "productId": "prod_1",
    "name": "Laptop",
    "price": 999.99,
    "quantity": 1
  }'
```

**Apply discount code:**
```bash
curl -X POST http://localhost:3000/api/cart/apply-discount \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-123" \
  -d '{"code": "DISC10_3"}'
```

**Checkout:**
```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-123" \
  -d '{"code": "DISC10_3"}'
```

**Get stats:**
```bash
curl http://localhost:3000/api/admin/stats
```

**Generate discount code:**
```bash
curl -X POST http://localhost:3000/api/admin/discount/generate
```

### Using VS Code REST Client

Create a file `requests.http`:

```http
### Add item to cart
POST http://localhost:3000/api/cart/add
Content-Type: application/json
x-user-id: user-123

{
  "productId": "prod_1",
  "name": "Laptop",
  "price": 999.99,
  "quantity": 1
}

### Get cart
GET http://localhost:3000/api/cart
x-user-id: user-123

### Apply discount
POST http://localhost:3000/api/cart/apply-discount
Content-Type: application/json
x-user-id: user-123

{
  "code": "DISC10_3"
}

### Checkout
POST http://localhost:3000/api/checkout
Content-Type: application/json
x-user-id: user-123

{
  "code": "DISC10_3"
}

### Get stats
GET http://localhost:3000/api/admin/stats

### Generate discount
POST http://localhost:3000/api/admin/discount/generate
```

---

## Running Tests

```bash
npm test
```

This runs Jest tests that verify:
- Discount code generation at the correct order intervals
- Discount code validation and usage
- Multiple orders and discount code generation cycles

---

## Data Model

### CartItem
```typescript
{
  productId: string;
  name: string;
  price: number;
  quantity: number;
}
```

### Cart
```typescript
{
  items: CartItem[];
  appliedDiscountCode?: string;
}
```

### DiscountCode
```typescript
{
  code: string;
  discountPercent: number;
  isUsed: boolean;
}
```

### Order
```typescript
{
  id: string;
  items: CartItem[];
  totalAmount: number;
  discountCode?: string;
  discountAmount: number;
  finalAmount: number;
  createdAt: Date;
}
```

---

## Configuration

### Discount Generation Interval

To change the discount generation interval (currently every 3 orders), modify `NTH_ORDER_FOR_DISCOUNT` in [src/services/store.ts](src/services/store.ts):

```typescript
const NTH_ORDER_FOR_DISCOUNT = 3; // Change this value
```

### Discount Percentage

To change the discount percentage (currently 10%), modify `DISCOUNT_PERCENT` in [src/services/discountService.ts](src/services/discountService.ts):

```typescript
const DISCOUNT_PERCENT = 10; // Change this value
```

---

## Architecture Notes

### In-Memory Storage

The system uses an in-memory store (module-level singletons) for simplicity. Data persists during the application runtime but is lost on server restart.

To use a database instead, replace the store implementation in [src/services/store.ts](src/services/store.ts).

### Error Handling

All endpoints include proper error handling:
- Invalid input returns `400 Bad Request`
- Server errors return `500 Internal Server Error`
- Business logic errors (empty cart, invalid discount) return `400 Bad Request`

### User Identification

Users are identified via the `x-user-id` header. If not provided, the system defaults to 'demo-user'. This allows testing multiple users simultaneously.

---

## Future Improvements

1. Persist data to a database (MongoDB, PostgreSQL, etc.)
2. Add user authentication and authorization
3. Support multiple discount code types and conditions
4. Implement inventory management
5. Add payment processing
6. Create a comprehensive admin dashboard
7. Add order history and tracking
