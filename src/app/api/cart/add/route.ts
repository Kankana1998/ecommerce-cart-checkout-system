import { NextResponse } from "next/server";
import { addItemToCart } from "../../../../services/cartService";
import type { CartItem } from "../../../../types/domain";

function getUserId(req: Request): string {
  return req.headers.get("x-user-id") ?? "demo-user";
}

/**
 * POST /api/cart/add
 * Adds an item to the user's shopping cart.
 * If the item already exists, increases its quantity.
 * 
 * Headers:
 * - x-user-id: The user's ID (optional, defaults to 'demo-user')
 * 
 * Request body:
 * {
 *   "productId": "prod_123",
 *   "name": "Product Name",
 *   "price": 29.99,
 *   "quantity": 2
 * }
 * 
 * Response: { items: CartItem[], appliedDiscountCode?: string }
 * 
 * Returns 400 if the payload is invalid.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<CartItem>;
    if (
      !body.productId ||
      !body.name ||
      typeof body.price !== "number" ||
      typeof body.quantity !== "number"
    ) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 },
      );
    }

    const userId = getUserId(req);
    const cart = addItemToCart(userId, {
      productId: body.productId,
      name: body.name,
      price: body.price,
      quantity: body.quantity,
    });

    return NextResponse.json(cart, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add item to cart" },
      { status: 500 },
    );
  }
}

