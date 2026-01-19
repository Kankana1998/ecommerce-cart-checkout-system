# 🛒 Ecommerce Cart & Checkout System

A modern, fully-functional ecommerce platform built with Next.js where customers can add items to their cart, apply discount codes, and checkout. The system automatically generates 10% discount codes every 3rd order!

## What This App Does

- 🛒 **Add items to cart** - Browse products and add them to your shopping cart
- 💳 **Checkout easily** - Place orders with a simple checkout flow
- 🎉 **Get discount codes** - Every 3rd order generates a 10% off coupon for the next order
- 📊 **Admin dashboard** - View sales stats, discount usage, and order metrics
- 🔐 **User accounts** - Sign in with Google to maintain your own cart

## Getting Started

Want to run this locally? Super easy!

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Then visit **http://localhost:3000** in your browser and start shopping!

## How the Discount System Works

Here's the cool part - **the system rewards loyal customers** by giving them discount codes automatically.

### The Simple Rule

After every **3rd order** is placed, a unique 10% discount code is generated. This code can be used **once** on any future order.

### Real Example

Let's say you're a new customer:

```
You place order #1  →  No discount yet
You place order #2  →  Still no discount
You place order #3  →  🎉 CONGRATS! Code "DISC10_3" is now available

You can now use DISC10_3 on your next purchase and get 10% off!

More orders:
You place order #4  →  (DISC10_3 has been used, no new code yet)
You place order #5  →  Still nothing
You place order #6  →  🎉 New code "DISC10_6" becomes available!
```

## How to Use the App

### 1. Sign In
Click "Login" and connect with your Google account. This keeps your cart safe and personal.

### 2. Shop
Browse through the products on the home page and click "Add to cart" for items you want.

### 3. View Your Cart
Click the cart icon in the header to see everything you've added, with the total price calculated.

### 4. Apply a Discount (If You Have One)
If you have a discount code from a previous order, paste it in the discount field and click "Checkout".

### 5. Complete Your Order
Hit the "Checkout" button. Your order is confirmed, and you'll see your Order ID and any new discount codes that were generated!

### For Admins
Visit the **Admin** page to:
- See total sales and items sold
- View all discount codes and which ones have been used
- Check total discounts given away

## Testing

Want to verify everything works? Run the tests!

```bash
npm test
```

The tests make sure:
- ✅ Discount codes are generated at exactly the right time (every 3rd order)
- ✅ A discount code can only be used once
- ✅ Invalid codes are rejected
- ✅ The system handles multiple orders correctly

## Built With

- **Frontend**: React + Next.js 16 (modern, fast)
- **Language**: TypeScript (catches bugs before they happen)
- **Database**: In-memory storage (no setup needed!)
- **Authentication**: Google Sign-In
- **Styling**: Tailwind CSS (clean design)

## Project Structure

```
src/
├── app/                      # Pages and APIs
│   ├── page.tsx             # Home with products
│   ├── cart/page.tsx        # Your shopping cart
│   ├── admin/page.tsx       # Admin dashboard
│   └── api/                 # All backend endpoints
│
├── services/                # Business logic
│   ├── store.ts             # Where data is stored
│   ├── cartService.ts       # Shopping cart operations
│   ├── discountService.ts   # Discount code logic
│   └── orderService.ts      # Order processing
│
├── components/              # React components
│   ├── LoginModal.tsx       # Google login
│   └── layout/SiteHeader.tsx # Top navigation
│
└── types/
    └── domain.ts            # Type definitions
```

## Important Things to Know

### Where's the Data Stored?
Everything is stored **in the app's memory** while the server runs. This means:
- ✅ Super fast (no database queries)
- ✅ Easy to test and develop
- ✅ **Data resets when you restart the server**

Think of it like writing on a whiteboard - it's there while the server is running, but disappears when you turn everything off. For a real business, you'd use a database like MongoDB or PostgreSQL instead.

### User Identification
Each customer is identified by their Google account. When you sign in, the system creates a unique ID for you, so your cart is completely separate from other users' carts.

### How to Change Settings

Want to change when discount codes appear? Edit `src/services/store.ts`:

```typescript
const NTH_ORDER_FOR_DISCOUNT = 3;  // Change this to generate codes every 5 orders, etc.
```

Want to change the discount percentage? Edit `src/services/discountService.ts`:

```typescript
const DISCOUNT_PERCENT = 10;  // Change this to 15, 20, etc.
```

## API Reference

For detailed API documentation, check out [API_DOCUMENTATION.md](API_DOCUMENTATION.md). Here's a quick overview:

### Customer Endpoints
- **GET /api/cart** - See what's in your cart
- **POST /api/cart/add** - Add an item to cart
- **POST /api/cart/apply-discount** - Enter your discount code
- **POST /api/checkout** - Finish your purchase

### Admin Endpoints
- **POST /api/admin/discount/generate** - Create a new discount code (if the time is right)
- **GET /api/admin/stats** - View sales and discount metrics

## Pages in the App

### 🏠 Home Page (`/`)
Browse available products and add items to your cart. Each product shows the price and a quick "Add to cart" button.

### 🛒 Cart Page (`/cart`)
View all items you've added, see the total price, and enter any discount codes you have. When you're ready, click "Checkout" to place your order. You'll see your order confirmation with the order ID and any new discount codes generated.

### 👨‍💼 Admin Page (`/admin`)
See the big picture:
- Total number of items sold across all orders
- Total revenue from all purchases
- Total discounts given away
- List of all discount codes and which ones have been used

## FAQ

**Q: My cart is still there after I closed the browser?**  
A: Yep! The data lives on the server in memory. When you log back in as the same Google user, you get the same cart. If you log in as a different Google user, you'll get a fresh, empty cart.

**Q: How do discount codes work?**  
A: After someone places their 3rd order, a 10% discount code is generated. That code can be used on the next order (the 4th one). After 6 orders, a new code is generated, and so on.

**Q: What happens if I restart the server?**  
A: All data disappears. This is because everything is stored in the server's memory, not in a database. It's perfect for testing and learning, but a real business would need a database.

**Q: Can I use a discount code twice?**  
A: Nope! Each code can only be used once. After someone uses it, it's locked in.

**Q: Can I test with multiple users?**  
A: Absolutely! Just log in with different Google accounts. Each account gets its own cart and order history.

## Want to Learn More?

- **Need API details?** → Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Want to see what we fixed?** → Read [FIXES_SUMMARY.md](FIXES_SUMMARY.md)
- **Want to test with a REST client?** → Use the examples in [requests.http](requests.http)

## Tech Stack Summary

| What | Why |
|------|-----|
| **Next.js 16** | Fast, modern React framework with built-in API routes |
| **TypeScript** | Catch bugs before they happen with type safety |
| **In-Memory Store** | Fast development without database setup |
| **Google Sign-In** | Easy authentication, no passwords to manage |
| **Tailwind CSS** | Quick, clean styling |
| **Jest** | Test the discount logic to ensure it works perfectly |

## Ready to Get Started?

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev

# 3. Open your browser
# Visit http://localhost:3000
```

That's it! Happy shopping! 🎉

