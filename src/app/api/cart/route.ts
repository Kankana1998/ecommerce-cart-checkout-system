import { NextResponse } from "next/server";
import { getCartForUser } from "../../../services/cartService";

function getUserId(req: Request): string {
  return req.headers.get("x-user-id") ?? "demo-user";
}

/**
 * GET /api/cart
 * Retrieves the current shopping cart for the user.
 * 
 * Headers:
 * - x-user-id: The user's ID (optional, defaults to 'demo-user')
 * 
 * Response: { items: CartItem[], appliedDiscountCode?: string }
 */
export async function GET(req: Request) {
  const userId = getUserId(req);
  const cart = getCartForUser(userId);
  return NextResponse.json(cart, { status: 200 });
}

