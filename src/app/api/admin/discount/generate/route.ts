import { NextResponse } from "next/server";
import { generateDiscountCodeForNthOrder } from "../../../../../services/discountService";
import { store } from "../../../../../services/store";

/**
 * POST /api/admin/discount/generate
 * 
 * Attempts to generate a new discount code.
 * A discount code is only generated after every nth order (default n=3).
 * 
 * For example, with n=3:
 * - After order #3: generates code DISC10_3
 * - After order #6: generates code DISC10_6
 * - After order #9: generates code DISC10_9
 * 
 * The generated code can be used by customers until it's used once.
 * After being used, the next code becomes available after the next nth order.
 * 
 * Response (when code is generated - status 200):
 * {
 *   "currentOrderCount": 3,
 *   "shouldGenerate": true,
 *   "code": { code: "DISC10_3", discountPercent: 10, isUsed: false }
 * }
 * 
 * Response (when not due yet - status 400):
 * {
 *   "currentOrderCount": 2,
 *   "shouldGenerate": false,
 *   "code": null,
 *   "error": "No discount code due yet"
 * }
 */
export async function POST() {
  const code = generateDiscountCodeForNthOrder();
  const currentOrderCount = store.getCurrentOrderCount();

  if (code) {
    return NextResponse.json(
      {
        currentOrderCount,
        shouldGenerate: true,
        code,
      },
      { status: 200 },
    );
  }

  return NextResponse.json(
    {
      currentOrderCount,
      shouldGenerate: false,
      code: null,
      error: "No discount code due yet",
    },
    { status: 400 },
  );
}

