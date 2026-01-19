import { NextResponse } from "next/server";
import { store } from "../../../../services/store";

/**
 * GET /api/admin/stats
 * 
 * Retrieves comprehensive store statistics including:
 * - Total number of items purchased
 * - Total purchase amount (sum of all order totals before discount)
 * - Total discount amount given (sum of all discounts applied)
 * - List of all discount codes generated and their status
 * 
 * Response:
 * {
 *   "totalItemsPurchased": 15,
 *   "totalPurchaseAmount": 499.97,
 *   "totalDiscountAmount": 50.00,
 *   "discountCodes": [
 *     { code: "DISC10_3", discountPercent: 10, isUsed: true },
 *     { code: "DISC10_6", discountPercent: 10, isUsed: false }
 *   ]
 * }
 */
export async function GET() {
  const stats = store.getStats();
  return NextResponse.json(stats, { status: 200 });
}

