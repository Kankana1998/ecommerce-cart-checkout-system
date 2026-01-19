import { NextResponse } from "next/server";
import { applyDiscountCodeToCart } from "../../../../services/cartService";
import { validateDiscountCode } from "../../../../services/discountService";

function getUserId(req: Request): string {
  return req.headers.get("x-user-id") ?? "demo-user";
}

/**
 * POST /api/cart/apply-discount
 * Applies a discount code to the user's cart.
 * The discount will be applied during checkout if the code is still valid.
 * 
 * Headers:
 * - x-user-id: The user's ID (optional, defaults to 'demo-user')
 * 
 * Request body:
 * {
 *   "code": "DISC10_3"
 * }
 * 
 * Response: { items: CartItem[], appliedDiscountCode: string }
 * 
 * Returns 400 if:
 * - Code is not provided
 * - Code is invalid or already used
 */
export async function POST(req: Request) {
  try {
    const { code } = (await req.json()) as { code?: string };
    if (!code) {
      return NextResponse.json(
        { error: "Code is required" },
        { status: 400 },
      );
    }

    const valid = validateDiscountCode(code);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid or already used discount code" },
        { status: 400 },
      );
    }

    const userId = getUserId(req);
    const cart = applyDiscountCodeToCart(userId, code);

    return NextResponse.json(cart, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to apply discount code" },
      { status: 500 },
    );
  }
}

