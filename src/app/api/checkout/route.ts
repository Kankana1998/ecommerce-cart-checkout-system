import { NextResponse } from "next/server";
import { checkoutCart } from "../../../services/orderService";
import { applyDiscountCodeToCart } from "../../../services/cartService";
import { validateDiscountCode } from "../../../services/discountService";

function getUserId(req: Request): string {
  return req.headers.get("x-user-id") ?? "demo-user";
}

/**
 * POST /api/checkout
 * 
 * Completes a checkout for the user's cart.
 * 
 * Request body (optional):
 * {
 *   "code": "DISC10_3"  // Optional discount code to apply
 * }
 * 
 * Response:
 * {
 *   "order": { ... order details ... },
 *   "discountCodeGeneratedForNextOrder": { code, discountPercent, isUsed } | null
 * }
 * 
 * Returns 400 if:
 * - Cart is empty
 * - Discount code is invalid or already used
 */
export async function POST(req: Request) {
  try {
    const userId = getUserId(req);
    const body = (await req.json()) as { code?: string };

    // If discount code provided, validate and apply it before checkout
    if (body.code) {
      const valid = validateDiscountCode(body.code);
      if (!valid) {
        return NextResponse.json(
          { error: "Invalid or already used discount code" },
          { status: 400 },
        );
      }
      applyDiscountCodeToCart(userId, body.code);
    }

    const { order, discountCodeGeneratedForNextOrder } =
      checkoutCart(userId);
    return NextResponse.json(
      {
        order,
        discountCodeGeneratedForNextOrder,
      },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Checkout failed";
    return NextResponse.json(
      { error: message },
      { status: 400 },
    );
  }
}

