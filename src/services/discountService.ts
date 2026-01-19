import type { DiscountCode } from "../types/domain";
import { store } from "./store";

const DISCOUNT_PERCENT = 10;

/**
 * Generates a discount code if the condition is satisfied.
 * A discount code is generated after every nth order (default n=3).
 * For example, if n=3, codes are generated after orders 3, 6, 9, etc.
 * 
 * The generated code can be used by the next customer(s) until it's used once.
 * After being used, a new code must be generated for subsequent orders.
 * 
 * @returns The generated discount code, or null if conditions aren't met
 */
export function generateDiscountCodeForNthOrder(): DiscountCode | null {
  // Only generate if we have at least one completed order AND
  // the order count is divisible by NTH_ORDER_FOR_DISCOUNT
  if (store.getCurrentOrderCount() === 0 || !store.shouldGenerateDiscountForNextOrder()) {
    return null;
  }

  const currentOrderCount = store.getCurrentOrderCount();
  const code: DiscountCode = {
    code: `DISC10_${currentOrderCount}`,
    discountPercent: DISCOUNT_PERCENT,
    isUsed: false,
  };

  store.addDiscountCode(code);
  return code;
}

/**
 * Validates if a discount code exists and hasn't been used yet.
 * @param code The discount code to validate
 * @returns The discount code object if valid, null otherwise
 */
export function validateDiscountCode(
  code: string,
): DiscountCode | null {
  const found = store.findDiscountCode(code);
  if (!found || found.isUsed) return null;
  return found;
}

/**
 * Marks a discount code as used after it's applied to an order.
 * @param code The discount code to mark as used
 */
export function markDiscountCodeUsed(code: string): void {
  store.markDiscountCodeUsed(code);
}


