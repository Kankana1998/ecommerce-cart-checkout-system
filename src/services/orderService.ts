import type { Cart, DiscountCode, Order } from "../types/domain";
import { store } from "./store";
import {
  markDiscountCodeUsed,
  validateDiscountCode,
  generateDiscountCodeForNthOrder,
} from "./discountService";

export interface CheckoutResult {
  order: Order;
  discountCodeGeneratedForNextOrder?: DiscountCode;
}

/**
 * Processes a checkout for a user's cart.
 * 
 * Process:
 * 1. Validates that the cart has items
 * 2. Calculates total amount before discount
 * 3. If a discount code is applied, validates it and applies the 10% discount
 * 4. Creates an order record
 * 5. Clears the user's cart
 * 6. Checks if a discount code should be generated for the next order
 * 
 * @param userId The user checking out
 * @returns The created order and any newly generated discount code
 * @throws Error if cart is empty or discount code is invalid
 */
export function checkoutCart(
  userId: string,
): CheckoutResult {
  const cart = store.getCart(userId);

  if (!cart.items.length) {
    throw new Error("Cart is empty");
  }

  const totalAmount = calculateCartTotal(cart);

  let discountAmount = 0;
  let discountCode: string | undefined;

  // Validate and apply discount code if provided
  if (cart.appliedDiscountCode) {
    const validCode = validateDiscountCode(
      cart.appliedDiscountCode,
    );
    if (!validCode) {
      throw new Error("Invalid or already used discount code");
    }
    discountCode = validCode.code;
    discountAmount =
      (totalAmount * validCode.discountPercent) / 100;
    markDiscountCodeUsed(validCode.code);
  }

  const finalAmount = totalAmount - discountAmount;

  const order: Order = {
    id: `order_${Date.now()}`,
    items: [...cart.items],
    totalAmount,
    discountCode,
    discountAmount,
    finalAmount,
    createdAt: new Date(),
  };

  store.addOrder(order);
  store.clearCart(userId);

  // Check if a new discount code should be generated after this order
  const discountCodeGeneratedForNextOrder =
    generateDiscountCodeForNthOrder() || undefined;

  return { order, discountCodeGeneratedForNextOrder };
}

/**
 * Calculates the total price of all items in the cart before discount.
 * @param cart The shopping cart
 * @returns The subtotal (sum of item price * quantity)
 */
export function calculateCartTotal(cart: Cart): number {
  return cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
}


